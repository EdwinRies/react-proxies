import React from 'react';
import './App.scss';

import { proxify } from './util/proxify';

import { TreeNode } from './TreeNode';

const o = {
  a: 1,
  b: 2,
  c: {
    d: 3,
    e: 4,
    f: [
      1,
      2,
      3,
      [
        4,
        5,
        {
          g: 6
        }
      ]
    ]
  }
};

const p = new (proxify as any)(o);

//Object test
p.c.d = 4;
//Array test
p.c.f[0] = 2;
p.c.f[0] = 1;

//delete p.c.f;

p.c.g = 9;


function App() {
  return (
    <div className="PlayField">
      <div className="Left">
        <h3>Proxified Object</h3>
        <TreeNode value={p}></TreeNode>
      </div>
      <div className="Right">
        <h3>Delta Object Tracking Changes</h3>
        <TreeNode value={p.getChanges()}></TreeNode>
      </div>
    </div>
  );
}

export default App;
