/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
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
import { MirrorPad } from '@tensorflow/tfjs-core';
import { CppDType } from './types';
// Must match enum in MirrorPad.cc
var MirrorPaddingMode;
(function (MirrorPaddingMode) {
    MirrorPaddingMode[MirrorPaddingMode["reflect"] = 0] = "reflect";
    MirrorPaddingMode[MirrorPaddingMode["symmetric"] = 1] = "symmetric";
})(MirrorPaddingMode || (MirrorPaddingMode = {}));
let wasmMirrorPad;
function setup(backend) {
    wasmMirrorPad = backend.wasm.cwrap(MirrorPad, null /* void */, [
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
function mirrorPad(args) {
    const { inputs: { x }, backend, attrs: { paddings, mode } } = args;
    const outShape = paddings.map((p, i) => p[0] /* beforePad */ + x.shape[i] + p[1] /* afterPad */);
    const xId = backend.dataIdMap.get(x.dataId).id;
    const out = backend.makeOutput(outShape, x.dtype);
    const outId = backend.dataIdMap.get(out.dataId).id;
    const xShapeBytes = new Uint8Array(new Int32Array(x.shape).buffer);
    const prePaddingsFlat = paddings.map(padTuple => padTuple[0]);
    const postPaddingsFlat = paddings.map(padTuple => padTuple[1]);
    const prePaddingsBytes = new Uint8Array(new Int32Array(prePaddingsFlat).buffer);
    const postPaddingsBytes = new Uint8Array(new Int32Array(postPaddingsFlat).buffer);
    wasmMirrorPad(xId, xShapeBytes, x.shape.length, CppDType[x.dtype], prePaddingsBytes, postPaddingsBytes, MirrorPaddingMode[mode], outId);
    return out;
}
export const mirrorPadConfig = {
    kernelName: MirrorPad,
    backendName: 'wasm',
    kernelFunc: mirrorPad,
    setupFunc: setup
};
//# sourceMappingURL=MirrorPad.js.map