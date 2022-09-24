import { Body } from './Body';
import { Dimensions } from './shapes/types';
import { World } from './World';
import { BoundingBox } from './shapes/rects/BoundingBox';
export declare type QuadTreeConfig = {
    maxBodiesInLeaf: number;
    minLeafDimensions: Dimensions;
};
declare abstract class Node {
    boundingBox: BoundingBox;
    constructor(boundingBox: BoundingBox);
    abstract getBodiesInBoundingBox(boundingBox: BoundingBox): Body[];
    abstract addBody(body: Body): void;
    protected overlapsWith(boundingBox: BoundingBox): boolean;
}
declare class Leaf extends Node {
    private config;
    bodies: Body[];
    constructor(boundingBox: BoundingBox, config: QuadTreeConfig);
    getBodiesInBoundingBox(boundingBox: BoundingBox): Body[];
    addBody(body: Body): void;
    removeBody(body: Body): void;
    shouldPartition(): boolean;
}
declare class InternalNode extends Node {
    private config;
    private children;
    constructor(boundingBox: BoundingBox, config: QuadTreeConfig);
    get bodies(): Body[];
    static initLeaves(boundingBox: BoundingBox, config: QuadTreeConfig): Leaf[];
    getBodiesInBoundingBox(boundingBox: BoundingBox): Body[];
    addBody(body: Body): void;
    removeBody(body: Body): void;
    update(): void;
    shouldCollapse(): boolean;
}
export declare class QuadTree extends InternalNode {
    constructor(world: World, config?: Partial<QuadTreeConfig>);
    private initWorldSubscriptions;
}
export {};
