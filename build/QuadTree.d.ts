import { Dimensions, Shape } from './shapes/types';
import { BoundingBox } from './shapes/rects/BoundingBox';
declare type SpatialData = {
    id: string;
    shape: Shape;
};
export declare type QuadTreeConfig = {
    maxDataInLeaf: number;
    minLeafDimensions: Dimensions;
};
declare abstract class Node<T extends SpatialData> {
    boundingBox: BoundingBox;
    constructor(boundingBox: BoundingBox);
    abstract getDataInShape(shape: Shape): T[];
    abstract addData(data: T): void;
    protected overlapsWith(shape: Shape): boolean;
}
declare class InternalNode<T extends SpatialData> extends Node<T> {
    private config;
    private needsUpdate;
    private children;
    constructor(boundingBox: BoundingBox, config: QuadTreeConfig);
    get data(): T[];
    getDataInShape(shape: Shape): T[];
    addData(data: T): void;
    removeData(data: T): void;
    update(): void;
    shouldCollapse(): boolean;
}
export declare class QuadTree<T extends SpatialData> extends InternalNode<T> {
    constructor(dimensions: Dimensions, config?: Partial<QuadTreeConfig>);
    getDataInShape(shape: Shape, inclusive?: boolean): T[];
    onDataPositionChange(data: T): void;
}
export {};
