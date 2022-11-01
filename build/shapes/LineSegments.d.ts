import { Vector } from '../Vectors';
export declare class LineSegment {
    start: Vector;
    end: Vector;
    constructor(start: Vector, end: Vector);
    get x0(): number;
    get x1(): number;
    get y0(): number;
    get y1(): number;
    toVector(): Vector;
    static isPoint(lineSegment: LineSegment): boolean;
    static isSame(a: LineSegment, b: LineSegment): boolean;
    static getOverlappingLineSegment(a: LineSegment, b: LineSegment): LineSegment;
}
declare type HorzLineSegmentArgs = {
    x0: number;
    x1: number;
    y: number;
};
export declare class HorzLineSegment extends LineSegment {
    constructor(args: HorzLineSegmentArgs);
    get y(): number;
}
declare type VertLineSegmentArgs = {
    x: number;
    y0: number;
    y1: number;
};
export declare class VertLineSegment extends LineSegment {
    constructor(args: VertLineSegmentArgs);
    get x(): number;
}
export {};
