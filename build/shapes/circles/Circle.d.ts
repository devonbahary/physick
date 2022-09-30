import { Particle } from '../Particle';
import { Vector } from '../../Vectors';
import { BoundingCircle } from './BoundingCircle';
export declare type CircleArgs = Partial<Vector> & {
    radius: number;
};
export declare class Circle extends Particle implements BoundingCircle {
    radius: number;
    constructor(args: CircleArgs);
    get width(): number;
    get height(): number;
    get x0(): number;
    get x1(): number;
    get y0(): number;
    get y1(): number;
}
