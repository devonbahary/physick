import { BoundingBox } from './rects/BoundingBox';
import { BoundingCircle } from './circles/BoundingCircle';
export declare type Dimensions = {
    width: number;
    height: number;
};
export declare type Shape = BoundingBox | BoundingCircle;
export declare type Spatial = Dimensions & {
    x: number;
    y: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
};
