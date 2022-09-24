import { Vector } from '../Vectors';

export class Particle implements Vector {
    public velocity: Vector = { x: 0, y: 0 };

    constructor(public x = 0, public y = 0) {}

    moveTo(pos: Vector): void {
        this.x = pos.x;
        this.y = pos.y;
    }

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
