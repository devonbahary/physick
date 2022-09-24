import { isInRange } from '../utilities';

export type LineSegment = HorzLineSegment | VertLineSegment;

type HorzLineSegmentArgs = {
    x0: number;
    x1: number;
    y: number;
};

export class HorzLineSegment implements HorzLineSegmentArgs {
    public x0: number;
    public x1: number;
    public y: number;

    constructor({ x0, x1, y }: HorzLineSegmentArgs) {
        this.x0 = x0;
        this.x1 = x1;
        this.y = y;
    }
}

type VertLineSegmentArgs = {
    x: number;
    y0: number;
    y1: number;
};

export class VertLineSegment implements VertLineSegmentArgs {
    public x: number;
    public y0: number;
    public y1: number;

    constructor({ x, y0, y1 }: VertLineSegmentArgs) {
        this.x = x;
        this.y0 = y0;
        this.y1 = y1;
    }
}

const invalidOverlappingSegmentsErrMessage = (a: LineSegment, b: LineSegment): string => {
    return `can't get overlap of incompatible line segments ${JSON.stringify(a)}, ${JSON.stringify(b)}`;
};

export class LineSegments {
    static isPoint(line: LineSegment): boolean {
        if (line instanceof HorzLineSegment) {
            return line.x0 === line.x1;
        }

        if (line instanceof VertLineSegment) {
            return line.y0 === line.y1;
        }

        throw new Error(`invalid LineSegment`);
    }

    static getOverlappingSegment(a: LineSegment, b: LineSegment): LineSegment {
        if (a instanceof HorzLineSegment) {
            if (b instanceof HorzLineSegment) {
                const x0 = Math.max(a.x0, b.x0);
                const x1 = Math.min(a.x1, b.x1);

                if (
                    a.y !== b.y ||
                    !isInRange(a.x0, x0, a.x1) ||
                    !isInRange(a.x0, x1, a.x1) ||
                    !isInRange(b.x0, x0, b.x1) ||
                    !isInRange(b.x0, x1, b.x1)
                ) {
                    throw new Error(invalidOverlappingSegmentsErrMessage(a, b));
                }

                return new HorzLineSegment({ x0, x1, y: a.y });
            }
        }

        if (a instanceof VertLineSegment) {
            if (b instanceof VertLineSegment) {
                const y0 = Math.max(a.y0, b.y0);
                const y1 = Math.min(a.y1, b.y1);

                if (
                    a.x !== b.x ||
                    !isInRange(a.y0, y0, a.y1) ||
                    !isInRange(a.y0, y1, a.y1) ||
                    !isInRange(b.y0, y0, b.y1) ||
                    !isInRange(b.y0, y1, b.y1)
                ) {
                    throw new Error(invalidOverlappingSegmentsErrMessage(a, b));
                }

                return new VertLineSegment({ y0, y1, x: a.x });
            }
        }

        throw new Error(invalidOverlappingSegmentsErrMessage(a, b));
    }
}
