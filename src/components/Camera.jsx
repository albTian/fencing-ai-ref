import React, { useRef, useEffect } from "react";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-wasm";
import * as poseDetection from "@tensorflow-models/pose-detection";
import Webcam from "react-webcam";
import { drawResults } from "../utils/drawUtils";

const videoDim = {
  width: 640,
  height: 380,
};

let rafId;
let camera, detector;
let ctx;

export default function Camera() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  function setupCamera() {
    camera = webcamRef.current;
    const video = camera.video;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
  
    camera.video.width = videoWidth;
    camera.video.height = videoHeight;

    // canvas.width = videoWidth
    // canvas.height = videoHeight
    ctx = canvasRef.current.getContext("2d");
    console.log("ctx");
    console.log(ctx);
    ctx.translate(videoDim.width, 0)
    ctx.scale(-1, 1)
  }

  async function setupDetector() {
    const model = poseDetection.SupportedModels.MoveNet;
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
      minPoseScore: 0.2,
      enableTracking: true,
    };
    detector = await poseDetection.createDetector(model, detectorConfig);
  }

  async function detect(detector) {
    if (typeof camera === "undefined" || camera === null) return;
    if (camera.video.readyState !== 4) return;
    if (!detector) return;

    return await detector.estimatePoses(camera.video);
  }

  function drawCanvas(poses, videoWidth, videoHeight) {
    ctx.drawImage(camera.video, 0, 0, videoWidth, videoHeight);
    drawResults(poses, ctx, 0);
  }

  async function renderResult() {
    if (!detector) return;
    const poses = await detect(detector);
    drawCanvas(poses, camera.video.videoWidth, camera.video.videoHeight)
  }

  // Loop to render new skeleton pose and video every frame
  async function renderPrediction() {
    await renderResult();
    rafId = requestAnimationFrame(renderPrediction);
    if (rafId) {
    }
  }

  async function run() {
    setupCamera();
    await setupDetector();
    renderPrediction();
  }

  useEffect(() => {
    console.log("LOADING ...");
    run();
    console.log("DONE LOADING.");
  });
  return (
    <div style={{ position: "relative˝" }}>
      <canvas
        // id="output"
        ref={canvasRef}
        width={videoDim.width}
        height={videoDim.height}
      />
      <Webcam
        // id="video"
        ref={webcamRef}
        playsInline
        style={{
          WebkitTransform: "scaleX(-1)",
          transform: "scaleX(-1)",
          visibility: "hidden",
          width: "auto",
          height: "auto",
        }}
      />
    </div>
  );
}
