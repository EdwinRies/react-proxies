import React, { useState } from 'react';
import './App.scss';

import { proxify } from './util/proxify';

import { TreeNode } from './TreeNode';

import { ChangeTracker } from './ChangeTracker';

import { ChangesDotNotation } from './ChangesDotNotation';
import changeObserver from './util/changeObserver';

const o: any = {
  a: "Hello",
  b: "World",
  c: {
    d: "This",
    e: "Is",
    f: [
      "Tracking",
      "All",
      "Your",
      [
        "Changes",
        "!",
        {
          g: "😊"
        }
      ]
    ]
  }
};

const [observer, getChanges] = changeObserver(o);

const p = proxify(o, [
  observer,
  () => {
    setChanges(getChanges());
  }
]);

let changes: any = {}, setChanges: React.Dispatch<any> = () => { }

function App() {
  [changes, setChanges] = useState({});

  return (
    <>
      <div className="PlayField">
        <div className="Left">
          <h3>Proxified Object</h3>
          <TreeNode value={p} ></TreeNode>
        </div>
        <div className="Right">
          <h3>Delta Object Tracking Changes</h3>
          <ChangeTracker value={changes}></ChangeTracker>
        </div>
      </div>
      <div className="DotNotationLog"><ChangesDotNotation value={changes}></ChangesDotNotation></div>
    </>
  );
}

export default App;
