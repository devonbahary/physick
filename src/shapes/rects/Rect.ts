import { Particle } from '../Particle';
import { Vector } from '../../Vectors';
import { Dimensions } from '../types';
import { BoundingBox } from '../rects/BoundingBox';

export type RectArgs = Partial<Vector> & Dimensions;

export class Rect extends Particle implements BoundingBox {
    public width: number;
    public height: number;

    constructor(args: RectArgs) {
        const { x, y, width, height } = args;
        super(x, y);
        this.width = width;
        this.height = height;
    }

    get x0(): number {
        return this.x - this.width / 2;
    }

    get x1(): number {
        return this.x + this.width / 2;
    }

    get y0(): number {
        return this.y - this.height / 2;
    }

    get y1(): number {
        return this.y + this.height / 2;
    }
}
