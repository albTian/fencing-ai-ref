import * as poseDetection from '@tensorflow-models/pose-detection'

const COLOR_PALETTE = [
    '#ffffff', '#800000', '#469990', '#e6194b', '#42d4f4', '#fabed4', '#aaffc3',
    '#9a6324', '#000075', '#f58231', '#4363d8', '#ffd8b1', '#dcbeff', '#808000',
    '#ffe119', '#911eb4', '#bfef45', '#f032e6', '#3cb44b', '#a9a9a9'
];

// What are we prop drilling?
// ctx, scoreThreshold

class DrawUtil {
    constructor(ctx, scoreThreshold) {
        this.ctx = ctx
        this.scoreThreshold = scoreThreshold
    }



    /**
     * Draw the keypoints and skeleton on the video.
     * @param poses A list of poses to render.
     */
    drawResults(poses) {
        if (!poses || !this.ctx) return
        for (const pose of poses) {
            this.drawResult(pose);
        }
    }

    /**
      * Draw the keypoints and skeleton on the video.
      * @param pose A pose with keypoints to render.
      */
    drawResult(pose) {
        if (pose.keypoints != null) {
            this.drawKeypoints(pose.keypoints, pose.id);
            this.drawSkeleton(pose.keypoints, pose.id);
        }
    }

    /**
     * Draw the keypoints on the video.
     * @param keypoints A list of keypoints.
     */
    drawKeypoints(keypoints, poseId) {
        // Hardcoding MoveNet in
        const keypointInd = poseDetection.util.getKeypointIndexBySide(poseDetection.SupportedModels.MoveNet)
        this.ctx.fillStyle = 'Red';
        this.ctx.strokeStyle = poseId != null ?
            COLOR_PALETTE[poseId % 20] :
            'White';;
        this.ctx.lineWidth = 2;

        for (const i of keypointInd.middle) {
            this.drawKeypoint(keypoints[i]);
        }

        this.ctx.fillStyle = 'Green';
        for (const i of keypointInd.left) {
            this.drawKeypoint(keypoints[i]);
        }

        this.ctx.fillStyle = 'Orange';
        for (const i of keypointInd.right) {
            this.drawKeypoint(keypoints[i]);
        }
    }

    drawKeypoint(keypoint) {
        // If score is null, just show the keypoint.
        const score = keypoint.score != null ? keypoint.score : 1;

        if (score >= this.scoreThreshold) {
            const circle = new Path2D();
            circle.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
            this.ctx.fill(circle);
            this.ctx.stroke(circle);
        }
    }

    /**
       * Draw the skeleton of a body on the video.
       * @param keypoints A list of keypoints.
       * @param poseId The ID of the pose
       */
    drawSkeleton(keypoints, poseId) {
        // Each poseId is mapped to a color in the color palette.
        const color = poseId != null ?
            COLOR_PALETTE[poseId % 20] :
            'White';
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;

        poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet).forEach(([
            i, j
        ]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];

            // If score is null, just show the keypoint.
            const score1 = kp1.score != null ? kp1.score : 1;
            const score2 = kp2.score != null ? kp2.score : 1;

            if (score1 >= this.scoreThreshold && score2 >= this.scoreThreshold) {
                this.ctx.beginPath();
                this.ctx.moveTo(kp1.x, kp1.y);
                this.ctx.lineTo(kp2.x, kp2.y);
                this.ctx.stroke();
            }
        });
    }
}

export default DrawUtil