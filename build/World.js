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
exports.World = exports.WorldEvent = void 0;
var Body_1 = require("./Body");
var Vectors_1 = require("./Vectors");
var Rect_1 = require("./shapes/rects/Rect");
var ContinuousCollisionDetection_1 = require("./collisions/ContinuousCollisionDetection");
var CollisionResolution_1 = require("./collisions/CollisionResolution");
var PubSub_1 = require("./PubSub");
var utilities_1 = require("./utilities");
var QuadTree_1 = require("./QuadTree");
var Serializer_1 = require("./Serializer");
var WorldEvent;
(function (WorldEvent) {
    WorldEvent["AddBody"] = "AddBody";
    WorldEvent["RemoveBody"] = "RemoveBody";
})(WorldEvent = exports.WorldEvent || (exports.WorldEvent = {}));
var DEFAULT_WORLD_OPTIONS = {
    friction: 0.5,
    initBoundaries: true,
};
var World = /** @class */ (function () {
    function World(args) {
        this.bodies = [];
        this.forces = [];
        var width = args.width, height = args.height, _a = args.options, options = _a === void 0 ? {} : _a;
        this.width = width;
        this.height = height;
        var quadTreeConfig = options.quadTreeConfig, rest = __rest(options, ["quadTreeConfig"]);
        this.options = __assign(__assign({}, DEFAULT_WORLD_OPTIONS), rest);
        var pubSub = new PubSub_1.PubSub(Object.values(WorldEvent));
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
        this.quadTree = new QuadTree_1.QuadTree(this, quadTreeConfig);
        if (options.initBoundaries)
            this.initBoundaries();
    }
    World.prototype.update = function (dt) {
        this.updateForces(dt);
        this.updateBodies(dt);
        this.quadTree.update();
    };
    World.prototype.addBody = function (body) {
        this.bodies.push(body);
        this.publish(WorldEvent.AddBody, body);
    };
    World.prototype.removeBody = function (body) {
        this.bodies = this.bodies.filter(function (b) { return b.id !== body.id; });
        this.publish(WorldEvent.RemoveBody, body);
    };
    World.prototype.addForce = function (force) {
        this.forces.push(force);
    };
    World.prototype.removeForce = function (force) {
        this.forces = this.forces.filter(function (f) { return f.id !== force.id; });
    };
    World.prototype.getBodiesInBoundingBox = function (boundingBox) {
        return this.quadTree.getBodiesInBoundingBox(boundingBox);
    };
    World.prototype.getFrictionOnBody = function (body) {
        return body.mass * this.options.friction;
    };
    World.prototype.getBodyVelocityAfterFriction = function (body) {
        if (!body.isMoving())
            return body.velocity;
        var friction = this.getFrictionOnBody(body);
        if (!friction)
            return body.velocity;
        var speed = body.speed;
        if (friction >= speed) {
            // friction should never reverse a body's velocity, only ever set its speed to 0
            return { x: 0, y: 0 };
        }
        else {
            return Vectors_1.Vectors.resize(body.velocity, speed - friction);
        }
    };
    // TODO: forces?
    World.prototype.loadSerialized = function (serializedWorld) {
        for (var _i = 0, _a = this.bodies; _i < _a.length; _i++) {
            var body = _a[_i];
            this.removeBody(body);
        }
        for (var _b = 0, _c = serializedWorld.bodies; _b < _c.length; _b++) {
            var serializedBody = _c[_b];
            var body = Serializer_1.Serializer.fromSerializedBody(serializedBody);
            this.addBody(body);
        }
    };
    World.prototype.updateForces = function (dt) {
        for (var _i = 0, _a = this.forces; _i < _a.length; _i++) {
            var force = _a[_i];
            force.update(this, dt);
        }
        this.forces = this.forces.filter(function (f) { return !f.shouldRemove(); });
    };
    World.prototype.updateBodies = function (dt) {
        for (var _i = 0, _a = this.bodies; _i < _a.length; _i++) {
            var body = _a[_i];
            // make sure each potential collision pair have both had friction applied before consideration
            this.applyFriction(body);
        }
        for (var _b = 0, _c = this.bodies; _b < _c.length; _b++) {
            var body = _c[_b];
            if (body.isMoving())
                this.updateBodyMovement(body, dt);
        }
    };
    World.prototype.updateBodyMovement = function (body, dt, ignoreBodyIds) {
        if (ignoreBodyIds === void 0) { ignoreBodyIds = new Set(); }
        var collisionEvent = ContinuousCollisionDetection_1.ContinuousCollisionDetection.getCollisionEvent(body, this, dt, ignoreBodyIds);
        if (collisionEvent) {
            // because we traverse bodies in no particular order, it's possible that we accidentally consider a false
            // collision of a slower-moving body into a faster-moving body along the collision vector
            // rather than ignoring the false collision altogether, we wait for that faster-moving colliding body to get
            // a chance to move
            if (ContinuousCollisionDetection_1.ContinuousCollisionDetection.isChronological(collisionEvent)) {
                var collisionBody = collisionEvent.collisionBody;
                if (collisionBody.isSensor) {
                    this.onCollision(collisionEvent);
                    // recognize sensor collision but do not resolve collision; continue on
                    ignoreBodyIds.add(collisionBody.id);
                    this.updateBodyMovement(body, dt, ignoreBodyIds);
                }
                else {
                    CollisionResolution_1.CollisionResolution.resolve(collisionEvent);
                    this.onCollision(collisionEvent);
                    this.resolveChainedBodies(collisionBody);
                }
            }
        }
        else {
            body.move(Vectors_1.Vectors.resize(body.velocity, dt * body.speed));
        }
    };
    // if the force through 1+ non-fixed bodies is stopped at a fixed body, move the last non-fixed body in the chain
    // around the fixed body
    World.prototype.resolveChainedBodies = function (bodyInChain, visitedBodyIds) {
        if (visitedBodyIds === void 0) { visitedBodyIds = new Set(); }
        if (bodyInChain.isFixed())
            return;
        var collisionEvent = ContinuousCollisionDetection_1.ContinuousCollisionDetection.getCollisionEvent(bodyInChain, this, 0, visitedBodyIds);
        if (collisionEvent && (0, utilities_1.roundForFloatingPoint)(collisionEvent.timeOfCollision) === 0) {
            this.onCollision(collisionEvent);
            if (collisionEvent.collisionBody.isFixed()) {
                var getTangentMovement = CollisionResolution_1.CollisionResolution.getTangentMovement(collisionEvent);
                bodyInChain.setVelocity(getTangentMovement);
            }
            else {
                visitedBodyIds.add(bodyInChain.id); // avoid infinite recursion
                this.resolveChainedBodies(collisionEvent.collisionBody, visitedBodyIds);
            }
        }
    };
    World.prototype.onCollision = function (collisionEvent) {
        var movingBody = collisionEvent.movingBody, collisionBody = collisionEvent.collisionBody;
        movingBody.publish(Body_1.BodyEvent.Collision, collisionEvent);
        collisionBody.publish(Body_1.BodyEvent.Collision, collisionEvent);
    };
    World.prototype.initBoundaries = function () {
        var _a = this, width = _a.width, height = _a.height;
        var rects = [
            new Rect_1.Rect({ x: width / 2, width: width, height: 0 }),
            new Rect_1.Rect({ x: width, y: height / 2, width: 0, height: height }),
            new Rect_1.Rect({ x: width / 2, y: height, width: width, height: 0 }),
            new Rect_1.Rect({ x: 0, y: height / 2, width: 0, height: height }), // left
        ];
        var boundaryBodies = rects.map(function (shape) { return new Body_1.Body({ shape: shape, mass: Infinity }); });
        for (var _i = 0, boundaryBodies_1 = boundaryBodies; _i < boundaryBodies_1.length; _i++) {
            var body = boundaryBodies_1[_i];
            this.addBody(body);
        }
    };
    World.prototype.applyFriction = function (body) {
        var newVelocity = this.getBodyVelocityAfterFriction(body);
        body.setVelocity(newVelocity);
    };
    return World;
}());
exports.World = World;
//# sourceMappingURL=World.js.map