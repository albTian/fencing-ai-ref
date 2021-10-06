import * as poseDetection from '@tensorflow-models/pose-detection'

/**
 * Draw the keypoints and skeleton on the video.
 * @param poses A list of poses to render.
 * @param ctx The context object to draw on
 * @param scoreThreshold The minimum score needed
 */
function drawResults(poses, ctx, scoreThreshold) {
    if (!poses || !ctx) return
    for (const pose of poses) {
        drawResult(pose, ctx, scoreThreshold);
    }
}

/**
  * Draw the keypoints and skeleton on the video.
  * @param pose A pose with keypoints to render.
  */
function drawResult(pose, ctx, scoreThreshold) {
    if (pose.keypoints != null) {
        drawKeypoints(pose.keypoints, ctx, scoreThreshold);
        // drawSkeleton(pose.keypoints, pose.id);
    }
}

/**
 * Draw the keypoints on the video.
 * @param keypoints A list of keypoints.
 */
function drawKeypoints(keypoints, ctx, scoreThreshold) {
    // Hardcoding MoveNet in
    const keypointInd = poseDetection.util.getKeypointIndexBySide(poseDetection.SupportedModels.MoveNet)
    ctx.fillStyle = 'Red';
    ctx.strokeStyle = 'White';
    ctx.lineWidth = 2;

    for (const i of keypointInd.middle) {
        drawKeypoint(keypoints[i], ctx, scoreThreshold);
    }

    ctx.fillStyle = 'Green';
    for (const i of keypointInd.left) {
        drawKeypoint(keypoints[i], ctx, scoreThreshold);
    }

    ctx.fillStyle = 'Orange';
    for (const i of keypointInd.right) {
        drawKeypoint(keypoints[i], ctx, scoreThreshold);
    }
}

function drawKeypoint(keypoint, ctx, scoreThreshold) {
    // If score is null, just show the keypoint.
    const score = keypoint.score != null ? keypoint.score : 1;
    const minScore = scoreThreshold || 0;

    if (score >= minScore) {
        const circle = new Path2D();
        circle.arc(keypoint.x, keypoint.y, 2, 0, 2 * Math.PI);
        ctx.fill(circle);
        ctx.stroke(circle);
    }
}

export { drawResults }