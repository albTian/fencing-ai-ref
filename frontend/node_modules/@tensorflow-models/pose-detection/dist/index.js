"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var create_detector_1 = require("./create_detector");
exports.createDetector = create_detector_1.createDetector;
// Supported models enum.
__export(require("./types"));
var types_1 = require("./calculators/types");
exports.TrackerType = types_1.TrackerType;
// Second level exports.
// Utils for rendering.
var util = require("./util");
exports.util = util;
// General calculators.
var keypoints_to_normalized_keypoints_1 = require("./calculators/keypoints_to_normalized_keypoints");
var calculators = { keypointsToNormalizedKeypoints: keypoints_to_normalized_keypoints_1.keypointsToNormalizedKeypoints };
exports.calculators = calculators;
// MoveNet model types.
var constants_1 = require("./movenet/constants");
var movenet = {
    modelType: {
        'SINGLEPOSE_LIGHTNING': constants_1.SINGLEPOSE_LIGHTNING,
        'SINGLEPOSE_THUNDER': constants_1.SINGLEPOSE_THUNDER,
        'MULTIPOSE_LIGHTNING': constants_1.MULTIPOSE_LIGHTNING
    }
};
exports.movenet = movenet;
//# sourceMappingURL=index.js.map