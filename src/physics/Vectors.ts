import { Vector } from '@physics/types';

export class Vectors {
    static add(a: Vector, b: Vector): Vector {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
        };
    }

    static mult(v: Vector, scalar: number): Vector {
        return {
            x: v.x * scalar,
            y: v.y * scalar,
        };
    }

    static divide(v: Vector, scalar: number): Vector {
        return {
            x: v.x / scalar,
            y: v.y / scalar,
        };
    }

    static opposite(v: Vector): Vector {
        return {
            x: -v.x,
            y: -v.y,
        };
    }

    static normalized(v: Vector): Vector {
        const mag = Vectors.magnitude(v);
        return Vectors.divide(v, mag);
    }

    static resize(v: Vector, scalar: number): Vector {
        if (!this.hasMagnitude(v)) {
            return v;
        }

        const normalized = Vectors.normalized(v);
        return Vectors.mult(normalized, scalar);
    }

    static magnitude(v: Vector): number {
        return Math.sqrt(v.x ** 2 + v.y ** 2);
    }

    static hasMagnitude(v: Vector): boolean {
        // less expensive than sqrt() === 0
        return Boolean(v.x || v.y);
    }
}
