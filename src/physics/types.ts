import { Circle } from "@physics/Circle";
import { Rect } from "@physics/Rect";

export type Dimensions = {
    width: number;
    height: number;
}

export type Spatial = Dimensions & {
    x: number;
    y: number;
}

export type Shape = Rect | Circle;

export type Vector = {
    x: number;
    y: number;
};
