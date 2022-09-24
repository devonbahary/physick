"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCircle = exports.isRect = void 0;
var isRect = function (rect) {
    for (var _i = 0, _a = ['x0', 'x1', 'y0', 'y1']; _i < _a.length; _i++) {
        var prop = _a[_i];
        if (!(prop in rect))
            return false;
    }
    return true;
};
exports.isRect = isRect;
var isCircle = function (circle) {
    for (var _i = 0, _a = ['x', 'y', 'radius']; _i < _a.length; _i++) {
        var prop = _a[_i];
        if (!(prop in circle))
            return false;
    }
    return true;
};
exports.isCircle = isCircle;
//# sourceMappingURL=utilities.js.map