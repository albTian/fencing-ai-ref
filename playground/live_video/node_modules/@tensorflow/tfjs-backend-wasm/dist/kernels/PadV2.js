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
import { PadV2 } from '@tensorflow/tfjs-core';
import { CppDType } from './types';
let wasmPadV2;
function setup(backend) {
    wasmPadV2 = backend.wasm.cwrap(PadV2, null /* void */, [
        'number',
        'array',
        'number',
        'number',
        'array',
        'array',
        'number',
        'number',
    ]);
}
function pad(args) {
    const { inputs: { x }, backend, attrs: { paddings, constantValue } } = args;
    const outShape = paddings.map((p, i) => p[0] /* beforePad */ + x.shape[i] + p[1] /* afterPad */);
    const xId = backend.dataIdMap.get(x.dataId).id;
    const out = backend.makeOutput(outShape, x.dtype);
    const outId = backend.dataIdMap.get(out.dataId).id;
    const xShapeBytes = new Uint8Array(new Int32Array(x.shape).buffer);
    const prePaddingsFlat = paddings.map(padTuple => padTuple[0]);
    const postPaddingsFlat = paddings.map(padTuple => padTuple[1]);
    const prePaddingsBytes = new Uint8Array(new Int32Array(prePaddingsFlat).buffer);
    const postPaddingsBytes = new Uint8Array(new Int32Array(postPaddingsFlat).buffer);
    wasmPadV2(xId, xShapeBytes, x.shape.length, CppDType[x.dtype], prePaddingsBytes, postPaddingsBytes, constantValue, outId);
    return out;
}
export const padV2Config = {
    kernelName: PadV2,
    backendName: 'wasm',
    kernelFunc: pad,
    setupFunc: setup
};
//# sourceMappingURL=PadV2.js.map