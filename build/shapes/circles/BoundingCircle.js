"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundingCircle = void 0;
var BoundingBox_1 = require("../rects/BoundingBox");
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
    Object.defineProperty(BoundingCircle.prototype, "boundingBox", {
        get: function () {
            var _a = this, x0 = _a.x0, x1 = _a.x1, y0 = _a.y0, y1 = _a.y1;
            return new BoundingBox_1.BoundingBox({ x0: x0, x1: x1, y0: y0, y1: y1 });
        },
        enumerable: false,
        configurable: true
    });
    return BoundingCircle;
}());
exports.BoundingCircle = BoundingCircle;
//# sourceMappingURL=BoundingCircle.js.map