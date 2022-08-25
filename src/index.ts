import { Renderer } from '@renderer/Renderer';
import { World, WorldEvent } from '@physics/World';
import { Circle } from '@physics/Circle';
import { Body } from '@physics/Body';
import { Controls } from 'src/Controls';

const world = new World({ width: 400, height: 400 });
const renderer = new Renderer(world);
const controls = new Controls();

world.subscribe(WorldEvent.AddBody, (body) => renderer.addBodySprite(body));
world.subscribe(WorldEvent.RemoveBody, (body) => renderer.removeBodySprite(body));

const player = new Body({ shape: new Circle(20) });

world.addBody(player);
renderer.assignPlayerSprite(player);
controls.setPlayer(player);

// TODO: timestep
const update = (): void => {
    world.update();
    controls.update();
    renderer.update();

    requestAnimationFrame(() => update());
};

requestAnimationFrame(update);
