import { Dimensions } from './shapes/types';
import { Body } from './Body';
import { PubSub, PubSubable } from './PubSub';
import { QuadTreeConfig } from './QuadTree';
import { Force } from './Force';
import { SerializedWorld } from './Serializer';
import { BoundingBox } from './shapes/rects/BoundingBox';
declare type WorldArgs = Dimensions & {
    options?: Partial<WorldOptions> & {
        quadTreeConfig?: Partial<QuadTreeConfig>;
    };
};
declare type WorldOptions = {
    frictionalForce: number;
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
    getBodiesInBoundingBox(boundingBox: BoundingBox): Body[];
    getFrictionOnBody(body: Body): number;
    loadSerialized(serializedWorld: SerializedWorld): void;
    private updateForces;
    private updateBodies;
    private updateBodyMovement;
    private resolveChainedBodies;
    private onCollision;
    private initBoundaries;
    private applyFriction;
}
export {};
