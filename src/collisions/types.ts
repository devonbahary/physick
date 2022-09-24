import { Body } from '../Body';
import { Vector } from '../Vectors';

export type Collision = {
    timeOfCollision: number;
    collisionVector: Vector;
};

export type CollisionEvent = Collision & {
    movingBody: Body;
    collisionBody: Body;
};
