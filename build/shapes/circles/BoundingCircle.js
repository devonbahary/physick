"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundingCircle = void 0;
var BoundingCircle = /** @class */ (function () {
    function BoundingCircle(args) {
        var x = args.x, y = args.y, radius = args.radius;
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    Object.defineProperty(BoundingCircle.prototype, "x0", {
        get: function () {
            return this.x - this.radius;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoundingCircle.prototype, "x1", {
        get: function () {
            return this.x + this.radius;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoundingCircle.prototype, "y0", {
        get: function () {
            return this.y - this.radius;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoundingCircle.prototype, "y1", {
        get: function () {
            return this.y + this.radius;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoundingCircle.prototype, "width", {
        get: function () {
            return this.radius * 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoundingCircle.prototype, "height", {
        get: function () {
            return this.radius * 2;
        },
        enumerable: false,
        configurable: true
    });
    return BoundingCircle;
}());
exports.BoundingCircle = BoundingCircle;
//# sourceMappingURL=BoundingCircle.js.map