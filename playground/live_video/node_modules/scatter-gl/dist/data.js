"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var DIMENSIONALITY_ERROR_MESSAGE = 'Points must be an array of either 2 or 3 dimensional number arrays';
var Dataset = (function () {
    function Dataset(points, metadata) {
        var e_1, _a;
        if (metadata === void 0) { metadata = []; }
        this.points = points;
        this.metadata = metadata;
        var dimensions = points[0].length;
        if (!(dimensions === 2 || dimensions === 3)) {
            throw new Error(DIMENSIONALITY_ERROR_MESSAGE);
        }
        try {
            for (var points_1 = __values(points), points_1_1 = points_1.next(); !points_1_1.done; points_1_1 = points_1.next()) {
                var point = points_1_1.value;
                if (dimensions !== point.length) {
                    throw new Error(DIMENSIONALITY_ERROR_MESSAGE);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (points_1_1 && !points_1_1.done && (_a = points_1.return)) _a.call(points_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.dimensions = dimensions;
    }
    Dataset.prototype.setSpriteMetadata = function (spriteMetadata) {
        this.spriteMetadata = spriteMetadata;
    };
    return Dataset;
}());
exports.Dataset = Dataset;
