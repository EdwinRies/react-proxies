import React from 'react';
import logo from './logo.svg';
import './App.css';

import { proxify } from './util/proxify';

const o = { a: 1, b: 2, c: { d: 3, e: 4, f: [1, 2, 3, [4, 5, { g: 6 }]] }, func: () => { return 'hi' } };

const p = new (proxify as any)(o);

//Object test
p.c.d = 4;
//Array test
p.c.f[0] = 2;
p.c.f[0] = 1;


function App() {
  return (
    <div>
      <pre className="App">
        {JSON.stringify(p, null, 4)}
      </pre>
      <pre>
        {JSON.stringify(p.getChanges(), null, 4)}
      </pre>
    </div>
  );
}

export default App;
