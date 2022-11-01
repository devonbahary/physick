export type Vector = {
    x: number;
    y: number;
};

export class Vectors {
    static magnitude(v: Vector): number {
        return Math.sqrt(v.x ** 2 + v.y ** 2);
    }

    static hasMagnitude(v: Vector): boolean {
        // less expensive than sqrt() === 0
        return Boolean(v.x || v.y);
    }

    static add(a: Vector, b: Vector): Vector {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
        };
    }

    static subtract(a: Vector, b: Vector): Vector {
        return {
            x: a.x - b.x,
            y: a.y - b.y,
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
        return Vectors.mult(v, -1);
    }

    static normal(v: Vector): Vector {
        return { x: -v.y, y: v.x }; // either <-y, x> or <y, -x>
    }

    static normalized(v: Vector): Vector {
        const mag = Vectors.magnitude(v);
        if (!mag) return v;
        return Vectors.divide(v, mag);
    }

    static dot(a: Vector, b: Vector): number {
        return a.x * b.x + a.y * b.y;
    }

    static proj(of: Vector, onto: Vector): Vector {
        return Vectors.mult(onto, Vectors.dot(of, onto) / Vectors.dot(onto, onto));
    }

    static resize(v: Vector, scalar: number): Vector {
        const mag = Vectors.magnitude(v);
        if (!mag) return v;

        const ratio = scalar / mag;

        return {
            x: v.x * ratio,
            y: v.y * ratio,
        };
    }

    static isLarger(a: Vector, b: Vector): boolean {
        // compare magnitudes without expensive sqrt()
        return a.x ** 2 + a.y ** 2 > b.x ** 2 + b.y ** 2;
    }

    static isSameDirection(a: Vector, b: Vector): boolean {
        return Vectors.dot(a, b) > 0;
    }

    static isSame(a: Vector, b: Vector): boolean {
        return a.x === b.x && a.y === b.y;
    }
}
