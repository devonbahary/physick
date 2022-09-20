import { Body } from '@physics/Body';
import { Vector, Vectors } from '@physics/Vectors';
import { framesInTimeDelta, roundForFloatingPoint } from '@physics/utilities';
import { ContinousCollisionDetection } from '@physics/collisions/ContinousCollisionDetection';
import { World } from '@physics/World';
import { CollisionResolution } from '@physics/collisions/CollisionResolution';

type CharacterOptions = {
    framesToTopSpeed: number;
    topSpeed: number;
};

const DEFAULT_CHARACTER_OPTIONS: CharacterOptions = {
    framesToTopSpeed: 1,
    topSpeed: 4,
};

export class Character {
    private options: CharacterOptions;

    constructor(public body: Body, options?: Partial<CharacterOptions>) {
        this.options = {
            ...options,
            ...DEFAULT_CHARACTER_OPTIONS,
        };

        if (this.options.framesToTopSpeed <= 0) throw new Error(`Character.framesToTopSpeed must be > 0`);
    }

    get acceleration(): number {
        return this.topSpeed / this.framesToTopSpeed;
    }

    get speed(): number {
        return Vectors.magnitude(this.body.velocity);
    }

    get topSpeed(): number {
        return this.options.topSpeed;
    }

    get framesToTopSpeed(): number {
        return this.options.framesToTopSpeed;
    }

    move(world: World, direction: Vector, dt: number): void {
        if (!Vectors.hasMagnitude(direction)) return;

        // player shouldn't be able to move if it's already moving faster than its movement speed
        if (this.speed >= this.topSpeed) return;

        const frames = framesInTimeDelta(dt);

        const acceleration = Vectors.resize(direction, this.acceleration * frames * this.body.mass);
        this.body.applyForce(acceleration);

        if (this.speed >= this.topSpeed) {
            this.body.setVelocity(Vectors.resize(this.body.velocity, this.topSpeed));
        }

        const collisionEvent = ContinousCollisionDetection.getCollisionEvent(this.body, world, frames);

        // redirect player around adjacent fixed bodies
        if (collisionEvent && roundForFloatingPoint(collisionEvent.timeOfCollision) === 0) {
            const tangent = CollisionResolution.getTangentMovement(collisionEvent);
            this.body.setVelocity(tangent);
        }
    }
}
