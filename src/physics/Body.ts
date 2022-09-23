import { v4 as uuid } from 'uuid';
import { Vector, Vectors } from '@physics/Vectors';
import { Particle } from '@physics/shapes/Particle';
import { PubSub, PubSubable } from '@physics/PubSub';
import { CollisionEvent } from '@physics/collisions/types';
import { Rect } from '@physics/shapes/rects/Rect';
import { Circle } from '@physics/shapes/circles/Circle';

export type BodyArgs = {
    id?: string;
    shape: Rect | Circle;
    mass?: number;
    restitution?: number;
    isSensor?: boolean; // don't collide with other Bodies, but still publish CollisionEvents
};

export enum BodyEvent {
    Move = 'Move',
    Collision = 'Collision',
}

type BodyEventDataMap = {
    [BodyEvent.Move]: Body;
    [BodyEvent.Collision]: CollisionEvent;
};

type Subscribe = PubSub<BodyEvent, BodyEventDataMap>['subscribe'];
type Publish = PubSub<BodyEvent, BodyEventDataMap>['publish'];

export class Body implements Particle, PubSubable<BodyEvent, BodyEventDataMap> {
    public id: string;
    public shape: Rect | Circle;
    public mass: number;
    public restitution: number;
    public isSensor: boolean;

    public subscribe: Subscribe;
    public publish: Publish;

    constructor(args: BodyArgs) {
        const { id = uuid(), shape, mass = 1, restitution = 1, isSensor = false } = args;

        this.id = id;
        this.shape = shape;
        this.mass = mass;
        this.restitution = restitution;
        this.isSensor = isSensor;

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

    get speed(): number {
        return Vectors.magnitude(this.velocity);
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

    public move(movement: Vector): void {
        if (this.isSensor) return;
        this.shape.move(movement);
        this.publish(BodyEvent.Move, this);
    }

    public setVelocity(vel: Vector): void {
        this.shape.velocity = vel;
    }

    public applyForce(force: Vector): void {
        if (this.isSensor) return;
        const netForce = Vectors.divide(force, this.mass);
        this.shape.velocity = Vectors.add(this.shape.velocity, netForce);
    }
}
