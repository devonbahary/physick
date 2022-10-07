"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VertLineSegment = exports.HorzLineSegment = exports.LineSegment = void 0;
var utilities_1 = require("../utilities");
var LineSegment = /** @class */ (function () {
    function LineSegment(start, end) {
        this.start = start;
        this.end = end;
    }
    Object.defineProperty(LineSegment.prototype, "x0", {
        get: function () {
            return Math.min(this.start.x, this.end.x);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LineSegment.prototype, "x1", {
        get: function () {
            return Math.max(this.start.x, this.end.x);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LineSegment.prototype, "y0", {
        get: function () {
            return Math.min(this.start.y, this.end.y);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LineSegment.prototype, "y1", {
        get: function () {
            return Math.max(this.start.y, this.end.y);
        },
        enumerable: false,
        configurable: true
    });
    LineSegment.isPoint = function (lineSegment) {
        return lineSegment.start.x === lineSegment.end.x && lineSegment.start.y === lineSegment.end.y;
    };
    LineSegment.isHorzLine = function (lineSegment) {
        return lineSegment.start.y === lineSegment.end.y;
    };
    LineSegment.isVertLine = function (lineSegment) {
        return lineSegment.start.x === lineSegment.end.x;
    };
    LineSegment.getOverlappingLineSegment = function (a, b) {
        if (LineSegment.isHorzLine(a) && LineSegment.isHorzLine(b)) {
            var x0 = Math.max(a.x0, b.x0);
            var x1 = Math.min(a.x1, b.x1);
            if (a.y0 !== b.y0 || // y0 and y1 will be the same
                !(0, utilities_1.isInRange)(a.x0, x0, a.x1) ||
                !(0, utilities_1.isInRange)(a.x0, x1, a.x1) ||
                !(0, utilities_1.isInRange)(b.x0, x0, b.x1) ||
                !(0, utilities_1.isInRange)(b.x0, x1, b.x1)) {
                throw new Error("can't get overlap of incompatible line segments: ".concat(JSON.stringify(a), ", ").concat(JSON.stringify(b)));
            }
            return (0, exports.HorzLineSegment)({ x0: x0, x1: x1, y: a.start.y }); // y0 and y1 will be the same
        }
        if (LineSegment.isVertLine(a) && LineSegment.isVertLine(b)) {
            var y0 = Math.max(a.y0, b.y0);
            var y1 = Math.min(a.y1, b.y1);
            if (a.x0 !== b.x0 || // x0 and x1 will be the same
                !(0, utilities_1.isInRange)(a.y0, y0, a.y1) ||
                !(0, utilities_1.isInRange)(a.y0, y1, a.y1) ||
                !(0, utilities_1.isInRange)(b.y0, y0, b.y1) ||
                !(0, utilities_1.isInRange)(b.y0, y1, b.y1)) {
                throw new Error("can't get overlap of incompatible line segments: ".concat(JSON.stringify(a), ", ").concat(JSON.stringify(b)));
            }
            return (0, exports.VertLineSegment)({ y0: y0, y1: y1, x: a.x0 }); // x0 and x1 will be the same
        }
        throw new Error("can only getOverlappingLineSegment() for mutually vertical / horizontal lines");
    };
    return LineSegment;
}());
exports.LineSegment = LineSegment;
var HorzLineSegment = function (args) {
    var x0 = args.x0, x1 = args.x1, y = args.y;
    return new LineSegment({ x: x0, y: y }, { x: x1, y: y });
};
exports.HorzLineSegment = HorzLineSegment;
var VertLineSegment = function (args) {
    var x = args.x, y0 = args.y0, y1 = args.y1;
    return new LineSegment({ x: x, y: y0 }, { x: x, y: y1 });
};
exports.VertLineSegment = VertLineSegment;
//# sourceMappingURL=LineSegment.js.map