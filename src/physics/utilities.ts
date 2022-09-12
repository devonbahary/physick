export const isInRange = (min: number, num: number, max: number): boolean => {
    return num >= min && num <= max;
};

export const quadratic = (a: number, b: number, c: number): number[] => {
    const roots = [(-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a), (-b - Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a)];

    return roots.filter((r) => !isNaN(r));
};

export const roundForFloatingPoint = (num: number): number => Math.round(num * 1000) / 1000;
