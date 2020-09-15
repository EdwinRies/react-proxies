/**
 * Unique symbol for detecting whether an object has already been proxified.
 */
const proxifiedSymbol = Symbol();

/**
 * Any extra members to be added to a proxified object
 */
interface iProxify {

}


export interface observer {
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

    Object.assign(self, original);

    return bindProxy(self, self, observers);;
}

/**
 * Allows for using proxify as an abstract class to extend from.
 */
export class Proxify implements iProxify {

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
    root: (T | object) & iProxify,
    obj: T | any = root,
    observers: observer[] = [],
    path: (string | number | symbol)[] = []
): T & iProxify {

    if (typeof obj === 'undefined' || obj === null || typeof obj === 'function') {
        //Cannot access children of undefined or null and functions should not be proxified
        return obj;
    }

    if (obj[proxifiedSymbol])
        return obj;


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
                obj[k] = bindProxy(root, v, observers, [...path, k]);
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

                target[property] = (typeof value === "object") ? bindProxy(root, value, observers, [...path, property]) : value;

                //Call all observers
                for (const obs of observers) {
                    obs(path, obj, property, value);
                }

                return receiver;
            },

            get: (target: any, property: any): any => {
                if (property === proxifiedSymbol)
                    return true

                return target[property];
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