import { Body, BodyEvent } from './Body';
import { Dimensions } from './shapes/types';
import { World, WorldEvent } from './World';
import { CollisionDetection } from './collisions/CollisionDetection';
import { BoundingBox } from './shapes/rects/BoundingBox';

export type QuadTreeConfig = {
    maxBodiesInLeaf: number;
    minLeafDimensions: Dimensions;
};

const DEFAULT_CONFIG: QuadTreeConfig = {
    maxBodiesInLeaf: 2,
    // world should be at least 4x the size of minLeafDimensions to comply with a min of 4 Leafs
    minLeafDimensions: {
        width: 40,
        height: 40,
    },
};

abstract class Node {
    constructor(public boundingBox: BoundingBox) {}

    abstract getBodiesInBoundingBox(boundingBox: BoundingBox): Body[];

    abstract addBody(body: Body): void;

    protected overlapsWith(boundingBox: BoundingBox): boolean {
        return CollisionDetection.hasOverlap(this.boundingBox, boundingBox);
    }
}

class Leaf extends Node {
    public bodies: Body[] = [];

    constructor(boundingBox: BoundingBox, private config: QuadTreeConfig) {
        super(boundingBox);
    }

    getBodiesInBoundingBox(boundingBox: BoundingBox): Body[] {
        return this.overlapsWith(boundingBox) ? this.bodies : [];
    }

    addBody(body: Body): void {
        if (this.overlapsWith(body.shape)) {
            this.bodies.push(body);
        }
    }

    removeBody(body: Body): void {
        this.bodies = this.bodies.filter((b) => b.id !== body.id);
    }

    shouldPartition(): boolean {
        if (this.bodies.length <= this.config.maxBodiesInLeaf) return false;
        return (
            this.boundingBox.width / 4 >= this.config.minLeafDimensions.width &&
            this.boundingBox.height / 4 >= this.config.minLeafDimensions.height
        );
    }
}

class InternalNode extends Node {
    private children: (InternalNode | Leaf)[];

    constructor(boundingBox: BoundingBox, private config: QuadTreeConfig) {
        super(boundingBox);
        this.children = InternalNode.initLeaves(boundingBox, config);
    }

    get bodies(): Body[] {
        const uniqueBodiesSet = this.children.reduce<Set<Body>>((acc, child) => {
            for (const body of child.bodies) {
                acc.add(body);
            }
            return acc;
        }, new Set());

        return Array.from(uniqueBodiesSet);
    }

    static initLeaves(boundingBox: BoundingBox, config: QuadTreeConfig): Leaf[] {
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

        return bounds.map((r) => new Leaf(r, config));
    }

    getBodiesInBoundingBox(boundingBox: BoundingBox): Body[] {
        if (!this.overlapsWith(boundingBox)) return [];

        const uniqueBodiesSet = this.children.reduce<Set<Body>>((acc, child) => {
            const bodies = child.getBodiesInBoundingBox(boundingBox);
            for (const body of bodies) {
                acc.add(body);
            }
            return acc;
        }, new Set());

        return Array.from(uniqueBodiesSet);
    }

    addBody(body: Body): void {
        for (const child of this.children) {
            child.addBody(body);
        }
    }

    removeBody(body: Body): void {
        for (const child of this.children) {
            child.removeBody(body);
        }
    }

    update(): void {
        this.children = this.children.map((child) => {
            if (child instanceof Leaf) {
                if (child.shouldPartition()) {
                    const internalNode = new InternalNode(child.boundingBox, this.config);

                    for (const body of child.bodies) {
                        internalNode.addBody(body);
                    }

                    return internalNode;
                }
                return child;
            }

            if (child.shouldCollapse()) {
                const leaf = new Leaf(child.boundingBox, this.config);

                for (const body of child.bodies) {
                    leaf.addBody(body);
                }

                return leaf;
            }

            return child;
        });
    }

    shouldCollapse(): boolean {
        return this.bodies.length <= this.config.maxBodiesInLeaf;
    }
}

export class QuadTree extends InternalNode {
    constructor(world: World, config: Partial<QuadTreeConfig> = {}) {
        const { width, height } = world;
        const boundingBox = new BoundingBox({
            x0: 0,
            x1: width,
            y0: 0,
            y1: height,
        });

        super(boundingBox, { ...DEFAULT_CONFIG, ...config });

        this.initWorldSubscriptions(world);
    }

    private initWorldSubscriptions(world: World): void {
        world.subscribe(WorldEvent.AddBody, (body) => {
            this.addBody(body);
            body.subscribe(BodyEvent.Move, (body) => {
                this.removeBody(body); // remove body from tree
                this.addBody(body); // re-insert in proper position
            });
        });

        world.subscribe(WorldEvent.RemoveBody, (body) => {
            this.removeBody(body);
        });
    }
}
