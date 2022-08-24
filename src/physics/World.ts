import { Dimensions } from "@physics/types";

export class World {
    public width: number;
    public height: number;
    
    constructor(dimensions: Dimensions) {
        const { width, height } = dimensions;
        
        this.width = width;
        this.height = height;
    }
}
