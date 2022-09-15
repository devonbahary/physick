import { v4 as uuid } from 'uuid';
import { Vector, Vectors } from '@physics/Vectors';
import { Particle } from '@physics/shapes/Particle';
import { Shape } from '@physics/shapes/types';
import { PubSub } from '@physics/PubSub';

type BodyArgs = {
    shape: Shape;
    mass?: number;
    restitution?: number;
};

export enum BodyEvent {
    Move = 'Move',
}

type BodyEventDataMap = {
    [BodyEvent.Move]: Body;
};

type Subscribe = PubSub<BodyEvent, BodyEventDataMap>['subscribe'];
type Publish = PubSub<BodyEvent, BodyEventDataMap>['publish'];

export class Body implements Particle {
    public id = uuid();
    public shape: Shape;
    public mass: number;
    public restitution: number;

    public subscribe: Subscribe;
    private publish: Publish;

    constructor(args: BodyArgs) {
        const { shape, mass = 1, restitution = 1 } = args;

        this.shape = shape;
        this.mass = mass;
        this.restitution = restitution;

        const pubSub = new PubSub<BodyEvent, BodyEventDataMap>(Object.values(BodyEvent));
        this.subscribe = (...args): ReturnType<Subscribe> => pubSub.subscribe(...args);
        this.publish = (...args): ReturnType<Publish> => pubSub.publish(...args);
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

    get x0(): number {
        return this.shape.x0;
    }

    get x1(): number {
        return this.shape.x1;
    }

    get y0(): number {
        return this.shape.y0;
    }
    get y1(): number {
        return this.shape.y1;
    }

    get velocity(): Vector {
        return this.shape.velocity;
    }

    public isMoving(): boolean {
        return Vectors.hasMagnitude(this.shape.velocity);
    }

    public isFixed(): boolean {
        return this.mass === Infinity;
    }

    public moveTo(pos: Vector): void {
        this.shape.moveTo(pos);
    }

    public move(dir: Vector): void {
        this.shape.move(dir);
        this.publish(BodyEvent.Move, this);
    }

    public setVelocity(vel: Vector): void {
        this.shape.velocity = vel;
    }

    public applyForce(force: Vector): void {
        const netForce = Vectors.divide(force, this.mass);
        this.shape.velocity = Vectors.add(this.shape.velocity, netForce);
    }
}
