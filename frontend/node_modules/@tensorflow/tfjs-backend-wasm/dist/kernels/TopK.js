/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
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
import { TopK } from '@tensorflow/tfjs-core';
import { CppDType } from './types';
let wasmTopK;
function setup(backend) {
    wasmTopK = backend.wasm.cwrap(TopK, null /* void */, [
        'number',
        'array',
        'number',
        'number',
        'number',
        'bool',
        'number',
        'number',
    ]);
}
export const topk = ({ inputs, backend, attrs }) => {
    const { x } = inputs;
    const { k, sorted } = attrs;
    const xId = backend.dataIdMap.get(x.dataId).id;
    const xShapeBytes = new Uint8Array(new Int32Array(x.shape).buffer);
    const outputShape = x.shape.slice();
    outputShape[outputShape.length - 1] = k;
    const outValues = backend.makeOutput(outputShape, x.dtype);
    const outValuesId = backend.dataIdMap.get(outValues.dataId).id;
    const outIndices = backend.makeOutput(outputShape, 'int32');
    const outIndicesId = backend.dataIdMap.get(outIndices.dataId).id;
    wasmTopK(xId, xShapeBytes, x.shape.length, CppDType[x.dtype], k, sorted, outValuesId, outIndicesId);
    return [outValues, outIndices];
};
export const topKConfig = {
    kernelName: TopK,
    backendName: 'wasm',
    setupFunc: setup,
    kernelFunc: topk,
};
//# sourceMappingURL=TopK.js.map