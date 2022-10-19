"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPoint = exports.isLineSegment = exports.isCircle = exports.isRect = void 0;
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
var isPoint = function (point) {
    for (var _i = 0, _a = ['x', 'y']; _i < _a.length; _i++) {
        var prop = _a[_i];
        if (!(prop in point))
            return false;
    }
    for (var _b = 0, _c = ['radius', 'width', 'height']; _b < _c.length; _b++) {
        var prop = _c[_b];
        if (prop in point)
            return false;
    }
    return true;
};
exports.isPoint = isPoint;
//# sourceMappingURL=utilities.js.map