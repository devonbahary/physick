import { Vector } from '@physics/types';

export class Point implements Vector {
    public velocity: Vector = { x: 0, y: 0 };

    constructor(public x = 0, public y = 0) {}

    move(dir: Vector): void {
        this.x += dir.x;
        this.y += dir.y;
    }

    setVelocity(vel: Vector): void {
        this.velocity = vel;
    }

    get pos(): Vector {
        return {
            x: this.x,
            y: this.y,
        };
    }
}
