import { Body } from '../Body';
import { Circle } from '../shapes/circles/Circle';
import { Rect } from '../shapes/rects/Rect';
import { Particle } from '../shapes/Particle';
import { Vector, Vectors } from '../Vectors';
import { isInRange, quadratic, roundForFloatingPoint } from '../utilities';
import { Collision, CollisionEvent } from './types';
import { CollisionDetection } from './CollisionDetection';
import { World } from '../World';
import { HorzLineSegment, LineSegment, VertLineSegment } from '../shapes/LineSegments';

const isCollisionInThisTimestep = (t: number, dt: number): boolean => {
    const rounded = roundForFloatingPoint(t);
    return isInRange(0, rounded, dt);
};

const isMovingTowards = (a: Particle, b: Particle): boolean => {
    const diffVector = Vectors.subtract(b, a);
    const velocityInDiff = Vectors.dot(diffVector, a.velocity);
    return roundForFloatingPoint(velocityInDiff) > 0;
};

const getEarliestCollision = (collisions: Collision[]): Collision | null => {
    return collisions.reduce<Collision | null>((earliest, collision) => {
        if (earliest === null || earliest.timeOfCollision > collision.timeOfCollision) {
            return collision;
        }

        return earliest;
    }, null);
};

export class ContinuousCollisionDetection {
    static isChronological(collisionEvent: CollisionEvent): boolean {
        // check that the speed at which the movingBody is moving towards collisionBody along the collision vector
        // is no slower than the speed at which collisionBody is (possibly) moving away
        const { movingBody, collisionBody, collisionVector } = collisionEvent;

        if (!collisionBody.isMoving()) return true;

        const movingBodyMovementOnCollisionVector = Vectors.proj(movingBody.velocity, collisionVector);
        const collisionBodyMovementOnCollisionVector = Vectors.proj(collisionBody.velocity, collisionVector);

        if (!Vectors.isSameDirection(movingBodyMovementOnCollisionVector, collisionBodyMovementOnCollisionVector)) {
            return true; // moving towards each other
        }

        return !Vectors.isLarger(collisionBodyMovementOnCollisionVector, movingBodyMovementOnCollisionVector);
    }

    static getCollisionEvent(
        movingBody: Body,
        world: World,
        dt: number,
        ignoreBodyIds = new Set<string>(),
    ): CollisionEvent | null {
        const movementBoundingBox = CollisionDetection.getMovementBoundingBox(movingBody);
        if (!movementBoundingBox) return null;

        const bodiesInBoundingBox = world.getBodiesInShape(movementBoundingBox);

        const potentialCollisionBodies = bodiesInBoundingBox.filter((body) => !ignoreBodyIds.has(body.id));

        return potentialCollisionBodies.reduce<CollisionEvent | null>((earliest, collisionBody) => {
            if (movingBody === collisionBody) return earliest;

            const collision = ContinuousCollisionDetection.getCollision(movingBody, collisionBody, dt);

            if (!collision) return earliest;

            if (earliest === null || earliest.timeOfCollision > collision.timeOfCollision) {
                return {
                    ...collision,
                    movingBody,
                    collisionBody,
                };
            }

            return earliest;
        }, null);
    }

    private static getCollision(a: Body, b: Body, dt: number): Collision | null {
        if (a.shape instanceof Circle) {
            if (b.shape instanceof Circle)
                return ContinuousCollisionDetection.getCircleVsCircleCollision(a.shape, b.shape, dt);
            if (b.shape instanceof Rect)
                return ContinuousCollisionDetection.getCircleVsRectCollision(a.shape, b.shape, dt);
        }

        if (a.shape instanceof Rect) {
            if (b.shape instanceof Circle)
                return ContinuousCollisionDetection.getRectVsCircleCollision(a.shape, b.shape, dt);
            if (b.shape instanceof Rect)
                return ContinuousCollisionDetection.getRectVsRectCollision(a.shape, b.shape, dt);
        }

        return null;
    }

