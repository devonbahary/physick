import { GameMode, initGame } from '@game/modes';
import { World } from '@physics/World';
import { Renderer } from '@renderer/Renderer';
import { Controls, Key } from '@game/Controls';

const MS_IN_SECOND = 1000;
const DESIRED_FRAMES_PER_SECOND = 60;

export class Game {
    private controls: Controls;
    private renderer: Renderer;
    private world: World;
    private isPaused = false;

    constructor() {
        const { controls, renderer, world } = initGame(GameMode.Chaos);

        this.controls = controls;
        this.renderer = renderer;
        this.world = world;

        this.controls.subscribeToOnKeyDown(Key.Space, () => {
            this.isPaused = !this.isPaused;
        });
    }

    loop(lastTimestamp = Date.now()): void {
        const now = Date.now();

        const dt = this.getTimeDelta(now, lastTimestamp);

        if (!this.isPaused) {
            this.controls.update(dt);
            this.world.update(dt);
        }

        this.renderer.update();

        requestAnimationFrame(() => this.loop(now));
    }

    private getTimeDelta(now: number, lastTimestamp: number): number {
        const timestep = now - lastTimestamp;
        const dt = (DESIRED_FRAMES_PER_SECOND * timestep) / MS_IN_SECOND; // # of frames to advance (1 @60FPS)

        return this.controls.isPressed(Key.Shift) ? dt * 2 : dt;
    }
}
