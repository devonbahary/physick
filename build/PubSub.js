"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSub = void 0;
var PubSub = /** @class */ (function () {
    function PubSub(events) {
        this.eventObserversMap = events.reduce(function (acc, event) {
            acc[event] = [];
            return acc;
        }, {});
    }
    PubSub.prototype.subscribe = function (event, callback) {
        this.eventObserversMap[event].push(callback);
    };
    PubSub.prototype.publish = function (event, eventData) {
        for (var _i = 0, _a = this.eventObserversMap[event]; _i < _a.length; _i++) {
            var observe = _a[_i];
            observe(eventData);
        }
    };
    return PubSub;
}());
exports.PubSub = PubSub;
//# sourceMappingURL=PubSub.js.map