import { Vector } from '../Vectors';
export declare class Particle implements Vector {
    x: number;
    y: number;
    velocity: Vector;
    constructor(x?: number, y?: number);
    moveTo(pos: Vector): void;
    move(dir: Vector): void;
    setVelocity(vel: Vector): void;
    get pos(): Vector;
}
