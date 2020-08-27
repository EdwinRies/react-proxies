"use strict";
exports.__esModule = true;
var react_1 = require("react");
require("./App.scss");
var proxify_1 = require("./util/proxify");
var TreeNode_1 = require("./TreeNode");
var o = {
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
var p = new proxify_1.proxify(o);
//Object test
p.c.d = 4;
//Array test
p.c.f[0] = 2;
p.c.f[0] = 1;
//delete p.c.f;
p.c.g = 9;
function App() {
    return (react_1["default"].createElement("div", { className: "PlayField" },
        react_1["default"].createElement("div", { className: "Left" },
            react_1["default"].createElement("h3", null, "Proxified Object"),
            react_1["default"].createElement(TreeNode_1.TreeNode, { value: p })),
        react_1["default"].createElement("div", { className: "Right" },
            react_1["default"].createElement("h3", null, "Delta Object Tracking Changes"),
            react_1["default"].createElement(TreeNode_1.TreeNode, { value: p.getChanges() }))));
}
exports["default"] = App;
