import { GameMode, initGame } from '@game/modes';
import { World } from '@physics/World';
import { Renderer } from '@renderer/Renderer';
import { Controls, ControlsEvent, Key } from '@game/Controls';

export class Game {
    private controls: Controls;
    private renderer: Renderer;
    private world: World;
    private isPaused = false;

    constructor() {
        const { controls, renderer, world } = initGame(GameMode.Default);

        this.controls = controls;
        this.renderer = renderer;
        this.world = world;

        this.controls.subscribe(ControlsEvent.OnKeyDown, (key) => {
            if (key === Key.Space) {
                this.isPaused = !this.isPaused;
            }
        });
    }

    loop(lastTimestamp = Date.now()): void {
        const now = Date.now();

        const dt = now - lastTimestamp;

        if (!this.isPaused) {
            const simulatedDt = this.controls.isPressed(Key.Shift) ? dt * 2 : dt;
            this.controls.update(simulatedDt);
            this.world.update(simulatedDt);
        }

        this.renderer.update();

        requestAnimationFrame(() => this.loop(now));
    }
}
