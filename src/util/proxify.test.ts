import { proxify, Proxify } from './proxify';

const o = { a: 1, b: 2, c: { d: 3, e: 4 } };


describe('Testing Proxify', () => {
    test('Testing Creation of Proxified Object', () => {
        const p = new Proxify(o);

        console.log(p.getChanges());

        expect(p).toEqual(o);
    })
})