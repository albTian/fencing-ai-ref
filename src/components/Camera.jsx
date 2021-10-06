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

    // eslint-disable-next-line
    ctx = canvasRef.current.getContext("2d");
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

    const video = camera.video;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    camera.video.width = videoWidth;
    camera.video.height = videoHeight;

    const poses = await detector.estimatePoses(video);
    console.log(poses);
    drawCanvas(poses, videoWidth, videoHeight, canvasRef);
  }

  function drawCanvas(poses, videoWidth, videoHeight, canvas) {
    const ctx = canvas.current.getContext("2d");
    canvas.current.videoWidth = videoWidth;
    canvas.current.videoHeight = videoHeight;

    ctx.drawImage(camera.video, 0, 0, videoWidth, videoHeight);
    drawResults(poses, ctx, 0);
  }

  async function renderResult() {
    if (!detector) return;
    await detect(detector);
  }

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

  // return (
  //   <div style={{ position: "relative" }}>
  //     <Webcam
  //       ref={webcamRef}
  //       mirrored
  //       width={videoDim.width}
  //       height={videoDim.height}
  //       style={{
  //         position: "absolute",
  //         width: videoDim.width,
  //         height: videoDim.height,
  //         left: 0,
  //         top: 0,
  //       }}
  //     />
  //     <canvas
  //       ref={canvasRef}
  //       width={videoDim.width}
  //       height={videoDim.height}
  //       style={{
  //         position: "absolute",
  //         width: videoDim.width,
  //         height: videoDim.height,
  //         left: 0,
  //         top: 0,
  //       }}
  //     />
  //   </div>
  // );
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
