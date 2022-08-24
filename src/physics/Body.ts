import { Shape, Vector } from "@physics/types";

export class Body {
    constructor(
        public shape: Shape,
    ) {}

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