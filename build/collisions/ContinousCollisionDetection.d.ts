import { Body } from '../Body';
import { CollisionEvent } from '../collisions/types';
import { World } from '../World';
export declare class ContinousCollisionDetection {
    static isChronological(collisionEvent: CollisionEvent): boolean;
    static getCollisionEvent(movingBody: Body, world: World, frames: number, ignoreBodyIds?: Set<string>): CollisionEvent | null;
    private static getCollision;
    private static getCircleVsCircleCollision;
    private static getCircleVsRectCollision;
    private static getRectVsCircleCollision;
    private static getRectVsRectCollision;
    private static getPointVsLineTimeOfCollision;
}
