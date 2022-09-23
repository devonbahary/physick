import { Body } from '@physics/Body';
import { Character } from '@physics/Character';
import { BoundingCircle } from '@physics/shapes/circles/BoundingCircle';
import { Circle } from '@physics/shapes/circles/Circle';
import { Rect } from '@physics/shapes/rects/Rect';
import { Dimensions, Shape } from '@physics/shapes/types';
import { World } from '@physics/World';
import { Renderer } from '@renderer/Renderer';
import { Controls } from 'src/game/Controls';

const WORLD_DIMENSIONS: Dimensions = {
    width: 400,
    height: 400,
};

type Game = {
    controls: Controls;
    player: Character;
    renderer: Renderer;
    world: World;
};

export enum GameMode {
    Default,
    Random,
    Chaos,
}

const randBool = (): boolean => Boolean(Math.round(Math.random()));
const randFloat = (min: number, max: number): number => min + Math.random() * (max - min);
const randInt = (min: number, max: number): number => min + Math.round(Math.random() * (max - min));

const getProportionateMass = (shape: Shape): number => {
    const { width, height } = shape;
    const standardRatio = (40 * 40) / 1;
    return (width * height) / standardRatio;
};

const generateRandomCircles = (world: World, min = 1, max = 5): Body[] => {
    const bodies: Body[] = [];

    const randomNumCircles = randInt(min, max);

    for (let i = 0; i < randomNumCircles; i++) {
        const radius = randInt(5, 60);
        const pos = {
            x: randInt(radius, world.width - radius),
            y: randInt(radius, world.height - radius),
        };

        const randomCircle = new Circle({ radius, ...pos });
        const randomCircleBody = new Body({
            shape: randomCircle,
            mass: getProportionateMass(randomCircle),
        });

        if (randBool()) randomCircleBody.mass = Infinity;

        bodies.push(randomCircleBody);
    }

    return bodies;
};

const generateRandomRects = (world: World, min = 1, max = 5): Body[] => {
    const bodies: Body[] = [];

    const randomNumRects = randInt(min, max);

    for (let i = 0; i < randomNumRects; i++) {
        const width = randInt(10, 120);
        const height = randInt(10, 120);
        const pos = {
            x: randInt(width / 2, world.width - width / 2),
            y: randInt(height / 2, world.height - height / 2),
        };

        const randomRect = new Rect({ width, height, ...pos });
        const randomRectBody = new Body({
            shape: randomRect,
            mass: getProportionateMass(randomRect),
        });

        if (randBool()) randomRectBody.mass = Infinity;

        bodies.push(randomRectBody);
    }

    return bodies;
};

const seedRandom = (playerBody: Body): [World, Renderer] => {
    const world = new World(WORLD_DIMENSIONS);
    const renderer = new Renderer(world, playerBody);

    const circleBodies = generateRandomCircles(world);
    const rectBodies = generateRandomRects(world);

    for (const body of [...circleBodies, ...rectBodies]) {
        world.addBody(body);
    }

    return [world, renderer];
};

const seedChaos = (playerBody: Body): [World, Renderer] => {
    const world = new World({
        ...WORLD_DIMENSIONS,
        options: {
            frictionalForce: 0,
        },
    });
    const renderer = new Renderer(world, playerBody);

    const circleBodies = generateRandomCircles(world, 25, 50);
    const rectBodies = generateRandomRects(world, 25, 50);

    for (const body of [...circleBodies, ...rectBodies]) {
        world.addBody(body);
        if (!body.isFixed()) {
            body.setVelocity({
                x: randFloat(0, 2),
                y: randFloat(0, 2),
            });
        }
    }

    return [world, renderer];
};

const seedDefault = (playerBody: Body): [World, Renderer] => {
    const world = new World(WORLD_DIMENSIONS);
    const renderer = new Renderer(world, playerBody);

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
    const player = new Character(
        new Body({
            shape: new Circle({
                x: 50,
                y: 50,
                radius: 20,
            }),
        }),
    );

    let world: World;
    let renderer: Renderer;
    switch (mode) {
        case GameMode.Random:
            [world, renderer] = seedRandom(player.body);
            break;
        case GameMode.Chaos:
            [world, renderer] = seedChaos(player.body);
            break;
        default:
            [world, renderer] = seedDefault(player.body);
            break;
    }

    world.addBody(player.body);

    const controls = new Controls(player, world, renderer);

    return {
        controls,
        player,
        renderer,
        world,
    };
};
