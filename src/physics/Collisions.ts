import { Body } from '@physics/Body';
import { Circle } from '@physics/shapes/Circle';
import { Rect } from '@physics/shapes/Rect';
import { Particle } from '@physics/shapes/Particle';
import { HorzLineSegment, LineSegment, LineSegments, VertLineSegment } from '@physics/shapes/LineSegments';
import { Vector, Vectors } from '@physics/Vectors';
import { isInRange, quadratic, roundForFloatingPoint } from '@physics/utilities';

type PointCollision = {
    pointOfContact: Vector;
    lineSegmentContact?: never;
    timeOfCollision: number;
};

type LineSegmentCollision = {
    pointOfContact?: never;
    lineSegmentContact: LineSegment;
    timeOfCollision: number;
};

type Collision = PointCollision | LineSegmentCollision;

type CollisionEvent = Collision & {
    movingBody: Body;
    collisionBody: Body;
};

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

export class Collisions {
    static getCollisionEventWithBodies(movingBody: Body, bodies: Body[], dt: number): CollisionEvent | null {
        if (!movingBody.isMoving()) return null;

        return bodies.reduce<CollisionEvent | null>((earliest, collisionBody) => {
            if (movingBody === collisionBody) return earliest;

            const collision = Collisions.getCollision(movingBody, collisionBody, dt);

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

    // TODO: this should probably only work / be applied against fixed objects
    static getVelocityProjectionOntoContactTangent(collisionEvent: CollisionEvent): Vector | null {
        const { movingBody, lineSegmentContact, pointOfContact, timeOfCollision } = collisionEvent;

        if (roundForFloatingPoint(timeOfCollision) !== 0) return null;

        const { velocity } = movingBody;

        if (pointOfContact) {
            const diffVector = Vectors.subtract(pointOfContact, movingBody);
            const tangent = Vectors.normal(diffVector);
            return Vectors.proj(velocity, tangent);
        }

        if (lineSegmentContact) {
            if (lineSegmentContact instanceof HorzLineSegment) {
                const contactAsVector = { x: lineSegmentContact.x1 - lineSegmentContact.x0, y: 0 };
                return Vectors.proj(velocity, contactAsVector);
            }

            if (lineSegmentContact instanceof VertLineSegment) {
                const contactAsVector = { x: 0, y: lineSegmentContact.y1 - lineSegmentContact.y0 };
                return Vectors.proj(velocity, contactAsVector);
            }
        }

        return null;
    }

    private static getCollision(a: Body, b: Body, dt: number): Collision | null {
        if (a.shape instanceof Circle) {
            if (b.shape instanceof Circle) return Collisions.getCircleVsCircleCollision(a.shape, b.shape, dt);
            if (b.shape instanceof Rect) return Collisions.getCircleVsRectCollision(a.shape, b.shape, dt);
        }

        if (a.shape instanceof Rect) {
            if (b.shape instanceof Circle) return Collisions.getRectVsCircleCollision(a.shape, b.shape, dt);
            if (b.shape instanceof Rect) return Collisions.getRectVsRectCollision(a.shape, b.shape, dt);
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

            const aAtTimeOfColliison = new Particle(a.x + dx * t, a.y + dy * t);
            aAtTimeOfColliison.setVelocity(a.velocity);

            // glance, but not a collision
            if (!isMovingTowards(aAtTimeOfColliison, b)) return earliest;

            if (earliest === null || earliest.timeOfCollision > t) {
                // point of contact with a point is always the point
                if (!radiusA) {
                    return {
                        timeOfCollision: t,
                        pointOfContact: aAtTimeOfColliison.pos,
                    };
                } else if (!radiusB) {
                    return {
                        timeOfCollision: t,
                        pointOfContact: b.pos,
                    };
                }

                // otherwise, calculate point of intersection
                const diffPosAtTimeOfCollision = Vectors.subtract(b, aAtTimeOfColliison);
                const vectorToPointOfContact = Vectors.resize(diffPosAtTimeOfCollision, radiusA);
                const pointOfContact = Vectors.add(aAtTimeOfColliison, vectorToPointOfContact);

                return {
                    timeOfCollision: t,
                    pointOfContact,
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

        const addSideCollision = (
            circle: Circle,
            side: LineSegment,
            getPointOfContact: (collision: PointCollision) => Vector,
        ): void => {
            const collision = Collisions.getPointVsLineCollision(circle, side, dt);

            if (collision) {
                sideCollisions.push({
                    timeOfCollision: collision.timeOfCollision,
                    pointOfContact: getPointOfContact(collision),
                });
            }
        };

        // extend the rectangle sides out by circle radius length so that we can simulate a point vs line collision
        const topSide = new HorzLineSegment({ x0, x1, y: y0 - radius });
        const bottomSide = new HorzLineSegment({ x0, x1, y: rect.y1 + radius });
        const rightSide = new VertLineSegment({ x: x1 + radius, y0, y1 });
        const leftSide = new VertLineSegment({ x: x0 - radius, y0, y1 });

        if (dy > 0) addSideCollision(circle, topSide, ({ pointOfContact: { x } }) => ({ x, y: rect.y0 }));
        if (dy < 0) addSideCollision(circle, bottomSide, ({ pointOfContact: { x } }) => ({ x, y: rect.y1 }));
        if (dx < 0) addSideCollision(circle, rightSide, ({ pointOfContact: { y } }) => ({ x: rect.x1, y }));
        if (dx > 0) addSideCollision(circle, leftSide, ({ pointOfContact: { y } }) => ({ x: rect.x0, y }));

        // consider circle collision into each rect corner
        const topLeftCorner = new Particle(x0, y0);
        const topRightCorner = new Particle(x1, y0);
        const bottomRightCorner = new Particle(x1, y1);
        const bottomLeftCorner = new Particle(x0, y1);

        const corners = [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner];

        const cornerCollisions = corners.reduce<Collision[]>((collisions, corner) => {
            if (isMovingTowards(circle, corner)) {
                const collision = Collisions.getCircleVsCircleCollision(circle, corner, dt);
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

        const addSideCollision = (
            point: Particle,
            side: LineSegment,
            getPointOfContact: (collision: PointCollision) => Vector,
        ): void => {
            const collision = Collisions.getPointVsLineCollision(point, side, dt);

            if (collision) {
                sideCollisions.push({
                    timeOfCollision: collision.timeOfCollision,
                    pointOfContact: getPointOfContact(collision),
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

        if (dy > 0) addSideCollision(point, bottomSide, ({ pointOfContact: { x } }) => ({ x, y: rect.y1 }));
        if (dy < 0) addSideCollision(point, topSide, ({ pointOfContact: { x } }) => ({ x, y: rect.y0 }));
        if (dx < 0) addSideCollision(point, leftSide, ({ pointOfContact: { y } }) => ({ x: rect.x0, y }));
        if (dx > 0) addSideCollision(point, rightSide, ({ pointOfContact: { y } }) => ({ x: rect.x1, y }));

        // consider rect corner collisions into the circle
        const topLeftCorner = new Particle(x0, y0);
        const topRightCorner = new Particle(x1, y0);
        const bottomRightCorner = new Particle(x1, y1);
        const bottomLeftCorner = new Particle(x0, y1);

        const corners = [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner];

        const cornerCollisions = corners.reduce<Collision[]>((collisions, corner) => {
            if (isMovingTowards(point, corner)) {
                corner.setVelocity(velocity);
                const collision = Collisions.getCircleVsCircleCollision(corner, circle, dt);
                if (collision) collisions.push(collision);
            }
            return collisions;
        }, []);

        return getEarliestCollision([...sideCollisions, ...cornerCollisions]);
    }

    // https://www.emanueleferonato.com/2021/10/21/understanding-physics-continuous-collision-detection-using-swept-aabb-method-and-minkowski-sum/
    private static getRectVsRectCollision(a: Rect, b: Rect, dt: number): Collision | null {
        // simulate a point vs line collision using a Minkowski Sum
        const rectBMinkowskiSum = new Rect({
            x: b.x,
            y: b.y,
            width: a.width + b.width,
            height: a.height + b.height,
        });

        const { x0, x1, y0, y1 } = rectBMinkowskiSum;

        const minkowskiTop = new HorzLineSegment({ x0, x1, y: y0 });
        const minkowskiBottom = new HorzLineSegment({ x0, x1, y: y1 });
        const minkowskiRight = new VertLineSegment({ x: x1, y0, y1 });
        const minkowskiLeft = new VertLineSegment({ x: x0, y0, y1 });

        const {
            velocity: { x: dx, y: dy },
        } = a;

        const collisions: LineSegmentCollision[] = [];

        if (dy > 0) {
            const collision = Collisions.getPointVsLineCollision(a, minkowskiTop, dt);

            if (collision) {
                const { timeOfCollision } = collision;

                const rectBTopSide = new HorzLineSegment({ x0: b.x0, x1: b.x1, y: b.y0 });

                const rectABottomSideAtTimeOfCollision = new HorzLineSegment({
                    x0: a.x0 + dx * timeOfCollision,
                    x1: a.x1 + dx * timeOfCollision,
                    y: rectBTopSide.y,
                });

                const lineSegmentContact = LineSegments.getOverlappingSegment(
                    rectBTopSide,
                    rectABottomSideAtTimeOfCollision,
                );

                // TODO: if collision resolution doesn't end up caring about lineSegmentContact then scrap all this
                if (!LineSegments.isPoint(lineSegmentContact)) {
                    collisions.push({
                        timeOfCollision,
                        lineSegmentContact,
                    });
                }
            }
        }

        if (dy < 0) {
            const collision = Collisions.getPointVsLineCollision(a, minkowskiBottom, dt);

            if (collision) {
                const { timeOfCollision } = collision;

                const rectBBottomSide = new HorzLineSegment({ x0: b.x0, x1: b.x1, y: b.y1 });

                const rectATopSideAtTimeOfCollision = new HorzLineSegment({
                    x0: a.x0 + dx * timeOfCollision,
                    x1: a.x1 + dx * timeOfCollision,
                    y: rectBBottomSide.y,
                });

                const lineSegmentContact = LineSegments.getOverlappingSegment(
                    rectBBottomSide,
                    rectATopSideAtTimeOfCollision,
                );

                if (!LineSegments.isPoint(lineSegmentContact)) {
                    collisions.push({
                        timeOfCollision,
                        lineSegmentContact,
                    });
                }
            }
        }

        if (dx < 0) {
            const collision = Collisions.getPointVsLineCollision(a, minkowskiRight, dt);

            if (collision) {
                const { timeOfCollision } = collision;

                const rectBRightSide = new VertLineSegment({ y0: b.y0, y1: b.y1, x: b.x1 });

                const rectALeftSideAtTimeOfCollision = new VertLineSegment({
                    y0: a.y0 + dy * timeOfCollision,
                    y1: a.y1 + dy * timeOfCollision,
                    x: rectBRightSide.x,
                });

                const lineSegmentContact = LineSegments.getOverlappingSegment(
                    rectBRightSide,
                    rectALeftSideAtTimeOfCollision,
                );

                if (!LineSegments.isPoint(lineSegmentContact)) {
                    collisions.push({
                        timeOfCollision,
                        lineSegmentContact,
                    });
                }
            }
        }

        if (dx > 0) {
            const collision = Collisions.getPointVsLineCollision(a, minkowskiLeft, dt);

            if (collision) {
                const { timeOfCollision } = collision;

                const rectBLeftSide = new VertLineSegment({ y0: b.y0, y1: b.y1, x: b.x0 });

                const rectARightSideAtTimeOfCollision = new VertLineSegment({
                    y0: a.y0 + dy * timeOfCollision,
                    y1: a.y1 + dy * timeOfCollision,
                    x: rectBLeftSide.x,
                });

                const lineSegmentContact = LineSegments.getOverlappingSegment(
                    rectBLeftSide,
                    rectARightSideAtTimeOfCollision,
                );

                if (!LineSegments.isPoint(lineSegmentContact)) {
                    collisions.push({
                        timeOfCollision,
                        lineSegmentContact,
                    });
                }
            }
        }

        return getEarliestCollision(collisions);
    }

    private static getPointVsLineCollision(point: Particle, line: LineSegment, dt: number): PointCollision | null {
        const {
            x: pointX,
            y: pointY,
            velocity: { x: dx, y: dy },
        } = point;

        if (line instanceof HorzLineSegment) {
            if (!dy) return null;

            const { x0, x1, y: lineY } = line;
            const t = (lineY - pointY) / dy;

            if (isCollisionInThisTimestep(t, dt)) {
                const pointXAtTimeOfCollision = pointX + dx * t;

                if (isInRange(x0, pointXAtTimeOfCollision, x1)) {
                    const pointOfContact = {
                        x: pointXAtTimeOfCollision,
                        y: lineY,
                    };

                    return {
                        timeOfCollision: t,
                        pointOfContact,
                    };
                }
            }
        }

        if (line instanceof VertLineSegment) {
            if (!dx) return null;

            const { x: lineX, y0, y1 } = line;
            const t = (lineX - pointX) / dx;

            if (isCollisionInThisTimestep(t, dt)) {
                const pointYAtTimeOfCollision = pointY + dy * t;

                if (isInRange(y0, pointYAtTimeOfCollision, y1)) {
                    const pointOfContact = {
                        x: lineX,
                        y: pointYAtTimeOfCollision,
                    };

                    return {
                        timeOfCollision: t,
                        pointOfContact,
                    };
                }
            }
        }

        return null;
    }
}
