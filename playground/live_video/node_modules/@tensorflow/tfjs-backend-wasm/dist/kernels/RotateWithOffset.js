/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import { RotateWithOffset } from '@tensorflow/tfjs-core';
import { backend_util } from '@tensorflow/tfjs-core';
let wasmRotate;
function setup(backend) {
    wasmRotate = backend.wasm.cwrap(RotateWithOffset, null /* void */, [
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
        'number',
        'array',
        'number',
        'number',
    ]);
}
export function rotateWithOffset(args) {
    const { inputs, backend, attrs } = args;
    const { image } = inputs;
    const { radians, fillValue, center } = attrs;
    const out = backend.makeOutput(image.shape, image.dtype);
    const imageId = backend.dataIdMap.get(image.dataId).id;
    const outId = backend.dataIdMap.get(out.dataId).id;
    const [batch, imageHeight, imageWidth, numChannels] = image.shape;
    const [centerX, centerY] = backend_util.getImageCenter(center, imageHeight, imageWidth);
    const fillIsBlack = fillValue === 0;
    const fullOpacityValue = 255;
    const fillValues = typeof fillValue === 'number' ?
        [fillValue, fillValue, fillValue, fillIsBlack ? 0 : fullOpacityValue] :
        [...fillValue, fullOpacityValue];
    const fillBytes = new Uint8Array(new Int32Array(fillValues).buffer);
    wasmRotate(imageId, batch, imageHeight, imageWidth, numChannels, radians, centerX, centerY, fillBytes, fillValues.length, outId);
    return out;
}
export const rotateWithOffsetConfig = {
    kernelName: RotateWithOffset,
    backendName: 'wasm',
    kernelFunc: rotateWithOffset,
    setupFunc: setup
};
//# sourceMappingURL=RotateWithOffset.js.map