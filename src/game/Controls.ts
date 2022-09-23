import { Character } from '@physics/Character';
import { ConstantForce } from '@physics/Force';
import { PubSub, PubSubable } from '@physics/PubSub';
import { BoundingCircle } from '@physics/shapes/circles/BoundingCircle';
import { Vector } from '@physics/Vectors';
import { World } from '@physics/World';
import { Renderer, RendererEvent } from '@renderer/Renderer';

export enum Key {
    Up = 'ArrowUp',
    Right = 'ArrowRight',
    Down = 'ArrowDown',
    Left = 'ArrowLeft',
    Shift = 'Shift',
    Space = ' ',
}

export enum ControlsEvent {
    OnKeyDown = 'OnKeyDown',
}

type ControlsEventDataMap = {
    [ControlsEvent.OnKeyDown]: string;
};

type Subscribe = PubSub<ControlsEvent, ControlsEventDataMap>['subscribe'];
type Publish = PubSub<ControlsEvent, ControlsEventDataMap>['publish'];

export class Controls implements PubSubable<ControlsEvent, ControlsEventDataMap> {
    public subscribe: Subscribe;
    public publish: Publish;

    private pressedKeys: Set<string>;

    constructor(private player: Character, private world: World, renderer: Renderer) {
        this.initListeners();
        this.pressedKeys = new Set();

        const pubSub = new PubSub<ControlsEvent, ControlsEventDataMap>(Object.values(ControlsEvent));
        this.subscribe = (...args): ReturnType<Subscribe> => pubSub.subscribe(...args);
        this.publish = (...args): ReturnType<Publish> => pubSub.publish(...args);

        this.initRendererSubscriptions(renderer);
    }

    public update(frames: number): void {
        this.updatePlayerMovement(frames);
    }

    public isPressed(key: Key): boolean {
        return this.pressedKeys.has(key);
    }

    private updatePlayerMovement(frames: number): void {
        const direction = this.getMovementDirection();
        this.player.move(this.world, direction, frames);
    }

    private getMovementDirection(): Vector {
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

        return movement;
    }

    private initListeners(): void {
        document.addEventListener('keydown', (event) => {
            if ([Key.Up, Key.Right, Key.Down, Key.Left, Key.Space].includes(event.key as Key)) {
                event.preventDefault();
            }
            this.pressedKeys.add(event.key);
            this.publish(ControlsEvent.OnKeyDown, event.key);
        });

        document.addEventListener('keyup', (event) => {
            this.pressedKeys.delete(event.key);
        });
    }

    private initRendererSubscriptions(renderer: Renderer): void {
        renderer.subscribe(RendererEvent.ClickSprite, (sprite) => console.log(sprite.body));
        renderer.subscribe(RendererEvent.ClickWorld, (pos) => {
            const shape = new BoundingCircle({ ...pos, radius: 50 });
            const force = new ConstantForce({
                boundingCircle: shape,
                magnitude: 5,
                expiration: { maxApplications: 1 },
            });
            this.world.addForce(force);
        });
    }
}
