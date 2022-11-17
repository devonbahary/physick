"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollisionResolution = void 0;
var Vectors_1 = require("../Vectors");
var CollisionResolution = /** @class */ (function () {
    function CollisionResolution() {
    }
    CollisionResolution.resolve = function (collisionEvent, getCoefficientOfRestitution) {
        if (getCoefficientOfRestitution === void 0) { getCoefficientOfRestitution = CollisionResolution.getCoefficientOfRestitution; }
        var movingBody = collisionEvent.movingBody, collisionBody = collisionEvent.collisionBody, timeOfCollision = collisionEvent.timeOfCollision;
        if (timeOfCollision) {
            var movementToTimeOfCollision = Vectors_1.Vectors.mult(movingBody.velocity, timeOfCollision);
            movingBody.move(movementToTimeOfCollision);
        }
        var _a = CollisionResolution.getResolvedCollisionVelocities(collisionEvent, getCoefficientOfRestitution), resolvedVelocityA = _a[0], resolvedVelocityB = _a[1];
        movingBody.setVelocity(resolvedVelocityA);
        collisionBody.setVelocity(resolvedVelocityB);
    };
    CollisionResolution.getTangentMovement = function (collisionEvent) {
        var movingBody = collisionEvent.movingBody, collisionVector = collisionEvent.collisionVector;
        var tangentCollisionVector = Vectors_1.Vectors.normal(collisionVector);
        return Vectors_1.Vectors.proj(movingBody.velocity, tangentCollisionVector);
    };
    CollisionResolution.getResolvedCollisionVelocities = function (collisionEvent, getCoefficientOfRestitution) {
        var a = collisionEvent.movingBody, b = collisionEvent.collisionBody, collisionVector = collisionEvent.collisionVector;
        var cor = getCoefficientOfRestitution(a, b);
        if (b.isFixed()) {
            // https://www.youtube.com/watch?v=naaeH1qbjdQ
            var surfaceNormal = Vectors_1.Vectors.opposite(collisionVector);
            var reflectedVector = Vectors_1.Vectors.subtract(a.velocity, Vectors_1.Vectors.mult(Vectors_1.Vectors.proj(a.velocity, surfaceNormal), 2));
            return [Vectors_1.Vectors.mult(reflectedVector, cor), b.velocity];
        }
        /*
            2D Elastic Collision (angle-free)
            https://stackoverflow.com/questions/35211114/2d-elastic-ball-collision-physics

                            mass scalar      dot product (scalar)        magnitude        pos diff vector
                vA` = vA - (2mB / (mA + mB)) * (<vA - vB | xA - xB> / (|| xA - xB || ** 2)) * (xA - xB)
                  where v = velocity
                        m = mass
                        x = position (at time of collision)
        */
        var diffVel = Vectors_1.Vectors.subtract(a.velocity, b.velocity);
        var massScalar = (2 * b.mass) / (a.mass + b.mass);
        var coefficient = massScalar * (Vectors_1.Vectors.dot(diffVel, collisionVector) / (Math.pow(collisionVector.x, 2) + Math.pow(collisionVector.y, 2)));
        var resolvedVelocityA = Vectors_1.Vectors.subtract(a.velocity, Vectors_1.Vectors.mult(collisionVector, coefficient));
        /*
            conservation of momentum
                mAvA` + mBvB` = mAvA + mBvB
                                sum
                vB` = (mAvA + mBvB - mAvA`) / mB
        */
        var sum = Vectors_1.Vectors.subtract(Vectors_1.Vectors.add(Vectors_1.Vectors.mult(a.velocity, a.mass), Vectors_1.Vectors.mult(b.velocity, b.mass)), Vectors_1.Vectors.mult(resolvedVelocityA, a.mass));
        var resolvedVelocityB = Vectors_1.Vectors.divide(sum, b.mass);
        return [Vectors_1.Vectors.mult(resolvedVelocityA, cor), Vectors_1.Vectors.mult(resolvedVelocityB, cor)];
    };
    CollisionResolution.getCoefficientOfRestitution = function (a, b) {
        return Math.min(a.restitution, b.restitution);
    };
    return CollisionResolution;
}());
exports.CollisionResolution = CollisionResolution;
//# sourceMappingURL=CollisionResolution.js.map