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
import { InputResolution } from '../../types';
export interface ImageToTensorConfig {
    inputResolution: InputResolution;
    keepAspectRatio?: boolean;
}
export interface VelocityFilterConfig {
    windowSize?: number;
    velocityScale?: number;
    minAllowedObjectScale?: number;
    disableValueScaling?: boolean;
}
export interface OneEuroFilterConfig {
    frequency?: number;
    minCutOff?: number;
    beta?: number;
    derivateCutOff?: number;
    thresholdCutOff?: number;
    thresholdBeta?: number;
    minAllowedObjectScale?: number;
    disableValueScaling?: boolean;
}
export interface KeypointsSmoothingConfig {
    velocityFilter?: VelocityFilterConfig;
    oneEuroFilter?: OneEuroFilterConfig;
}
export interface TrackerConfig {
    maxTracks: number;
    maxAge: number;
    minSimilarity: number;
    keypointTrackerParams?: KeypointTrackerConfig;
    boundingBoxTrackerParams?: BoundingBoxTrackerConfig;
}
export interface KeypointTrackerConfig {
    keypointConfidenceThreshold: number;
    keypointFalloff: number[];
    minNumberOfKeypoints: number;
}
export interface BoundingBoxTrackerConfig {
}
