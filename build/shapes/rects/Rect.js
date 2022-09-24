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
exports.Rect = void 0;
var Particle_1 = require("../Particle");
var Rect = /** @class */ (function (_super) {
    __extends(Rect, _super);
    function Rect(args) {
        var _this = this;
        var x = args.x, y = args.y, width = args.width, height = args.height;
        _this = _super.call(this, x, y) || this;
        _this.width = width;
        _this.height = height;
        return _this;
    }
    Object.defineProperty(Rect.prototype, "x0", {
        get: function () {
            return this.x - this.width / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "x1", {
        get: function () {
            return this.x + this.width / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "y0", {
        get: function () {
            return this.y - this.height / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "y1", {
        get: function () {
            return this.y + this.height / 2;
        },
        enumerable: false,
        configurable: true
    });
    return Rect;
}(Particle_1.Particle));
exports.Rect = Rect;
//# sourceMappingURL=Rect.js.map