    private static getCircleVsCircleCollision(
        a: Circle | Particle,
        b: Circle | Particle,
        dt: number,
    ): Collision | null {
        // don't consider circles not even moving in the direction of another circle
        if (!isMovingTowards(a, b)) return null;

        const {
            velocity: { x: dx, y: dy },
        } = a;

        const diffX = a.x - b.x;
        const diffY = a.y - b.y;
        const radiusA = a instanceof Circle ? a.radius : 0;
        const radiusB = b instanceof Circle ? b.radius : 0;

        const coefficientA = dx ** 2 + dy ** 2;
        const coefficientB = 2 * dx * diffX + 2 * dy * diffY;
        const coefficientC = diffX ** 2 + diffY ** 2 - (radiusA + radiusB) ** 2;

        const timesOfCollision = quadratic(coefficientA, coefficientB, coefficientC);

        return timesOfCollision.reduce<Collision | null>((earliest, t) => {
            if (!isCollisionInThisTimestep(t, dt)) return earliest;

            const aAtTimeOfCollision = new Particle(a.x + dx * t, a.y + dy * t);
            aAtTimeOfCollision.setVelocity(a.velocity);

            // glance, but not a collision
            if (!isMovingTowards(aAtTimeOfCollision, b)) return earliest;

            if (earliest === null || earliest.timeOfCollision > t) {
                return {
                    timeOfCollision: t,
                    collisionVector: Vectors.subtract(b, aAtTimeOfCollision),
                };
            }

            return earliest;
        }, null);
    }

    // https://gamedev.stackexchange.com/questions/65814/2d-rectangle-circle-continuous-collision-detection
    private static getCircleVsRectCollision(circle: Circle, rect: Rect, dt: number): Collision | null {
        const {
            radius,
            velocity: { x: dx, y: dy },
        } = circle;
        const { x0, x1, y0, y1 } = rect;

        // consider circle collision into each rect side
        const sideCollisions: Collision[] = [];

        const addSideCollision = (circle: Circle, side: LineSegment, collisionVector: Vector): void => {
            const timeOfCollision = ContinuousCollisionDetection.getPointVsLineTimeOfCollision(circle, side, dt);

            if (timeOfCollision !== null) {
                sideCollisions.push({
                    timeOfCollision,
                    collisionVector,
                });
            }
        };

        // extend the rectangle sides out by circle radius length so that we can simulate a point vs line collision
        const topSide = new HorzLineSegment({ x0, x1, y: y0 - radius });
        const bottomSide = new HorzLineSegment({ x0, x1, y: rect.y1 + radius });
        const rightSide = new VertLineSegment({ x: x1 + radius, y0, y1 });
        const leftSide = new VertLineSegment({ x: x0 - radius, y0, y1 });

        const xAxisCollisionDistance = circle.radius + rect.width / 2;
        const yAxisCollisionDistance = circle.radius + rect.height / 2;

        if (dy > 0) addSideCollision(circle, topSide, { x: 0, y: yAxisCollisionDistance });
        if (dy < 0) addSideCollision(circle, bottomSide, { x: 0, y: -yAxisCollisionDistance });
        if (dx < 0) addSideCollision(circle, rightSide, { x: -xAxisCollisionDistance, y: 0 });
        if (dx > 0) addSideCollision(circle, leftSide, { x: xAxisCollisionDistance, y: 0 });

        // consider circle collision into each rect corner
        const topLeftCorner = new Particle(x0, y0);
        const topRightCorner = new Particle(x1, y0);
        const bottomRightCorner = new Particle(x1, y1);
        const bottomLeftCorner = new Particle(x0, y1);

        const corners = [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner];

        const cornerCollisions = corners.reduce<Collision[]>((collisions, corner) => {
            if (isMovingTowards(circle, corner)) {
                const collision = ContinuousCollisionDetection.getCircleVsCircleCollision(circle, corner, dt);
                if (collision) collisions.push(collision);
            }
            return collisions;
        }, []);

        return getEarliestCollision([...sideCollisions, ...cornerCollisions]);
    }

