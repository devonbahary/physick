import { Renderer } from '@renderer/Renderer';
import { World } from '@physics/World';
import { Circle } from '@physics/Circle';
import { Body } from '@physics/Body';
import { Controls } from 'src/Controls';

const player = new Body(new Circle(20));

const world = new World({ width: 400, height: 400 });

const renderer = new Renderer(world, player);

const controls = new Controls(player);

const update = (): void => {
    controls.update();
    renderer.update();

    requestAnimationFrame(update);
};

requestAnimationFrame(update);
