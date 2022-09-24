"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Particle = void 0;
var Particle = /** @class */ (function () {
    function Particle(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
        this.velocity = { x: 0, y: 0 };
    }
    Particle.prototype.moveTo = function (pos) {
        this.x = pos.x;
        this.y = pos.y;
    };
    Particle.prototype.move = function (dir) {
        this.x += dir.x;
        this.y += dir.y;
    };
    Particle.prototype.setVelocity = function (vel) {
        this.velocity = vel;
    };
    Object.defineProperty(Particle.prototype, "pos", {
        get: function () {
            return {
                x: this.x,
                y: this.y,
            };
        },
        enumerable: false,
        configurable: true
    });
    return Particle;
}());
exports.Particle = Particle;
//# sourceMappingURL=Particle.js.map