import { Body } from '../Body';
import { BoundingBox } from '../shapes/rects/BoundingBox';
import { BoundingCircle } from '../shapes/circles/BoundingCircle';
import { Shape } from '../shapes/types';
import { isCircle, isLineSegment, isPoint, isRect } from '../shapes/utilities';
import { Vector, Vectors } from '../Vectors';
import { LineSegment } from '../shapes/LineSegments';
import { isInRange } from '../utilities';
import { Particle } from '../shapes/Particle';

export class CollisionDetection {
    static getMovementBoundingBox(body: Body): BoundingBox | null {
        if (!body.isMoving()) return null;
        const {
            x0,
            x1,
            y0,
            y1,
            velocity: { x: dx, y: dy },
        } = body;

        const bounds = { x0, x1, y0, y1 };

        if (dx > 0) bounds.x1 += dx;
        if (dx < 0) bounds.x0 += dx;
        if (dy > 0) bounds.y1 += dy;
        if (dy < 0) bounds.y0 += dy;

        return new BoundingBox(bounds);
    }

    static hasOverlap(a: Shape, b: Shape, inclusive = true): boolean {
        if (isCircle(a)) {
            if (isCircle(b)) {
                return CollisionDetection.getCircleVsCircleOverlap(a, b, inclusive);
            }

            if (isRect(b)) {
                return CollisionDetection.getCircleVsRectOverlap(a, b, inclusive);
            }

            if (isLineSegment(b)) {
                return CollisionDetection.getCircleVsLineOverlap(a, b, inclusive);
            }

            if (isPoint(b)) {
                return CollisionDetection.getCircleVsPointOverlap(a, b, inclusive);
            }
        }

        if (isRect(a)) {
            if (isCircle(b)) {
                return CollisionDetection.getCircleVsRectOverlap(b, a, inclusive);
            }

            if (isRect(b)) {
                return CollisionDetection.getRectVsRectOverlap(a, b, inclusive);
            }

            if (isLineSegment(b)) {
                return CollisionDetection.getRectVsLineOverlap(a, b, inclusive);
            }

            if (isPoint(b)) {
                return CollisionDetection.getRectVsPointOverlap(a, b, inclusive);
            }
        }

        if (isLineSegment(a)) {
            if (isCircle(b)) {
                return CollisionDetection.getCircleVsLineOverlap(b, a, inclusive);
            }

            if (isRect(b)) {
                return CollisionDetection.getRectVsLineOverlap(b, a, inclusive);
            }

            if (isLineSegment(b)) {
                return CollisionDetection.getLineVsLineOverlap(a, b, inclusive);
            }
        }

        if (isPoint(a)) {
            if (isCircle(b)) {
                return CollisionDetection.getCircleVsPointOverlap(b, a, inclusive);
            }

            if (isRect(b)) {
                return CollisionDetection.getRectVsPointOverlap(b, a, inclusive);
            }

            if (isPoint(b)) {
                return CollisionDetection.getPointVsPointOverlap(a, b);
            }
        }

        throw new Error(`can't determine overlap for shapes: ${JSON.stringify(a)}, ${JSON.stringify(b)}`);
    }

    private static getCircleVsCircleOverlap(a: BoundingCircle, b: BoundingCircle, inclusive: boolean): boolean {
        const diffPos = Vectors.subtract(a, b);
        const radiiLength = a.radius + b.radius;
        return inclusive
            ? diffPos.x ** 2 + diffPos.y ** 2 <= radiiLength ** 2
            : diffPos.x ** 2 + diffPos.y ** 2 < radiiLength ** 2;
    }

    // https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
    private static getCircleVsRectOverlap(circle: BoundingCircle, rect: BoundingBox, inclusive: boolean): boolean {
        const dx = Math.abs(circle.x - rect.x);
        const dy = Math.abs(circle.y - rect.y);

        // check if circle is beyond the length of the radius and half the rect
        if (inclusive) {
            if (dx > rect.width / 2 + circle.radius) return false;
            if (dy > rect.height / 2 + circle.radius) return false;
        } else {
            if (dx >= rect.width / 2 + circle.radius) return false;
            if (dy >= rect.height / 2 + circle.radius) return false;
        }

        // check if is circle is close enough to rect to guarantee intersection
        if (inclusive) {
            if (dx <= rect.width / 2) return true;
            if (dy <= rect.height / 2) return true;
        } else {
            if (dx < rect.width / 2) return true;
            if (dy < rect.height / 2) return true;
        }

        const circleDistanceFromCorner = (dx - rect.width / 2) ** 2 + (dy - rect.height / 2) ** 2;

        return inclusive
            ? circleDistanceFromCorner <= circle.radius ** 2
            : circleDistanceFromCorner < circle.radius ** 2;
    }

