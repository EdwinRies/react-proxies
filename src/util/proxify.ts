import _ from 'lodash'
import { debug } from 'console';
/**
 * Defines the change tracking features that comes together with the proxified object
 */
interface iProxify {
    /**
     * Returns a delta object containing alterations made to the Proxified Object
     */
    getChanges: () => any;
}


interface observer {
    (
        path: (string | number | symbol)[],
        obj: object,
        property: string | number | symbol,
        value: any
    ): void
}

/**
 * Will wrap the object in a proxy to track changes of children
 * @param o Any object to be proxified
 * @param observers observer callbacks to be executed on each change
 */
export function proxify<T, U = T & iProxify>(
    this: U,
    o: T,
    observers: observer[] = []
): T & iProxify {
    const original: T & iProxify | any = o;

    //If the function is called without new Keyword, we will create a blank this keyword
    //Ultimately making proxify a factory if needs be too
    const self: (T & iProxify) | any = (typeof this === 'undefined') ? {} : this;

    const privates: proxyPrivates = {
        oldValues: _.cloneDeep(o),
        changesDelta: {}
    };

    //Observer to track delta changes
    observers = [(path, obj, property, value) => {

        let oldValObj = path.reduce((oldValCursor, pathElement) => {
            if (!oldValCursor[pathElement]) {
                if (typeof obj === 'object') {
                    if (Symbol.iterator in obj) {
                        oldValCursor[pathElement] = [];
                    }
                    else {
                        oldValCursor[pathElement] = {};
                    }
                } else if (typeof oldValCursor === 'object') {
                    oldValCursor[pathElement] = obj;
                }
            }
            return oldValCursor[pathElement];
        }, privates.oldValues);


        console.log(`${(property as string)} being set to`, value);
        console.log(oldValObj[property], value);
        //Compare with old value
        if (_.isEqual(oldValObj[property], value)) {
            console.log(`${(property as string)} Equal to initial value`);
            //If we revert to the old value, we need to cleanup the delta object
            let deltaObj = privates.changesDelta;

            let deltaObjPath = [deltaObj];

            //Traverse down the nested objects as close as possible to the changed property
            for (const pathElement of path) {
                if (!deltaObj[pathElement])
                    break;

                deltaObj = deltaObj[pathElement];
                deltaObjPath.push(deltaObj);
            }

            console.log(deltaObjPath.length, path.length);
            if (deltaObjPath.length === path.length + 1) {

                delete deltaObj[property];

                //Traverse back up and clean empty objects
                if (deltaObjPath.length > -1) {
                    deltaObjPath.reverse();
                    for (let pathIndex = 0; pathIndex < deltaObjPath.length - 1; pathIndex++) {
                        const pathElement = deltaObjPath[pathIndex + 1];
                        if (Object.keys(deltaObjPath[pathIndex]).length === 0) {
                            delete pathElement[path[deltaObjPath.length - pathIndex - 2]];
                        }
                    }
                }

            }
        }
        else {

            let deltaObj = path!.reduce((deltaCursor, pathElement) => {
                if (!deltaCursor[pathElement])
                    deltaCursor[pathElement] = {};

                return deltaCursor[pathElement]
            }, privates.changesDelta)

            deltaObj[property!] = value;

        }
    }, ...observers];

    Object.assign(self, original);

    Object.defineProperties(self, {

        getChanges: {
            value: () => {
                return _.cloneDeep(privates.changesDelta);
            },
            writable: false
        }

    });
    return bindProxy(privates, self, self, observers);;
}

/**
 * Allows for using proxify as an abstract class to extend from.
 */
export class Proxify implements iProxify {

    getChanges() { let r: any; return r }

    constructor(o: any) {
        //Will override all members of this class
        return proxify(o);
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
    obj: T | any = root,
    observers: observer[] = [],
    path: (string | number | symbol)[] = []
): T & iProxify {

    if (typeof obj === 'undefined' || obj === null || typeof obj === 'function') {
        //Cannot access children of undefined or null and functions should not be proxified
        return obj;
    }


    /*
    TypeOf Array is always 'object', so we get that info from the constructor
    or alternative would be Symbol.iterator in Object which is not 100% accurate
    */
    const constructor: () => T = Object.getPrototypeOf(obj).constructor;

    //If type object, we want to iterate through members and proxify them before 
    //finally creating the current object's proxy
    if (typeof obj === "object") {

        for (const [k, v] of Object.entries(obj)) {
            //Arrays have special treatment due to length property also changing when appending etc.
            if (!(constructor.name === 'Array' && k === 'length'))
                obj[k] = bindProxy(privates, root, v, observers, [...path, k]);
        }

        const handler = {

            deleteProperty: (target: any, property: string | number) => {
                console.log(`${property} was deleted`);

                //Keeping the property, but with undefined value in the change Object so we can track the delete    
                for (const obs of observers) {
                    obs(path, obj, property, undefined);
                }
                return delete target[property];
            },

            set: (target: any, property: string | number, value: any, receiver: any): any => {

                target[property] = (typeof value === "object") ? bindProxy(privates, root, value, observers, [...path, property]) : value;

                for (const obs of observers) {
                    obs(path, obj, property, value);
                }

                return receiver;
            }
        };

        return new Proxy(obj, handler);

    }

    return obj;
}

/**
 * Private object to manage change tracking features
 */
interface proxyPrivates {
    oldValues: any;
    changesDelta: any;
}

/**
 * Key Value structure of dot notation changes
 */
interface changesDot {
    [key: string]: any
}