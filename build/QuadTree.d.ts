import { Body } from './Body';
import { Dimensions, Shape } from './shapes/types';
import { World } from './World';
import { BoundingBox } from './shapes/rects/BoundingBox';
export declare type QuadTreeConfig = {
    maxBodiesInLeaf: number;
    minLeafDimensions: Dimensions;
};
declare abstract class Node {
    boundingBox: BoundingBox;
    constructor(boundingBox: BoundingBox);
    abstract getBodiesInShape(shape: Shape): Body[];
    abstract addBody(body: Body): void;
    protected overlapsWith(shape: Shape): boolean;
}
declare class Leaf extends Node {
    private config;
    bodies: Body[];
    constructor(boundingBox: BoundingBox, config: QuadTreeConfig);
    getBodiesInShape(shape: Shape): Body[];
    addBody(body: Body): void;
    removeBody(body: Body): void;
    shouldPartition(): boolean;
}
declare class InternalNode extends Node {
    private config;
    private needsUpdate;
    private children;
    constructor(boundingBox: BoundingBox, config: QuadTreeConfig);
    get bodies(): Body[];
    static initLeaves(boundingBox: BoundingBox, config: QuadTreeConfig): Leaf[];
    getBodiesInShape(shape: Shape): Body[];
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
