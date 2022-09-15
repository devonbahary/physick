import { Dimensions } from '@physics/types';
import { Body } from '@physics/Body';
import { Vectors } from '@physics/Vectors';
import { Rect } from '@physics/shapes/Rect';
import { ContinousCollisionDetection } from '@physics/collisions/ContinousCollisionDetection';
import { CollisionResolution } from '@physics/collisions/CollisionResolution';
import { PubSub } from '@physics/PubSub';
import { roundForFloatingPoint } from '@physics/utilities';
import { QuadTree, QuadTreeConfig } from '@physics/collisions/QuadTree';

type WorldArgs = Dimensions & {
    options?: Partial<WorldOptions> & { quadTreeConfig?: Partial<QuadTreeConfig> };
};

type WorldOptions = {
    frictionalForce: number;
    minimumFrictionalSpeed: number;
};

export enum WorldEvent {
    AddBody = 'AddBody',
    RemoveBody = 'RemoveBody',
}

type WorldEventDataMap = {
    [WorldEvent.AddBody]: Body;
    [WorldEvent.RemoveBody]: Body;
};

type Subscribe = PubSub<WorldEvent, WorldEventDataMap>['subscribe'];
type Publish = PubSub<WorldEvent, WorldEventDataMap>['publish'];

const DEFAULT_WORLD_OPTIONS: WorldOptions = {
    frictionalForce: 0.1,
    minimumFrictionalSpeed: 0.1,
};

export class World {
    public width: number;
    public height: number;
    public bodies: Body[] = [];

    public subscribe: Subscribe;
    private publish: Publish;

    private options: WorldOptions;
    private quadTree: QuadTree;

    constructor(args: WorldArgs) {
        const { width, height, options = {} } = args;

        this.width = width;
        this.height = height;

        const { quadTreeConfig, ...rest } = options;
        this.options = { ...DEFAULT_WORLD_OPTIONS, ...rest };

        const pubSub = new PubSub<WorldEvent, WorldEventDataMap>(Object.values(WorldEvent));
        this.subscribe = (...args): ReturnType<Subscribe> => pubSub.subscribe(...args);
        this.publish = (...args): ReturnType<Publish> => pubSub.publish(...args);

        this.quadTree = new QuadTree(this, quadTreeConfig);

        this.initBoundaries();
    }

    public update(dt: number): void {
        this.updateBodies(dt);
        this.quadTree.update();
    }

    public addBody(body: Body): void {
        this.bodies.push(body);
        this.publish(WorldEvent.AddBody, body);
    }

    public removeBody(body: Body): void {
        this.bodies = this.bodies.filter((b) => b.id !== body.id);
        this.publish(WorldEvent.RemoveBody, body);
    }

    public getBodiesInBoundingBox(rect: Rect): Body[] {
        return this.quadTree.getBodiesInBoundingBox(rect);
    }

    private updateBodies(dt: number): void {
        for (const body of this.bodies) {
            if (!body.isMoving()) continue;

            const collisionEvent = ContinousCollisionDetection.getCollisionEvent(body, this, dt);

            if (collisionEvent) {
                // because we traverse bodies in no particular order, it's possible that we accidentally consider a false
                // collision of a slower-moving body into a faster-moving body along the collision vector
                // rather than ignoring the false collision altogether, we wait for that fast-moving colliding body to get
                // a chance to move
                if (ContinousCollisionDetection.isChronological(collisionEvent)) {
                    CollisionResolution.resolve(collisionEvent);

                    this.resolveChainedBodies(collisionEvent.collisionBody);
                }
            } else {
                body.move(Vectors.mult(body.velocity, dt));
                this.applyFriction(body, dt);
            }
        }
    }

    // if the force through 1+ non-fixed bodies is stopped at a fixed body, move the last non-fixed body in the chain
    // around the fixed body
    private resolveChainedBodies(bodyInChain: Body): void {
        if (bodyInChain.isFixed()) return;

        const collisionEvent = ContinousCollisionDetection.getCollisionEvent(bodyInChain, this, 0);

        if (collisionEvent && roundForFloatingPoint(collisionEvent.timeOfCollision) === 0) {
            if (collisionEvent.collisionBody.isFixed()) {
                const getTangentMovement = CollisionResolution.getTangentMovement(collisionEvent);
                bodyInChain.setVelocity(getTangentMovement);
            } else {
                this.resolveChainedBodies(collisionEvent.collisionBody);
            }
        }
    }

    private initBoundaries(): void {
        const { width, height } = this;

        const topBorder = new Rect({ width, height: 0 });
        topBorder.moveTo({ x: width / 2, y: 0 });

        const rightBorder = new Rect({ width: 0, height });
        rightBorder.moveTo({ x: width, y: height / 2 });

        const bottomBorder = new Rect({ width, height: 0 });
        bottomBorder.moveTo({ x: width / 2, y: height });

        const leftBorder = new Rect({ width: 0, height });
        leftBorder.moveTo({ x: 0, y: height / 2 });

        const boundaryRects = [topBorder, rightBorder, bottomBorder, leftBorder];

        const boundaryBodies = boundaryRects.map((shape) => new Body({ shape, mass: Infinity }));

        for (const body of boundaryBodies) {
            this.addBody(body);
        }
    }

    private applyFriction(body: Body, dt: number): void {
        if (!this.options.frictionalForce) return;

        // friction has a direct relationship with the body's speed + mass
        const frictionalForce = Vectors.resize(body.velocity, dt * this.options.frictionalForce * body.mass);

        const newVelocity = Vectors.subtract(body.velocity, frictionalForce);
        body.setVelocity(newVelocity);

        // stop the body once reached some minimum rather than infinitely approach 0
        if (Vectors.magnitude(newVelocity) < this.options.minimumFrictionalSpeed) {
            body.setVelocity({ x: 0, y: 0 });
        }
    }
}