    // https://gamedev.stackexchange.com/questions/65814/2d-rectangle-circle-continuous-collision-detection
    private static getRectVsCircleCollision(rect: Rect, circle: Circle, dt: number): Collision | null {
        const { x0, x1, y0, y1, velocity } = rect;
        const { x: dx, y: dy } = velocity;
        const { radius } = circle;

        // consider rect side collisions into the circle
        const sideCollisions: Collision[] = [];

        const addSideCollision = (point: Particle, side: LineSegment, collisionVector: Vector): void => {
            const timeOfCollision = ContinuousCollisionDetection.getPointVsLineTimeOfCollision(point, side, dt);

            if (timeOfCollision !== null) {
                sideCollisions.push({
                    timeOfCollision,
                    collisionVector,
                });
            }
        };

        // extend the rectangle sides out by circle radius length so that we can simulate a point vs line collision
        const topSide = new HorzLineSegment({ x0, x1, y: y0 - radius });
        const bottomSide = new HorzLineSegment({ x0, x1, y: y1 + radius });
        const rightSide = new VertLineSegment({ x: x1 + radius, y0, y1 });
        const leftSide = new VertLineSegment({ x: x0 - radius, y0, y1 });

        // simulate the circle moving towards the rect so we can simulate point vs line rather than line vs point
        const point = new Particle(circle.x, circle.y);
        point.setVelocity(Vectors.opposite(velocity));

        if (dy > 0) addSideCollision(point, bottomSide, { x: 0, y: circle.radius + rect.height / 2 });
        if (dy < 0) addSideCollision(point, topSide, { x: 0, y: -(circle.radius + rect.height / 2) });
        if (dx < 0) addSideCollision(point, leftSide, { x: -(circle.radius + rect.width / 2), y: 0 });
        if (dx > 0) addSideCollision(point, rightSide, { x: circle.radius + rect.width / 2, y: 0 });

        // consider rect corner collisions into the circle
        const topLeftCorner = new Particle(x0, y0);
        const topRightCorner = new Particle(x1, y0);
        const bottomRightCorner = new Particle(x1, y1);
        const bottomLeftCorner = new Particle(x0, y1);

        const corners = [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner];

        const cornerCollisions = corners.reduce<Collision[]>((collisions, corner) => {
            if (isMovingTowards(point, corner)) {
                corner.setVelocity(velocity);
                const collision = ContinuousCollisionDetection.getCircleVsCircleCollision(corner, circle, dt);
                if (collision) collisions.push(collision);
            }
            return collisions;
        }, []);

        return getEarliestCollision([...sideCollisions, ...cornerCollisions]);
    }

