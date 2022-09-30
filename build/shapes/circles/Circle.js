"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Circle = void 0;
var Particle_1 = require("../Particle");
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle(args) {
        var _this = this;
        var radius = args.radius, x = args.x, y = args.y;
        _this = _super.call(this, x, y) || this;
        _this.radius = radius;
        return _this;
    }
    Object.defineProperty(Circle.prototype, "width", {
        get: function () {
            return this.radius * 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Circle.prototype, "height", {
        get: function () {
            return this.radius * 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Circle.prototype, "x0", {
        get: function () {
            return this.x - this.radius;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Circle.prototype, "x1", {
        get: function () {
            return this.x + this.radius;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Circle.prototype, "y0", {
        get: function () {
            return this.y - this.radius;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Circle.prototype, "y1", {
        get: function () {
            return this.y + this.radius;
        },
        enumerable: false,
        configurable: true
    });
    return Circle;
}(Particle_1.Particle));
exports.Circle = Circle;
//# sourceMappingURL=Circle.js.map