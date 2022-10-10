import { BoundingBox } from './rects/BoundingBox';
import { BoundingCircle } from './circles/BoundingCircle';
import { LineSegment } from './LineSegments';

export type Dimensions = {
    width: number;
    height: number;
};

export type Shape = BoundingBox | BoundingCircle | LineSegment;

export type Spatial = Dimensions & {
    x: number;
    y: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
};
