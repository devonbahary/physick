import { Dimensions, Shape } from './shapes/types';
import { Body, BodyEvent } from './Body';
import { Vector, Vectors } from './Vectors';
import { Rect } from './shapes/rects/Rect';
import { ContinuousCollisionDetection } from './collisions/ContinuousCollisionDetection';
import { CollisionResolution } from './collisions/CollisionResolution';
import { PubSub, PubSubable } from './PubSub';
import { roundForFloatingPoint } from './utilities';
import { QuadTree, QuadTreeConfig } from './QuadTree';
import { Force } from './Force';
import { CollisionEvent } from './collisions/types';
import { SerializedWorld, Serializer } from './Serializer';

type WorldArgs = Dimensions & {
    options?: Partial<WorldOptions> & { quadTreeConfig?: Partial<QuadTreeConfig> };
};

type WorldOptions = {
    friction: number;
    initBoundaries: boolean;
    // specify overwriting rules for when to treat collisionEvents like sensor collisions
    shouldResolveCollision?: (collisionEvent: CollisionEvent) => boolean;
    getCoefficientOfRestitution?: (a: Body, b: Body) => number;
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
    friction: 0.5,
    initBoundaries: true,
};

export class World implements PubSubable<WorldEvent, WorldEventDataMap> {
    public width: number;
    public height: number;
    public bodies: Body[] = [];

    public subscribe: Subscribe;
    public publish: Publish;

    private options: WorldOptions;
    private quadTree: QuadTree<Body>;
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

        if (options.initBoundaries) this.initBoundaries();
    }

    public update(dt: number): void {
        this.updateForces(dt);
        this.updateBodies(dt);
        this.quadTree.update();
    }

    public addBody(body: Body): void {
        this.bodies.push(body);
        this.quadTree.addData(body);
        this.publish(WorldEvent.AddBody, body);

        body.subscribe(BodyEvent.Move, (body) => {
            this.quadTree.onDataPositionChange(body);
        });
    }

    public removeBody(body: Body): void {
        this.bodies = this.bodies.filter((b) => b.id !== body.id);
        this.publish(WorldEvent.RemoveBody, body);
        this.quadTree.removeData(body);
    }

    public addForce(force: Force): void {
        this.forces.push(force);
    }

    public removeForce(force: Force): void {
        this.forces = this.forces.filter((f) => f.id !== force.id);
    }

    public getBodiesInShape(shape: Shape, inclusive = true): Body[] {
        return this.quadTree.getDataInShape(shape, inclusive);
    }

    public getFrictionOnBody(body: Body): number {
        return body.mass * this.options.friction;
    }

    public getBodyVelocityAfterFriction(body: Body): Vector {
        if (!body.isMoving()) return body.velocity;

        const friction = this.getFrictionOnBody(body);
        if (!friction) return body.velocity;

        const speed = body.speed;

        if (friction >= speed) {
            // friction should never reverse a body's velocity, only ever set its speed to 0
            return { x: 0, y: 0 };
        } else {
            return Vectors.resize(body.velocity, speed - friction);
        }
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

    private updateBodies(dt: number): void {
        for (const body of this.bodies) {
            // make sure each potential collision pair have both had friction applied before consideration
            this.applyFriction(body);
        }

        for (const body of this.bodies) {
            if (body.isMoving()) this.updateBodyMovement(body, dt);
        }
    }

    private updateBodyMovement(body: Body, dt: number, ignoreBodyIds = new Set<string>()): void {
        const collisionEvent = ContinuousCollisionDetection.getCollisionEvent(body, this, dt, ignoreBodyIds);

        if (collisionEvent) {
            // because we traverse bodies in no particular order, it's possible that we accidentally consider a false
            // collision of a slower-moving body into a faster-moving body along the collision vector
            // rather than ignoring the false collision altogether, we wait for that faster-moving colliding body to get
            // a chance to move
            if (ContinuousCollisionDetection.isChronological(collisionEvent)) {
                const { collisionBody } = collisionEvent;

                if (this.shouldResolveCollision(collisionEvent)) {
                    CollisionResolution.resolve(collisionEvent, this.options.getCoefficientOfRestitution);

                    this.onCollision(collisionEvent);

                    this.resolveChainedBodies(collisionBody);
                } else {
                    // recognize collision but do not resolve collision; continue on
                    this.onCollision(collisionEvent);

                    ignoreBodyIds.add(collisionBody.id);

                    this.updateBodyMovement(body, dt, ignoreBodyIds);
                }
            }
        } else {
            body.move(Vectors.resize(body.velocity, dt * body.speed));
        }
    }

    private shouldResolveCollision(collisionEvent: CollisionEvent): boolean {
        if (this.options.shouldResolveCollision) {
            return this.options.shouldResolveCollision(collisionEvent);
        }
        return !collisionEvent.movingBody.isSensor && !collisionEvent.collisionBody.isSensor;
    }

    // if the force through 1+ non-fixed bodies is stopped at a fixed body, move the last non-fixed body in the chain
    // around the fixed body
    private resolveChainedBodies(bodyInChain: Body, visitedBodyIds = new Set<string>()): void {
        if (bodyInChain.isFixed()) return;

        const collisionEvent = ContinuousCollisionDetection.getCollisionEvent(bodyInChain, this, 0, visitedBodyIds);

        if (collisionEvent && roundForFloatingPoint(collisionEvent.timeOfCollision) === 0) {
            this.onCollision(collisionEvent);

            const { collisionBody } = collisionEvent;

            if (collisionBody.isSensor) {
                visitedBodyIds.add(collisionBody.id);
                this.resolveChainedBodies(bodyInChain, visitedBodyIds);
            } else if (collisionBody.isFixed()) {
                const getTangentMovement = CollisionResolution.getTangentMovement(collisionEvent);
                bodyInChain.setVelocity(getTangentMovement);
            } else {
                visitedBodyIds.add(bodyInChain.id); // avoid infinite recursion
                this.resolveChainedBodies(collisionBody, visitedBodyIds);
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
        const newVelocity = this.getBodyVelocityAfterFriction(body);
        body.setVelocity(newVelocity);
    }
}
