import { proxify, Proxify } from './proxify';

const o = { a: 1, b: 2, c: { d: 3, e: 4, f: [1, 2, 3, [4, 5, { g: 6 }]] }, func: () => { return 'hi' } };






describe('Testing Proxify', () => {
    let p: any;
    test('Testing Creation of Proxified Object', () => {
        p = new (proxify as any)(o);

        //Even though the object is now a proxy, 
        //it should fool normal JS into making it seem equal
        expect(p).toEqual(o);
    });

    test('Testing change tracking of Proxified Object', () => {

        //No changes to be expected initially
        expect(p.getChanges()).toEqual({});
        //Object test
        p.c.d = 4;
        expect(p.getChanges()).toEqual({ c: { d: 4 } });

        //Reset value back to initial
        p.c.d = 3;
        expect(p.getChanges()).toEqual({});

        //Array test
        p.c.f[0] = 2;
        expect(p.getChanges()).toEqual({ c: { f: { '0': 2 } } });

        //Reset value
        p.c.f[0] = 1;
        expect(p.getChanges()).toEqual({});
    });
})