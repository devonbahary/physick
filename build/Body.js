"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Body = exports.BodyEvent = void 0;
var uuid_1 = require("uuid");
var Vectors_1 = require("./Vectors");
var PubSub_1 = require("./PubSub");
var BodyEvent;
(function (BodyEvent) {
    BodyEvent["Move"] = "Move";
    BodyEvent["Collision"] = "Collision";
})(BodyEvent = exports.BodyEvent || (exports.BodyEvent = {}));
var Body = /** @class */ (function () {
    function Body(args) {
        var _a = args.id, id = _a === void 0 ? (0, uuid_1.v4)() : _a, shape = args.shape, _b = args.mass, mass = _b === void 0 ? 1 : _b, _c = args.restitution, restitution = _c === void 0 ? 1 : _c, _d = args.isSensor, isSensor = _d === void 0 ? false : _d;
        this.id = id;
        this.shape = shape;
        this.mass = mass;
        this.restitution = restitution;
        this.isSensor = isSensor;
        var pubSub = new PubSub_1.PubSub(Object.values(BodyEvent));
        this.subscribe = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return pubSub.subscribe.apply(pubSub, args);
        };
        this.publish = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return pubSub.publish.apply(pubSub, args);
        };
    }
    Object.defineProperty(Body.prototype, "pos", {
        get: function () {
            return this.shape.pos;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "x", {
        get: function () {
            return this.shape.x;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "y", {
        get: function () {
            return this.shape.y;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "width", {
        get: function () {
            return this.shape.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "height", {
        get: function () {
            return this.shape.height;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "x0", {
        get: function () {
            return this.shape.x0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "x1", {
        get: function () {
            return this.shape.x1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "y0", {
        get: function () {
            return this.shape.y0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "y1", {
        get: function () {
            return this.shape.y1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "velocity", {
        get: function () {
            return this.shape.velocity;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "speed", {
        get: function () {
            return Vectors_1.Vectors.magnitude(this.velocity);
        },
        enumerable: false,
        configurable: true
    });
    Body.prototype.isMoving = function () {
        return Vectors_1.Vectors.hasMagnitude(this.shape.velocity);
    };
    Body.prototype.isFixed = function () {
        return this.mass === Infinity;
    };
    Body.prototype.moveTo = function (pos) {
        this.shape.moveTo(pos);
        this.publish(BodyEvent.Move, this);
    };
    Body.prototype.move = function (movement) {
        if (this.isSensor)
            return;
        this.shape.move(movement);
        this.publish(BodyEvent.Move, this);
    };
    Body.prototype.setVelocity = function (vel) {
        this.shape.velocity = vel;
    };
    Body.prototype.applyForce = function (force) {
        if (this.isSensor)
            return;
        var netForce = Vectors_1.Vectors.divide(force, this.mass);
        this.shape.velocity = Vectors_1.Vectors.add(this.shape.velocity, netForce);
    };
    return Body;
}());
exports.Body = Body;
//# sourceMappingURL=Body.js.map