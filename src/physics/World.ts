import { Dimensions } from '@physics/types';
import { Body } from '@physics/Body';
import { Vectors } from '@physics/Vectors';
import { Rect } from '@physics/shapes/Rect';
import { ContinousCollisionDetection } from '@physics/collisions/ContinousCollisionDetection';
import { CollisionResolution } from '@physics/collisions/CollisionResolution';
import { Observable } from '@physics/Observable';

type WorldArgs = Dimensions & {
    options?: Partial<WorldOptions>;
};

type WorldOptions = {
    frictionalForce: number;
    minimumFrictionalSpeed: number;
};

type OnBodyChange = (body: Body) => void;

export enum WorldEvent {
    AddBody,
    RemoveBody,
}

const DEFAULT_WORLD_OPTIONS: WorldOptions = {
    frictionalForce: 0.1,
    minimumFrictionalSpeed: 0.1,
};

export class World {
    public width: number;
    public height: number;
    public bodies: Body[] = [];
    private addBodyObservable = new Observable<Body>();
    private removeBodyObservable = new Observable<Body>();
    private options: WorldOptions;

    constructor(args: WorldArgs) {
        const { width, height, options } = args;

        this.width = width;
        this.height = height;

        this.options = { ...DEFAULT_WORLD_OPTIONS, ...options };

        this.initBoundaries();
    }

    public update(dt: number): void {
        for (const body of this.bodies) {
            if (!body.isMoving()) continue;

            const collisionEvent = ContinousCollisionDetection.getCollisionEventWithBodies(body, this.bodies, dt);

            if (collisionEvent) {
                // because we traverse bodies in no particular order, it's possible that we accidentally consider a false
                // collision of a slower-moving body into a faster-moving body along the collision vector
                // rather than ignoring the false collision altogether, we wait for that fast-moving colliding body to get
                // a chance to move
                if (ContinousCollisionDetection.isChronological(collisionEvent)) {
                    CollisionResolution.resolve(collisionEvent);
                }
            } else {
                body.move(Vectors.mult(body.velocity, dt));
                this.applyFriction(body, dt);
            }
        }
    }

    public subscribe(event: WorldEvent, callback: OnBodyChange): void {
        switch (event) {
            case WorldEvent.AddBody:
                this.addBodyObservable.observe(callback);
                break;
            case WorldEvent.RemoveBody:
                this.removeBodyObservable.observe(callback);
                break;
        }
    }

    public addBody(body: Body): void {
        this.bodies.push(body);
        this.addBodyObservable.notify(body);
    }

    public removeBody(body: Body): void {
        this.bodies = this.bodies.filter((b) => b.id !== body.id);
        this.removeBodyObservable.notify(body);
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
