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
exports.Serializer = void 0;
var Rect_1 = require("./shapes/rects/Rect");
var Circle_1 = require("./shapes/circles/Circle");
var Body_1 = require("./Body");
var Serializer = /** @class */ (function () {
    function Serializer() {
    }
    Serializer.getSerializedWorld = function (world) {
        return {
            bodies: world.bodies.map(function (body) { return Serializer.getSerializedBody(body); }),
        };
    };
    Serializer.fromSerializedBody = function (serialized) {
        var shape = serialized.shape, rest = __rest(serialized, ["shape"]);
        if (Serializer.isSerializedCircle(shape)) {
            var circle = Serializer.fromSerializedCircle(shape);
            return new Body_1.Body(__assign(__assign({}, rest), { shape: circle }));
        }
        if (Serializer.isSerializedRect(shape)) {
            var rect = Serializer.fromSerializedRect(shape);
            return new Body_1.Body(__assign(__assign({}, rest), { shape: rect }));
        }
        throw new Error("could not create Body from serialized data: ".concat(JSON.stringify(serialized)));
    };
    Serializer.fromSerializedCircle = function (serialized) {
        var circle = new Circle_1.Circle(serialized);
        circle.setVelocity(serialized.velocity);
        return circle;
    };
    Serializer.fromSerializedRect = function (serialized) {
        var rect = new Rect_1.Rect(serialized);
        rect.setVelocity(serialized.velocity);
        return rect;
    };
    Serializer.getSerializedBody = function (body) {
        var id = body.id, mass = body.mass, restitution = body.restitution, isSensor = body.isSensor;
        return {
            id: id,
            shape: Serializer.getSerializedShape(body.shape),
            mass: mass,
            restitution: restitution,
            isSensor: isSensor,
        };
    };
    Serializer.getSerializedShape = function (shape) {
        if (shape instanceof Circle_1.Circle) {
            return Serializer.getSerializedCircle(shape);
        }
        if (shape instanceof Rect_1.Rect) {
            return Serializer.getSerializedRect(shape);
        }
        throw new Error("could not serialize shape: ".concat(JSON.stringify(shape)));
    };
    Serializer.getSerializedCircle = function (circle) {
        var x = circle.x, y = circle.y, radius = circle.radius, velocity = circle.velocity;
        return {
            x: x,
            y: y,
            radius: radius,
            velocity: velocity,
        };
    };
    Serializer.getSerializedRect = function (rect) {
        var x = rect.x, y = rect.y, width = rect.width, height = rect.height, velocity = rect.velocity;
        return {
            x: x,
            y: y,
            width: width,
            height: height,
            velocity: velocity,
        };
    };
    Serializer.isSerializedCircle = function (shape) {
        for (var _i = 0, _a = ['x', 'y', 'radius', 'velocity']; _i < _a.length; _i++) {
            var prop = _a[_i];
            if (!(prop in shape))
                return false;
        }
        return true;
    };
    Serializer.isSerializedRect = function (shape) {
        for (var _i = 0, _a = ['x', 'y', 'width', 'height', 'velocity']; _i < _a.length; _i++) {
            var prop = _a[_i];
            if (!(prop in shape))
                return false;
        }
        return true;
    };
    return Serializer;
}());
exports.Serializer = Serializer;
//# sourceMappingURL=Serializer.js.map