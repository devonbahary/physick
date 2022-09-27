import { Body } from './Body';
import { Vector, Vectors } from './Vectors';
import { roundForFloatingPoint } from './utilities';
import { ContinousCollisionDetection } from './collisions/ContinousCollisionDetection';
import { World } from './World';
import { CollisionResolution } from './collisions/CollisionResolution';
import { CollisionEvent } from './collisions/types';

type CharacterOptions = {
    framesToTopSpeed: number;
    topSpeed: number;
};

const DEFAULT_CHARACTER_OPTIONS: CharacterOptions = {
    framesToTopSpeed: 5,
    topSpeed: 4,
};

type Momentum = {
    consecutiveFrames: number;
    lastHeading: Vector | null;
    heading: Vector | null;
};

export class Character {
    private momentum: Momentum = {
        consecutiveFrames: 0,
        lastHeading: null,
        heading: null,
    };
    private options: CharacterOptions;

    constructor(public body: Body, options?: Partial<CharacterOptions>) {
        this.options = {
            ...options,
            ...DEFAULT_CHARACTER_OPTIONS,
        };

        if (this.options.framesToTopSpeed <= 0) throw new Error(`Character.framesToTopSpeed must be > 0`);
    }

    get topSpeed(): number {
        return this.options.topSpeed;
    }

    get framesToTopSpeed(): number {
        return this.options.framesToTopSpeed;
    }

    get acceleration(): number {
        return this.topSpeed / this.framesToTopSpeed;
    }

    update(dt: number): void {
        this.updateMomentum(dt);
    }

    move(world: World, direction: Vector, dt: number): void {
        if (!Vectors.hasMagnitude(direction)) return;

        this.momentum.heading = direction;

        // character shouldn't be able to move if it's already moving faster than its movement speed
        if (this.body.speed >= this.topSpeed) return;

        const acceleration = this.getAccelerationWithMomentum(world);
        const accelerativeForce = Vectors.resize(direction, acceleration * this.body.mass);
        this.body.applyForce(accelerativeForce);

        if (this.body.speed >= this.topSpeed) {
            this.body.setVelocity(Vectors.resize(this.body.velocity, this.topSpeed));
        }

        const collisionEvent = ContinousCollisionDetection.getCollisionEvent(this.body, world, dt);
        if (collisionEvent) this.redirectAroundCollisionBody(collisionEvent);
    }

    private redirectAroundCollisionBody(collisionEvent: CollisionEvent): void {
        if (roundForFloatingPoint(collisionEvent.timeOfCollision) === 0) {
            const tangent = CollisionResolution.getTangentMovement(collisionEvent);
            this.body.setVelocity(tangent);
        }
    }

    private getAccelerationWithMomentum(world: World): number {
        const friction = world.getFrictionOnBody(this.body);

        const momentum = this.getMomentum();

        return friction > this.acceleration ? momentum : this.acceleration;
    }

    private getMomentum(): number {
        return Math.min(this.topSpeed, (this.topSpeed * this.momentum.consecutiveFrames) / this.framesToTopSpeed);
    }

    private updateMomentum(dt: number): void {
        if (!this.headingHasUpdated() || this.headingHasReversed()) {
            this.resetMomentum();
        } else if (this.momentum.heading) {
            const consecutiveFrames = this.momentum.consecutiveFrames + dt;
            this.momentum.consecutiveFrames = Math.min(consecutiveFrames, this.framesToTopSpeed);
        }

        this.momentum.lastHeading = this.momentum.heading;
    }

    private resetMomentum(): void {
        this.momentum.consecutiveFrames = 0;
        this.momentum.lastHeading = null;
        this.momentum.heading = null;
    }

    private headingHasUpdated(): boolean {
        // heading will point to a new vector every frame as long as move() is called
        return this.momentum.lastHeading !== this.momentum.heading;
    }

    private headingHasReversed(): boolean {
        const { lastHeading, heading } = this.momentum;
        return Boolean(lastHeading && heading && !Vectors.isSameDirection(lastHeading, heading));
    }
}
