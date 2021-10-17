"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var tf = require("@tensorflow/tfjs-core");
function getImageSize(input) {
    if (input instanceof tf.Tensor) {
        return { height: input.shape[0], width: input.shape[1] };
    }
    else {
        return { height: input.height, width: input.width };
    }
}
exports.getImageSize = getImageSize;
/**
 * Normalizes the provided angle to the range -pi to pi.
 * @param angle The angle in radians to be normalized.
 */
function normalizeRadians(angle) {
    return angle - 2 * Math.PI * Math.floor((angle + Math.PI) / (2 * Math.PI));
}
exports.normalizeRadians = normalizeRadians;
/**
 * Transform value ranges.
 * @param fromMin Min of original value range.
 * @param fromMax Max of original value range.
 * @param toMin New min of transformed value range.
 * @param toMax New max of transformed value range.
 */
function transformValueRange(fromMin, fromMax, toMin, toMax) {
    var fromRange = fromMax - fromMin;
    var toRange = toMax - toMin;
    if (fromRange === 0) {
        throw new Error("Original min and max are both " + fromMin + ", range cannot be 0.");
    }
    var scale = toRange / fromRange;
    var offset = toMin - fromMin * scale;
    return { scale: scale, offset: offset };
}
exports.transformValueRange = transformValueRange;
/**
 * Convert an image to an image tensor representation.
 *
 * The image tensor has a shape [1, height, width, colorChannel].
 *
 * @param input An image, video frame, or image tensor.
 */
function toImageTensor(input) {
    return input instanceof tf.Tensor ? input : tf.browser.fromPixels(input);
}
exports.toImageTensor = toImageTensor;
/**
 * Padding ratio of left, top, right, bottom, based on the output dimensions.
 *
 * The padding values are non-zero only when the "keep_aspect_ratio" is true.
 *
 * For instance, when the input image is 10x10 (width x height) and the
 * output dimensions is 20x40 and "keep_aspect_ratio" is true, we should scale
 * the input image to 20x20 and places it in the middle of the output image with
 * an equal padding of 10 pixels at the top and the bottom. The result is
 * therefore {left: 0, top: 0.25, right: 0, bottom: 0.25} (10/40 = 0.25f).
 * @param roi The original rectangle to pad.
 * @param targetSize The target width and height of the result rectangle.
 * @param keepAspectRatio Whether keep aspect ratio. Default to false.
 */
function padRoi(roi, targetSize, keepAspectRatio) {
    if (keepAspectRatio === void 0) { keepAspectRatio = false; }
    if (!keepAspectRatio) {
        return { top: 0, left: 0, right: 0, bottom: 0 };
    }
    var targetH = targetSize.height;
    var targetW = targetSize.width;
    validateSize(targetSize, 'targetSize');
    validateSize(roi, 'roi');
    var tensorAspectRatio = targetH / targetW;
    var roiAspectRatio = roi.height / roi.width;
    var newWidth;
    var newHeight;
    var horizontalPadding = 0;
    var verticalPadding = 0;
    if (tensorAspectRatio > roiAspectRatio) {
        // pad height;
        newWidth = roi.width;
        newHeight = roi.width * tensorAspectRatio;
        verticalPadding = (1 - roiAspectRatio / tensorAspectRatio) / 2;
    }
    else {
        // pad width.
        newWidth = roi.height / tensorAspectRatio;
        newHeight = roi.height;
        horizontalPadding = (1 - tensorAspectRatio / roiAspectRatio) / 2;
    }
    roi.width = newWidth;
    roi.height = newHeight;
    return {
        top: verticalPadding,
        left: horizontalPadding,
        right: horizontalPadding,
        bottom: verticalPadding
    };
}
exports.padRoi = padRoi;
/**
 * Get the rectangle information of an image, including xCenter, yCenter, width,
 * height and rotation.
 *
 * @param imageSize imageSize is used to calculate the rectangle.
 * @param normRect Optional. If normRect is not null, it will be used to get
 *     a subarea rectangle information in the image. `imageSize` is used to
 *     calculate the actual non-normalized coordinates.
 */
