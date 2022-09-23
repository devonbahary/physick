import { Particle } from '@physics/shapes/Particle';
import { Vector } from '@physics/Vectors';
import { BoundingBox } from '@physics/shapes/rects/BoundingBox';
import { BoundingCircle } from '@physics/shapes/circles/BoundingCircle';

export type CircleArgs = Partial<Vector> & {
    radius: number;
};

export class Circle extends Particle implements BoundingCircle {
    public radius: number;

    constructor(args: CircleArgs) {
        const { radius, x, y } = args;
        super(x, y);
        this.radius = radius;
    }

    get width(): number {
        return this.radius * 2;
    }

    get height(): number {
        return this.radius * 2;
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

    get boundingBox(): BoundingBox {
        const { x0, x1, y0, y1 } = this;
        return new BoundingBox({ x0, x1, y0, y1 });
    }
}
