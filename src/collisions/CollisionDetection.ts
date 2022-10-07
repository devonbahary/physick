import { Body } from '../Body';
import { BoundingBox } from '../shapes/rects/BoundingBox';
import { BoundingCircle } from '../shapes/circles/BoundingCircle';
import { Shape } from '../shapes/types';
import { isCircle, isRect } from '../shapes/utilities';
import { Vectors } from '../Vectors';

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

    static hasOverlap(a: Shape, b: Shape): boolean {
        if (isCircle(a)) {
            if (isCircle(b)) {
                return CollisionDetection.getCircleVsCircleOverlap(a, b);
            }

            if (isRect(b)) {
                return CollisionDetection.getCircleVsRectOverlap(a, b);
            }
        }

        if (isRect(a)) {
            if (isCircle(b)) {
                return CollisionDetection.getCircleVsRectOverlap(b, a);
            }

            if (isRect(b)) {
                return CollisionDetection.getRectVsRectOverlap(a, b);
            }
        }

        throw new Error(`can't determine overlap for shapes: ${JSON.stringify(a)}, ${JSON.stringify(b)}`);
    }

    private static getCircleVsCircleOverlap(a: BoundingCircle, b: BoundingCircle): boolean {
        const diffPos = Vectors.subtract(a, b);
        const radiiLength = a.radius + b.radius;
        return diffPos.x ** 2 + diffPos.y ** 2 <= radiiLength ** 2;
    }

    // https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
    private static getCircleVsRectOverlap(circle: BoundingCircle, rect: BoundingBox): boolean {
        const dx = Math.abs(circle.x - rect.x);
        const dy = Math.abs(circle.y - rect.y);

        // check if circle is beyond the length of the radius and half the rect
        if (dx > rect.width / 2 + circle.radius) return false;
        if (dy > rect.height / 2 + circle.radius) return false;

        // check if is circle is close enough to rect to guarantee intersection
        if (dx <= rect.width / 2) return true;
        if (dy <= rect.height / 2) return true;

        const circleDistanceFromCorner = (dx - rect.width / 2) ** 2 + (dy - rect.height / 2) ** 2;

        return circleDistanceFromCorner <= circle.radius ** 2;
    }

    private static getRectVsRectOverlap(a: BoundingBox, b: BoundingBox): boolean {
        return a.x0 <= b.x1 && a.x1 >= b.x0 && a.y0 <= b.y1 && a.y1 >= b.y0;
    }
}
