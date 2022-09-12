import { Circle } from '@physics/shapes/Circle';
import { Rect } from '@physics/shapes/Rect';
import { Dimensions } from '@physics/types';

export type Shape = Rect | Circle;

export type Spatial = Dimensions & {
    x: number;
    y: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
};
