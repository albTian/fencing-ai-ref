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
var render_1 = require("./render");
var label_1 = require("./label");
var util = require("./util");
var MAX_LABELS_ON_SCREEN = 10000;
var ScatterPlotVisualizerCanvasLabels = (function () {
    function ScatterPlotVisualizerCanvasLabels(container, styles) {
        this.styles = styles;
        this.id = 'CANVAS_LABELS';
        this.worldSpacePointPositions = new Float32Array(0);
        this.labelsActive = true;
        this.canvas = document.createElement('canvas');
        container.appendChild(this.canvas);
        this.gc = this.canvas.getContext('2d');
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '0';
        this.canvas.style.top = '0';
        this.canvas.style.pointerEvents = 'none';
    }
    ScatterPlotVisualizerCanvasLabels.prototype.removeAllLabels = function () {
        var pixelWidth = this.canvas.width * window.devicePixelRatio;
        var pixelHeight = this.canvas.height * window.devicePixelRatio;
        this.gc.clearRect(0, 0, pixelWidth, pixelHeight);
    };
    ScatterPlotVisualizerCanvasLabels.prototype.makeLabels = function (rc) {
        if (rc.labels == null || rc.labels.pointIndices.length === 0) {
            return;
        }
        if (this.worldSpacePointPositions == null) {
            return;
        }
        var lrc = rc.labels;
        var sceneIs3D = rc.cameraType === render_1.CameraType.Perspective;
        var labelHeight = parseInt(this.gc.font, 10);
        var dpr = window.devicePixelRatio;
        var grid;
        {
            var pixw = this.canvas.width * dpr;
            var pixh = this.canvas.height * dpr;
            var bb = { loX: 0, hiX: pixw, loY: 0, hiY: pixh };
            grid = new label_1.CollisionGrid(bb, pixw / 25, pixh / 50);
        }
        var cameraDomain = [
            rc.farthestCameraSpacePointZ,
            rc.nearestCameraSpacePointZ,
        ];
        var opacityMap = function (x) {
            return util.scaleExponential(x, cameraDomain, [0.1, 1]);
        };
        var camPos = rc.camera.position;
        var camToTarget = camPos.clone().sub(rc.cameraTarget);
        var camToPoint = new THREE.Vector3();
        this.gc.textBaseline = 'middle';
        this.gc.miterLimit = 2;
        var labelMargin = 2;
        var xShift = 4;
        var n = Math.min(MAX_LABELS_ON_SCREEN, lrc.pointIndices.length);
        for (var i = 0; i < n; ++i) {
            var point = void 0;
            {
                var pi = lrc.pointIndices[i];
                point = util.vector3FromPackedArray(this.worldSpacePointPositions, pi);
            }
            camToPoint.copy(camPos).sub(point);
            if (camToTarget.dot(camToPoint) < 0) {
                continue;
            }
            var _a = __read(util.vector3DToScreenCoords(rc.camera, rc.screenWidth, rc.screenHeight, point), 2), x = _a[0], y = _a[1];
            x += xShift;
            var textBoundingBox = {
                loX: x - labelMargin,
                hiX: x + 1 + labelMargin,
                loY: y - labelHeight / 2 - labelMargin,
                hiY: y + labelHeight / 2 + labelMargin,
            };
            if (grid.insert(textBoundingBox, true)) {
                var text = lrc.labelStrings[i];
                var fontSize = lrc.defaultFontSize * lrc.scaleFactors[i] * dpr;
                this.gc.font = fontSize + 'px roboto';
                textBoundingBox.hiX += this.gc.measureText(text).width - 1;
                if (grid.insert(textBoundingBox)) {
                    var opacity = 1;
                    if (sceneIs3D && lrc.useSceneOpacityFlags[i] === 1) {
                        opacity = opacityMap(camToPoint.length());
                    }
                    this.gc.fillStyle = this.styleStringFromPackedRgba(lrc.fillColors, i, opacity);
                    this.gc.strokeStyle = this.styleStringFromPackedRgba(lrc.strokeColors, i, opacity);
                    this.gc.lineWidth = this.styles.label.strokeWidth;
                    this.gc.strokeText(text, x, y);
                    this.gc.lineWidth = this.styles.label.fillWidth;
                    this.gc.fillText(text, x, y);
                }
            }
        }
    };
    ScatterPlotVisualizerCanvasLabels.prototype.styleStringFromPackedRgba = function (packedRgbaArray, colorIndex, opacity) {
        var offset = colorIndex * 3;
        var r = packedRgbaArray[offset];
        var g = packedRgbaArray[offset + 1];
        var b = packedRgbaArray[offset + 2];
        return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
    };
    ScatterPlotVisualizerCanvasLabels.prototype.onResize = function (newWidth, newHeight) {
        var dpr = window.devicePixelRatio;
        this.canvas.width = newWidth * dpr;
        this.canvas.height = newHeight * dpr;
        this.canvas.style.width = newWidth + 'px';
        this.canvas.style.height = newHeight + 'px';
    };
    ScatterPlotVisualizerCanvasLabels.prototype.dispose = function () {
        this.removeAllLabels();
    };
    ScatterPlotVisualizerCanvasLabels.prototype.onPointPositionsChanged = function (newPositions) {
        this.worldSpacePointPositions = newPositions;
        this.removeAllLabels();
    };
    ScatterPlotVisualizerCanvasLabels.prototype.onRender = function (rc) {
        if (!this.labelsActive) {
            return;
        }
        this.removeAllLabels();
        this.makeLabels(rc);
    };
    ScatterPlotVisualizerCanvasLabels.prototype.setScene = function (scene) { };
    ScatterPlotVisualizerCanvasLabels.prototype.onPickingRender = function (renderContext) { };
    return ScatterPlotVisualizerCanvasLabels;
}());
exports.ScatterPlotVisualizerCanvasLabels = ScatterPlotVisualizerCanvasLabels;
