import { Dimensions } from '@physics/types';
import { Body } from '@physics/Body';
import { Vectors } from '@physics/Vectors';
import { Rect } from '@physics/shapes/Rect';
import { Collisions } from '@physics/Collisions';

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
    private addBodyHandlers: OnBodyChange[] = [];
    private removeBodyHandlers: OnBodyChange[] = [];
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

            const collisionEvent = Collisions.getCollisionEventWithBodies(body, this.bodies, dt);

            if (collisionEvent !== null) {
                if (collisionEvent.timeOfCollision) {
                    // TODO: round?
                    const movement = Vectors.mult(body.velocity, collisionEvent.timeOfCollision);
                    body.move(movement);
                }
                // TODO: collision resolution
                body.setVelocity({ x: 0, y: 0 });
            } else {
                body.move(Vectors.mult(body.velocity, dt));
                this.applyFriction(body, dt);
            }
        }
    }

    public subscribe(event: WorldEvent, callback: OnBodyChange): void {
        switch (event) {
            case WorldEvent.AddBody:
                this.addBodyHandlers.push(callback);
                break;
            case WorldEvent.RemoveBody:
                this.removeBodyHandlers.push(callback);
                break;
        }
    }

    public addBody(body: Body): void {
        this.bodies.push(body);

        for (const addBodyHandler of this.addBodyHandlers) {
            addBodyHandler(body);
        }
    }

    public removeBody(body: Body): void {
        this.bodies = this.bodies.filter((b) => b.id !== body.id);

        for (const removeBodyHandler of this.removeBodyHandlers) {
            removeBodyHandler(body);
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
