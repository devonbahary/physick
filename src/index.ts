import { GameMode, initGame } from 'src/Game';

const MS_IN_SECOND = 1000;
const DESIRED_FRAMES_PER_SECOND = 60;

const { controls, renderer, world } = initGame(GameMode.Chaos);

console.log(world);

const gameLoop = (lastTimestamp = Date.now()): void => {
    const now = Date.now();

    const timestep = now - lastTimestamp;
    const dt = (DESIRED_FRAMES_PER_SECOND * timestep) / MS_IN_SECOND; // # of frames to advance (1 @60FPS)

    const modifiedDt = controls.isShiftPressed() ? dt * 2 : dt;

    controls.update(modifiedDt);
    world.update(modifiedDt);
    renderer.update();

    requestAnimationFrame(() => gameLoop(now));
};

requestAnimationFrame(gameLoop);
