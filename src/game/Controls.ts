import { Body } from '@physics/Body';
import { CollisionResolution } from '@physics/collisions/CollisionResolution';
import { ContinousCollisionDetection } from '@physics/collisions/ContinousCollisionDetection';
import { ConstantForce } from '@physics/Force';
import { PubSub, PubSubable } from '@physics/PubSub';
import { Circle } from '@physics/shapes/Circle';
import { framesInTimeDelta, roundForFloatingPoint } from '@physics/utilities';
import { Vector, Vectors } from '@physics/Vectors';
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

const PLAYER_SPEED = 4;

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

    constructor(private player: Body, private world: World, renderer: Renderer) {
        this.initListeners();
        this.pressedKeys = new Set();

        const pubSub = new PubSub<ControlsEvent, ControlsEventDataMap>(Object.values(ControlsEvent));
        this.subscribe = (...args): ReturnType<Subscribe> => pubSub.subscribe(...args);
        this.publish = (...args): ReturnType<Publish> => pubSub.publish(...args);

        this.initRendererSubscriptions(renderer);
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
            const newVelocity = Vectors.resize(movement, PLAYER_SPEED);
            const projExistingVelocityOntoNewVelocity = Vectors.proj(this.player.velocity, newVelocity);

            if (Vectors.isSameDirection(newVelocity, projExistingVelocityOntoNewVelocity)) {
                this.player.setVelocity(newVelocity);
            } else {
                this.player.setVelocity(Vectors.add(newVelocity, projExistingVelocityOntoNewVelocity));
            }

            const frames = framesInTimeDelta(dt);
            const collisionEvent = ContinousCollisionDetection.getCollisionEvent(this.player, this.world, frames);

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
            const shape = new Circle({ ...pos, radius: 50 });
            const force = new ConstantForce({ shape, magnitude: 5, expiration: { maxApplications: 1 } });
            this.world.addForce(force);
        });
    }
}
