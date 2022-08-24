import { Body } from '@physics/Body';

enum Key {
    Up = 'ArrowUp',
    Right = 'ArrowRight',
    Down = 'ArrowDown',
    Left = 'ArrowLeft',
}

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
        if (!this.player) return;

        const movement = { x: 0, y: 0 };

        if (this.isPressed(Key.Up)) {
            movement.y -= 5;
        }

        if (this.isPressed(Key.Down)) {
            movement.y += 5;
        }

        if (this.isPressed(Key.Left)) {
            movement.x -= 5;
        }

        if (this.isPressed(Key.Right)) {
            movement.x += 5;
        }

        this.player.move(movement);
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
