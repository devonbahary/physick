import { Body } from '../Body';
import { Vector } from '../Vectors';
export declare type Collision = {
    timeOfCollision: number;
    collisionVector: Vector;
};
export declare type CollisionEvent = Collision & {
    movingBody: Body;
    collisionBody: Body;
};