    // https://www.emanueleferonato.com/2021/10/21/understanding-physics-continuous-collision-detection-using-swept-aabb-method-and-minkowski-sum/
    private static getRectVsRectCollision(a: Rect, b: Rect, dt: number): Collision | null {
        const collisions: Collision[] = [];

        const addSideCollision = (
            minkowskiCollisionSide: LineSegment,
            actualCollisionSide: LineSegment,
            getMovingSideAtTimeOfCollision: (t: number) => LineSegment,
            collisionVector: Vector,
        ): void => {
            const timeOfCollision = ContinuousCollisionDetection.getPointVsLineTimeOfCollision(
                a,
                minkowskiCollisionSide,
                dt,
            );

            if (timeOfCollision !== null) {
                const movingSideAtTimeOfCollision = getMovingSideAtTimeOfCollision(timeOfCollision);

                const lineSegmentContact = LineSegment.getOverlappingLineSegment(
                    actualCollisionSide,
                    movingSideAtTimeOfCollision,
                );

                if (!LineSegment.isPoint(lineSegmentContact)) {
                    collisions.push({
                        timeOfCollision,
                        collisionVector,
                    });
                }
            }
        };

        const {
            velocity: { x: dx, y: dy },
        } = a;

        const xAxisCollisionDistance = a.width / 2 + b.width / 2;
        const yAxisCollisionDistance = a.height / 2 + b.height / 2;

        // simulate a point vs line collision using a Minkowski Sum
        const minkowskiSumB = new Rect({ ...b.pos, width: a.width + b.width, height: a.height + b.height });

        if (dy > 0) {
            const minkowskiTopB = new HorzLineSegment({
                x0: minkowskiSumB.x0,
                x1: minkowskiSumB.x1,
                y: minkowskiSumB.y0,
            });

            const collisionY = b.y0;
            const actualTopB = new HorzLineSegment({ x0: b.x0, x1: b.x1, y: collisionY });

            addSideCollision(
                minkowskiTopB,
                actualTopB,
                (t) =>
                    new HorzLineSegment({
                        x0: a.x0 + dx * t,
                        x1: a.x1 + dx * t,
                        y: collisionY,
                    }),
                { x: 0, y: yAxisCollisionDistance },
            );
        }

        if (dy < 0) {
            const minkowskiBottomB = new HorzLineSegment({
                x0: minkowskiSumB.x0,
                x1: minkowskiSumB.x1,
                y: minkowskiSumB.y1,
            });

            const collisionY = b.y1;
            const actualBottomB = new HorzLineSegment({ x0: b.x0, x1: b.x1, y: collisionY });

            addSideCollision(
                minkowskiBottomB,
                actualBottomB,
                (t) =>
                    new HorzLineSegment({
                        x0: a.x0 + dx * t,
                        x1: a.x1 + dx * t,
                        y: collisionY,
                    }),
                { x: 0, y: -yAxisCollisionDistance },
            );
        }

        if (dx < 0) {
            const minkowskiRightB = new VertLineSegment({
                x: minkowskiSumB.x1,
                y0: minkowskiSumB.y0,
                y1: minkowskiSumB.y1,
            });

            const collisionX = b.x1;
            const actualRightB = new VertLineSegment({ y0: b.y0, y1: b.y1, x: collisionX });

            addSideCollision(
                minkowskiRightB,
                actualRightB,
                (t) =>
                    new VertLineSegment({
                        y0: a.y0 + dy * t,
                        y1: a.y1 + dy * t,
                        x: collisionX,
                    }),
                { x: -xAxisCollisionDistance, y: 0 },
            );
        }

        if (dx > 0) {
            const minkowskiLeft = new VertLineSegment({
                x: minkowskiSumB.x0,
                y0: minkowskiSumB.y0,
                y1: minkowskiSumB.y1,
            });

            const collisionX = b.x0;
            const actualLeftB = new VertLineSegment({ y0: b.y0, y1: b.y1, x: collisionX });

            addSideCollision(
                minkowskiLeft,
                actualLeftB,
                (t) =>
                    new VertLineSegment({
                        y0: a.y0 + dy * t,
                        y1: a.y1 + dy * t,
                        x: collisionX,
                    }),
                { x: xAxisCollisionDistance, y: 0 },
            );
        }

        return getEarliestCollision(collisions);
    }

    private static getPointVsLineTimeOfCollision(point: Particle, line: LineSegment, dt: number): number | null {
        const {
            x: pointX,
            y: pointY,
            velocity: { x: dx, y: dy },
        } = point;

        if (!(line instanceof HorzLineSegment) && !(line instanceof VertLineSegment)) {
            throw new Error(`can't getPointVsLineTimeOfCollision() with non-horizontal/vertical line`);
        }

        if (line instanceof HorzLineSegment) {
            if (!dy) return null;

            const { x0, x1, y: lineY } = line;
            const t = (lineY - pointY) / dy;

            if (isCollisionInThisTimestep(t, dt)) {
                const pointXAtTimeOfCollision = pointX + dx * t;
                if (isInRange(x0, pointXAtTimeOfCollision, x1)) return t;
            }
        }

        if (line instanceof VertLineSegment) {
            if (!dx) return null;

            const { x: lineX, y0, y1 } = line;
            const t = (lineX - pointX) / dx;

            if (isCollisionInThisTimestep(t, dt)) {
                const pointYAtTimeOfCollision = pointY + dy * t;
                if (isInRange(y0, pointYAtTimeOfCollision, y1)) return t;
            }
        }

        return null;
    }
}
