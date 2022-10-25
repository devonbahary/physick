"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VertLineSegment = exports.HorzLineSegment = exports.LineSegment = void 0;
var utilities_1 = require("../utilities");
var Vectors_1 = require("../Vectors");
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
    LineSegment.prototype.toVector = function () {
        return Vectors_1.Vectors.subtract(this.end, this.start);
    };
    LineSegment.isPoint = function (lineSegment) {
        return lineSegment.start.x === lineSegment.end.x && lineSegment.start.y === lineSegment.end.y;
    };
    LineSegment.getOverlappingLineSegment = function (a, b) {
        if (a instanceof HorzLineSegment && b instanceof HorzLineSegment) {
            var x0 = Math.max(a.x0, b.x0);
            var x1 = Math.min(a.x1, b.x1);
            if (a.y !== b.y ||
                !(0, utilities_1.isInRange)(a.x0, x0, a.x1, true) ||
                !(0, utilities_1.isInRange)(a.x0, x1, a.x1, true) ||
                !(0, utilities_1.isInRange)(b.x0, x0, b.x1, true) ||
                !(0, utilities_1.isInRange)(b.x0, x1, b.x1, true)) {
                throw new Error("can't get overlap of incompatible line segments: ".concat(JSON.stringify(a), ", ").concat(JSON.stringify(b)));
            }
            return new HorzLineSegment({ x0: x0, x1: x1, y: a.y }); // a.y === b.y
        }
        if (a instanceof VertLineSegment && b instanceof VertLineSegment) {
            var y0 = Math.max(a.y0, b.y0);
            var y1 = Math.min(a.y1, b.y1);
            if (a.x !== b.x ||
                !(0, utilities_1.isInRange)(a.y0, y0, a.y1, true) ||
                !(0, utilities_1.isInRange)(a.y0, y1, a.y1, true) ||
                !(0, utilities_1.isInRange)(b.y0, y0, b.y1, true) ||
                !(0, utilities_1.isInRange)(b.y0, y1, b.y1, true)) {
                throw new Error("can't get overlap of incompatible line segments: ".concat(JSON.stringify(a), ", ").concat(JSON.stringify(b)));
            }
            return new VertLineSegment({ y0: y0, y1: y1, x: a.x }); // a.x === b.x
        }
        throw new Error("can only getOverlappingLineSegment() for mutually vertical / horizontal lines");
    };
    return LineSegment;
}());
exports.LineSegment = LineSegment;
var HorzLineSegment = /** @class */ (function (_super) {
    __extends(HorzLineSegment, _super);
    function HorzLineSegment(args) {
        var x0 = args.x0, x1 = args.x1, y = args.y;
        return _super.call(this, { x: x0, y: y }, { x: x1, y: y }) || this;
    }
    Object.defineProperty(HorzLineSegment.prototype, "y", {
        get: function () {
            return this.start.y; // arbitrarily choosing start.y instead of end.y
        },
        enumerable: false,
        configurable: true
    });
    return HorzLineSegment;
}(LineSegment));
exports.HorzLineSegment = HorzLineSegment;
var VertLineSegment = /** @class */ (function (_super) {
    __extends(VertLineSegment, _super);
    function VertLineSegment(args) {
        var x = args.x, y0 = args.y0, y1 = args.y1;
        return _super.call(this, { x: x, y: y0 }, { x: x, y: y1 }) || this;
    }
    Object.defineProperty(VertLineSegment.prototype, "x", {
        get: function () {
            return this.start.x; // arbitrarily choosing start.y instead of end.y
        },
        enumerable: false,
        configurable: true
    });
    return VertLineSegment;
}(LineSegment));
exports.VertLineSegment = VertLineSegment;
//# sourceMappingURL=LineSegments.js.map