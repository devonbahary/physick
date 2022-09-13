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
    Chaos,
}

const randFloat = (min: number, max: number): number => min + Math.random() * (max - min);
const randInt = (min: number, max: number): number => min + Math.round(Math.random() * (max - min));

const generateRandomCircles = (): Body[] => {
    const bodies: Body[] = [];

    const randomNumCircles = randInt(1, 5);

    for (let i = 0; i < randomNumCircles; i++) {
        const radius = randInt(5, 60);
        const pos = {
            x: randInt(radius, WORLD_DIMENSIONS.width - radius),
            y: randInt(radius, WORLD_DIMENSIONS.height - radius),
        };

        const randomCircle = new Circle({ radius, ...pos });
        const randomCircleBody = new Body({ shape: randomCircle });

        bodies.push(randomCircleBody);
    }

    return bodies;
};

const generateRandomRects = (): Body[] => {
    const bodies: Body[] = [];

    const randomNumRects = randInt(1, 5);

    for (let i = 0; i < randomNumRects; i++) {
        const width = randInt(10, 120);
        const height = randInt(10, 120);
        const pos = {
            x: randInt(width / 2, WORLD_DIMENSIONS.width - width / 2),
            y: randInt(height / 2, WORLD_DIMENSIONS.height - height / 2),
        };

        const randomRect = new Rect({ width, height, ...pos });
        const randomRectBody = new Body({ shape: randomRect });

        bodies.push(randomRectBody);
    }

    return bodies;
};

const seedRandom = (player: Body): [World, Renderer] => {
    const world = new World(WORLD_DIMENSIONS);
    const renderer = new Renderer(world, player);

    const circleBodies = generateRandomCircles();
    const rectBodies = generateRandomRects();

    for (const body of [...circleBodies, ...rectBodies]) {
        world.addBody(body);
    }

    return [world, renderer];
};

const seedChaos = (player: Body): [World, Renderer] => {
    const world = new World({
        ...WORLD_DIMENSIONS,
        options: {
            frictionalForce: 0,
        },
    });
    const renderer = new Renderer(world, player);

    const circleBodies = generateRandomCircles();
    const rectBodies = generateRandomRects();

    for (const body of [...circleBodies, ...rectBodies]) {
        world.addBody(body);
        body.setVelocity({
            x: randFloat(0, 0.05),
            y: randFloat(0, 0.05),
        });
    }

    return [world, renderer];
};

const seedDefault = (player: Body): [World, Renderer] => {
    const world = new World(WORLD_DIMENSIONS);
    const renderer = new Renderer(world, player);

    world.addBody(
        new Body({
            shape: new Circle({ radius: 20, x: 60, y: 90 }),
            mass: Infinity,
        }),
    );
    const rectBody = new Body({
        shape: new Rect({ width: 40, height: 40 }),
        mass: Infinity,
    });
    rectBody.moveTo({ x: 180, y: 100 });
    world.addBody(rectBody);

    return [world, renderer];
};

export const initGame = (mode = GameMode.Default): Game => {
    const player = new Body({ shape: new Circle({ radius: 20, x: 50, y: 50 }) });
    // const player = new Body({ shape: new Rect({ x: 50, y: 50, width: 40, height: 40 }) });

    let world: World;
    let renderer: Renderer;
    switch (mode) {
        case GameMode.Random:
            [world, renderer] = seedRandom(player);
            break;
        case GameMode.Chaos:
            [world, renderer] = seedChaos(player);
            break;
        default:
            [world, renderer] = seedDefault(player);
            break;
    }

    world.addBody(player);

    const controls = new Controls(player, world);

    return {
        controls,
        renderer,
        world,
    };
};
