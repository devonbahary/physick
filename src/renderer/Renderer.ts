import 'normalize.css';
import { Sprite } from '@renderer/Sprite';
import { World, WorldEvent } from '@physics/World';
import { Body } from '@physics/Body';
import { applyBodySpriteStyles, applyStyle, createElement, toPx } from '@renderer/utilities';
import { Vector } from '@physics/Vectors';
import { PubSub, PubSubable } from '@physics/PubSub';
import '@renderer/styles.css';

export enum RendererEvent {
    ClickSprite = 'ClickSprite',
    ClickWorld = 'ClickWorld',
}

type RendererEventDataMap = {
    [RendererEvent.ClickSprite]: Sprite;
    [RendererEvent.ClickWorld]: Vector;
};

type Subscribe = PubSub<RendererEvent, RendererEventDataMap>['subscribe'];
type Publish = PubSub<RendererEvent, RendererEventDataMap>['publish'];

export class Renderer implements PubSubable<RendererEvent, RendererEventDataMap> {
    private worldElement: HTMLElement;
    private sprites: Sprite[] = [];

    public subscribe: Subscribe;
    public publish: Publish;

    constructor(world: World, private player: Body) {
        this.worldElement = this.createWorld(world);
        document.body.appendChild(this.worldElement);

        const pubSub = new PubSub<RendererEvent, RendererEventDataMap>(Object.values(RendererEvent));
        this.subscribe = (...args): ReturnType<Subscribe> => pubSub.subscribe(...args);
        this.publish = (...args): ReturnType<Publish> => pubSub.publish(...args);

        this.initWorldSubscriptions(world);
    }

    public update(): void {
        for (const sprite of this.sprites) {
            const { body, element } = sprite;
            applyStyle(element, {
                top: toPx(body.y),
                left: toPx(body.x),
            });
        }
    }

    public addBodySprite(body: Body): void {
        const classNames = ['body'];

        if (body.isFixed()) classNames.push('fixed');

        const element = createElement({
            id: body.id === this.player.id ? 'player' : undefined,
            classNames,
        });

        const sprite = new Sprite(body, element);

        element.addEventListener('click', (event) => {
            this.publish(RendererEvent.ClickSprite, sprite);
            event.stopPropagation();
        });

        applyBodySpriteStyles(sprite);
        this.addSprite(sprite);
    }

    public removeBodySprite(body: Body): void {
        const spriteToRemove = this.sprites.find((sprite) => sprite.body.id === body.id);
        if (spriteToRemove) this.removeSprite(spriteToRemove);
    }

    private initWorldSubscriptions(world: World): void {
        world.subscribe(WorldEvent.AddBody, (body) => this.addBodySprite(body));
        world.subscribe(WorldEvent.RemoveBody, (body) => this.removeBodySprite(body));
    }

    private addSprite(sprite: Sprite): void {
        this.worldElement.appendChild(sprite.element);
        this.sprites.push(sprite);
    }

    private removeSprite(sprite: Sprite): void {
        this.worldElement.removeChild(sprite.element);
        this.sprites = this.sprites.filter((s) => s !== sprite);
    }

    private createWorld(world: World): HTMLElement {
        const element = createElement();
        element.id = 'world';

        applyStyle(element, {
            width: toPx(world.width),
            height: toPx(world.height),
        });

        element.addEventListener('click', (event) => {
            const { offsetX, offsetY } = event;
            this.publish(RendererEvent.ClickWorld, { x: offsetX, y: offsetY });
        });

        return element;
    }
}
