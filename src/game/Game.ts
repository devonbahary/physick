import { GameMode, initGame } from '@game/modes';
import { World } from '@physics/World';
import { Renderer } from '@renderer/Renderer';
import { Controls, ControlsEvent, Key } from '@game/Controls';
import { Character } from '@physics/Character';
import { framesInTimeDelta } from '@physics/utilities';
import { WorldStateMemory } from '@game/WorldStateMemory';

export class Game {
    private controls: Controls;
    private renderer: Renderer;
    private world: World;
    private isPaused = false;
    private characters: Character[] = [];
    private worldStateMemory = new WorldStateMemory();

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

            if (key === Key.Left || key === Key.Right) {
                this.onLeftOrRightInput(key);
            }
        });
    }

    loop(lastTimestamp = Date.now()): void {
        const now = Date.now();
        const dt = now - lastTimestamp;
        if (!this.isPaused) {
            const simulatedDt = this.controls.isPressed(Key.Shift) ? dt * 2 : dt;
            this.timestep(simulatedDt);
        }

        requestAnimationFrame(() => this.loop(now));
    }

    private timestep(dt: number): void {
        const frames = framesInTimeDelta(dt);

        this.controls.update(frames);
        this.updateCharacters(frames);
        this.worldStateMemory.update(dt, this.world); // serialize bodies before velocity is resolved to capture contributing forces
        this.world.update(dt);

        this.renderer.update();
    }

    private updateCharacters(frames: number): void {
        for (const character of this.characters) {
            character.update(frames);
        }
    }

    private onLeftOrRightInput(key: Key.Left | Key.Right): void {
        if (!this.isPaused) return;

        if (key === Key.Left) {
            this.worldStateMemory.goBackward();
            const snapshot = this.worldStateMemory.getSnapshot();
            if (snapshot) {
                this.world.loadSerialized(snapshot.serialized);
                this.renderer.update();
            }
        }

        if (key === Key.Right) {
            this.worldStateMemory.goForward();
            const snapshot = this.worldStateMemory.getSnapshot();
            if (snapshot) {
                this.world.loadSerialized(snapshot.serialized);
                this.renderer.update();
            } else {
                const fakeDt = 16.7; // 60FPS in ms
                this.timestep(fakeDt);
            }
        }
    }
}
