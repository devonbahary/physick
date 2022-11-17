import { Body } from '../Body';
import { CollisionEvent } from '../collisions/types';
import { Vector, Vectors } from '../Vectors';

export class CollisionResolution {
    static resolve(
        collisionEvent: CollisionEvent,
        getCoefficientOfRestitution = CollisionResolution.getCoefficientOfRestitution,
    ): void {
        const { movingBody, collisionBody, timeOfCollision } = collisionEvent;

        if (timeOfCollision) {
            const movementToTimeOfCollision = Vectors.mult(movingBody.velocity, timeOfCollision);
            movingBody.move(movementToTimeOfCollision);
        }

        const [resolvedVelocityA, resolvedVelocityB] = CollisionResolution.getResolvedCollisionVelocities(
            collisionEvent,
            getCoefficientOfRestitution,
        );

        movingBody.setVelocity(resolvedVelocityA);
        collisionBody.setVelocity(resolvedVelocityB);
    }

    static getTangentMovement(collisionEvent: CollisionEvent): Vector {
        const { movingBody, collisionVector } = collisionEvent;
        const tangentCollisionVector = Vectors.normal(collisionVector);
        return Vectors.proj(movingBody.velocity, tangentCollisionVector);
    }

    private static getResolvedCollisionVelocities(
        collisionEvent: CollisionEvent,
        getCoefficientOfRestitution: (a: Body, b: Body) => number,
    ): [Vector, Vector] {
        const { movingBody: a, collisionBody: b, collisionVector } = collisionEvent;

        const cor = getCoefficientOfRestitution(a, b);

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

        const resolvedVelocityA = Vectors.subtract(a.velocity, Vectors.mult(collisionVector, coefficient));

        /* 
            conservation of momentum
                mAvA` + mBvB` = mAvA + mBvB
                                sum
                vB` = (mAvA + mBvB - mAvA`) / mB
        */

        const sum = Vectors.subtract(
            Vectors.add(Vectors.mult(a.velocity, a.mass), Vectors.mult(b.velocity, b.mass)),
            Vectors.mult(resolvedVelocityA, a.mass),
        );
        const resolvedVelocityB = Vectors.divide(sum, b.mass);

        return [Vectors.mult(resolvedVelocityA, cor), Vectors.mult(resolvedVelocityB, cor)];
    }

    private static getCoefficientOfRestitution = (a: Body, b: Body): number => {
        return Math.min(a.restitution, b.restitution);
    };
}
