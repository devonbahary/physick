import { Renderer } from '@renderer/Renderer';
import { World, WorldEvent } from '@physics/World';
import { Circle } from '@physics/shapes/Circle';
import { Body } from '@physics/Body';
import { Controls } from 'src/Controls';
import { Rect } from '@physics/shapes/Rect';

const MS_IN_SECOND = 1000;
const DESIRED_FRAMES_PER_SECOND = 60;

const player = new Body({ shape: new Circle({ radius: 20, x: 50, y: 50 }) });
// const player = new Body({ shape: new Rect({ x: 50, y: 50, width: 40, height: 40 }) });

const world = new World({ width: 400, height: 400 });
const renderer = new Renderer(world, player);
const controls = new Controls(player, world);

world.subscribe(WorldEvent.AddBody, (body) => renderer.addBodySprite(body));
world.subscribe(WorldEvent.RemoveBody, (body) => renderer.removeBodySprite(body));

world.addBody(player);

world.addBody(new Body({ shape: new Circle({ radius: 20, x: 60, y: 90 }) }));
const rectBody = new Body({ shape: new Rect({ width: 40, height: 40 }) });
rectBody.moveTo({ x: 180, y: 100 });
world.addBody(rectBody);

const update = (lastTimestamp = Date.now()): void => {
    const now = Date.now();

    const timestep = now - lastTimestamp;
    const dt = (DESIRED_FRAMES_PER_SECOND * timestep) / MS_IN_SECOND; // # of frames to advance (1 @60FPS)

    const modifiedDt = controls.isShiftPressed() ? dt * 2 : dt;

    world.update(modifiedDt);
    controls.update(modifiedDt);
    renderer.update();

    requestAnimationFrame(() => update(now));
};

requestAnimationFrame(update);
