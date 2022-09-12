import { Body } from '@physics/Body';
import { Circle } from '@physics/shapes/Circle';
import { Rect } from '@physics/shapes/Rect';
import { Dimensions } from '@physics/types';
import { World } from '@physics/World';
import { Renderer } from '@renderer/Renderer';
import { Controls } from 'src/Controls';

const WORLD_DIMENSIONS: Dimensions = {
    width: 400,
    height: 400,
};

type Game = {
    controls: Controls;
    renderer: Renderer;
    world: World;
};

export enum GameMode {
    Default,
    Random,
}

const rand = (min: number, max: number): number => min + Math.round(Math.random() * (max - min));

const seedRandom = (world: World): void => {
    const randomNumCircles = rand(1, 5);

    for (let i = 0; i < randomNumCircles; i++) {
        const radius = rand(5, 60);
        const pos = {
            x: rand(radius, WORLD_DIMENSIONS.width - radius),
            y: rand(radius, WORLD_DIMENSIONS.height - radius),
        };

        const randomCircle = new Circle({ radius, ...pos });
        const randomCircleBody = new Body({ shape: randomCircle });

        world.addBody(randomCircleBody);
    }

    const randomNumRects = rand(1, 5);

    for (let i = 0; i < randomNumRects; i++) {
        const width = rand(10, 120);
        const height = rand(10, 120);
        const pos = {
            x: rand(width / 2, WORLD_DIMENSIONS.width - width / 2),
            y: rand(height / 2, WORLD_DIMENSIONS.height - height / 2),
        };

        const randomRect = new Rect({ width, height, ...pos });
        const randomRectBody = new Body({ shape: randomRect });

        world.addBody(randomRectBody);
    }
};

const seedDefault = (world: World): void => {
    world.addBody(new Body({ shape: new Circle({ radius: 20, x: 60, y: 90 }) }));
    const rectBody = new Body({ shape: new Rect({ width: 40, height: 40 }) });
    rectBody.moveTo({ x: 180, y: 100 });
    world.addBody(rectBody);
};

export const initGame = (mode = GameMode.Default): Game => {
    const player = new Body({ shape: new Circle({ radius: 20, x: 50, y: 50 }) });
    // const player = new Body({ shape: new Rect({ x: 50, y: 50, width: 40, height: 40 }) });

    const world = new World(WORLD_DIMENSIONS);
    const renderer = new Renderer(world, player);
    const controls = new Controls(player, world);

    world.addBody(player);

    switch (mode) {
        case GameMode.Random:
            seedRandom(world);
            break;
        default:
            seedDefault(world);
            break;
    }

    return {
        controls,
        renderer,
        world,
    };
};
