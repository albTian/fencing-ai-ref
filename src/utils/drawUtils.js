import * as poseDetection from '@tensorflow-models/pose-detection'

const COLOR_PALETTE = [
    '#ffffff', '#800000', '#469990', '#e6194b', '#42d4f4', '#fabed4', '#aaffc3',
    '#9a6324', '#000075', '#f58231', '#4363d8', '#ffd8b1', '#dcbeff', '#808000',
    '#ffe119', '#911eb4', '#bfef45', '#f032e6', '#3cb44b', '#a9a9a9'
];

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
        drawSkeleton(pose.keypoints, pose.id, ctx, scoreThreshold);
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
        circle.arc(keypoint.x, keypoint.y, 3, 0, 2 * Math.PI);
        ctx.fill(circle);
        ctx.stroke(circle);
    }
}

/**
   * Draw the skeleton of a body on the video.
   * @param keypoints A list of keypoints.
   * @param poseId The ID of the pose
   */
function drawSkeleton(keypoints, poseId, ctx, scoreThreshold) {
    // Each poseId is mapped to a color in the color palette.
    const color = poseId != null ?
        COLOR_PALETTE[poseId % 20] :
        'White';
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet).forEach(([
        i, j
    ]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];

        // If score is null, just show the keypoint.
        const score1 = kp1.score != null ? kp1.score : 1;
        const score2 = kp2.score != null ? kp2.score : 1;

        if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.stroke();
        }
    });
}

export { drawResults }