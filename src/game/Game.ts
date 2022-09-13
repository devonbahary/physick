import { GameMode, initGame } from '@game/modes';
import { World } from '@physics/World';
import { Renderer } from '@renderer/Renderer';
import { Controls } from '@game/Controls';

const MS_IN_SECOND = 1000;
const DESIRED_FRAMES_PER_SECOND = 60;

export class Game {
    private controls: Controls;
    private renderer: Renderer;
    private world: World;

    constructor() {
        const { controls, renderer, world } = initGame(GameMode.Chaos);

        this.controls = controls;
        this.renderer = renderer;
        this.world = world;
    }

    loop(lastTimestamp = Date.now()): void {
        const now = Date.now();

        const timestep = now - lastTimestamp;
        const dt = (DESIRED_FRAMES_PER_SECOND * timestep) / MS_IN_SECOND; // # of frames to advance (1 @60FPS)

        const modifiedDt = this.controls.isShiftPressed() ? dt * 2 : dt;

        this.controls.update(modifiedDt);
        this.world.update(modifiedDt);
        this.renderer.update();

        requestAnimationFrame(() => this.loop(now));
    }
}
