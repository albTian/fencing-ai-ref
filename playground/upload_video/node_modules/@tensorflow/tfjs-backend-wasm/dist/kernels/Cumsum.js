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
import { backend_util, Cumsum, util } from '@tensorflow/tfjs-core';
import { CppDType } from './types';
import { transpose } from './Transpose';
let wasmCumsum;
function setup(backend) {
    wasmCumsum = backend.wasm.cwrap(Cumsum, null /* void */, [
        'number',
        'number',
        'number',
        'number',
        'number',
        'number' // dtype
    ]);
}
export function cumsum(args) {
    const { inputs, backend, attrs } = args;
    const { x } = inputs;
    const { axis, exclusive, reverse } = attrs;
    const xRank = x.shape.length;
    util.assert(x.dtype === 'float32' || x.dtype === 'int32', () => `cumsum does not support ${x.dtype} tensors in the WASM backend`);
    // permute required axis to inner most axis
    const permutation = backend_util.getAxesPermutation([axis], xRank);
    let permutedX = x;
    if (permutation !== null) {
        permutedX = transpose({ inputs: { x }, attrs: { perm: permutation }, backend });
    }
    const permutedAxis = backend_util.getInnerMostAxes(1, xRank)[0];
    backend_util.assertAxesAreInnerMostDims('cumsum', [permutedAxis], xRank);
    const permutedOut = backend.makeOutput(permutedX.shape, permutedX.dtype);
    const finalDim = permutedX.shape[permutedAxis];
    const permutedXId = backend.dataIdMap.get(permutedX.dataId).id;
    const permutedOutId = backend.dataIdMap.get(permutedOut.dataId).id;
    wasmCumsum(permutedXId, exclusive ? 1 : 0, reverse ? 1 : 0, finalDim, permutedOutId, CppDType[x.dtype]);
    // transpose data back if permuted
    let out = permutedOut;
    if (permutation !== null) {
        const undoPermutation = backend_util.getUndoAxesPermutation(permutation);
        out = transpose({ inputs: { x: permutedOut }, attrs: { perm: undoPermutation }, backend });
        backend.disposeData(permutedX.dataId);
        backend.disposeData(permutedOut.dataId);
    }
    return out;
}
export const cumsumConfig = {
    kernelName: Cumsum,
    backendName: 'wasm',
    setupFunc: setup,
    kernelFunc: cumsum
};
//# sourceMappingURL=Cumsum.js.map