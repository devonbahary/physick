"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineSegments = exports.VertLineSegment = exports.HorzLineSegment = void 0;
var utilities_1 = require("../utilities");
var HorzLineSegment = /** @class */ (function () {
    function HorzLineSegment(_a) {
        var x0 = _a.x0, x1 = _a.x1, y = _a.y;
        this.x0 = x0;
        this.x1 = x1;
        this.y = y;
    }
    return HorzLineSegment;
}());
exports.HorzLineSegment = HorzLineSegment;
var VertLineSegment = /** @class */ (function () {
    function VertLineSegment(_a) {
        var x = _a.x, y0 = _a.y0, y1 = _a.y1;
        this.x = x;
        this.y0 = y0;
        this.y1 = y1;
    }
    return VertLineSegment;
}());
exports.VertLineSegment = VertLineSegment;
var invalidOverlappingSegmentsErrMessage = function (a, b) {
    return "can't get overlap of incompatible line segments ".concat(JSON.stringify(a), ", ").concat(JSON.stringify(b));
};
var LineSegments = /** @class */ (function () {
    function LineSegments() {
    }
    LineSegments.isPoint = function (line) {
        if (line instanceof HorzLineSegment) {
            return line.x0 === line.x1;
        }
        if (line instanceof VertLineSegment) {
            return line.y0 === line.y1;
        }
        throw new Error("invalid LineSegment");
    };
    LineSegments.getOverlappingSegment = function (a, b) {
        if (a instanceof HorzLineSegment) {
            if (b instanceof HorzLineSegment) {
                var x0 = Math.max(a.x0, b.x0);
                var x1 = Math.min(a.x1, b.x1);
                if (a.y !== b.y ||
                    !(0, utilities_1.isInRange)(a.x0, x0, a.x1) ||
                    !(0, utilities_1.isInRange)(a.x0, x1, a.x1) ||
                    !(0, utilities_1.isInRange)(b.x0, x0, b.x1) ||
                    !(0, utilities_1.isInRange)(b.x0, x1, b.x1)) {
                    throw new Error(invalidOverlappingSegmentsErrMessage(a, b));
                }
                return new HorzLineSegment({ x0: x0, x1: x1, y: a.y });
            }
        }
        if (a instanceof VertLineSegment) {
            if (b instanceof VertLineSegment) {
                var y0 = Math.max(a.y0, b.y0);
                var y1 = Math.min(a.y1, b.y1);
                if (a.x !== b.x ||
                    !(0, utilities_1.isInRange)(a.y0, y0, a.y1) ||
                    !(0, utilities_1.isInRange)(a.y0, y1, a.y1) ||
                    !(0, utilities_1.isInRange)(b.y0, y0, b.y1) ||
                    !(0, utilities_1.isInRange)(b.y0, y1, b.y1)) {
                    throw new Error(invalidOverlappingSegmentsErrMessage(a, b));
                }
                return new VertLineSegment({ y0: y0, y1: y1, x: a.x });
            }
        }
        throw new Error(invalidOverlappingSegmentsErrMessage(a, b));
    };
    return LineSegments;
}());
exports.LineSegments = LineSegments;
//# sourceMappingURL=LineSegments.js.map