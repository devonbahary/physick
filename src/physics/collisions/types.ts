import { Body } from '@physics/Body';
import { Vector } from '@physics/Vectors';

export type Collision = {
    timeOfCollision: number;
    collisionVector: Vector;
};

export type CollisionEvent = Collision & {
    movingBody: Body;
    collisionBody: Body;
};
