import _ from 'lodash'
import { Z_PARTIAL_FLUSH } from 'zlib';
/**
 * Defines the change tracking features that comes together with the proxified object
 */
interface iProxify {
    /**
     * Returns a delta object containing alterations made to the Proxified Object
     */
    getChanges: () => any;
}

/**
 * Will wrap the object in a proxy to track changes of children
 * @param o Any object to be proxified
 */
export function proxify<T>(this: T & iProxify, o: T): T & iProxify {
    const original: T & iProxify | any = o;

    //If the function is called without new Keyword, we will create a blank this keyword
    //Ultimately making proxify a factory if needs be too
    const self: (T & iProxify) | any = (typeof this === 'undefined') ? {} : this;

    const privates: proxyPrivates = {
        oldValues: {},
        changesDelta: {},
        changesDot: {}
    };

    Object.assign(self, original);

    Object.defineProperties(self, {

        getChanges: {
            value: () => {
                return privates.changesDelta;
            },
            writable: false
        }

    });

    return bindProxy(privates, self);;
}

/**
 * Allows for using proxify as an abstract class to extend from.
 */
export class Proxify implements iProxify {

    getChanges() { let r: any; return r }

    constructor(o: any) {
        //Will override all members of this class
        return new (proxify as any)(o);
    }
}


/**
 * Swap out object members with Proxies
 * @param root The root object for proxifying
 * @param o Any member of the proxifying object
 * @param path An array explaining the current descendants route in the object tree
 */
function bindProxy<T>(
    privates: proxyPrivates,
    root: (T | object) & iProxify,
    o: T | any = root,
    path: bindProxyPath[] = []
): T & iProxify {

    if (typeof o === 'undefined' || o === null || typeof o === 'function') {
        //Cannot access children of undefined or null and functions should not be proxified
        return o;
    }


    /*
    TypeOf Array is always 'object', so we get that info from the constructor
    or alternative would be Symbol.iterator in Object which is not 100% accurate
    */
    const constructor: () => T = Object.getPrototypeOf(o).constructor;

    let oldValObj = path.reduce((oldValCursor, pathElement) => {
        if (!oldValCursor[pathElement.key]) {
            if (typeof o === 'object') {
                if (constructor.name === 'Array') {
                    oldValCursor[pathElement.key] = [];
                }
                else {
                    oldValCursor[pathElement.key] = {};
                }
            } else if (typeof oldValCursor === 'object') {
                oldValCursor[pathElement.key] = o;
            }
        }
        return oldValCursor[pathElement.key];
    }, privates.oldValues);

    //If type object, we want to iterate through members and proxify them before 
    //finally creating the current object's proxy
    if (typeof o === "object") {

        for (const [k, v] of Object.entries(o)) {
            //Arrays have special treatment due to length property also changing when appending etc.
            if (!(constructor.name === 'Array' && k === 'length'))
                o[k] = bindProxy(privates, root, v, [...path, { parentObj: o, key: k }]);
        }
        return new Proxy(o, {
            set: (target: any, property: string | number, value: any, receiver): any => {

                //Compare with old value
                if (_.isEqual(oldValObj[property], value)) {
                    //If we revert to old value, we need to cleanup the delta object
                    let deltaObj = privates.changesDelta;
                    let deltaObjPath = [deltaObj];

                    //Traverse down the nested objects as close as possible to the changed property
                    for (const pathElement of path) {
                        if (!deltaObj[pathElement.key])
                            break;

                        deltaObj = deltaObj[pathElement.key];
                        deltaObjPath.push(deltaObj);
                    }

                    if (deltaObjPath.length === path.length + 1) {
                        delete deltaObj[property];

                        //Traverse back up and clean empty objects
                        if (deltaObjPath.length > -1) {
                            deltaObjPath.reverse();
                            for (let pathIndex = 0; pathIndex < deltaObjPath.length - 1; pathIndex++) {
                                const pathElement = deltaObjPath[pathIndex + 1];
                                if (Object.keys(deltaObjPath[pathIndex]).length === 0) {
                                    delete pathElement[path[deltaObjPath.length - pathIndex - 2].key];
                                }
                            }
                        }
                    }
                }
                else {
                    //Make sure minimal path to property is built from root
                    let deltaObj = path.reduce((deltaCursor, pathElement) => {
                        if (!deltaCursor[pathElement.key])
                            deltaCursor[pathElement.key] = {};

                        return deltaCursor[pathElement.key]
                    }, privates.changesDelta)

                    deltaObj[property] = value;

                }

                target[property] = value;
                return receiver;
            }
        });

    }

    return o;
}

/**
 * Key value pair helping explain routes in object trees
 */
interface bindProxyPath {
    parentObj: any;
    key: string | number | symbol;
}

/**
 * Private object to manage change tracking features
 */
interface proxyPrivates {
    oldValues: any;
    changesDelta: any;
    changesDot: changesDot;
}

/**
 * Key Value structure of dot notation changes
 */
interface changesDot {
    [key: string]: any
}