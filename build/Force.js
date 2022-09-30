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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntervalForce = exports.ConstantForce = void 0;
var uuid_1 = require("uuid");
var CollisionDetection_1 = require("./collisions/CollisionDetection");
var Vectors_1 = require("./Vectors");
var DEFAULT_EXPIRATION = {
    duration: Infinity,
    maxApplications: Infinity,
};
var BaseForce = /** @class */ (function () {
    function BaseForce(args) {
        this.id = (0, uuid_1.v4)();
        var boundingCircle = args.boundingCircle, magnitude = args.magnitude, expiration = args.expiration;
        this.boundingCircle = boundingCircle;
        this.magnitude = magnitude;
        this.expirable = __assign(__assign(__assign({}, DEFAULT_EXPIRATION), expiration), { applications: 0, age: 0 });
    }
    BaseForce.prototype.apply = function (world) {
        var bodies = world.getBodiesInShape(this.boundingCircle);
        for (var _i = 0, bodies_1 = bodies; _i < bodies_1.length; _i++) {
            var body = bodies_1[_i];
            if (CollisionDetection_1.CollisionDetection.hasOverlap(this.boundingCircle, body.shape)) {
                var diffPos = Vectors_1.Vectors.subtract(body, this.boundingCircle);
                var dissipation = this.getDissipationFactor(diffPos);
                var force = Vectors_1.Vectors.resize(diffPos, this.magnitude * dissipation);
                body.applyForce(force);
            }
        }
        this.expirable.applications += 1;
    };
    BaseForce.prototype.shouldRemove = function () {
        var _a = this.expirable, applications = _a.applications, maxApplications = _a.maxApplications;
        return applications >= maxApplications || this.hasExceededDuration();
    };
    BaseForce.prototype.getDissipationFactor = function (diffPos) {
        return (this.boundingCircle.radius - Vectors_1.Vectors.magnitude(diffPos)) / this.boundingCircle.radius;
    };
    return BaseForce;
}());
var ConstantForce = /** @class */ (function (_super) {
    __extends(ConstantForce, _super);
    function ConstantForce() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConstantForce.prototype.update = function (world, dt) {
        this.apply(world);
        this.expirable.age += dt;
    };
    ConstantForce.prototype.hasExceededDuration = function () {
        if (this.expirable.duration === Infinity)
            return false;
        return this.expirable.age >= this.expirable.duration;
    };
    return ConstantForce;
}(BaseForce));
exports.ConstantForce = ConstantForce;
var IntervalForce = /** @class */ (function (_super) {
    __extends(IntervalForce, _super);
    function IntervalForce(args) {
        var _this = this;
        var interval = args.interval, rest = __rest(args, ["interval"]);
        _this = _super.call(this, rest) || this;
        _this.lastIntervalProcessed = 0;
        if (interval <= 0)
            throw new Error("IntervalForce interval must be greater than 0");
        _this.interval = interval;
        return _this;
    }
    IntervalForce.prototype.update = function (world, dt) {
        var timeSinceLastInterval = this.expirable.age - this.lastIntervalProcessed;
        var timesToApplyThisFrame = Math.floor(timeSinceLastInterval / this.interval);
        for (var i = 0; i < timesToApplyThisFrame; i++) {
            if (!this.shouldRemove()) {
                this.apply(world);
            }
        }
        this.expirable.age += dt;
    };
    IntervalForce.prototype.apply = function (world) {
        _super.prototype.apply.call(this, world);
        this.lastIntervalProcessed = this.expirable.age;
    };
    IntervalForce.prototype.hasExceededDuration = function () {
        var _a = this.expirable, age = _a.age, duration = _a.duration;
        if (duration === Infinity)
            return false;
        // because time is processed multiple ms at a time, an IntervalForce may exceed its duration before it
        // processes an intended interval
        return Math.floor(age / this.interval) > Math.floor(duration / this.interval);
    };
    return IntervalForce;
}(BaseForce));
exports.IntervalForce = IntervalForce;
//# sourceMappingURL=Force.js.map