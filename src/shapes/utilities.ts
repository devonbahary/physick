import { BoundingBox } from './rects/BoundingBox';
import { BoundingCircle } from './circles/BoundingCircle';
import { Shape } from './types';
import { LineSegment } from './LineSegments';
import { Particle } from './Particle';

export const isRect = (rect: Shape): rect is BoundingBox => {
    for (const prop of ['x0', 'x1', 'y0', 'y1', 'width', 'height']) {
        if (!(prop in rect)) return false;
    }

    if ('radius' in rect) return false;

    return true;
};

export const isCircle = (circle: Shape): circle is BoundingCircle => {
    for (const prop of ['x', 'y', 'radius']) {
        if (!(prop in circle)) return false;
    }

    return true;
};

export const isLineSegment = (line: Shape): line is LineSegment => {
    for (const prop of ['start', 'end']) {
        if (!(prop in line)) return false;
    }

    return true;
};

export const isPoint = (point: Shape): point is Particle => {
    for (const prop of ['x', 'y']) {
        if (!(prop in point)) return false;
    }

    for (const prop of ['radius', 'width', 'height']) {
        if (prop in point) return false;
    }

    return true;
};
