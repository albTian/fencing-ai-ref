"use strict";
/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
var image_utils_1 = require("../../calculators/image_utils");
// ref:
// https://github.com/google/mediapipe/blob/master/mediapipe/calculators/util/detections_to_rects_calculator.cc
function computeRotation(detection, imageSize, config) {
    var locationData = detection.locationData;
    var startKeypoint = config.rotationVectorStartKeypointIndex;
    var endKeypoint = config.rotationVectorEndKeypointIndex;
    var targetAngle;
    if (config.rotationVectorTargetAngle) {
        targetAngle = config.rotationVectorTargetAngle;
    }
    else {
        targetAngle = Math.PI * config.rotationVectorTargetAngleDegree / 180;
    }
    var x0 = locationData.relativeKeypoints[startKeypoint].x * imageSize.width;
    var y0 = locationData.relativeKeypoints[startKeypoint].y * imageSize.height;
    var x1 = locationData.relativeKeypoints[endKeypoint].x * imageSize.width;
    var y1 = locationData.relativeKeypoints[endKeypoint].y * imageSize.height;
    var rotation = image_utils_1.normalizeRadians(targetAngle - Math.atan2(-(y1 - y0), x1 - x0));
    return rotation;
}
exports.computeRotation = computeRotation;
//# sourceMappingURL=detection_to_rect.js.map