import { Dimensions } from '@physics/types';
import { Body } from '@physics/Body';

type OnBodyChange = (body: Body) => void;

export enum WorldEvent {
    AddBody,
    RemoveBody,
}

export class World {
    public width: number;
    public height: number;
    public bodies: Body[] = [];
    private addBodyHandlers: OnBodyChange[] = [];
    private removeBodyHandlers: OnBodyChange[] = [];

    constructor(dimensions: Dimensions) {
        const { width, height } = dimensions;

        this.width = width;
        this.height = height;
    }

    public subscribe(event: WorldEvent, callback: OnBodyChange): void {
        switch (event) {
            case WorldEvent.AddBody:
                this.addBodyHandlers.push(callback);
                break;
            case WorldEvent.RemoveBody:
                this.removeBodyHandlers.push(callback);
                break;
        }
    }

    public addBody(body: Body): void {
        this.bodies.push(body);

        for (const addBodyHandler of this.addBodyHandlers) {
            addBodyHandler(body);
        }
    }

    public removeBody(body: Body): void {
        this.bodies = this.bodies.filter((b) => b.id !== body.id);

        for (const removeBodyHandler of this.removeBodyHandlers) {
            removeBodyHandler(body);
        }
    }
}