    private static getRectVsRectOverlap(a: BoundingBox, b: BoundingBox, inclusive: boolean): boolean {
        return inclusive
            ? a.x0 <= b.x1 && a.x1 >= b.x0 && a.y0 <= b.y1 && a.y1 >= b.y0
            : a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
    }

    // https://www.jeffreythompson.org/collision-detection/line-circle.php
    private static getCircleVsLineOverlap(circle: BoundingCircle, line: LineSegment, inclusive: boolean): boolean {
        // check if either end of the line segment exists inside the circle
        if (CollisionDetection.getCircleVsPointOverlap(circle, line.start, inclusive)) return true;
        if (CollisionDetection.getCircleVsPointOverlap(circle, line.end, inclusive)) return true;

        const lineAsVector = line.toVector();
        const startToCircle = Vectors.subtract(circle, line.start);
        const projScalar = Vectors.dot(startToCircle, lineAsVector) / Vectors.dot(lineAsVector, lineAsVector);

        if (projScalar < 0) {
            return false; // closest point on line is beyond the start of line segment
        }

        const projStartToCircleOntoLineSegment = Vectors.mult(lineAsVector, projScalar);

        if (Vectors.isLarger(projStartToCircleOntoLineSegment, lineAsVector)) {
            return false; // closest point on line is beyond the end of line segment
        }

        const closestPointToCircleVector = Vectors.subtract(
            circle,
            Vectors.add(line.start, projStartToCircleOntoLineSegment),
        );

        // circle overlaps with line if the radius is >= than the distance to closest point
        return inclusive
            ? closestPointToCircleVector.x ** 2 + closestPointToCircleVector.y ** 2 <= circle.radius ** 2
            : closestPointToCircleVector.x ** 2 + closestPointToCircleVector.y ** 2 < circle.radius ** 2;
    }

    private static getCircleVsPointOverlap(circle: BoundingCircle, point: Vector, inclusive: boolean): boolean {
        const diffPos = Vectors.subtract(circle, point);
        return inclusive
            ? diffPos.x ** 2 + diffPos.y ** 2 <= circle.radius ** 2
            : diffPos.x ** 2 + diffPos.y ** 2 < circle.radius ** 2;
    }

    private static getRectVsPointOverlap(rect: BoundingBox, point: Vector, inclusive: boolean): boolean {
        return isInRange(rect.x0, point.x, rect.x1, inclusive) && isInRange(rect.y0, point.y, rect.y1, inclusive);
    }

    private static getRectVsLineOverlap(rect: BoundingBox, line: LineSegment, inclusive: boolean): boolean {
        if (
            CollisionDetection.getRectVsPointOverlap(rect, line.start, inclusive) ||
            CollisionDetection.getRectVsPointOverlap(rect, line.end, inclusive)
        ) {
            return true;
        }

        const topLeftCorner = { x: rect.x0, y: rect.y0 };
        const topRightCorner = { x: rect.x1, y: rect.y0 };
        const bottomRightCorner = { x: rect.x1, y: rect.y1 };
        const bottomLeftCorner = { x: rect.x0, y: rect.y1 };

        const rectLineSegments = [
            new LineSegment(topLeftCorner, topRightCorner),
            new LineSegment(topRightCorner, bottomRightCorner),
            new LineSegment(bottomRightCorner, bottomLeftCorner),
            new LineSegment(bottomLeftCorner, topLeftCorner),
        ];

        for (const rectLineSegment of rectLineSegments) {
            if (CollisionDetection.getLineVsLineOverlap(line, rectLineSegment, inclusive)) {
                return true;
            }
        }

        return false;
    }

    // https://www.jeffreythompson.org/collision-detection/line-line.php
    private static getLineVsLineOverlap(a: LineSegment, b: LineSegment, inclusive: boolean): boolean {
        const {
            start: { x: x1, y: y1 },
            end: { x: x2, y: y2 },
        } = a;
        const {
            start: { x: x3, y: y3 },
            end: { x: x4, y: y4 },
        } = b;

        const uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
        const uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

        return isInRange(0, uA, 1, inclusive) && isInRange(0, uB, 1, inclusive);
    }

    private static getPointVsPointOverlap(a: Particle, b: Particle): boolean {
        return a.x === b.x && a.y === b.y;
    }
}
