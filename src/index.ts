import { Renderer } from '@renderer/Renderer';
import { World, WorldEvent } from '@physics/World';
import { Circle } from '@physics/shapes/Circle';
import { Body } from '@physics/Body';
import { Controls } from 'src/Controls';
import { Rect } from '@physics/shapes/Rect';

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

// TODO: timestep
const update = (): void => {
    world.update();
    controls.update();
    renderer.update();

    requestAnimationFrame(() => update());
};

requestAnimationFrame(update);
