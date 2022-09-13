import { Body } from '@physics/Body';
import { CollisionEvent } from '@physics/collisions/types';
import { roundForFloatingPoint } from '@physics/utilities';
import { Vector, Vectors } from '@physics/Vectors';

export class CollisionResolution {
    static resolve(collisionEvent: CollisionEvent): void {
        const { movingBody, collisionBody, timeOfCollision } = collisionEvent;

        if (timeOfCollision) {
            const movementToTimeOfCollision = Vectors.mult(movingBody.velocity, timeOfCollision);
            movingBody.move(movementToTimeOfCollision);
        }

        const [finalVelocityA, finalVelocityB] = CollisionResolution.getFinalVelocities(collisionEvent);

        movingBody.setVelocity(finalVelocityA);
        collisionBody.setVelocity(finalVelocityB);
    }

    static getMovementTangentToTouchingFixedBody(collisionEvent: CollisionEvent): Vector | null {
        const { movingBody, collisionBody, collisionVector, timeOfCollision } = collisionEvent;

        if (roundForFloatingPoint(timeOfCollision) !== 0 || !collisionBody.isFixed()) return null;

        const { velocity } = movingBody;

        const tangentCollisionVector = Vectors.normal(collisionVector);
        return Vectors.proj(velocity, tangentCollisionVector);
    }

    private static getFinalVelocities(collisionEvent: CollisionEvent): [Vector, Vector] {
        const { movingBody: a, collisionBody: b, collisionVector } = collisionEvent;

        const cor = CollisionResolution.getCoefficientOfRestitution(a, b);

        if (b.isFixed()) {
            // https://www.youtube.com/watch?v=naaeH1qbjdQ
            const surfaceNormal = Vectors.opposite(collisionVector);
            const reflectedVector = Vectors.subtract(
                a.velocity,
                Vectors.mult(Vectors.proj(a.velocity, surfaceNormal), 2),
            );
            return [Vectors.mult(reflectedVector, cor), b.velocity];
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

        const diffVel = Vectors.subtract(a.velocity, b.velocity);
        const massScalar = (2 * b.mass) / (a.mass + b.mass);
        const coefficient =
            massScalar * (Vectors.dot(diffVel, collisionVector) / (collisionVector.x ** 2 + collisionVector.y ** 2));

        const finalVelocityA = Vectors.subtract(a.velocity, Vectors.mult(collisionVector, coefficient));

        /* 
            conservation of momentum
                mAvA` + mBvB` = mAvA + mBvB
                                sum
                vB` = (mAvA + mBvB - mAvA`) / mB
        */

        const sum = Vectors.subtract(
            Vectors.add(Vectors.mult(a.velocity, a.mass), Vectors.mult(b.velocity, b.mass)),
            Vectors.mult(finalVelocityA, a.mass),
        );
        const finalVelocityB = Vectors.divide(sum, b.mass);

        return [Vectors.mult(finalVelocityA, cor), Vectors.mult(finalVelocityB, cor)];
    }

    private static getCoefficientOfRestitution(a: Body, b: Body): number {
        return Math.min(a.restitution, b.restitution);
    }
}
