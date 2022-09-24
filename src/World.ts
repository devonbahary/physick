import { Dimensions } from './shapes/types';
import { Body, BodyEvent } from './Body';
import { Vectors } from './Vectors';
import { Rect } from './shapes/rects/Rect';
import { ContinousCollisionDetection } from './collisions/ContinousCollisionDetection';
import { CollisionResolution } from './collisions/CollisionResolution';
import { PubSub, PubSubable } from './PubSub';
import { framesInTimeDelta, roundForFloatingPoint } from './utilities';
import { QuadTree, QuadTreeConfig } from './QuadTree';
import { Force } from './Force';
import { CollisionEvent } from './collisions/types';
import { SerializedWorld, Serializer } from './Serializer';
import { BoundingBox } from './shapes/rects/BoundingBox';

type WorldArgs = Dimensions & {
    options?: Partial<WorldOptions> & { quadTreeConfig?: Partial<QuadTreeConfig> };
};

type WorldOptions = {
    frictionalForce: number;
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
    frictionalForce: 0.5,
};

export class World implements PubSubable<WorldEvent, WorldEventDataMap> {
    public width: number;
    public height: number;
    public bodies: Body[] = [];

    public subscribe: Subscribe;
    public publish: Publish;

    private options: WorldOptions;
    private quadTree: QuadTree;
    private forces: Force[] = [];

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
        const frames = framesInTimeDelta(dt);
        this.updateForces(dt);
        this.updateBodies(frames);
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

    public addForce(force: Force): void {
        this.forces.push(force);
    }

    public removeForce(force: Force): void {
        this.forces = this.forces.filter((f) => f.id !== force.id);
    }

    public getBodiesInBoundingBox(boundingBox: BoundingBox): Body[] {
        return this.quadTree.getBodiesInBoundingBox(boundingBox);
    }

    public getFrictionOnBody(body: Body): number {
        return body.mass * this.options.frictionalForce;
    }

    // TODO: forces?
    public loadSerialized(serializedWorld: SerializedWorld): void {
        for (const body of this.bodies) {
            this.removeBody(body);
        }

        for (const serializedBody of serializedWorld.bodies) {
            const body = Serializer.fromSerializedBody(serializedBody);
            this.addBody(body);
        }
    }

    private updateForces(dt: number): void {
        for (const force of this.forces) {
            force.update(this, dt);
        }

        this.forces = this.forces.filter((f) => !f.shouldRemove());
    }

    private updateBodies(frames: number): void {
        for (const body of this.bodies) {
            // make sure each potential collision pair have both had friction applied before consideration
            this.applyFriction(body);
        }

        for (const body of this.bodies) {
            if (body.isMoving()) this.updateBodyMovement(body, frames);
        }
    }

    private updateBodyMovement(body: Body, frames: number, ignoreBodyIds = new Set<string>()): void {
        const collisionEvent = ContinousCollisionDetection.getCollisionEvent(body, this, frames, ignoreBodyIds);

        if (collisionEvent) {
            // because we traverse bodies in no particular order, it's possible that we accidentally consider a false
            // collision of a slower-moving body into a faster-moving body along the collision vector
            // rather than ignoring the false collision altogether, we wait for that faster-moving colliding body to get
            // a chance to move
            if (ContinousCollisionDetection.isChronological(collisionEvent)) {
                const { collisionBody } = collisionEvent;

                if (collisionBody.isSensor) {
                    this.onCollision(collisionEvent);

                    // recognize sensor collision but do not resolve collision; continue on
                    ignoreBodyIds.add(collisionBody.id);

                    this.updateBodyMovement(body, frames, ignoreBodyIds);
                } else {
                    CollisionResolution.resolve(collisionEvent);

                    this.onCollision(collisionEvent);

                    this.resolveChainedBodies(collisionBody);
                }
            }
        } else {
            body.move(Vectors.resize(body.velocity, frames * body.speed));
        }
    }

    // if the force through 1+ non-fixed bodies is stopped at a fixed body, move the last non-fixed body in the chain
    // around the fixed body
    private resolveChainedBodies(bodyInChain: Body, visitedBodyIds = new Set<string>()): void {
        if (bodyInChain.isFixed()) return;

        const collisionEvent = ContinousCollisionDetection.getCollisionEvent(bodyInChain, this, 0, visitedBodyIds);

        if (collisionEvent && roundForFloatingPoint(collisionEvent.timeOfCollision) === 0) {
            this.onCollision(collisionEvent);

            if (collisionEvent.collisionBody.isFixed()) {
                const getTangentMovement = CollisionResolution.getTangentMovement(collisionEvent);
                bodyInChain.setVelocity(getTangentMovement);
            } else {
                visitedBodyIds.add(bodyInChain.id); // avoid infinite recursion
                this.resolveChainedBodies(collisionEvent.collisionBody, visitedBodyIds);
            }
        }
    }

    private onCollision(collisionEvent: CollisionEvent): void {
        const { movingBody, collisionBody } = collisionEvent;
        movingBody.publish(BodyEvent.Collision, collisionEvent);
        collisionBody.publish(BodyEvent.Collision, collisionEvent);
    }

    private initBoundaries(): void {
        const { width, height } = this;

        const rects = [
            new Rect({ x: width / 2, width, height: 0 }), // top
            new Rect({ x: width, y: height / 2, width: 0, height }), // right
            new Rect({ x: width / 2, y: height, width, height: 0 }), // bottom
            new Rect({ x: 0, y: height / 2, width: 0, height }), // left
        ];

        const boundaryBodies = rects.map((shape) => new Body({ shape, mass: Infinity }));

        for (const body of boundaryBodies) {
            this.addBody(body);
        }
    }

    private applyFriction(body: Body): void {
        if (!body.isMoving()) return;

        const friction = this.getFrictionOnBody(body);
        const speed = body.speed;

        if (!friction) return;

        if (friction >= speed) {
            // friction should never reverse a body's velocity, only ever set it to 0
            body.setVelocity({ x: 0, y: 0 });
        } else {
            const newVelocity = Vectors.resize(body.velocity, speed - friction);
            body.setVelocity(newVelocity);
        }
    }
}
