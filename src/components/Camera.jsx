import React, { useRef, useEffect } from "react";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-wasm";
import * as poseDetection from "@tensorflow-models/pose-detection";
import Webcam from "react-webcam";
import { drawResults } from "../utils/drawUtils";

const videoDim = {
  width: 1280,
  height: 720,
};

const videoConstraints = {
  width: 1280,
  height: 720,
}

let rafId;
let webcam, detector;
let canvas, ctx;

export default function Camera() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log("LOADING ...");
    run();
    console.log("DONE LOADING.");
  });
  
  async function run() {
    setupCamera();
    await setupDetector();
    renderPrediction();
  }

  function setupCamera() {
    webcam = webcamRef.current;
    webcam.width = videoDim.width
    webcam.height = videoDim.height
    console.log('webcam');
    console.log(webcam);
    
    canvas = canvasRef.current
    canvas.width = videoDim.width
    canvas.height = videoDim.height
    console.log('canvas');
    console.log(canvas);
    
    ctx = canvas.getContext("2d");
    ctx.width = videoDim.width
    ctx.height = videoDim.height
    ctx.translate(videoDim.width, 0)
    ctx.scale(-1, 1)
    console.log('ctx');
    console.log(ctx);
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

  // Loop to render new skeleton pose and video every frame
  async function renderPrediction() {
    await renderResult();
    rafId = requestAnimationFrame(renderPrediction);
    if (rafId) {
    }
  }

  async function renderResult() {
    if (!detector) return;
    const poses = await detect(detector);
    drawCanvas(poses)
  }

  async function detect(detector) {
    if (typeof webcam === "undefined" || webcam === null) return;
    if (webcam.video.readyState !== 4) return;
    if (!detector) return;

    return await detector.estimatePoses(webcam.video);
  }

  function drawCanvas(poses) {
    ctx.drawImage(webcam.video, 0, 0, videoDim.width, videoDim.height);
    drawResults(poses, ctx, 0);
  }

  return (
    <div style={{ position: "relative˝" }}>
      <canvas
        ref={canvasRef}
        width={videoDim.width}
        height={videoDim.height}
      />
      <Webcam
        ref={webcamRef}
        playsInline
        width={videoDim.width}
        height={videoDim.height}
        videoConstraints={videoConstraints}
        style={{
          visibility: "hidden"
        }}
      />
    </div>
  );
}
