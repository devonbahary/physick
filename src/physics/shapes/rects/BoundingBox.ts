import { Spatial } from '@physics/shapes/types';

type BoundingBoxArgs = Pick<Spatial, 'x0' | 'x1' | 'y0' | 'y1'>;

export class BoundingBox implements Spatial {
    public x0: number;
    public x1: number;
    public y0: number;
    public y1: number;

    constructor(args: BoundingBoxArgs) {
        const { x0, x1, y0, y1 } = args;
        this.x0 = x0;
        this.x1 = x1;
        this.y0 = y0;
        this.y1 = y1;
    }

    get x(): number {
        return this.x0 + this.width / 2;
    }

    get y(): number {
        return this.y0 + this.height / 2;
    }

    get width(): number {
        return this.x1 - this.x0;
    }

    get height(): number {
        return this.y1 - this.y0;
    }
}
