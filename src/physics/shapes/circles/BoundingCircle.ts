import { Spatial } from '@physics/shapes/types';
import { BoundingBox } from '@physics/shapes/rects/BoundingBox';

type BoundingCircleArgs = {
    x: number;
    y: number;
    radius: number;
};

export class BoundingCircle implements Spatial {
    public x: number;
    public y: number;
    public radius: number;

    constructor(args: BoundingCircleArgs) {
        const { x, y, radius } = args;
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    get x0(): number {
        return this.x - this.radius;
    }

    get x1(): number {
        return this.x + this.radius;
    }

    get y0(): number {
        return this.y - this.radius;
    }

    get y1(): number {
        return this.y + this.radius;
    }

    get width(): number {
        return this.radius * 2;
    }

    get height(): number {
        return this.radius * 2;
    }

    get boundingBox(): BoundingBox {
        const { x0, x1, y0, y1 } = this;
        return new BoundingBox({ x0, x1, y0, y1 });
    }
}
