import { Vector } from "../Vectors";
export declare class LineSegment {
    start: Vector;
    end: Vector;
    constructor(start: Vector, end: Vector);
    get x0(): number;
    get x1(): number;
    get y0(): number;
    get y1(): number;
    static isPoint(lineSegment: LineSegment): boolean;
    static isHorzLine(lineSegment: LineSegment): boolean;
    static isVertLine(lineSegment: LineSegment): boolean;
    static getOverlappingLineSegment(a: LineSegment, b: LineSegment): LineSegment;
}
declare type HorzLineSegmentArgs = {
    x0: number;
    x1: number;
    y: number;
};
export declare const HorzLineSegment: (args: HorzLineSegmentArgs) => LineSegment;
declare type VertLineSegmentArgs = {
    x: number;
    y0: number;
    y1: number;
};
export declare const VertLineSegment: (args: VertLineSegmentArgs) => LineSegment;
export {};
