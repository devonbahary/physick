import { Dimensions, Shape } from './shapes/types';
import { CollisionDetection } from './collisions/CollisionDetection';
import { BoundingBox } from './shapes/rects/BoundingBox';

type SpatialData = {
    id: string;
    shape: Shape;
};

export type QuadTreeConfig = {
    maxDataInLeaf: number;
    minLeafDimensions: Dimensions;
};

const DEFAULT_CONFIG: QuadTreeConfig = {
    maxDataInLeaf: 2,
    // world should be at least 4x the size of minLeafDimensions to comply with a min of 4 Leafs
    minLeafDimensions: {
        width: 40,
        height: 40,
    },
};

abstract class Node<T extends SpatialData> {
    constructor(public boundingBox: BoundingBox) {}

    abstract getDataInShape(shape: Shape): T[];

    abstract addData(data: T): void;

    protected overlapsWith(shape: Shape): boolean {
        return CollisionDetection.hasOverlap(this.boundingBox, shape);
    }
}

class Leaf<T extends SpatialData> extends Node<T> {
    public data: T[] = [];

    constructor(boundingBox: BoundingBox, private config: QuadTreeConfig) {
        super(boundingBox);
    }

    // broad phase collision detection of node with shape
    getDataInShape(shape: Shape): T[] {
        return this.overlapsWith(shape) ? this.data : [];
    }

    addData(data: T): void {
        if (this.overlapsWith(data.shape)) {
            this.data.push(data);
        }
    }

    removeData(data: T): void {
        this.data = this.data.filter((b) => b.id !== data.id);
    }

    shouldPartition(): boolean {
        if (this.data.length <= this.config.maxDataInLeaf) return false;
        return (
            this.boundingBox.width / 4 >= this.config.minLeafDimensions.width &&
            this.boundingBox.height / 4 >= this.config.minLeafDimensions.height
        );
    }
}

class InternalNode<T extends SpatialData> extends Node<T> {
    private needsUpdate = false;
    private children: (InternalNode<T> | Leaf<T>)[];

    constructor(boundingBox: BoundingBox, private config: QuadTreeConfig) {
        super(boundingBox);

        const { x0, x1, width, y0, y1, height } = boundingBox;

        const halfWidth = width / 2;
        const halfHeight = height / 2;

        const leftSide = { x0, x1: x0 + halfWidth };
        const rightSide = { x0: x0 + halfWidth, x1 };
        const topSide = { y0, y1: y0 + halfHeight };
        const bottomSide = { y0: y0 + halfHeight, y1 };

        const bounds = [
            new BoundingBox({ ...leftSide, ...topSide }),
            new BoundingBox({ ...rightSide, ...topSide }),
            new BoundingBox({ ...leftSide, ...bottomSide }),
            new BoundingBox({ ...rightSide, ...bottomSide }),
        ];

        this.children = bounds.map((r) => new Leaf(r, config));
    }

    get data(): T[] {
        const uniqueDataSet = this.children.reduce<Set<T>>((acc, child) => {
            for (const data of child.data) {
                acc.add(data);
            }
            return acc;
        }, new Set());

        return Array.from(uniqueDataSet);
    }

    getDataInShape(shape: Shape): T[] {
        if (!this.overlapsWith(shape)) return [];

        const uniqueDataSet = this.children.reduce<Set<T>>((acc, child) => {
            const data = child.getDataInShape(shape);
            for (const item of data) {
                acc.add(item);
            }
            return acc;
        }, new Set());

        return Array.from(uniqueDataSet);
    }

    addData(data: T): void {
        for (const child of this.children) {
            child.addData(data);
        }

        this.needsUpdate = true;
    }

    removeData(data: T): void {
        for (const child of this.children) {
            child.removeData(data);
        }

        this.needsUpdate = true;
    }

    update(): void {
        if (!this.needsUpdate) return;

        this.children = this.children.map((child) => {
            if (child instanceof Leaf) {
                if (child.shouldPartition()) {
                    const internalNode = new InternalNode<T>(child.boundingBox, this.config);

                    for (const data of child.data) {
                        internalNode.addData(data);
                    }

                    return internalNode;
                }
                return child;
            }

            child.update();

            if (child.shouldCollapse()) {
                const leaf = new Leaf<T>(child.boundingBox, this.config);

                for (const data of child.data) {
                    leaf.addData(data);
                }

                return leaf;
            }

            return child;
        });

        this.needsUpdate = false;
    }

    shouldCollapse(): boolean {
        return this.data.length <= this.config.maxDataInLeaf;
    }
}

export class QuadTree<T extends SpatialData> extends InternalNode<T> {
    constructor(dimensions: Dimensions, config: Partial<QuadTreeConfig> = {}) {
        const { width, height } = dimensions;
        const boundingBox = new BoundingBox({
            x0: 0,
            x1: width,
            y0: 0,
            y1: height,
        });

        super(boundingBox, { ...DEFAULT_CONFIG, ...config });
    }

    // narrow phase collision detection of shape with data returned in broad phase
    getDataInShape(shape: Shape, inclusive = true): T[] {
        const data = super.getDataInShape(shape);
        return data.filter((b) => CollisionDetection.hasOverlap(shape, b.shape, inclusive));
    }

    onDataPositionChange(data: T): void {
        this.removeData(data); // remove data from tree
        this.addData(data); // re-insert in proper position
    }
}
