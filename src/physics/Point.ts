import { Vector } from '@physics/types';

export class Point implements Vector {
    constructor(public x = 0, public y = 0) {}

    move(dir: Vector): void {
        this.x += dir.x;
        this.y += dir.y;
    }

    get pos(): Vector {
        return {
            x: this.x,
            y: this.y,
        };
    }
}
