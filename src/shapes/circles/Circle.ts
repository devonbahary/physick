import { Particle } from '../Particle';
import { Vector } from '../../Vectors';
import { BoundingBox } from '../rects/BoundingBox';
import { BoundingCircle } from './BoundingCircle';

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
