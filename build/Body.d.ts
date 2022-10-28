import { Vector } from './Vectors';
import { Particle } from './shapes/Particle';
import { ChangeOfValue, PubSub, PubSubable } from './PubSub';
import { CollisionEvent } from './collisions/types';
import { Rect } from './shapes/rects/Rect';
import { Circle } from './shapes/circles/Circle';
export declare type BodyArgs = {
    id?: string;
    shape: Rect | Circle;
    mass?: number;
    restitution?: number;
    isSensor?: boolean;
};
export declare enum BodyEvent {
    Move = "Move",
    Collision = "Collision",
    MassChange = "MassChange",
    ShapeChange = "ShapeChange"
}
declare type BodyEventDataMap = {
    [BodyEvent.Move]: Body;
    [BodyEvent.Collision]: CollisionEvent;
    [BodyEvent.MassChange]: ChangeOfValue<number>;
    [BodyEvent.ShapeChange]: ChangeOfValue<Body['shape']>;
};
declare type Subscribe = PubSub<BodyEvent, BodyEventDataMap>['subscribe'];
declare type Publish = PubSub<BodyEvent, BodyEventDataMap>['publish'];
export declare class Body implements Particle, PubSubable<BodyEvent, BodyEventDataMap> {
    id: string;
    shape: Rect | Circle;
    mass: number;
    restitution: number;
    isSensor: boolean;
    subscribe: Subscribe;
    publish: Publish;
    constructor(args: BodyArgs);
    get pos(): Vector;
    get x(): number;
    get y(): number;
    get width(): number;
    get height(): number;
    get x0(): number;
    get x1(): number;
    get y0(): number;
    get y1(): number;
    get velocity(): Vector;
    get speed(): number;
    isMoving(): boolean;
    isFixed(): boolean;
    moveTo(pos: Vector): void;
    move(movement: Vector): void;
    setVelocity(vel: Vector): void;
    applyForce(force: Vector): void;
    setMass(number: number): void;
    setShape(shape: Circle | Rect): void;
}
export {};
