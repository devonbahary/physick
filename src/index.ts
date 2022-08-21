import { Renderer } from './renderer/Renderer';
import { World } from './physics/World';
import { Circle } from './physics/Circle';
import { Controls } from './Controls';

const player = new Circle(20);

const world = new World(400, 400);

const renderer = new Renderer(world, player);

const controls = new Controls(player);

const update = (): void => {
    controls.update();
    renderer.update();

    requestAnimationFrame(update);
};

requestAnimationFrame(update);
