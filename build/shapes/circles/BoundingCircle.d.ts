import { Spatial } from '../types';
import { BoundingBox } from '../rects/BoundingBox';
declare type BoundingCircleArgs = {
    x: number;
    y: number;
    radius: number;
};
export declare class BoundingCircle implements Spatial {
    x: number;
    y: number;
    radius: number;
    constructor(args: BoundingCircleArgs);
    get x0(): number;
    get x1(): number;
    get y0(): number;
    get y1(): number;
    get width(): number;
    get height(): number;
    get boundingBox(): BoundingBox;
}
export {};
