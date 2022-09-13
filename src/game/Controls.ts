import { Body } from '@physics/Body';
import { CollisionResolution } from '@physics/collisions/CollisionResolution';
import { ContinousCollisionDetection } from '@physics/collisions/ContinousCollisionDetection';
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

export class Controls {
    private pressedKeys: Set<string>;
    private tappedKeys: Set<string>;

    constructor(private player: Body, private world: World) {
        this.initListeners();
        this.pressedKeys = new Set();
        this.tappedKeys = new Set();
    }

    public update(dt: number): void {
        this.tappedKeys.clear();
        this.updatePlayerMovement(dt);
    }

    public isPressed(key: Key): boolean {
        return this.pressedKeys.has(key);
    }

    public isTapped(key: Key): boolean {
        return this.tappedKeys.has(key);
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

            if (collisionEvent) {
                // slide around an object in contact with
                const projection = CollisionResolution.getMovementTangentToTouchingFixedBody(collisionEvent);
                if (projection) this.player.setVelocity(projection);
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
        });

        document.addEventListener('keyup', (event) => {
            this.pressedKeys.delete(event.key);
            this.tappedKeys.add(event.key);
        });
    }
}
