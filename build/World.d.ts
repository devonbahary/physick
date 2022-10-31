import { Dimensions, Shape } from './shapes/types';
import { Body } from './Body';
import { Vector } from './Vectors';
import { PubSub, PubSubable } from './PubSub';
import { QuadTreeConfig } from './QuadTree';
import { Force } from './Force';
import { CollisionEvent } from './collisions/types';
import { SerializedWorld } from './Serializer';
declare type WorldArgs = Dimensions & {
    options?: Partial<WorldOptions> & {
        quadTreeConfig?: Partial<QuadTreeConfig>;
    };
};
declare type WorldOptions = {
    friction: number;
    initBoundaries: boolean;
    shouldResolveCollision?: (collisionEvent: CollisionEvent) => boolean;
};
export declare enum WorldEvent {
    AddBody = "AddBody",
    RemoveBody = "RemoveBody"
}
declare type WorldEventDataMap = {
    [WorldEvent.AddBody]: Body;
    [WorldEvent.RemoveBody]: Body;
};
declare type Subscribe = PubSub<WorldEvent, WorldEventDataMap>['subscribe'];
declare type Publish = PubSub<WorldEvent, WorldEventDataMap>['publish'];
export declare class World implements PubSubable<WorldEvent, WorldEventDataMap> {
    width: number;
    height: number;
    bodies: Body[];
    subscribe: Subscribe;
    publish: Publish;
    private options;
    private quadTree;
    private forces;
    constructor(args: WorldArgs);
    update(dt: number): void;
    addBody(body: Body): void;
    removeBody(body: Body): void;
    addForce(force: Force): void;
    removeForce(force: Force): void;
    getBodiesInShape(shape: Shape, inclusive?: boolean): Body[];
    getFrictionOnBody(body: Body): number;
    getBodyVelocityAfterFriction(body: Body): Vector;
    loadSerialized(serializedWorld: SerializedWorld): void;
    private updateForces;
    private updateBodies;
    private updateBodyMovement;
    private shouldResolveCollision;
    private resolveChainedBodies;
    private onCollision;
    private initBoundaries;
    private applyFriction;
}
export {};
