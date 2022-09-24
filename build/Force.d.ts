import { World } from './World';
import { BoundingCircle } from './shapes/circles/BoundingCircle';
export declare type Force = ConstantForce | IntervalForce;
declare type BaseForceArgs = {
    boundingCircle: BoundingCircle;
    magnitude: number;
    expiration?: Partial<Expiration>;
};
declare type Expiration = {
    duration: number;
    maxApplications: number;
};
declare type Expirable = Expiration & {
    applications: number;
    age: number;
};
declare abstract class BaseForce {
    id: string;
    private boundingCircle;
    private magnitude;
    protected expirable: Expirable;
    constructor(args: BaseForceArgs);
    protected apply(world: World): void;
    shouldRemove(): boolean;
    abstract update(world: World, dt: number): void;
    protected abstract hasExceededDuration(): boolean;
    private getDissipationFactor;
}
export declare class ConstantForce extends BaseForce {
    update(world: World, dt: number): void;
    protected hasExceededDuration(): boolean;
}
declare type IntervalForceArgs = BaseForceArgs & {
    interval: number;
};
export declare class IntervalForce extends BaseForce {
    private interval;
    private lastIntervalProcessed;
    constructor(args: IntervalForceArgs);
    update(world: World, dt: number): void;
    protected apply(world: World): void;
    protected hasExceededDuration(): boolean;
}
export {};
