import { RectArgs } from './shapes/rects/Rect';
import { Vector } from './Vectors';
import { CircleArgs } from './shapes/circles/Circle';
import { Body, BodyArgs } from './Body';
import { World } from './World';
export declare type SerializedWorld = {
    bodies: SerializedBody[];
};
declare type SerializedBody = Required<Omit<BodyArgs, 'shape'>> & {
    shape: SerializedShape;
};
declare type SerializedShape = SerializedCircle | SerializedRect;
declare type SerializedRect = BaseSerializedShape & Required<RectArgs>;
declare type SerializedCircle = BaseSerializedShape & Required<CircleArgs>;
declare type BaseSerializedShape = {
    velocity: Vector;
};
export declare class Serializer {
    static getSerializedWorld(world: World): SerializedWorld;
    static fromSerializedBody(serialized: SerializedBody): Body;
    private static fromSerializedCircle;
    private static fromSerializedRect;
    private static getSerializedBody;
    private static getSerializedShape;
    private static getSerializedCircle;
    private static getSerializedRect;
    private static isSerializedCircle;
    private static isSerializedRect;
}
export {};
