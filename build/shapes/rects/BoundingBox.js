"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundingBox = void 0;
var BoundingBox = /** @class */ (function () {
    function BoundingBox(args) {
        var x0 = args.x0, x1 = args.x1, y0 = args.y0, y1 = args.y1;
        this.x0 = x0;
        this.x1 = x1;
        this.y0 = y0;
        this.y1 = y1;
    }
    Object.defineProperty(BoundingBox.prototype, "x", {
        get: function () {
            return this.x0 + this.width / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoundingBox.prototype, "y", {
        get: function () {
            return this.y0 + this.height / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoundingBox.prototype, "width", {
        get: function () {
            return this.x1 - this.x0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoundingBox.prototype, "height", {
        get: function () {
            return this.y1 - this.y0;
        },
        enumerable: false,
        configurable: true
    });
    return BoundingBox;
}());
exports.BoundingBox = BoundingBox;
//# sourceMappingURL=BoundingBox.js.map