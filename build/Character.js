"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Character = void 0;
var Vectors_1 = require("./Vectors");
var utilities_1 = require("./utilities");
var ContinuousCollisionDetection_1 = require("./collisions/ContinuousCollisionDetection");
var CollisionResolution_1 = require("./collisions/CollisionResolution");
var DEFAULT_CHARACTER_OPTIONS = {
    framesToTopSpeed: 5,
    topSpeed: 4,
};
var Character = /** @class */ (function () {
    function Character(body, options) {
        this.body = body;
        this.momentum = {
            consecutiveFrames: 0,
            lastHeading: null,
            heading: null,
        };
        this.options = __assign(__assign({}, options), DEFAULT_CHARACTER_OPTIONS);
        if (this.options.framesToTopSpeed <= 0)
            throw new Error("Character.framesToTopSpeed must be > 0");
    }
    Object.defineProperty(Character.prototype, "topSpeed", {
        get: function () {
            return this.options.topSpeed;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Character.prototype, "framesToTopSpeed", {
        get: function () {
            return this.options.framesToTopSpeed;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Character.prototype, "acceleration", {
        get: function () {
            return this.topSpeed / this.framesToTopSpeed;
        },
        enumerable: false,
        configurable: true
    });
    Character.prototype.update = function (dt) {
        this.updateMomentum(dt);
    };
    Character.prototype.move = function (world, direction, dt) {
        if (!Vectors_1.Vectors.hasMagnitude(direction))
            return;
        this.momentum.heading = direction;
        // character shouldn't be able to move if it's already moving faster than its movement speed
        if (this.body.speed >= this.topSpeed)
            return;
        var acceleration = this.getAccelerationWithMomentum(world);
        var accelerativeForce = Vectors_1.Vectors.resize(direction, acceleration * this.body.mass);
        this.body.applyForce(accelerativeForce);
        if (this.body.speed >= this.topSpeed) {
            this.body.setVelocity(Vectors_1.Vectors.resize(this.body.velocity, this.topSpeed));
        }
        var collisionEvent = ContinuousCollisionDetection_1.ContinuousCollisionDetection.getCollisionEvent(this.body, world, dt);
        if (collisionEvent)
            this.redirectAroundCollisionBody(collisionEvent);
    };
    Character.prototype.redirectAroundCollisionBody = function (collisionEvent) {
        if ((0, utilities_1.roundForFloatingPoint)(collisionEvent.timeOfCollision) === 0) {
            var tangent = CollisionResolution_1.CollisionResolution.getTangentMovement(collisionEvent);
            this.body.setVelocity(tangent);
        }
    };
    Character.prototype.getAccelerationWithMomentum = function (world) {
        var friction = world.getFrictionOnBody(this.body);
        var momentum = this.getMomentum();
        return friction > this.acceleration ? momentum : this.acceleration;
    };
    Character.prototype.getMomentum = function () {
        return Math.min(this.topSpeed, (this.topSpeed * this.momentum.consecutiveFrames) / this.framesToTopSpeed);
    };
    Character.prototype.updateMomentum = function (dt) {
        if (!this.headingHasUpdated() || this.headingHasReversed()) {
            this.resetMomentum();
        }
        else if (this.momentum.heading) {
            var consecutiveFrames = this.momentum.consecutiveFrames + dt;
            this.momentum.consecutiveFrames = Math.min(consecutiveFrames, this.framesToTopSpeed);
        }
        this.momentum.lastHeading = this.momentum.heading;
    };
    Character.prototype.resetMomentum = function () {
        this.momentum.consecutiveFrames = 0;
        this.momentum.lastHeading = null;
        this.momentum.heading = null;
    };
    Character.prototype.headingHasUpdated = function () {
        // heading will point to a new vector every frame as long as move() is called
        return this.momentum.lastHeading !== this.momentum.heading;
    };
    Character.prototype.headingHasReversed = function () {
        var _a = this.momentum, lastHeading = _a.lastHeading, heading = _a.heading;
        return Boolean(lastHeading && heading && !Vectors_1.Vectors.isSameDirection(lastHeading, heading));
    };
    return Character;
}());
exports.Character = Character;
//# sourceMappingURL=Character.js.map