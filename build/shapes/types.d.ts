import { BoundingBox } from './rects/BoundingBox';
import { BoundingCircle } from './circles/BoundingCircle';
import { LineSegment } from './LineSegments';
export declare type Dimensions = {
    width: number;
    height: number;
};
export declare type Shape = BoundingBox | BoundingCircle | LineSegment;
export declare type Spatial = Dimensions & {
    x: number;
    y: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
};
