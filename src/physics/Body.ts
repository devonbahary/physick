import { v4 as uuid } from 'uuid';
import { Shape, Vector } from '@physics/types';
import { Vectors } from '@physics/Vectors';

type BodyOptions = {
    shape: Shape;
    mass?: number;
};

export class Body {
    public id = uuid();
    public shape: Shape;
    public mass: number;

    constructor(options: BodyOptions) {
        const { shape, mass = 1 } = options;

        this.shape = shape;
        this.mass = mass;
    }

    get pos(): Vector {
        return this.shape.pos;
    }

    get x(): number {
        return this.shape.x;
    }

    get y(): number {
        return this.shape.y;
    }

    get width(): number {
        return this.shape.width;
    }

    get height(): number {
        return this.shape.height;
    }

    get velocity(): Vector {
        return this.shape.velocity;
    }

    public isMoving(): boolean {
        return Vectors.hasMagnitude(this.shape.velocity);
    }

    public move(dir: Vector): void {
        this.shape.move(dir);
    }

    public setVelocity(vel: Vector): void {
        this.shape.velocity = vel;
    }

    public applyForce(force: Vector): void {
        const netForce = Vectors.divide(force, this.mass);
        this.shape.velocity = Vectors.add(this.shape.velocity, netForce);
    }
}
