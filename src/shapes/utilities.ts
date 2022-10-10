import { BoundingBox } from './rects/BoundingBox';
import { BoundingCircle } from './circles/BoundingCircle';
import { Shape } from './types';

export const isRect = (rect: Shape): rect is BoundingBox => {
    for (const prop of ['x0', 'x1', 'y0', 'y1', 'width', 'height']) {
        if (!(prop in rect)) return false;
    }

    return true;
};

export const isCircle = (circle: Shape): circle is BoundingCircle => {
    for (const prop of ['x', 'y', 'radius']) {
        if (!(prop in circle)) return false;
    }

    return true;
};
