import { Dimensions } from '@physics/types';
import { Body } from '@physics/Body';
import { Vectors } from '@physics/Vectors';

type OnBodyChange = (body: Body) => void;

export enum WorldEvent {
    AddBody,
    RemoveBody,
}

const FRICTIONAL_FORCE = 0.1;

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

    public update(): void {
        for (const body of this.bodies) {
            if (body.isMoving()) {
                body.move(body.velocity);
                this.applyFriction(body);
            }
        }
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

    private applyFriction(body: Body): void {
        const opposingVector = Vectors.opposite(body.velocity);
        const frictionalForce = Vectors.resize(opposingVector, FRICTIONAL_FORCE);

        body.applyForce(Vectors.mult(frictionalForce, body.mass));

        if (Vectors.magnitude(body.velocity) < 0.1) {
            body.setVelocity({ x: 0, y: 0 });
        }
    }
}
