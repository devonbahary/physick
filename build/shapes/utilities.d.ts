import { BoundingBox } from './rects/BoundingBox';
import { BoundingCircle } from './circles/BoundingCircle';
import { Shape } from './types';
export declare const isRect: (rect: Shape) => rect is BoundingBox;
export declare const isCircle: (circle: Shape) => circle is BoundingCircle;
