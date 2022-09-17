import { v4 as uuid } from 'uuid';
import { Circle } from '@physics/shapes/Circle';
import { World } from '@physics/World';
import { CollisionDetection } from '@physics/collisions/CollisionDetection';
import { Vector, Vectors } from '@physics/Vectors';

export type Force = ConstantForce | IntervalForce;

type BaseForceArgs = {
    shape: Circle;
    magnitude: number;
    expiration?: Partial<Expiration>;
};

type Expiration = {
    duration: number;
    maxApplications: number;
};

type Expirable = Expiration & {
    applications: number;
    age: number;
};

const DEFAULT_EXPIRATION: Expiration = {
    duration: Infinity,
    maxApplications: Infinity,
};

abstract class BaseForce {
    id = uuid();
    private shape: Circle;
    private magnitude: number;
    protected expirable: Expirable;

    constructor(args: BaseForceArgs) {
        const { shape, magnitude, expiration } = args;
        this.shape = shape;
        this.magnitude = magnitude;

        this.expirable = { ...DEFAULT_EXPIRATION, ...expiration, applications: 0, age: 0 };
    }

    protected apply(world: World): void {
        const bodies = world.getBodiesInBoundingBox(this.shape.boundingBox);

        for (const body of bodies) {
            if (CollisionDetection.hasOverlap(this.shape, body.shape)) {
                const direction = Vectors.subtract(body, this.shape);
                const dissipation = this.getDissipationFactor(direction);
                const force = Vectors.resize(direction, this.magnitude * dissipation);
                body.applyForce(force);
            }
        }

        this.expirable.applications += 1;
    }

    shouldRemove(): boolean {
        const { applications, maxApplications } = this.expirable;
        return applications >= maxApplications || this.hasExceededDuration();
    }

    abstract update(world: World, dt: number): void;

    protected abstract hasExceededDuration(): boolean;

    private getDissipationFactor(direction: Vector): number {
        return (this.shape.radius - Vectors.magnitude(direction)) / this.shape.radius;
    }
}

export class ConstantForce extends BaseForce {
    update(world: World, dt: number): void {
        this.apply(world);
        this.expirable.age += dt;
    }

    protected hasExceededDuration(): boolean {
        if (this.expirable.duration === Infinity) return false;
        return this.expirable.age >= this.expirable.duration;
    }
}

type IntervalForceArgs = BaseForceArgs & {
    interval: number;
};

export class IntervalForce extends BaseForce {
    private interval: number;
    private lastIntervalProcessed = 0;

    constructor(args: IntervalForceArgs) {
        const { interval, ...rest } = args;
        super(rest);

        if (interval <= 0) throw new Error(`IntervalForce interval must be greater than 0`);

        this.interval = interval;
    }

    update(world: World, dt: number): void {
        const timeSinceLastInterval = this.expirable.age - this.lastIntervalProcessed;

        const timesToApplyThisFrame = Math.floor(timeSinceLastInterval / this.interval);

        for (let i = 0; i < timesToApplyThisFrame; i++) {
            if (!this.shouldRemove()) {
                this.apply(world);
            }
        }

        this.expirable.age += dt;
    }

    protected apply(world: World): void {
        super.apply(world);
        this.lastIntervalProcessed = this.expirable.age;
    }

    protected hasExceededDuration(): boolean {
        const { age, duration } = this.expirable;
        if (duration === Infinity) return false;
        // because time is processed multiple ms at a time, an IntervalForce may exceed its duration before it
        // processes an intended interval
        return Math.floor(age / this.interval) > Math.floor(duration / this.interval);
    }
}
