import { Body } from './Body';
import { Vector } from './Vectors';
import { World } from './World';
declare type CharacterOptions = {
    framesToTopSpeed: number;
    topSpeed: number;
};
export declare class Character {
    body: Body;
    private momentum;
    private options;
    constructor(body: Body, options?: Partial<CharacterOptions>);
    get topSpeed(): number;
    get framesToTopSpeed(): number;
    get acceleration(): number;
    update(dt: number): void;
    move(world: World, direction: Vector, dt: number): void;
    private redirectAroundCollisionBody;
    private getAccelerationWithMomentum;
    private getMomentum;
    private updateMomentum;
    private resetMomentum;
    private headingHasUpdated;
    private headingHasReversed;
}
export {};
