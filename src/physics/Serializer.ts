import { Rect, RectArgs } from '@physics/shapes/rects/Rect';
import { Vector } from '@physics/Vectors';
import { Circle, CircleArgs } from '@physics/shapes/circles/Circle';
import { Body, BodyArgs } from '@physics/Body';
import { World } from '@physics/World';

export type SerializedWorld = {
    bodies: SerializedBody[];
};

// TODO: can we serialize subscribers? do we need to?
type SerializedBody = Required<Omit<BodyArgs, 'shape'>> & {
    shape: SerializedShape;
};

type SerializedShape = SerializedCircle | SerializedRect;

type SerializedRect = BaseSerializedShape & Required<RectArgs>;

type SerializedCircle = BaseSerializedShape & Required<CircleArgs>;

type BaseSerializedShape = {
    velocity: Vector;
};

export class Serializer {
    static getSerializedWorld(world: World): SerializedWorld {
        return {
            bodies: world.bodies.map((body) => Serializer.getSerializedBody(body)),
        };
    }

    static fromSerializedBody(serialized: SerializedBody): Body {
        const { shape, ...rest } = serialized;

        if (Serializer.isSerializedCircle(shape)) {
            const circle = Serializer.fromSerializedCircle(shape);
            return new Body({ ...rest, shape: circle });
        }

        if (Serializer.isSerializedRect(shape)) {
            const rect = Serializer.fromSerializedRect(shape);
            return new Body({ ...rest, shape: rect });
        }

        throw new Error(`could not create Body from serialized data: ${JSON.stringify(serialized)}`);
    }

    private static fromSerializedCircle(serialized: SerializedCircle): Circle {
        const circle = new Circle(serialized);
        circle.setVelocity(serialized.velocity);
        return circle;
    }

    private static fromSerializedRect(serialized: SerializedRect): Rect {
        const rect = new Rect(serialized);
        rect.setVelocity(serialized.velocity);
        return rect;
    }

    private static getSerializedBody(body: Body): SerializedBody {
        const { id, mass, restitution, isSensor } = body;

        return {
            id,
            shape: Serializer.getSerializedShape(body.shape),
            mass,
            restitution,
            isSensor,
        };
    }

    private static getSerializedShape(shape: Body['shape']): SerializedShape {
        if (shape instanceof Circle) {
            return Serializer.getSerializedCircle(shape);
        }

        if (shape instanceof Rect) {
            return Serializer.getSerializedRect(shape);
        }

        throw new Error(`could not serialize shape: ${JSON.stringify(shape)}`);
    }

    private static getSerializedCircle(circle: Circle): SerializedCircle {
        const { x, y, radius, velocity } = circle;
        return {
            x,
            y,
            radius,
            velocity,
        };
    }

    private static getSerializedRect(rect: Rect): SerializedRect {
        const { x, y, width, height, velocity } = rect;
        return {
            x,
            y,
            width,
            height,
            velocity,
        };
    }

    private static isSerializedCircle(shape: SerializedShape): shape is SerializedCircle {
        for (const prop of ['x', 'y', 'radius', 'velocity']) {
            if (!(prop in shape)) return false;
        }
        return true;
    }

    private static isSerializedRect(shape: SerializedShape): shape is SerializedRect {
        for (const prop of ['x', 'y', 'width', 'height', 'velocity']) {
            if (!(prop in shape)) return false;
        }
        return true;
    }
}
