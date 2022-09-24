"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollisionDetection = void 0;
var BoundingBox_1 = require("../shapes/rects/BoundingBox");
var utilities_1 = require("../shapes/utilities");
var Vectors_1 = require("../Vectors");
var CollisionDetection = /** @class */ (function () {
    function CollisionDetection() {
    }
    CollisionDetection.getMovementBoundingBox = function (body) {
        if (!body.isMoving())
            return null;
        var x0 = body.x0, x1 = body.x1, y0 = body.y0, y1 = body.y1, _a = body.velocity, dx = _a.x, dy = _a.y;
        var bounds = { x0: x0, x1: x1, y0: y0, y1: y1 };
        if (dx > 0)
            bounds.x1 += dx;
        if (dx < 0)
            bounds.x0 += dx;
        if (dy > 0)
            bounds.y1 += dy;
        if (dy < 0)
            bounds.y0 += dy;
        return new BoundingBox_1.BoundingBox(bounds);
    };
    CollisionDetection.hasOverlap = function (a, b) {
        if ((0, utilities_1.isCircle)(a)) {
            if ((0, utilities_1.isCircle)(b)) {
                return CollisionDetection.getCircleVsCircleOverlap(a, b);
            }
            if ((0, utilities_1.isRect)(b)) {
                return CollisionDetection.getCircleVsRectOverlap(a, b);
            }
        }
        if ((0, utilities_1.isRect)(a)) {
            if ((0, utilities_1.isCircle)(b)) {
                return CollisionDetection.getCircleVsRectOverlap(b, a);
            }
            if ((0, utilities_1.isRect)(b)) {
                return CollisionDetection.getRectVsRectOverlap(a, b);
            }
        }
        throw new Error("can't determine overlap for shapes: ".concat(JSON.stringify(a), ", ").concat(JSON.stringify(b)));
    };
    CollisionDetection.getCircleVsCircleOverlap = function (a, b) {
        var diffPos = Vectors_1.Vectors.subtract(a, b);
        var radiiLength = a.radius + b.radius;
        return Math.pow(diffPos.x, 2) + Math.pow(diffPos.y, 2) <= Math.pow(radiiLength, 2);
    };
    // https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
    CollisionDetection.getCircleVsRectOverlap = function (circle, rect) {
        var dx = Math.abs(circle.x - rect.x);
        var dy = Math.abs(circle.y - rect.y);
        // check if circle is beyond the length of the radius and half the rect
        if (dx > rect.width / 2 + circle.radius)
            return false;
        if (dy > rect.height / 2 + circle.radius)
            return false;
        // check if is circle is close enough to rect to guarantee intersection
        if (dx <= rect.width / 2)
            return true;
        if (dy <= rect.height / 2)
            return true;
        var circleDistanceFromCorner = Math.pow((dx - rect.width / 2), 2) + Math.pow((dy - rect.height / 2), 2);
        return circleDistanceFromCorner <= Math.pow(circle.radius, 2);
    };
    CollisionDetection.getRectVsRectOverlap = function (a, b) {
        return a.x0 <= b.x1 && a.x1 >= b.x0 && a.y0 <= b.y1 && a.y1 >= b.y0;
    };
    return CollisionDetection;
}());
exports.CollisionDetection = CollisionDetection;
//# sourceMappingURL=CollisionDetection.js.map