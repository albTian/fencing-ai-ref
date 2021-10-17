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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var tfconv = require("@tensorflow/tfjs-converter");
var tf = require("@tensorflow/tfjs-core");
var constants_1 = require("../calculators/constants");
var convert_image_to_tensor_1 = require("../calculators/convert_image_to_tensor");
var image_utils_1 = require("../calculators/image_utils");
var is_video_1 = require("../calculators/is_video");
var keypoints_smoothing_1 = require("../calculators/keypoints_smoothing");
var normalized_keypoints_to_keypoints_1 = require("../calculators/normalized_keypoints_to_keypoints");
var shift_image_value_1 = require("../calculators/shift_image_value");
var constants_2 = require("../constants");
var calculate_alignment_points_rects_1 = require("./calculators/calculate_alignment_points_rects");
var calculate_landmark_projection_1 = require("./calculators/calculate_landmark_projection");
var calculate_score_copy_1 = require("./calculators/calculate_score_copy");
var calculate_world_landmark_projection_1 = require("./calculators/calculate_world_landmark_projection");
var create_ssd_anchors_1 = require("./calculators/create_ssd_anchors");
var detector_inference_1 = require("./calculators/detector_inference");
var landmarks_to_detection_1 = require("./calculators/landmarks_to_detection");
var non_max_suppression_1 = require("./calculators/non_max_suppression");
var refine_landmarks_from_heatmap_1 = require("./calculators/refine_landmarks_from_heatmap");
var remove_detection_letterbox_1 = require("./calculators/remove_detection_letterbox");
var remove_landmark_letterbox_1 = require("./calculators/remove_landmark_letterbox");
var tensors_to_detections_1 = require("./calculators/tensors_to_detections");
var tensors_to_landmarks_1 = require("./calculators/tensors_to_landmarks");
var transform_rect_1 = require("./calculators/transform_rect");
var visibility_smoothing_1 = require("./calculators/visibility_smoothing");
var constants = require("./constants");
var detector_utils_1 = require("./detector_utils");
/**
 * BlazePose detector class.
 */
