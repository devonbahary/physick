import { Particle } from '../Particle';
import { Vector } from '../../Vectors';
import { Dimensions } from '../types';
import { BoundingBox } from '../rects/BoundingBox';
export declare type RectArgs = Partial<Vector> & Dimensions;
export declare class Rect extends Particle implements BoundingBox {
    width: number;
    height: number;
    constructor(args: RectArgs);
    get x0(): number;
    get x1(): number;
    get y0(): number;
    get y1(): number;
}
