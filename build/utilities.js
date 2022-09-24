"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.framesInTimeDelta = exports.roundForFloatingPoint = exports.quadratic = exports.isInRange = void 0;
var MS_IN_SECOND = 1000;
var DESIRED_FRAMES_PER_SECOND = 60;
var isInRange = function (min, num, max) {
    return num >= min && num <= max;
};
exports.isInRange = isInRange;
var quadratic = function (a, b, c) {
    var roots = [(-b + Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a), (-b - Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a)];
    return roots.filter(function (r) { return !isNaN(r); });
};
exports.quadratic = quadratic;
var roundForFloatingPoint = function (num) { return Math.round(num * 1000) / 1000; };
exports.roundForFloatingPoint = roundForFloatingPoint;
var framesInTimeDelta = function (dt) {
    return (DESIRED_FRAMES_PER_SECOND * dt) / MS_IN_SECOND; // # "frame" defined as 1/60s
};
exports.framesInTimeDelta = framesInTimeDelta;
//# sourceMappingURL=utilities.js.map