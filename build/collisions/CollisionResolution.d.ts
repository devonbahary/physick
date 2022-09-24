import { CollisionEvent } from '../collisions/types';
import { Vector } from '../Vectors';
export declare class CollisionResolution {
    static resolve(collisionEvent: CollisionEvent): void;
    static getTangentMovement(collisionEvent: CollisionEvent): Vector;
    private static getResolvedCollisionVelocities;
    private static getCoefficientOfRestitution;
}
