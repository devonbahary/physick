import { Spatial } from '../types';

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
}
