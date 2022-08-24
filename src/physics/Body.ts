import { Shape, Vector } from '@physics/types';
import { v4 as uuid } from 'uuid';

export class Body {
    constructor(public shape: Shape, public id = uuid()) {}

    get pos(): Vector {
        return this.shape.pos;
    }

    get x(): number {
        return this.shape.x;
    }

    get y(): number {
        return this.shape.y;
    }

    get width(): number {
        return this.shape.width;
    }

    get height(): number {
        return this.shape.height;
    }

    public move(dir: Vector): void {
        this.shape.move(dir);
    }
}
