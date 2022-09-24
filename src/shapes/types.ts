import { BoundingBox } from './rects/BoundingBox';
import { BoundingCircle } from './circles/BoundingCircle';

export type Dimensions = {
    width: number;
    height: number;
};

export type Shape = BoundingBox | BoundingCircle;

export type Spatial = Dimensions & {
    x: number;
    y: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
};
