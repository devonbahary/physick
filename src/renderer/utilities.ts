import { Circle } from '@physics/shapes/Circle';
import { Sprite } from '@renderer/Sprite';

export const applyStyle = (element: HTMLElement, style: Partial<CSSStyleDeclaration>): void => {
    Object.assign(element.style, style);
};

export const toPx = (val: number): string => `${val}px`;

type CreateElementOptions = {
    id?: string;
    classNames?: string[];
};

export const createElement = (options: CreateElementOptions = {}): HTMLElement => {
    const { id, classNames } = options;

    const element = document.createElement('div');

    if (id) element.id = id;
    if (classNames) element.classList.add(...classNames);

    return element;
};

export const applyBodySpriteStyles = (sprite: Sprite): void => {
    const { body, element } = sprite;
    const { width, height } = body;

    const style: Partial<CSSStyleDeclaration> = {
        width: toPx(width),
        height: toPx(height),
    };

    if (body.shape instanceof Circle) {
        style.borderRadius = '50%';
    }

    applyStyle(element, style);
};