var BlazePoseTfjsDetector = /** @class */ (function () {
    function BlazePoseTfjsDetector(detectorModel, landmarkModel, enableSmoothing, modelType) {
        this.detectorModel = detectorModel;
        this.landmarkModel = landmarkModel;
        this.enableSmoothing = enableSmoothing;
        this.modelType = modelType;
        // Store global states.
        this.regionOfInterest = null;
        this.anchors =
            create_ssd_anchors_1.createSsdAnchors(constants.BLAZEPOSE_DETECTOR_ANCHOR_CONFIGURATION);
        var anchorW = tf.tensor1d(this.anchors.map(function (a) { return a.width; }));
        var anchorH = tf.tensor1d(this.anchors.map(function (a) { return a.height; }));
        var anchorX = tf.tensor1d(this.anchors.map(function (a) { return a.xCenter; }));
        var anchorY = tf.tensor1d(this.anchors.map(function (a) { return a.yCenter; }));
        this.anchorTensor = { x: anchorX, y: anchorY, w: anchorW, h: anchorH };
    }
    /**
     * Estimates poses for an image or video frame.
     *
     * It returns a single pose or multiple poses based on the maxPose parameter
     * from the `config`.
     *
     * @param image
     * ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement The input
     * image to feed through the network.
     *
     * @param estimationConfig Optional. See `BlazePoseTfjsEstimationConfig`
     *       documentation for detail.
     *
     * @param timestamp Optional. In milliseconds. This is useful when image is
     *     a tensor, which doesn't have timestamp info. Or to override timestamp
     *     in a video.
     *
     * @return An array of `Pose`s.
     */
    // TF.js implementation of the mediapipe pose detection pipeline.
    // ref graph:
    // https://github.com/google/mediapipe/blob/master/mediapipe/modules/pose_landmark/pose_landmark_cpu.pbtxt
    BlazePoseTfjsDetector.prototype.estimatePoses = function (image, estimationConfig, timestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var config, imageSize, image3d, poseRect, detections, firstDetection, poseLandmarks, actualLandmarks, auxiliaryLandmarks, poseScore, actualWorldLandmarks, _a, actualLandmarksFiltered, auxiliaryLandmarksFiltered, actualWorldLandmarksFiltered, poseRectFromLandmarks, keypoints, keypoints3D, pose;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        config = detector_utils_1.validateEstimationConfig(estimationConfig);
                        if (image == null) {
                            this.reset();
                            return [2 /*return*/, []];
                        }
                        this.maxPoses = config.maxPoses;
                        // User provided timestamp will override video's timestamp.
                        if (timestamp != null) {
                            this.timestamp = timestamp * constants_1.MILLISECOND_TO_MICRO_SECONDS;
                        }
                        else {
                            // For static images, timestamp should be null.
                            this.timestamp =
                                is_video_1.isVideo(image) ? image.currentTime * constants_1.SECOND_TO_MICRO_SECONDS : null;
                        }
                        imageSize = image_utils_1.getImageSize(image);
                        image3d = tf.tidy(function () { return tf.cast(image_utils_1.toImageTensor(image), 'float32'); });
                        poseRect = this.regionOfInterest;
                        if (!(poseRect == null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.detectPose(image3d)];
                    case 1:
                        detections = _b.sent();
                        if (detections.length === 0) {
                            this.reset();
                            image3d.dispose();
                            return [2 /*return*/, []];
                        }
                        firstDetection = detections[0];
                        // Calculates region of interest based on pose detection, so that can be
                        // used to detect landmarks.
                        poseRect = this.poseDetectionToRoi(firstDetection, imageSize);
                        _b.label = 2;
                    case 2: return [4 /*yield*/, this.poseLandmarksByRoi(poseRect, image3d)];
                    case 3:
                        poseLandmarks = _b.sent();
                        image3d.dispose();
                        if (poseLandmarks == null) {
                            this.reset();
                            return [2 /*return*/, []];
                        }
                        actualLandmarks = poseLandmarks.actualLandmarks, auxiliaryLandmarks = poseLandmarks.auxiliaryLandmarks, poseScore = poseLandmarks.poseScore, actualWorldLandmarks = poseLandmarks.actualWorldLandmarks;
                        _a = this.poseLandmarkFiltering(actualLandmarks, auxiliaryLandmarks, actualWorldLandmarks, imageSize), actualLandmarksFiltered = _a.actualLandmarksFiltered, auxiliaryLandmarksFiltered = _a.auxiliaryLandmarksFiltered, actualWorldLandmarksFiltered = _a.actualWorldLandmarksFiltered;
                        poseRectFromLandmarks = this.poseLandmarksToRoi(auxiliaryLandmarksFiltered, imageSize);
                        // Cache roi for next image.
                        this.regionOfInterest = poseRectFromLandmarks;
                        keypoints = actualLandmarksFiltered != null ?
                            normalized_keypoints_to_keypoints_1.normalizedKeypointsToKeypoints(actualLandmarksFiltered, imageSize) :
                            null;
                        // Add keypoint name.
                        if (keypoints != null) {
                            keypoints.forEach(function (keypoint, i) {
                                keypoint.name = constants_2.BLAZEPOSE_KEYPOINTS[i];
                            });
                        }
                        keypoints3D = actualWorldLandmarksFiltered;
                        // Add keypoint name.
                        if (keypoints3D != null) {
                            keypoints3D.forEach(function (keypoint3D, i) {
                                keypoint3D.name = constants_2.BLAZEPOSE_KEYPOINTS[i];
                            });
                        }
                        pose = { score: poseScore, keypoints: keypoints, keypoints3D: keypoints3D };
                        return [2 /*return*/, [pose]];
                }
            });
        });
    };
    BlazePoseTfjsDetector.prototype.dispose = function () {
        this.detectorModel.dispose();
        this.landmarkModel.dispose();
        tf.dispose([
            this.anchorTensor.x, this.anchorTensor.y, this.anchorTensor.w,
            this.anchorTensor.h
        ]);
    };
    BlazePoseTfjsDetector.prototype.reset = function () {
        this.regionOfInterest = null;
        this.visibilitySmoothingFilterActual = null;
        this.visibilitySmoothingFilterAuxiliary = null;
        this.landmarksSmoothingFilterActual = null;
        this.landmarksSmoothingFilterAuxiliary = null;
    };
    // Detects poses.
    // Subgraph: PoseDetectionCpu.
    // ref:
    // https://github.com/google/mediapipe/blob/master/mediapipe/modules/pose_detection/pose_detection_cpu.pbtxt
    BlazePoseTfjsDetector.prototype.detectPose = function (image) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, imageTensor, padding, imageValueShifted, _b, boxes, scores, detections, selectedDetections, newDetections;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = convert_image_to_tensor_1.convertImageToTensor(image, constants.BLAZEPOSE_DETECTOR_IMAGE_TO_TENSOR_CONFIG), imageTensor = _a.imageTensor, padding = _a.padding;
                        imageValueShifted = shift_image_value_1.shiftImageValue(imageTensor, [-1, 1]);
                        _b = detector_inference_1.detectorInference(imageValueShifted, this.detectorModel), boxes = _b.boxes, scores = _b.scores;
                        return [4 /*yield*/, tensors_to_detections_1.tensorsToDetections([scores, boxes], this.anchorTensor, constants.BLAZEPOSE_TENSORS_TO_DETECTION_CONFIGURATION)];
                    case 1:
                        detections = _c.sent();
                        return [4 /*yield*/, non_max_suppression_1.nonMaxSuppression(detections, this.maxPoses, constants.BLAZEPOSE_DETECTOR_NON_MAX_SUPPRESSION_CONFIGURATION
                                .minSuppressionThreshold, constants.BLAZEPOSE_DETECTOR_NON_MAX_SUPPRESSION_CONFIGURATION
                                .minScoreThreshold)];
                    case 2:
                        selectedDetections = _c.sent();
                        newDetections = remove_detection_letterbox_1.removeDetectionLetterbox(selectedDetections, padding);
                        tf.dispose([imageTensor, imageValueShifted, scores, boxes]);
                        return [2 /*return*/, newDetections];
                }
            });
        });
    };
    // Calculates region of interest from a detection.
    // Subgraph: PoseDetectionToRoi.
    // ref:
    // https://github.com/google/mediapipe/blob/master/mediapipe/modules/pose_landmark/pose_detection_to_roi.pbtxt
    // If detection is not null, imageSize should not be null either.
    BlazePoseTfjsDetector.prototype.poseDetectionToRoi = function (detection, imageSize) {
        var startKeypointIndex;
        var endKeypointIndex;
        // Converts pose detection into a rectangle based on center and scale
        // alignment points.
        startKeypointIndex = 0;
        endKeypointIndex = 1;
        // PoseDetectionToRoi: AlignmentPointsRectsCalculator.
        var rawRoi = calculate_alignment_points_rects_1.calculateAlignmentPointsRects(detection, imageSize, {
            rotationVectorEndKeypointIndex: endKeypointIndex,
            rotationVectorStartKeypointIndex: startKeypointIndex,
            rotationVectorTargetAngleDegree: 90
        });
        // Expands pose rect with marging used during training.
        // PoseDetectionToRoi: RectTransformationCalculation.
        var roi = transform_rect_1.transformNormalizedRect(rawRoi, imageSize, constants.BLAZEPOSE_DETECTOR_RECT_TRANSFORMATION_CONFIG);
        return roi;
    };
    // Predict pose landmarks.
    // subgraph: PoseLandmarksByRoiCpu
    // ref:
    // https://github.com/google/mediapipe/blob/master/mediapipe/modules/pose_landmark/pose_landmark_by_roi_cpu.pbtxt
    // When poseRect is not null, image should not be null either.
    BlazePoseTfjsDetector.prototype.poseLandmarksByRoi = function (poseRect, image) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, imageTensor, padding, imageValueShifted, landmarkResult, landmarkTensor, poseFlagTensor, heatmapTensor, worldLandmarkTensor, poseScore, landmarks, refinedLandmarks, adjustedLandmarks, landmarksProjected, actualLandmarks, auxiliaryLandmarks, worldLandmarks, worldLandmarksWithVisibility, projectedWorldLandmarks, actualWorldLandmarks;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = convert_image_to_tensor_1.convertImageToTensor(image, constants.BLAZEPOSE_LANDMARK_IMAGE_TO_TENSOR_CONFIG, poseRect), imageTensor = _a.imageTensor, padding = _a.padding;
                        imageValueShifted = shift_image_value_1.shiftImageValue(imageTensor, [0, 1]);
                        if (this.modelType !== 'lite' && this.modelType !== 'full' &&
                            this.modelType !== 'heavy') {
                            throw new Error('Model type must be one of lite, full or heavy,' +
                                ("but got " + this.modelType));
                        }
                        landmarkResult = this.landmarkModel.execute(imageValueShifted, [
                            'ld_3d', 'output_poseflag', 'activation_heatmap', 'world_3d'
                        ]);
                        landmarkTensor = landmarkResult[0], poseFlagTensor = landmarkResult[1], heatmapTensor = landmarkResult[2], worldLandmarkTensor = landmarkResult[3];
                        return [4 /*yield*/, poseFlagTensor.data()];
                    case 1:
                        poseScore = (_b.sent())[0];
                        // Applies a threshold to the confidence score to determine whether a pose
                        // is present.
                        if (poseScore < constants.BLAZEPOSE_POSE_PRESENCE_SCORE) {
                            tf.dispose(landmarkResult);
                            tf.dispose([imageTensor, imageValueShifted]);
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, tensors_to_landmarks_1.tensorsToLandmarks(landmarkTensor, constants.BLAZEPOSE_TENSORS_TO_LANDMARKS_CONFIG)];
                    case 2:
                        landmarks = _b.sent();
                        return [4 /*yield*/, refine_landmarks_from_heatmap_1.refineLandmarksFromHeatmap(landmarks, heatmapTensor, constants.BLAZEPOSE_REFINE_LANDMARKS_FROM_HEATMAP_CONFIG)];
                    case 3:
                        refinedLandmarks = _b.sent();
                        adjustedLandmarks = remove_landmark_letterbox_1.removeLandmarkLetterbox(refinedLandmarks, padding);
                        landmarksProjected = calculate_landmark_projection_1.calculateLandmarkProjection(adjustedLandmarks, poseRect);
                        actualLandmarks = landmarksProjected.slice(0, constants.BLAZEPOSE_NUM_KEYPOINTS);
                        auxiliaryLandmarks = landmarksProjected.slice(constants.BLAZEPOSE_NUM_KEYPOINTS, constants.BLAZEPOSE_NUM_AUXILIARY_KEYPOINTS);
                        return [4 /*yield*/, tensors_to_landmarks_1.tensorsToLandmarks(worldLandmarkTensor, constants.BLAZEPOSE_TENSORS_TO_WORLD_LANDMARKS_CONFIG)];
                    case 4:
                        worldLandmarks = _b.sent();
                        worldLandmarksWithVisibility = calculate_score_copy_1.calculateScoreCopy(landmarks, worldLandmarks, true);
                        projectedWorldLandmarks = calculate_world_landmark_projection_1.calculateWorldLandmarkProjection(worldLandmarksWithVisibility, poseRect);
                        actualWorldLandmarks = projectedWorldLandmarks.slice(0, constants.BLAZEPOSE_NUM_KEYPOINTS);
                        tf.dispose(landmarkResult);
                        tf.dispose([imageTensor, imageValueShifted]);
                        return [2 /*return*/, {
                                actualLandmarks: actualLandmarks,
                                auxiliaryLandmarks: auxiliaryLandmarks,
                                poseScore: poseScore,
                                actualWorldLandmarks: actualWorldLandmarks
                            }];
                }
            });
        });
    };
    // Calculate region of interest (ROI) from landmarks.
    // Subgraph: PoseLandmarksToRoiCpu
    // ref:
    // https://github.com/google/mediapipe/blob/master/mediapipe/modules/pose_landmark/pose_landmarks_to_roi.pbtxt
    // When landmarks is not null, imageSize should not be null either.
    BlazePoseTfjsDetector.prototype.poseLandmarksToRoi = function (landmarks, imageSize) {
        // PoseLandmarksToRoi: LandmarksToDetectionCalculator.
        var detection = landmarks_to_detection_1.landmarksToDetection(landmarks);
        // Converts detection into a rectangle based on center and scale alignment
        // points.
        // PoseLandmarksToRoi: AlignmentPointsRectsCalculator.
        var rawRoi = calculate_alignment_points_rects_1.calculateAlignmentPointsRects(detection, imageSize, {
            rotationVectorStartKeypointIndex: 0,
            rotationVectorEndKeypointIndex: 1,
            rotationVectorTargetAngleDegree: 90
        });
        // Expands pose rect with marging used during training.
        // PoseLandmarksToRoi: RectTransformationCalculator.
        var roi = transform_rect_1.transformNormalizedRect(rawRoi, imageSize, constants.BLAZEPOSE_DETECTOR_RECT_TRANSFORMATION_CONFIG);
        return roi;
    };
    // Filter landmarks temporally to reduce jitter.
    // Subgraph: PoseLandmarkFiltering
    // ref:
    // https://github.com/google/mediapipe/blob/master/mediapipe/modules/pose_landmark/pose_landmark_filtering.pbtxt
    BlazePoseTfjsDetector.prototype.poseLandmarkFiltering = function (actualLandmarks, auxiliaryLandmarks, actualWorldLandmarks, imageSize) {
        var actualLandmarksFiltered;
        var auxiliaryLandmarksFiltered;
        var actualWorldLandmarksFiltered;
        if (this.timestamp == null || !this.enableSmoothing) {
            actualLandmarksFiltered = actualLandmarks;
            auxiliaryLandmarksFiltered = auxiliaryLandmarks;
            actualWorldLandmarksFiltered = actualWorldLandmarks;
        }
        else {
            var auxDetection = landmarks_to_detection_1.landmarksToDetection(auxiliaryLandmarks);
            var objectScaleROI = calculate_alignment_points_rects_1.calculateAlignmentPointsRects(auxDetection, imageSize, {
                rotationVectorEndKeypointIndex: 0,
                rotationVectorStartKeypointIndex: 1,
                rotationVectorTargetAngleDegree: 90
            });
            // Smoothes pose landmark visibilities to reduce jitter.
            if (this.visibilitySmoothingFilterActual == null) {
                this.visibilitySmoothingFilterActual = new visibility_smoothing_1.LowPassVisibilityFilter(constants.BLAZEPOSE_VISIBILITY_SMOOTHING_CONFIG);
            }
            actualLandmarksFiltered =
                this.visibilitySmoothingFilterActual.apply(actualLandmarks);
            if (this.visibilitySmoothingFilterAuxiliary == null) {
                this.visibilitySmoothingFilterAuxiliary = new visibility_smoothing_1.LowPassVisibilityFilter(constants.BLAZEPOSE_VISIBILITY_SMOOTHING_CONFIG);
            }
            auxiliaryLandmarksFiltered =
                this.visibilitySmoothingFilterAuxiliary.apply(auxiliaryLandmarks);
            actualWorldLandmarksFiltered =
                this.visibilitySmoothingFilterActual.apply(actualWorldLandmarks);
            // Smoothes pose landmark coordinates to reduce jitter.
            if (this.landmarksSmoothingFilterActual == null) {
                this.landmarksSmoothingFilterActual = new keypoints_smoothing_1.KeypointsSmoothingFilter(constants.BLAZEPOSE_LANDMARKS_SMOOTHING_CONFIG_ACTUAL);
            }
            actualLandmarksFiltered = this.landmarksSmoothingFilterActual.apply(actualLandmarksFiltered, this.timestamp, imageSize, true /* normalized */, objectScaleROI);
            if (this.landmarksSmoothingFilterAuxiliary == null) {
                this.landmarksSmoothingFilterAuxiliary = new keypoints_smoothing_1.KeypointsSmoothingFilter(constants.BLAZEPOSE_LANDMARKS_SMOOTHING_CONFIG_AUXILIARY);
            }
            auxiliaryLandmarksFiltered = this.landmarksSmoothingFilterAuxiliary.apply(auxiliaryLandmarksFiltered, this.timestamp, imageSize, true /* normalized */, objectScaleROI);
            // Smoothes pose world landmark coordinates to reduce jitter.
            if (this.worldLandmarksSmoothingFilterActual == null) {
                this.worldLandmarksSmoothingFilterActual = new keypoints_smoothing_1.KeypointsSmoothingFilter(constants.BLAZEPOSE_WORLD_LANDMARKS_SMOOTHING_CONFIG_ACTUAL);
            }
            actualWorldLandmarksFiltered =
                this.worldLandmarksSmoothingFilterActual.apply(actualWorldLandmarks, this.timestamp);
        }
        return {
            actualLandmarksFiltered: actualLandmarksFiltered,
            auxiliaryLandmarksFiltered: auxiliaryLandmarksFiltered,
            actualWorldLandmarksFiltered: actualWorldLandmarksFiltered
        };
    };
    return BlazePoseTfjsDetector;
}());
/**
 * Loads the BlazePose model.
 *
 * @param modelConfig ModelConfig object that contains parameters for
 * the BlazePose loading process. Please find more details of each parameters
 * in the documentation of the `BlazePoseTfjsModelConfig` interface.
 */
function load(modelConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var config, detectorFromTFHub, landmarkFromTFHub, _a, detectorModel, landmarkModel;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    config = detector_utils_1.validateModelConfig(modelConfig);
                    detectorFromTFHub = (config.detectorModelUrl.indexOf('https://tfhub.dev') > -1);
                    landmarkFromTFHub = (config.landmarkModelUrl.indexOf('https://tfhub.dev') > -1);
                    return [4 /*yield*/, Promise.all([
                            tfconv.loadGraphModel(config.detectorModelUrl, { fromTFHub: detectorFromTFHub }),
                            tfconv.loadGraphModel(config.landmarkModelUrl, { fromTFHub: landmarkFromTFHub })
                        ])];
                case 1:
                    _a = _b.sent(), detectorModel = _a[0], landmarkModel = _a[1];
                    return [2 /*return*/, new BlazePoseTfjsDetector(detectorModel, landmarkModel, config.enableSmoothing, config.modelType)];
            }
        });
    });
}
exports.load = load;
//# sourceMappingURL=detector.js.map