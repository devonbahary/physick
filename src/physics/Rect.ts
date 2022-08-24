import { Point } from "@physics/Point";
import { Spatial } from "@physics/types";

export class Rect extends Point implements Spatial {
    constructor(
        public width: number, 
        public height: number,
    ) {
        super();
    }
}