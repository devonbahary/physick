import { Body, BodyEvent } from '@physics/Body';
import { Rect } from '@physics/shapes/Rect';
import { Shape } from '@physics/shapes/types';
import { Dimensions } from '@physics/types';
import { World, WorldEvent } from '@physics/World';
import { CollisionDetection } from '@physics/collisions/CollisionDetection';

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
    public bodies: Body[] = [];

    abstract getBodiesInBoundingBox(rect: Rect): Body[];

    abstract addBody(body: Body): void;
}

class Leaf implements Node {
    public bodies: Body[] = [];

    constructor(public rect: Rect, private config: QuadTreeConfig) {}

    getBodiesInBoundingBox(rect: Rect): Body[] {
        if (!this.overlapsWith(rect)) return [];
        return this.bodies.filter((body) => CollisionDetection.hasOverlap(this.rect, body.shape));
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
            this.rect.width / 4 >= this.config.minLeafDimensions.width &&
            this.rect.height / 4 >= this.config.minLeafDimensions.height
        );
    }

    private overlapsWith(shape: Shape): boolean {
        return CollisionDetection.hasOverlap(this.rect, shape);
    }
}

class InternalNode implements Node {
    private children: (InternalNode | Leaf)[];
    constructor(private rect: Rect, private config: QuadTreeConfig) {
        this.children = InternalNode.initLeaves(rect, config);
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

    static initLeaves(rect: Rect, config: QuadTreeConfig): Leaf[] {
        const { x0, x, width, y0, y, height } = rect;

        const halfWidth = width / 2;
        const quarterWidth = width / 4;
        const halfHeight = height / 2;
        const quarterHeight = height / 4;

        const dimensions = {
            width: halfWidth,
            height: halfHeight,
        };

        const topLeftRect = new Rect({
            x: x0 + quarterWidth,
            y: y0 + quarterHeight,
            ...dimensions,
        });

        const topRightRect = new Rect({
            x: x + quarterWidth,
            y: y0 + quarterHeight,
            ...dimensions,
        });

        const bottomLeftRect = new Rect({
            x: x0 + quarterWidth,
            y: y + quarterHeight,
            ...dimensions,
        });

        const bottomRightRect = new Rect({
            x: x + quarterWidth,
            y: y + quarterHeight,
            ...dimensions,
        });

        return [
            new Leaf(topLeftRect, config),
            new Leaf(topRightRect, config),
            new Leaf(bottomLeftRect, config),
            new Leaf(bottomRightRect, config),
        ];
    }

    getBodiesInBoundingBox(rect: Rect): Body[] {
        if (!this.overlapsWith(rect)) return [];
        const uniqueBodiesSet = this.children.reduce<Set<Body>>((acc, child) => {
            const bodies = child.getBodiesInBoundingBox(rect);
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
                    const internalNode = new InternalNode(child.rect, this.config);

                    for (const body of child.bodies) {
                        internalNode.addBody(body);
                    }

                    return internalNode;
                }
                return child;
            }
            if (child.shouldCollapse()) {
                const leaf = new Leaf(child.rect, this.config);

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

    private overlapsWith(rect: Rect): boolean {
        return CollisionDetection.hasOverlap(this.rect, rect);
    }
}

export class QuadTree extends InternalNode {
    constructor(world: World, config: Partial<QuadTreeConfig> = {}) {
        const { width, height } = world;
        const rect = new Rect({
            x: width / 2,
            y: height / 2,
            width,
            height,
        });

        super(rect, { ...DEFAULT_CONFIG, ...config });

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
    }
}
