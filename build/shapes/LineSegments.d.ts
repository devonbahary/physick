export declare type LineSegment = HorzLineSegment | VertLineSegment;
declare type HorzLineSegmentArgs = {
    x0: number;
    x1: number;
    y: number;
};
export declare class HorzLineSegment implements HorzLineSegmentArgs {
    x0: number;
    x1: number;
    y: number;
    constructor({ x0, x1, y }: HorzLineSegmentArgs);
}
declare type VertLineSegmentArgs = {
    x: number;
    y0: number;
    y1: number;
};
export declare class VertLineSegment implements VertLineSegmentArgs {
    x: number;
    y0: number;
    y1: number;
    constructor({ x, y0, y1 }: VertLineSegmentArgs);
}
export declare class LineSegments {
    static isPoint(line: LineSegment): boolean;
    static getOverlappingSegment(a: LineSegment, b: LineSegment): LineSegment;
}
export {};
