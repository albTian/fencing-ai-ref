import React, { useRef, useEffect } from "react";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-wasm";
import * as poseDetection from "@tensorflow-models/pose-detection";
import Webcam from "react-webcam";
import DrawUtil from "../utils/drawUtils";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "environment",
};

const MIN_SCORE = 0.25;

let rafId;
let webcam, detector;
let canvas, ctx;
let drawer;

export default function Camera() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    run();
    // eslint-disable-next-line
  }, []);

  async function run() {
    console.log("loading...");
    setupCamera();
    await setupDetector();
    await renderPrediction();
    console.log("done loading");
  }

  function setupCamera() {
    webcam = webcamRef.current;

    canvas = canvasRef.current;
    ctx = canvas.getContext("2d");
    ctx.translate(videoConstraints.width, 0);
    ctx.scale(-1, 1);

    drawer = new DrawUtil(ctx, MIN_SCORE);
  }

  async function setupDetector() {
    const model = poseDetection.SupportedModels.MoveNet;
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
      minPoseScore: MIN_SCORE,
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
    drawCanvas(poses);
  }

  async function detect(detector) {
    if (typeof webcam === "undefined" || webcam === null) return;
    if (webcam.video.readyState !== 4) return;
    if (!detector) return;

    return await detector.estimatePoses(webcam.video);
  }

  function drawCanvas(poses) {
    ctx.drawImage(
      webcam.video,
      0,
      0,
      videoConstraints.width,
      videoConstraints.height
    );
    // drawResults(poses, ctx, MIN_SCORE);
    drawer.drawResults(poses, ctx, MIN_SCORE);
  }

  return (
    <div
      style={{ position: "relative", maxHeight: "100vh", overflow: "hidden" }}
    >
      <canvas
        ref={canvasRef}
        width={videoConstraints.width}
        height={videoConstraints.height}
      />
      <Webcam
        ref={webcamRef}
        playsInline
        width={videoConstraints.width}
        height={videoConstraints.height}
        videoConstraints={videoConstraints}
        style={{
          visibility: "hidden",
        }}
      />
    </div>
  );
}
