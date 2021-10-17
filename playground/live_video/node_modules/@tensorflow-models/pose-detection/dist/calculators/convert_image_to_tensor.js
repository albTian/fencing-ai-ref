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
var image_utils_1 = require("./image_utils");
/**
 * Convert an image or part of it to an image tensor.
 *
 * @param image An image, video frame or image tensor.
 * @param config
 *      inputResolution: The target height and width.
 *      keepAspectRatio?: Whether target tensor should keep aspect ratio.
 * @param normRect A normalized rectangle, representing the subarea to crop from
 *      the image. If normRect is provided, the returned image tensor represents
 *      the subarea.
 */
function convertImageToTensor(image, config, normRect) {
    var inputResolution = config.inputResolution, keepAspectRatio = config.keepAspectRatio;
    // Ref:
    // https://github.com/google/mediapipe/blob/master/mediapipe/calculators/tensor/image_to_tensor_calculator.cc
    var imageSize = image_utils_1.getImageSize(image);
    var roi = image_utils_1.getRoi(imageSize, normRect);
    var padding = image_utils_1.padRoi(roi, inputResolution, keepAspectRatio);
    var imageTensor = tf.tidy(function () {
        var $image = image_utils_1.toImageTensor(image);
        var transformMatrix = tf.tensor2d(image_utils_1.getProjectiveTransformMatrix(roi, imageSize, false, inputResolution), [1, 8]);
        var imageTransformed = tf.image.transform(
        // tslint:disable-next-line: no-unnecessary-type-assertion
        tf.expandDims(tf.cast($image, 'float32')), transformMatrix, 'bilinear', 'nearest', 0, [inputResolution.height, inputResolution.width]);
        return imageTransformed;
    });
    return { imageTensor: imageTensor, padding: padding };
}
exports.convertImageToTensor = convertImageToTensor;
//# sourceMappingURL=convert_image_to_tensor.js.map