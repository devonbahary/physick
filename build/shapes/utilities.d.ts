import { BoundingBox } from './rects/BoundingBox';
import { BoundingCircle } from './circles/BoundingCircle';
import { Shape } from './types';
import { LineSegment } from './LineSegments';
export declare const isRect: (rect: Shape) => rect is BoundingBox;
export declare const isCircle: (circle: Shape) => circle is BoundingCircle;
export declare const isLineSegment: (line: Shape) => line is LineSegment;
