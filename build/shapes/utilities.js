"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLineSegment = exports.isCircle = exports.isRect = void 0;
var isRect = function (rect) {
    for (var _i = 0, _a = ['x0', 'x1', 'y0', 'y1', 'width', 'height']; _i < _a.length; _i++) {
        var prop = _a[_i];
        if (!(prop in rect))
            return false;
    }
    if ('radius' in rect)
        return false;
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
var isLineSegment = function (line) {
    for (var _i = 0, _a = ['start', 'end']; _i < _a.length; _i++) {
        var prop = _a[_i];
        if (!(prop in line))
            return false;
    }
    return true;
};
exports.isLineSegment = isLineSegment;
//# sourceMappingURL=utilities.js.map