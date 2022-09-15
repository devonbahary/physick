import { Body } from '@physics/Body';
import { CollisionResolution } from '@physics/collisions/CollisionResolution';
import { ContinousCollisionDetection } from '@physics/collisions/ContinousCollisionDetection';
import { PubSub } from '@physics/PubSub';
import { roundForFloatingPoint } from '@physics/utilities';
import { Vector, Vectors } from '@physics/Vectors';
import { World } from '@physics/World';

export enum Key {
    Up = 'ArrowUp',
    Right = 'ArrowRight',
    Down = 'ArrowDown',
    Left = 'ArrowLeft',
    Shift = 'Shift',
    Space = ' ',
}

const PLAYER_SPEED = 4;

export enum ControlsEvent {
    OnKeyDown = 'OnKeyDown',
}

type ControlsEventDataMap = {
    [ControlsEvent.OnKeyDown]: string;
};

type Subscribe = PubSub<ControlsEvent, ControlsEventDataMap>['subscribe'];
type Publish = PubSub<ControlsEvent, ControlsEventDataMap>['publish'];

export class Controls {
    public subscribe: Subscribe;
    private publish: Publish;

    private pressedKeys: Set<string>;

    constructor(private player: Body, private world: World) {
        this.initListeners();
        this.pressedKeys = new Set();

        const pubSub = new PubSub<ControlsEvent, ControlsEventDataMap>(Object.values(ControlsEvent));
        this.subscribe = (...args): ReturnType<Subscribe> => pubSub.subscribe(...args);
        this.publish = (...args): ReturnType<Publish> => pubSub.publish(...args);
    }

    public update(dt: number): void {
        this.updatePlayerMovement(dt);
    }

    public isPressed(key: Key): boolean {
        return this.pressedKeys.has(key);
    }

    private updatePlayerMovement(dt: number): void {
        // player shouldn't be able to move if it's already moving faster than its movement speed
        if (Vectors.magnitude(this.player.velocity) > PLAYER_SPEED) return;

        const movement = this.getMovementVector();

        if (Vectors.hasMagnitude(movement)) {
            const velocity = Vectors.resize(movement, PLAYER_SPEED);
            this.player.setVelocity(velocity);

            const collisionEvent = ContinousCollisionDetection.getCollisionEventWithBodies(
                this.player,
                this.world.bodies,
                dt,
            );

            // move player around adjacent fixed bodies
            if (
                collisionEvent &&
                roundForFloatingPoint(collisionEvent.timeOfCollision) === 0 &&
                collisionEvent.collisionBody.isFixed()
            ) {
                const tangent = CollisionResolution.getTangentMovement(collisionEvent);
                this.player.setVelocity(tangent);
            }
        }
    }

    private getMovementVector(): Vector {
        const movement = { x: 0, y: 0 };

        if (this.isPressed(Key.Up)) {
            movement.y -= 1;
        }

        if (this.isPressed(Key.Down)) {
            movement.y += 1;
        }

        if (this.isPressed(Key.Left)) {
            movement.x -= 1;
        }

        if (this.isPressed(Key.Right)) {
            movement.x += 1;
        }

        return Vectors.resize(movement, PLAYER_SPEED);
    }

    private initListeners(): void {
        document.addEventListener('keydown', (event) => {
            this.pressedKeys.add(event.key);
            this.publish(ControlsEvent.OnKeyDown, event.key);
        });

        document.addEventListener('keyup', (event) => {
            this.pressedKeys.delete(event.key);
        });
    }
}
