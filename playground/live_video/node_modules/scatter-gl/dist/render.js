"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LabelRenderParams = (function () {
    function LabelRenderParams(pointIndices, labelStrings, scaleFactors, useSceneOpacityFlags, defaultFontSize, fillColors, strokeColors) {
        this.pointIndices = pointIndices;
        this.labelStrings = labelStrings;
        this.scaleFactors = scaleFactors;
        this.useSceneOpacityFlags = useSceneOpacityFlags;
        this.defaultFontSize = defaultFontSize;
        this.fillColors = fillColors;
        this.strokeColors = strokeColors;
    }
    return LabelRenderParams;
}());
exports.LabelRenderParams = LabelRenderParams;
var CameraType;
(function (CameraType) {
    CameraType[CameraType["Perspective"] = 0] = "Perspective";
    CameraType[CameraType["Orthographic"] = 1] = "Orthographic";
})(CameraType = exports.CameraType || (exports.CameraType = {}));
var RenderContext = (function () {
    function RenderContext(camera, cameraType, cameraTarget, screenWidth, screenHeight, nearestCameraSpacePointZ, farthestCameraSpacePointZ, backgroundColor, pointColors, pointScaleFactors, labels, polylineColors, polylineOpacities, polylineWidths) {
        this.camera = camera;
        this.cameraType = cameraType;
        this.cameraTarget = cameraTarget;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.nearestCameraSpacePointZ = nearestCameraSpacePointZ;
        this.farthestCameraSpacePointZ = farthestCameraSpacePointZ;
        this.backgroundColor = backgroundColor;
        this.pointColors = pointColors;
        this.pointScaleFactors = pointScaleFactors;
        this.labels = labels;
        this.polylineColors = polylineColors;
        this.polylineOpacities = polylineOpacities;
        this.polylineWidths = polylineWidths;
    }
    return RenderContext;
}());
exports.RenderContext = RenderContext;
