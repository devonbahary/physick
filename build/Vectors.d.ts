export declare type Vector = {
    x: number;
    y: number;
};
export declare class Vectors {
    static magnitude(v: Vector): number;
    static hasMagnitude(v: Vector): boolean;
    static add(a: Vector, b: Vector): Vector;
    static subtract(a: Vector, b: Vector): Vector;
    static mult(v: Vector, scalar: number): Vector;
    static divide(v: Vector, scalar: number): Vector;
    static opposite(v: Vector): Vector;
    static normal(v: Vector): Vector;
    static normalized(v: Vector): Vector;
    static dot(a: Vector, b: Vector): number;
    static proj(of: Vector, onto: Vector): Vector;
    static resize(v: Vector, scalar: number): Vector;
    static isLarger(a: Vector, b: Vector): boolean;
    static isSameDirection(a: Vector, b: Vector): boolean;
    static isSame(a: Vector, b: Vector): boolean;
}
