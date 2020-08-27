"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.TreeNode = void 0;
var react_1 = require("react");
require("./treenode.scss");
var TreeNode = /** @class */ (function (_super) {
    __extends(TreeNode, _super);
    function TreeNode(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            value: props.value
        };
        return _this;
    }
    TreeNode.prototype.render = function () {
        var value = this.state.value;
        if (typeof value === 'object') {
            var constructor = Object.getPrototypeOf(value).constructor;
            var isArray = constructor.name === 'Array';
            if (isArray) {
                return react_1["default"].createElement("div", { className: "TreeNode Array" },
                    react_1["default"].createElement("ul", null, Object.entries(value).map(function (_a) {
                        var k = _a[0], v = _a[1];
                        return react_1["default"].createElement("li", { key: k },
                            react_1["default"].createElement("div", { className: "property" },
                                react_1["default"].createElement(TreeNode, { value: v, key: k })));
                    })));
            }
            else {
                return react_1["default"].createElement("div", { className: "TreeNode Object" },
                    react_1["default"].createElement("ul", null, Object.entries(value).map(function (_a) {
                        var k = _a[0], v = _a[1];
                        return react_1["default"].createElement("li", { key: k },
                            react_1["default"].createElement("div", { className: "property" },
                                react_1["default"].createElement("div", { className: "key" }, k),
                                react_1["default"].createElement(TreeNode, { value: v, key: k })));
                    })));
            }
        }
        return react_1["default"].createElement("div", { className: "NodeVal" }, "" + value);
    };
    return TreeNode;
}(react_1["default"].Component));
exports.TreeNode = TreeNode;
