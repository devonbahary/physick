"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vectors = void 0;
var Vectors = /** @class */ (function () {
    function Vectors() {
    }
    Vectors.magnitude = function (v) {
        return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
    };
    Vectors.hasMagnitude = function (v) {
        // less expensive than sqrt() === 0
        return Boolean(v.x || v.y);
    };
    Vectors.add = function (a, b) {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
        };
    };
    Vectors.subtract = function (a, b) {
        return {
            x: a.x - b.x,
            y: a.y - b.y,
        };
    };
    Vectors.mult = function (v, scalar) {
        return {
            x: v.x * scalar,
            y: v.y * scalar,
        };
    };
    Vectors.divide = function (v, scalar) {
        return {
            x: v.x / scalar,
            y: v.y / scalar,
        };
    };
    Vectors.opposite = function (v) {
        return Vectors.mult(v, -1);
    };
    Vectors.normal = function (v) {
        return { x: -v.y, y: v.x }; // either <-y, x> or <y, -x>
    };
    Vectors.normalized = function (v) {
        var mag = Vectors.magnitude(v);
        if (!mag)
            return v;
        return Vectors.divide(v, mag);
    };
    Vectors.dot = function (a, b) {
        return a.x * b.x + a.y * b.y;
    };
    Vectors.proj = function (of, onto) {
        return Vectors.mult(onto, Vectors.dot(of, onto) / Vectors.dot(onto, onto));
    };
    Vectors.resize = function (v, scalar) {
        var mag = Vectors.magnitude(v);
        if (!mag)
            return v;
        var ratio = scalar / mag;
        return {
            x: v.x * ratio,
            y: v.y * ratio,
        };
    };
    Vectors.isLarger = function (a, b) {
        // compare magnitudes without expensive sqrt()
        return Math.pow(a.x, 2) + Math.pow(a.y, 2) > Math.pow(b.x, 2) + Math.pow(b.y, 2);
    };
    Vectors.isSameDirection = function (a, b) {
        return Vectors.dot(a, b) > 0;
    };
    Vectors.isSame = function (a, b) {
        return a.x === b.x && a.y === b.y;
    };
    return Vectors;
}());
exports.Vectors = Vectors;
//# sourceMappingURL=Vectors.js.map