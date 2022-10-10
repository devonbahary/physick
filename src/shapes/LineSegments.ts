import { isInRange } from '../utilities';
import { Vector, Vectors } from '../Vectors';

export class LineSegment {
    constructor(public start: Vector, public end: Vector) {}

    get x0(): number {
        return Math.min(this.start.x, this.end.x);
    }

    get x1(): number {
        return Math.max(this.start.x, this.end.x);
    }

    get y0(): number {
        return Math.min(this.start.y, this.end.y);
    }

    get y1(): number {
        return Math.max(this.start.y, this.end.y);
    }

    toVector(): Vector {
        return Vectors.subtract(this.end, this.start);
    }

    static isPoint(lineSegment: LineSegment): boolean {
        return lineSegment.start.x === lineSegment.end.x && lineSegment.start.y === lineSegment.end.y;
    }

    static getOverlappingLineSegment(a: LineSegment, b: LineSegment): LineSegment {
        if (a instanceof HorzLineSegment && b instanceof HorzLineSegment) {
            const x0 = Math.max(a.x0, b.x0);
            const x1 = Math.min(a.x1, b.x1);

            if (
                a.y !== b.y ||
                !isInRange(a.x0, x0, a.x1) ||
                !isInRange(a.x0, x1, a.x1) ||
                !isInRange(b.x0, x0, b.x1) ||
                !isInRange(b.x0, x1, b.x1)
            ) {
                throw new Error(
                    `can't get overlap of incompatible line segments: ${JSON.stringify(a)}, ${JSON.stringify(b)}`,
                );
            }

            return new HorzLineSegment({ x0, x1, y: a.y }); // a.y === b.y
        }

        if (a instanceof VertLineSegment && b instanceof VertLineSegment) {
            const y0 = Math.max(a.y0, b.y0);
            const y1 = Math.min(a.y1, b.y1);

            if (
                a.x !== b.x ||
                !isInRange(a.y0, y0, a.y1) ||
                !isInRange(a.y0, y1, a.y1) ||
                !isInRange(b.y0, y0, b.y1) ||
                !isInRange(b.y0, y1, b.y1)
            ) {
                throw new Error(
                    `can't get overlap of incompatible line segments: ${JSON.stringify(a)}, ${JSON.stringify(b)}`,
                );
            }

            return new VertLineSegment({ y0, y1, x: a.x }); // a.x === b.x
        }

        throw new Error(`can only getOverlappingLineSegment() for mutually vertical / horizontal lines`);
    }
}

type HorzLineSegmentArgs = {
    x0: number;
    x1: number;
    y: number;
};

export class HorzLineSegment extends LineSegment {
    constructor(args: HorzLineSegmentArgs) {
        const { x0, x1, y } = args;
        super({ x: x0, y }, { x: x1, y });
    }

    get y(): number {
        return this.start.y; // arbitrarily choosing start.y instead of end.y
    }
}

type VertLineSegmentArgs = {
    x: number;
    y0: number;
    y1: number;
};

export class VertLineSegment extends LineSegment {
    constructor(args: VertLineSegmentArgs) {
        const { x, y0, y1 } = args;
        super({ x, y: y0 }, { x, y: y1 });
    }

    get x(): number {
        return this.start.x; // arbitrarily choosing start.y instead of end.y
    }
}
