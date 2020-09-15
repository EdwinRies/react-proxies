import _ from 'lodash';
import { observer } from './proxify';

export default function changeObserver(obj: any): [observer, () => any] {

    const oldValues = _.cloneDeep(obj);

    const changesDelta: any = {};


    const getChanges = () => {
        return _.cloneDeep(changesDelta);
    }


    const observer: observer = (path, obj: any, property, value) => {

        //We don't care to track the length property of arrays
        if (typeof obj === 'object' && Symbol.iterator in obj && property === "length") {
            return;
        }

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
        }, oldValues);


        console.log(`${(path.join('.') + (path.length ? '.' : '') + property.toString())} being set to`, value);
        //Compare with old value
        if (_.isEqual(oldValObj[property], value)) {
            console.log(`${(property as string)} Equal to initial value`);
            //If we revert to the old value, we need to cleanup the delta object
            let deltaObj = changesDelta;

            let deltaObjPath = [deltaObj];

            //Traverse down the nested objects as close as possible to the changed property
            for (const pathElement of path) {
                if (!deltaObj[pathElement])
                    break;

                deltaObj = deltaObj[pathElement];
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
            }, changesDelta);

            if (typeof value === 'object') {

                const keys = [];

                if (oldValObj[property] && typeof oldValObj[property] === 'object')
                    keys.push(...Object.keys(oldValObj[property]));

                if (value && typeof value === 'object')
                    keys.push(...Object.keys(value));

                for (const key of ([...new Set(keys)])) {
                    if (oldValObj[property] && !_.isEqual(oldValObj[property][key], value[key]))
                        observer([...path, property], obj[property], key, value[key]);
                }
                return;
            }

            if (typeof deltaObj === 'object')
                deltaObj[property!] = value;

        }
    }

    return [observer, getChanges];

}