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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuadTree = void 0;
var Body_1 = require("./Body");
var World_1 = require("./World");
var CollisionDetection_1 = require("./collisions/CollisionDetection");
var BoundingBox_1 = require("./shapes/rects/BoundingBox");
var DEFAULT_CONFIG = {
    maxBodiesInLeaf: 2,
    // world should be at least 4x the size of minLeafDimensions to comply with a min of 4 Leafs
    minLeafDimensions: {
        width: 40,
        height: 40,
    },
};
var Node = /** @class */ (function () {
    function Node(boundingBox) {
        this.boundingBox = boundingBox;
    }
    Node.prototype.overlapsWith = function (shape) {
        return CollisionDetection_1.CollisionDetection.hasOverlap(this.boundingBox, shape);
    };
    return Node;
}());
var Leaf = /** @class */ (function (_super) {
    __extends(Leaf, _super);
    function Leaf(boundingBox, config) {
        var _this = _super.call(this, boundingBox) || this;
        _this.config = config;
        _this.bodies = [];
        return _this;
    }
    Leaf.prototype.getBodiesInShape = function (shape) {
        return this.overlapsWith(shape) ? this.bodies : [];
    };
    Leaf.prototype.addBody = function (body) {
        if (this.overlapsWith(body.shape)) {
            this.bodies.push(body);
        }
    };
    Leaf.prototype.removeBody = function (body) {
        this.bodies = this.bodies.filter(function (b) { return b.id !== body.id; });
    };
    Leaf.prototype.shouldPartition = function () {
        if (this.bodies.length <= this.config.maxBodiesInLeaf)
            return false;
        return (this.boundingBox.width / 4 >= this.config.minLeafDimensions.width &&
            this.boundingBox.height / 4 >= this.config.minLeafDimensions.height);
    };
    return Leaf;
}(Node));
var InternalNode = /** @class */ (function (_super) {
    __extends(InternalNode, _super);
    function InternalNode(boundingBox, config) {
        var _this = _super.call(this, boundingBox) || this;
        _this.config = config;
        _this.needsUpdate = false;
        _this.children = InternalNode.initLeaves(boundingBox, config);
        return _this;
    }
    Object.defineProperty(InternalNode.prototype, "bodies", {
        get: function () {
            var uniqueBodiesSet = this.children.reduce(function (acc, child) {
                for (var _i = 0, _a = child.bodies; _i < _a.length; _i++) {
                    var body = _a[_i];
                    acc.add(body);
                }
                return acc;
            }, new Set());
            return Array.from(uniqueBodiesSet);
        },
        enumerable: false,
        configurable: true
    });
    InternalNode.initLeaves = function (boundingBox, config) {
        var x0 = boundingBox.x0, x1 = boundingBox.x1, width = boundingBox.width, y0 = boundingBox.y0, y1 = boundingBox.y1, height = boundingBox.height;
        var halfWidth = width / 2;
        var halfHeight = height / 2;
        var leftSide = { x0: x0, x1: x0 + halfWidth };
        var rightSide = { x0: x0 + halfWidth, x1: x1 };
        var topSide = { y0: y0, y1: y0 + halfHeight };
        var bottomSide = { y0: y0 + halfHeight, y1: y1 };
        var bounds = [
            new BoundingBox_1.BoundingBox(__assign(__assign({}, leftSide), topSide)),
            new BoundingBox_1.BoundingBox(__assign(__assign({}, rightSide), topSide)),
            new BoundingBox_1.BoundingBox(__assign(__assign({}, leftSide), bottomSide)),
            new BoundingBox_1.BoundingBox(__assign(__assign({}, rightSide), bottomSide)),
        ];
        return bounds.map(function (r) { return new Leaf(r, config); });
    };
    InternalNode.prototype.getBodiesInShape = function (shape) {
        if (!this.overlapsWith(shape))
            return [];
        var uniqueBodiesSet = this.children.reduce(function (acc, child) {
            var bodies = child.getBodiesInShape(shape);
            for (var _i = 0, bodies_1 = bodies; _i < bodies_1.length; _i++) {
                var body = bodies_1[_i];
                acc.add(body);
            }
            return acc;
        }, new Set());
        return Array.from(uniqueBodiesSet);
    };
    InternalNode.prototype.addBody = function (body) {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            child.addBody(body);
        }
        this.needsUpdate = true;
    };
    InternalNode.prototype.removeBody = function (body) {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            child.removeBody(body);
        }
        this.needsUpdate = true;
    };
    InternalNode.prototype.update = function () {
        var _this = this;
        if (!this.needsUpdate)
            return;
        this.children = this.children.map(function (child) {
            if (child instanceof Leaf) {
                if (child.shouldPartition()) {
                    var internalNode = new InternalNode(child.boundingBox, _this.config);
                    for (var _i = 0, _a = child.bodies; _i < _a.length; _i++) {
                        var body = _a[_i];
                        internalNode.addBody(body);
                    }
                    return internalNode;
                }
                return child;
            }
            child.update();
            if (child.shouldCollapse()) {
                var leaf = new Leaf(child.boundingBox, _this.config);
                for (var _b = 0, _c = child.bodies; _b < _c.length; _b++) {
                    var body = _c[_b];
                    leaf.addBody(body);
                }
                return leaf;
            }
            return child;
        });
        this.needsUpdate = false;
    };
    InternalNode.prototype.shouldCollapse = function () {
        return this.bodies.length <= this.config.maxBodiesInLeaf;
    };
    return InternalNode;
}(Node));
var QuadTree = /** @class */ (function (_super) {
    __extends(QuadTree, _super);
    function QuadTree(world, config) {
        if (config === void 0) { config = {}; }
        var _this = this;
        var width = world.width, height = world.height;
        var boundingBox = new BoundingBox_1.BoundingBox({
            x0: 0,
            x1: width,
            y0: 0,
            y1: height,
        });
        _this = _super.call(this, boundingBox, __assign(__assign({}, DEFAULT_CONFIG), config)) || this;
        _this.initWorldSubscriptions(world);
        return _this;
    }
    QuadTree.prototype.getBodiesInShape = function (shape) {
        var bodies = _super.prototype.getBodiesInShape.call(this, shape);
        return bodies.filter(function (b) { return CollisionDetection_1.CollisionDetection.hasOverlap(shape, b.shape); });
    };
    QuadTree.prototype.initWorldSubscriptions = function (world) {
        var _this = this;
        world.subscribe(World_1.WorldEvent.AddBody, function (body) {
            _this.addBody(body);
            body.subscribe(Body_1.BodyEvent.Move, function (body) {
                _this.removeBody(body); // remove body from tree
                _this.addBody(body); // re-insert in proper position
            });
        });
        world.subscribe(World_1.WorldEvent.RemoveBody, function (body) {
            _this.removeBody(body);
        });
    };
    return QuadTree;
}(InternalNode));
exports.QuadTree = QuadTree;
//# sourceMappingURL=QuadTree.js.map