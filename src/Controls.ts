import { Body } from '@physics/Body';
import { Vectors } from '@physics/Vectors';

enum Key {
    Up = 'ArrowUp',
    Right = 'ArrowRight',
    Down = 'ArrowDown',
    Left = 'ArrowLeft',
}

const PLAYER_SPEED = 2;

export class Controls {
    private player: Body | null = null;
    private pressedKeys: Set<string>;

    constructor() {
        this.initListeners();
        this.pressedKeys = new Set();
    }

    public update(): void {
        this.updatePlayerMovement();
    }

    public setPlayer(player: Body): void {
        this.player = player;
    }

    private updatePlayerMovement(): void {
        if (!this.player || Vectors.magnitude(this.player.velocity) > PLAYER_SPEED) return;

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

        if (Vectors.hasMagnitude(movement)) {
            const velocity = Vectors.resize(movement, PLAYER_SPEED);
            this.player.setVelocity(velocity);
        }
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
