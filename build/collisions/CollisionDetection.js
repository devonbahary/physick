"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollisionDetection = void 0;
var BoundingBox_1 = require("../shapes/rects/BoundingBox");
var utilities_1 = require("../shapes/utilities");
var Vectors_1 = require("../Vectors");
var LineSegments_1 = require("../shapes/LineSegments");
var utilities_2 = require("../utilities");
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
            if (b instanceof LineSegments_1.LineSegment) {
                return CollisionDetection.getCircleVsLineOverlap(a, b);
            }
        }
        if ((0, utilities_1.isRect)(a)) {
            if ((0, utilities_1.isCircle)(b)) {
                return CollisionDetection.getCircleVsRectOverlap(b, a);
            }
            if ((0, utilities_1.isRect)(b)) {
                return CollisionDetection.getRectVsRectOverlap(a, b);
            }
            if (b instanceof LineSegments_1.LineSegment) {
                return CollisionDetection.getRectVsLineOverlap(a, b);
            }
        }
        if (a instanceof LineSegments_1.LineSegment) {
            if ((0, utilities_1.isCircle)(b)) {
                return CollisionDetection.getCircleVsLineOverlap(b, a);
            }
            if ((0, utilities_1.isRect)(b)) {
                return CollisionDetection.getRectVsLineOverlap(b, a);
            }
            if (b instanceof LineSegments_1.LineSegment) {
                return CollisionDetection.getLineVsLineOverlap(a, b);
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
    // https://www.jeffreythompson.org/collision-detection/line-circle.php
    CollisionDetection.getCircleVsLineOverlap = function (circle, line) {
        // check if either end of the line segment exists inside the circle
        if (CollisionDetection.getCircleVsPointOverlap(circle, line.start))
            return true;
        if (CollisionDetection.getCircleVsPointOverlap(circle, line.end))
            return true;
        var lineAsVector = line.toVector();
        var startToCircle = Vectors_1.Vectors.subtract(circle, line.start);
        var projScalar = Vectors_1.Vectors.dot(startToCircle, lineAsVector) / Vectors_1.Vectors.dot(lineAsVector, lineAsVector);
        if (projScalar < 0) {
            return false; // closest point on line is beyond the start of line segment
        }
        var projStartToCircleOntoLineSegment = Vectors_1.Vectors.mult(lineAsVector, projScalar);
        if (Vectors_1.Vectors.isLarger(projStartToCircleOntoLineSegment, lineAsVector)) {
            return false; // closest point on line is beyond the end of line segment
        }
        var closestPointToCircleVector = Vectors_1.Vectors.subtract(circle, Vectors_1.Vectors.add(line.start, projStartToCircleOntoLineSegment));
        // circle overlaps with line if the radius is >= than the distance to closest point
        return Math.pow(closestPointToCircleVector.x, 2) + Math.pow(closestPointToCircleVector.y, 2) <= Math.pow(circle.radius, 2);
    };
    CollisionDetection.getCircleVsPointOverlap = function (circle, point) {
        var diffPos = Vectors_1.Vectors.subtract(circle, point);
        return Math.pow(diffPos.x, 2) + Math.pow(diffPos.y, 2) <= Math.pow(circle.radius, 2);
    };
    CollisionDetection.getRectVsLineOverlap = function (rect, line) {
        var topLeftCorner = { x: rect.x0, y: rect.y0 };
        var topRightCorner = { x: rect.x1, y: rect.y0 };
        var bottomRightCorner = { x: rect.x1, y: rect.y1 };
        var bottomLeftCorner = { x: rect.x0, y: rect.y1 };
        var rectLineSegments = [
            new LineSegments_1.LineSegment(topLeftCorner, topRightCorner),
            new LineSegments_1.LineSegment(topRightCorner, bottomRightCorner),
            new LineSegments_1.LineSegment(bottomRightCorner, bottomLeftCorner),
            new LineSegments_1.LineSegment(bottomLeftCorner, topLeftCorner),
        ];
        for (var _i = 0, rectLineSegments_1 = rectLineSegments; _i < rectLineSegments_1.length; _i++) {
            var rectLineSegment = rectLineSegments_1[_i];
            if (CollisionDetection.getLineVsLineOverlap(line, rectLineSegment)) {
                return true;
            }
        }
        return false;
    };
    // https://www.jeffreythompson.org/collision-detection/line-line.php
    CollisionDetection.getLineVsLineOverlap = function (a, b) {
        var _a = a.start, x1 = _a.x, y1 = _a.y, _b = a.end, x2 = _b.x, y2 = _b.y;
        var _c = b.start, x3 = _c.x, y3 = _c.y, _d = b.end, x4 = _d.x, y4 = _d.y;
        var uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
        var uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
        return (0, utilities_2.isInRange)(0, uA, 1) && (0, utilities_2.isInRange)(0, uB, 1);
    };
    return CollisionDetection;
}());
exports.CollisionDetection = CollisionDetection;
//# sourceMappingURL=CollisionDetection.js.map