import 'normalize.css';
import { Circle } from '@physics/shapes/Circle';
import { Sprite } from '@renderer/Sprite';
import { World } from '@physics/World';
import { Body } from '@physics/Body';
import '@renderer/styles.css';

const applyStyle = (element: HTMLElement, style: Partial<CSSStyleDeclaration>): void => {
    Object.assign(element.style, style);
};

const toPx = (val: number): string => `${val}px`;

type CreateElementOptions = {
    id?: string;
    className?: string;
};

export class Renderer {
    private worldElement: HTMLElement;
    private sprites: Sprite[] = [];

    constructor(world: World, private player: Body) {
        this.worldElement = this.createWorld(world);
        document.body.appendChild(this.worldElement);
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
        const element = this.createElement({
            id: body.id === this.player.id ? 'player' : undefined,
            className: 'entity',
        });

        const { width, height } = body;

        const style: Partial<CSSStyleDeclaration> = {
            width: toPx(width),
            height: toPx(height),
        };

        if (body.shape instanceof Circle) {
            style.borderRadius = '50%';
        }

        applyStyle(element, style);

        const sprite = new Sprite(body, element);
        this.addSprite(sprite);
    }

    public removeBodySprite(body: Body): void {
        const spriteToRemove = this.sprites.find((sprite) => sprite.body.id === body.id);
        console.log(spriteToRemove);
        if (spriteToRemove) this.removeSprite(spriteToRemove);
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
        const element = this.createElement();
        element.id = 'world';

        applyStyle(element, {
            width: toPx(world.width),
            height: toPx(world.height),
        });

        return element;
    }

    private createElement(options: CreateElementOptions = {}): HTMLElement {
        const { id, className } = options;

        const element = document.createElement('div');

        if (id) element.id = id;
        if (className) element.classList.add(className);

        return element;
    }
}