function getRoi(imageSize, normRect) {
    if (normRect) {
        return {
            xCenter: normRect.xCenter * imageSize.width,
            yCenter: normRect.yCenter * imageSize.height,
            width: normRect.width * imageSize.width,
            height: normRect.height * imageSize.height,
            rotation: normRect.rotation
        };
    }
    else {
        return {
            xCenter: 0.5 * imageSize.width,
            yCenter: 0.5 * imageSize.height,
            width: imageSize.width,
            height: imageSize.height,
            rotation: 0
        };
    }
}
exports.getRoi = getRoi;
/**
 * Generate the projective transformation matrix to be used for `tf.transform`.
 *
 * See more documentation in `tf.transform`.
 *
 * @param subRect The rectangle to generate the projective transformation matrix
 *     for.
 * @param imageSize The original image height and width.
 * @param flipHorizontally Whether flip the image horizontally.
 * @param inputResolution The target height and width.
 */
function getProjectiveTransformMatrix(subRect, imageSize, flipHorizontally, inputResolution) {
    validateSize(inputResolution, 'inputResolution');
    // Ref:
    // https://github.com/google/mediapipe/blob/master/mediapipe/calculators/tensor/image_to_tensor_utils.cc
    // The resulting matrix is multiplication of below matrices:
    // M = postScaleMatrix * translateMatrix * rotateMatrix * flipMatrix *
    //     scaleMatrix * initialTranslateMatrix
    //
    // For any point in the transformed image p, we can use the above matrix to
    // calculate the projected point in the original image p'. So that:
    // p' = p * M;
    // Note: The transform matrix below assumes image coordinates is normalized
    // to [0, 1] range.
    // postScaleMatrix: Matrix to scale x, y to [0, 1] range
    //   | g  0  0 |
    //   | 0  h  0 |
    //   | 0  0  1 |
    var g = 1 / imageSize.width;
    var h = 1 / imageSize.height;
    // translateMatrix: Matrix to move the center to the subRect center.
    //   | 1  0  e |
    //   | 0  1  f |
    //   | 0  0  1 |
    var e = subRect.xCenter;
    var f = subRect.yCenter;
    // rotateMatrix: Matrix to do rotate the image around the subRect center.
    //   | c -d  0 |
    //   | d  c  0 |
    //   | 0  0  1 |
    var c = Math.cos(subRect.rotation);
    var d = Math.sin(subRect.rotation);
    // flipMatrix: Matrix for optional horizontal flip around the subRect center.
    //   | fl 0  0 |
    //   | 0  1  0 |
    //   | 0  0  1 |
    var flip = flipHorizontally ? -1 : 1;
    // scaleMatrix: Matrix to scale x, y to subRect size.
    //   | a  0  0 |
    //   | 0  b  0 |
    //   | 0  0  1 |
    var a = subRect.width;
    var b = subRect.height;
    // initialTranslateMatrix: Matrix convert x, y to [-0.5, 0.5] range.
    //   | 1  0 -0.5 |
    //   | 0  1 -0.5 |
    //   | 0  0  1   |
    // M is a 3 by 3 matrix denoted by:
    // | a0  a1  a2 |
    // | b0  b1  b2 |
    // | 0   0   1  |
    // To use M with regular x, y coordinates, we need to normalize them first.
    // Because x' = a0 * x + a1 * y + a2, y' = b0 * x + b1 * y + b2,
    // we need to use factor (1/inputResolution.width) to normalize x for a0 and
    // b0, similarly we need to use factor (1/inputResolution.height) to normalize
    // y for a1 and b1.
    // Also at the end, we need to de-normalize x' and y' to regular coordinates.
    // So we need to use factor imageSize.width for a0, a1 and a2, similarly
    // we need to use factor imageSize.height for b0, b1 and b2.
    var a0 = (1 / inputResolution.width) * a * c * flip * g * imageSize.width;
    var a1 = (1 / inputResolution.height) * -b * d * g * imageSize.width;
    var a2 = (-0.5 * a * c * flip + 0.5 * b * d + e) * g * imageSize.width;
    var b0 = (1 / inputResolution.width) * a * d * flip * h * imageSize.height;
    var b1 = (1 / inputResolution.height) * b * c * h * imageSize.height;
    var b2 = (-0.5 * b * c - 0.5 * a * d * flip + f) * h * imageSize.height;
    return [a0, a1, a2, b0, b1, b2, 0, 0];
}
exports.getProjectiveTransformMatrix = getProjectiveTransformMatrix;
function validateSize(size, name) {
    tf.util.assert(size.width !== 0, function () { return name + " width cannot be 0."; });
    tf.util.assert(size.height !== 0, function () { return name + " height cannot be 0."; });
}
//# sourceMappingURL=image_utils.js.map