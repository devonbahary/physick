import { GameMode, initGame } from '@game/modes';
import { World } from '@physics/World';
import { Renderer } from '@renderer/Renderer';
import { Controls, ControlsEvent, Key } from '@game/Controls';
import { Character } from '@physics/Character';
import { framesInTimeDelta } from '@physics/utilities';

export class Game {
    private controls: Controls;
    private renderer: Renderer;
    private world: World;
    private isPaused = false;
    private characters: Character[] = [];

    constructor() {
        const { controls, player, renderer, world } = initGame(GameMode.Default);

        this.controls = controls;
        this.renderer = renderer;
        this.world = world;
        this.characters.push(player);

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
            const frames = framesInTimeDelta(simulatedDt);

            this.controls.update(frames);
            this.updateCharacters(frames);
            this.world.update(simulatedDt);
        }

        this.renderer.update();

        requestAnimationFrame(() => this.loop(now));
    }

    private updateCharacters(frames: number): void {
        for (const character of this.characters) {
            character.update(frames);
        }
    }
}
