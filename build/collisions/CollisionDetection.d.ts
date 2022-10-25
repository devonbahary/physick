import { Body } from '../Body';
import { BoundingBox } from '../shapes/rects/BoundingBox';
import { Shape } from '../shapes/types';
export declare class CollisionDetection {
    static getMovementBoundingBox(body: Body): BoundingBox | null;
    static hasOverlap(a: Shape, b: Shape, inclusive?: boolean): boolean;
    private static getCircleVsCircleOverlap;
    private static getCircleVsRectOverlap;
    private static getRectVsRectOverlap;
    private static getCircleVsLineOverlap;
    private static getCircleVsPointOverlap;
    private static getRectVsPointOverlap;
    private static getRectVsLineOverlap;
    private static getLineVsLineOverlap;
    private static getPointVsPointOverlap;
}
