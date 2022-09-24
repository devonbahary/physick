import { Spatial } from '../types';
declare type BoundingBoxArgs = Pick<Spatial, 'x0' | 'x1' | 'y0' | 'y1'>;
export declare class BoundingBox implements Spatial {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    constructor(args: BoundingBoxArgs);
    get x(): number;
    get y(): number;
    get width(): number;
    get height(): number;
}
export {};
