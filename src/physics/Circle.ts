import { Point } from '@physics/Point';
import { Spatial } from '@physics/types';

export class Circle extends Point implements Spatial {
    constructor(public radius: number) {
        super();
    }

    get width(): number {
        return this.radius * 2;
    }

    get height(): number {
        return this.radius * 2;
    }
}
