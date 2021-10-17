"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var cache = new Map();
var regex = /^(rgba|hsla)\((\d+),\s*(\d+%?),\s*(\d+%?)(?:,\s*(\d+(?:\.\d+)?))?\)$/;
function parseOpacity(colorString) {
    var result = regex.exec(colorString);
    if (result) {
        var _a = __read(result, 6), _ = _a[0], rgbaOrHsla = _a[1], rh = _a[2], gs = _a[3], bl = _a[4], opacity = _a[5];
        var colorString_1 = rgbaOrHsla.replace('a', '') + "(" + rh + "," + gs + "," + bl + ")";
        return { colorString: colorString_1, opacity: parseFloat(opacity) };
    }
    return { colorString: colorString, opacity: 1 };
}
function parseColor(inputColorString) {
    if (cache.has(inputColorString))
        return cache.get(inputColorString);
    var _a = parseOpacity(inputColorString), colorString = _a.colorString, opacity = _a.opacity;
    var color = new THREE.Color(colorString);
    var r = color.r, g = color.g, b = color.b;
    var item = { r: r, g: g, b: b, opacity: opacity };
    cache.set(inputColorString, item);
    return item;
}
exports.parseColor = parseColor;
