import { Detection } from './interfaces/shape_interfaces';
export declare function nonMaxSuppression(detections: Detection[], maxPoses: number, iouThreshold: number, scoreThreshold: number): Promise<Detection[]>;
