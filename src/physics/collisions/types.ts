import { Collision } from '@physics/collisions/ContinousCollisionDetection';
import { Body } from '@physics/Body';

export type CollisionEvent = Collision & {
    movingBody: Body;
    collisionBody: Body;
};
