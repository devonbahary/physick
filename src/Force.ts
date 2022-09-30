import { v4 as uuid } from 'uuid';
import { World } from './World';
import { Vector, Vectors } from './Vectors';
import { BoundingCircle } from './shapes/circles/BoundingCircle';

export type Force = ConstantForce | IntervalForce;

type BaseForceArgs = {
    boundingCircle: BoundingCircle;
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
    private boundingCircle: BoundingCircle;
    private magnitude: number;
    protected expirable: Expirable;

    constructor(args: BaseForceArgs) {
        const { boundingCircle, magnitude, expiration } = args;
        this.boundingCircle = boundingCircle;
        this.magnitude = magnitude;

        this.expirable = { ...DEFAULT_EXPIRATION, ...expiration, applications: 0, age: 0 };
    }

    protected apply(world: World): void {
        const bodies = world.getBodiesInShape(this.boundingCircle);

        for (const body of bodies) {
            const diffPos = Vectors.subtract(body, this.boundingCircle);
            const dissipation = this.getDissipationFactor(diffPos);
            const force = Vectors.resize(diffPos, this.magnitude * dissipation);
            body.applyForce(force);
        }

        this.expirable.applications += 1;
    }

    shouldRemove(): boolean {
        const { applications, maxApplications } = this.expirable;
        return applications >= maxApplications || this.hasExceededDuration();
    }

    abstract update(world: World, dt: number): void;

    protected abstract hasExceededDuration(): boolean;

    private getDissipationFactor(diffPos: Vector): number {
        return (this.boundingCircle.radius - Vectors.magnitude(diffPos)) / this.boundingCircle.radius;
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
