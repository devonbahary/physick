import { Body } from '@physics/Body';
import { Collisions } from '@physics/Collisions';
import { Vector, Vectors } from '@physics/Vectors';
import { World } from '@physics/World';

enum Key {
    Up = 'ArrowUp',
    Right = 'ArrowRight',
    Down = 'ArrowDown',
    Left = 'ArrowLeft',
    Shift = 'Shift',
}

const PLAYER_SPEED = 2;

export class Controls {
    private pressedKeys: Set<string>;

    constructor(private player: Body, private world: World) {
        this.initListeners();
        this.pressedKeys = new Set();
    }

    public update(dt: number): void {
        this.updatePlayerMovement(dt);
    }

    public isShiftPressed(): boolean {
        return this.isPressed(Key.Shift);
    }

    private updatePlayerMovement(dt: number): void {
        // player shouldn't be able to move if it's already moving faster than its movement speed
        if (Vectors.magnitude(this.player.velocity) > PLAYER_SPEED) return;

        const movement = this.getMovementVector();

        if (Vectors.hasMagnitude(movement)) {
            const velocity = Vectors.resize(movement, PLAYER_SPEED);
            this.player.setVelocity(velocity);

            const collisionEvent = Collisions.getCollisionEventWithBodies(this.player, this.world.bodies, dt);

            if (collisionEvent) {
                // slide around an object in contact with
                const projection = Collisions.getVelocityProjectionOntoContactTangent(collisionEvent);
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
        });
    }

    private isPressed(key: Key): boolean {
        return this.pressedKeys.has(key);
    }
}
