"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContinousCollisionDetection = void 0;
var Circle_1 = require("../shapes/circles/Circle");
var Rect_1 = require("../shapes/rects/Rect");
var Particle_1 = require("../shapes/Particle");
var LineSegments_1 = require("../shapes/LineSegments");
var Vectors_1 = require("../Vectors");
var utilities_1 = require("../utilities");
var CollisionDetection_1 = require("../collisions/CollisionDetection");
var isCollisionInThisTimestep = function (t, dt) {
    var rounded = (0, utilities_1.roundForFloatingPoint)(t);
    return (0, utilities_1.isInRange)(0, rounded, dt);
};
var isMovingTowards = function (a, b) {
    var diffVector = Vectors_1.Vectors.subtract(b, a);
    var velocityInDiff = Vectors_1.Vectors.dot(diffVector, a.velocity);
    return (0, utilities_1.roundForFloatingPoint)(velocityInDiff) > 0;
};
var getEarliestCollision = function (collisions) {
    return collisions.reduce(function (earliest, collision) {
        if (earliest === null || earliest.timeOfCollision > collision.timeOfCollision) {
            return collision;
        }
        return earliest;
    }, null);
};
var ContinousCollisionDetection = /** @class */ (function () {
    function ContinousCollisionDetection() {
    }
    ContinousCollisionDetection.isChronological = function (collisionEvent) {
        // check that the speed at which the movingBody is moving towards collisionBody along the collision vector
        // is no slower than the speed at which collisionBody is (possibly) moving away
        var movingBody = collisionEvent.movingBody, collisionBody = collisionEvent.collisionBody, collisionVector = collisionEvent.collisionVector;
        if (!collisionBody.isMoving())
            return true;
        var movingBodyMovementOnCollisionVector = Vectors_1.Vectors.proj(movingBody.velocity, collisionVector);
        var collisionBodyMovementOnCollisionVector = Vectors_1.Vectors.proj(collisionBody.velocity, collisionVector);
        if (!Vectors_1.Vectors.isSameDirection(movingBodyMovementOnCollisionVector, collisionBodyMovementOnCollisionVector)) {
            return true; // moving towards each other
        }
        return !Vectors_1.Vectors.isLarger(collisionBodyMovementOnCollisionVector, movingBodyMovementOnCollisionVector);
    };
    ContinousCollisionDetection.getCollisionEvent = function (movingBody, world, dt, ignoreBodyIds) {
        if (ignoreBodyIds === void 0) { ignoreBodyIds = new Set(); }
        var movementBoundingBox = CollisionDetection_1.CollisionDetection.getMovementBoundingBox(movingBody);
        if (!movementBoundingBox)
            return null;
        var bodiesInBoundingBox = world.getBodiesInBoundingBox(movementBoundingBox);
        var potentialCollisionBodies = bodiesInBoundingBox.filter(function (body) { return !ignoreBodyIds.has(body.id); });
        return potentialCollisionBodies.reduce(function (earliest, collisionBody) {
            if (movingBody === collisionBody)
                return earliest;
            var collision = ContinousCollisionDetection.getCollision(movingBody, collisionBody, dt);
            if (!collision)
                return earliest;
            if (earliest === null || earliest.timeOfCollision > collision.timeOfCollision) {
                return __assign(__assign({}, collision), { movingBody: movingBody, collisionBody: collisionBody });
            }
            return earliest;
        }, null);
    };
    ContinousCollisionDetection.getCollision = function (a, b, dt) {
        if (a.shape instanceof Circle_1.Circle) {
            if (b.shape instanceof Circle_1.Circle)
                return ContinousCollisionDetection.getCircleVsCircleCollision(a.shape, b.shape, dt);
            if (b.shape instanceof Rect_1.Rect)
                return ContinousCollisionDetection.getCircleVsRectCollision(a.shape, b.shape, dt);
        }
        if (a.shape instanceof Rect_1.Rect) {
            if (b.shape instanceof Circle_1.Circle)
                return ContinousCollisionDetection.getRectVsCircleCollision(a.shape, b.shape, dt);
            if (b.shape instanceof Rect_1.Rect)
                return ContinousCollisionDetection.getRectVsRectCollision(a.shape, b.shape, dt);
        }
        return null;
    };
    ContinousCollisionDetection.getCircleVsCircleCollision = function (a, b, dt) {
        // don't consider circles not even moving in the direction of another circle
        if (!isMovingTowards(a, b))
            return null;
        var _a = a.velocity, dx = _a.x, dy = _a.y;
        var diffX = a.x - b.x;
        var diffY = a.y - b.y;
        var radiusA = a instanceof Circle_1.Circle ? a.radius : 0;
        var radiusB = b instanceof Circle_1.Circle ? b.radius : 0;
        var coefficientA = Math.pow(dx, 2) + Math.pow(dy, 2);
        var coefficientB = 2 * dx * diffX + 2 * dy * diffY;
        var coefficientC = Math.pow(diffX, 2) + Math.pow(diffY, 2) - Math.pow((radiusA + radiusB), 2);
        var timesOfCollision = (0, utilities_1.quadratic)(coefficientA, coefficientB, coefficientC);
        return timesOfCollision.reduce(function (earliest, t) {
            if (!isCollisionInThisTimestep(t, dt))
                return earliest;
            var aAtTimeOfCollision = new Particle_1.Particle(a.x + dx * t, a.y + dy * t);
            aAtTimeOfCollision.setVelocity(a.velocity);
            // glance, but not a collision
            if (!isMovingTowards(aAtTimeOfCollision, b))
                return earliest;
            if (earliest === null || earliest.timeOfCollision > t) {
                return {
                    timeOfCollision: t,
                    collisionVector: Vectors_1.Vectors.subtract(b, aAtTimeOfCollision),
                };
            }
            return earliest;
        }, null);
    };
    // https://gamedev.stackexchange.com/questions/65814/2d-rectangle-circle-continuous-collision-detection
    ContinousCollisionDetection.getCircleVsRectCollision = function (circle, rect, dt) {
        var radius = circle.radius, _a = circle.velocity, dx = _a.x, dy = _a.y;
        var x0 = rect.x0, x1 = rect.x1, y0 = rect.y0, y1 = rect.y1;
        // consider circle collision into each rect side
        var sideCollisions = [];
        var addSideCollision = function (circle, side, collisionVector) {
            var timeOfCollision = ContinousCollisionDetection.getPointVsLineTimeOfCollision(circle, side, dt);
            if (timeOfCollision !== null) {
                sideCollisions.push({
                    timeOfCollision: timeOfCollision,
                    collisionVector: collisionVector,
                });
            }
        };
        // extend the rectangle sides out by circle radius length so that we can simulate a point vs line collision
        var topSide = new LineSegments_1.HorzLineSegment({ x0: x0, x1: x1, y: y0 - radius });
        var bottomSide = new LineSegments_1.HorzLineSegment({ x0: x0, x1: x1, y: rect.y1 + radius });
        var rightSide = new LineSegments_1.VertLineSegment({ x: x1 + radius, y0: y0, y1: y1 });
        var leftSide = new LineSegments_1.VertLineSegment({ x: x0 - radius, y0: y0, y1: y1 });
        var xAxisCollisionDistance = circle.radius + rect.width / 2;
        var yAxisCollisionDistance = circle.radius + rect.height / 2;
        if (dy > 0)
            addSideCollision(circle, topSide, { x: 0, y: yAxisCollisionDistance });
        if (dy < 0)
            addSideCollision(circle, bottomSide, { x: 0, y: -yAxisCollisionDistance });
        if (dx < 0)
            addSideCollision(circle, rightSide, { x: -xAxisCollisionDistance, y: 0 });
        if (dx > 0)
            addSideCollision(circle, leftSide, { x: xAxisCollisionDistance, y: 0 });
        // consider circle collision into each rect corner
        var topLeftCorner = new Particle_1.Particle(x0, y0);
        var topRightCorner = new Particle_1.Particle(x1, y0);
        var bottomRightCorner = new Particle_1.Particle(x1, y1);
        var bottomLeftCorner = new Particle_1.Particle(x0, y1);
        var corners = [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner];
        var cornerCollisions = corners.reduce(function (collisions, corner) {
            if (isMovingTowards(circle, corner)) {
                var collision = ContinousCollisionDetection.getCircleVsCircleCollision(circle, corner, dt);
                if (collision)
                    collisions.push(collision);
            }
            return collisions;
        }, []);
        return getEarliestCollision(__spreadArray(__spreadArray([], sideCollisions, true), cornerCollisions, true));
    };
    // https://gamedev.stackexchange.com/questions/65814/2d-rectangle-circle-continuous-collision-detection
    ContinousCollisionDetection.getRectVsCircleCollision = function (rect, circle, dt) {
        var x0 = rect.x0, x1 = rect.x1, y0 = rect.y0, y1 = rect.y1, velocity = rect.velocity;
        var dx = velocity.x, dy = velocity.y;
        var radius = circle.radius;
        // consider rect side collisions into the circle
        var sideCollisions = [];
        var addSideCollision = function (point, side, collisionVector) {
            var timeOfCollision = ContinousCollisionDetection.getPointVsLineTimeOfCollision(point, side, dt);
            if (timeOfCollision !== null) {
                sideCollisions.push({
                    timeOfCollision: timeOfCollision,
                    collisionVector: collisionVector,
                });
            }
        };
        // extend the rectangle sides out by circle radius length so that we can simulate a point vs line collision
        var topSide = new LineSegments_1.HorzLineSegment({ x0: x0, x1: x1, y: y0 - radius });
        var bottomSide = new LineSegments_1.HorzLineSegment({ x0: x0, x1: x1, y: y1 + radius });
        var rightSide = new LineSegments_1.VertLineSegment({ x: x1 + radius, y0: y0, y1: y1 });
        var leftSide = new LineSegments_1.VertLineSegment({ x: x0 - radius, y0: y0, y1: y1 });
        // simulate the circle moving towards the rect so we can simulate point vs line rather than line vs point
        var point = new Particle_1.Particle(circle.x, circle.y);
        point.setVelocity(Vectors_1.Vectors.opposite(velocity));
        if (dy > 0)
            addSideCollision(point, bottomSide, { x: 0, y: circle.radius + rect.height / 2 });
        if (dy < 0)
            addSideCollision(point, topSide, { x: 0, y: -(circle.radius + rect.height / 2) });
        if (dx < 0)
            addSideCollision(point, leftSide, { x: -(circle.radius + rect.width / 2), y: 0 });
        if (dx > 0)
            addSideCollision(point, rightSide, { x: circle.radius + rect.width / 2, y: 0 });
        // consider rect corner collisions into the circle
        var topLeftCorner = new Particle_1.Particle(x0, y0);
        var topRightCorner = new Particle_1.Particle(x1, y0);
        var bottomRightCorner = new Particle_1.Particle(x1, y1);
        var bottomLeftCorner = new Particle_1.Particle(x0, y1);
        var corners = [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner];
        var cornerCollisions = corners.reduce(function (collisions, corner) {
            if (isMovingTowards(point, corner)) {
                corner.setVelocity(velocity);
                var collision = ContinousCollisionDetection.getCircleVsCircleCollision(corner, circle, dt);
                if (collision)
                    collisions.push(collision);
            }
            return collisions;
        }, []);
        return getEarliestCollision(__spreadArray(__spreadArray([], sideCollisions, true), cornerCollisions, true));
    };
    // https://www.emanueleferonato.com/2021/10/21/understanding-physics-continuous-collision-detection-using-swept-aabb-method-and-minkowski-sum/
    ContinousCollisionDetection.getRectVsRectCollision = function (a, b, dt) {
        var collisions = [];
        var addSideCollision = function (minkowskiCollisionSide, actualCollisionSide, getMovingSideAtTimeOfCollision, collisionVector) {
            var timeOfCollision = ContinousCollisionDetection.getPointVsLineTimeOfCollision(a, minkowskiCollisionSide, dt);
            if (timeOfCollision !== null) {
                var movingSideAtTimeOfCollision = getMovingSideAtTimeOfCollision(timeOfCollision);
                var lineSegmentContact = LineSegments_1.LineSegments.getOverlappingSegment(actualCollisionSide, movingSideAtTimeOfCollision);
                if (!LineSegments_1.LineSegments.isPoint(lineSegmentContact)) {
                    collisions.push({
                        timeOfCollision: timeOfCollision,
                        collisionVector: collisionVector,
                    });
                }
            }
        };
        var _a = a.velocity, dx = _a.x, dy = _a.y;
        var xAxisCollisionDistance = a.width / 2 + b.width / 2;
        var yAxisCollisionDistance = a.height / 2 + b.height / 2;
        // simulate a point vs line collision using a Minkowski Sum
        var minkowskiSumB = new Rect_1.Rect(__assign(__assign({}, b.pos), { width: a.width + b.width, height: a.height + b.height }));
        if (dy > 0) {
            var minkowskiTopB = new LineSegments_1.HorzLineSegment({
                x0: minkowskiSumB.x0,
                x1: minkowskiSumB.x1,
                y: minkowskiSumB.y0,
            });
            var actualTopB_1 = new LineSegments_1.HorzLineSegment({ x0: b.x0, x1: b.x1, y: b.y0 });
            addSideCollision(minkowskiTopB, actualTopB_1, function (t) {
                return new LineSegments_1.HorzLineSegment({
                    x0: a.x0 + dx * t,
                    x1: a.x1 + dx * t,
                    y: actualTopB_1.y,
                });
            }, { x: 0, y: yAxisCollisionDistance });
        }
        if (dy < 0) {
            var minkowskiBottomB = new LineSegments_1.HorzLineSegment({
                x0: minkowskiSumB.x0,
                x1: minkowskiSumB.x1,
                y: minkowskiSumB.y1,
            });
            var actualBottomB_1 = new LineSegments_1.HorzLineSegment({ x0: b.x0, x1: b.x1, y: b.y1 });
            addSideCollision(minkowskiBottomB, actualBottomB_1, function (t) {
                return new LineSegments_1.HorzLineSegment({
                    x0: a.x0 + dx * t,
                    x1: a.x1 + dx * t,
                    y: actualBottomB_1.y,
                });
            }, { x: 0, y: -yAxisCollisionDistance });
        }
        if (dx < 0) {
            var minkowskiRightB = new LineSegments_1.VertLineSegment({
                x: minkowskiSumB.x1,
                y0: minkowskiSumB.y0,
                y1: minkowskiSumB.y1,
            });
            var actualRightB_1 = new LineSegments_1.VertLineSegment({ y0: b.y0, y1: b.y1, x: b.x1 });
            addSideCollision(minkowskiRightB, actualRightB_1, function (t) {
                return new LineSegments_1.VertLineSegment({
                    y0: a.y0 + dy * t,
                    y1: a.y1 + dy * t,
                    x: actualRightB_1.x,
                });
            }, { x: -xAxisCollisionDistance, y: 0 });
        }
        if (dx > 0) {
            var minkowskiLeft = new LineSegments_1.VertLineSegment({
                x: minkowskiSumB.x0,
                y0: minkowskiSumB.y0,
                y1: minkowskiSumB.y1,
            });
            var rectBLeftSide_1 = new LineSegments_1.VertLineSegment({ y0: b.y0, y1: b.y1, x: b.x0 });
            addSideCollision(minkowskiLeft, rectBLeftSide_1, function (t) {
                return new LineSegments_1.VertLineSegment({
                    y0: a.y0 + dy * t,
                    y1: a.y1 + dy * t,
                    x: rectBLeftSide_1.x,
                });
            }, { x: xAxisCollisionDistance, y: 0 });
        }
        return getEarliestCollision(collisions);
    };
    ContinousCollisionDetection.getPointVsLineTimeOfCollision = function (point, line, dt) {
        var pointX = point.x, pointY = point.y, _a = point.velocity, dx = _a.x, dy = _a.y;
        if (line instanceof LineSegments_1.HorzLineSegment) {
            if (!dy)
                return null;
            var x0 = line.x0, x1 = line.x1, lineY = line.y;
            var t = (lineY - pointY) / dy;
            if (isCollisionInThisTimestep(t, dt)) {
                var pointXAtTimeOfCollision = pointX + dx * t;
                if ((0, utilities_1.isInRange)(x0, pointXAtTimeOfCollision, x1))
                    return t;
            }
        }
        if (line instanceof LineSegments_1.VertLineSegment) {
            if (!dx)
                return null;
            var lineX = line.x, y0 = line.y0, y1 = line.y1;
            var t = (lineX - pointX) / dx;
            if (isCollisionInThisTimestep(t, dt)) {
                var pointYAtTimeOfCollision = pointY + dy * t;
                if ((0, utilities_1.isInRange)(y0, pointYAtTimeOfCollision, y1))
                    return t;
            }
        }
        return null;
    };
    return ContinousCollisionDetection;
}());
exports.ContinousCollisionDetection = ContinousCollisionDetection;
//# sourceMappingURL=ContinousCollisionDetection.js.map