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
                return privates.oldValues;
            },
            writable: false
        }

    });

    return bindProxy(privates, original);;
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
    TypeOf Array = Object, so we need constructor 
    or alternative would be Symbol.iterator in Object which is not 100% accurate
    */
    const constructor: () => T = Object.getPrototypeOf(o).constructor;

    console.log(constructor.name, o, path);

    if (constructor.name === "Array") {
        //Arrays have special treatment due to Count property also changing when appending etc.
        for (const [k, v] of Object.entries(o)) {
            if (typeof k === 'number') {
                privates.oldValues[path.map(v => v.key).join('.') + k] = o;
                console.log(JSON.stringify(privates.oldValues));
                o[k] = bindProxy(privates, root, v, [...path, { parentObj: o, key: k }]);
            }
        }
        return new Proxy(o, {
            set: (target: any, property: string | number, value: any, receiver): any => {
                target[property] = value;
                return receiver;
            }
        })
    }

    if (typeof o === "object") {
        for (const [k, v] of Object.entries(o)) {
            o[k] = bindProxy(privates, root, v, [...path, { parentObj: o, key: k }]);
        }
        return new Proxy(o, {
            set: (target: any, property: string | number, value: any, receiver): any => {
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