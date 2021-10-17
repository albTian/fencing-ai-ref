"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tf = require("@tensorflow/tfjs-core");
var split_detection_result_1 = require("./split_detection_result");
function detectorInference(imageTensor, poseDetectorModel) {
    return tf.tidy(function () {
        var detectionResult = poseDetectorModel.predict(imageTensor);
        var _a = split_detection_result_1.splitDetectionResult(detectionResult), scores = _a[0], rawBoxes = _a[1];
        // Shape [896, 12]
        var rawBoxes2d = tf.squeeze(rawBoxes);
        // Shape [896]
        var scores1d = tf.squeeze(scores);
        return { boxes: rawBoxes2d, scores: scores1d };
    });
}
exports.detectorInference = detectorInference;
//# sourceMappingURL=detector_inference.js.map