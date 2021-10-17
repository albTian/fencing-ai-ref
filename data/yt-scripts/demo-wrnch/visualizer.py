# Copyright (c) 2019 wrnch Inc.
# All rights reserved

import cv2
import json
import numpy as np
from copy import copy
from wrcloud import wrcloud as wr

WRNCH_BLUE = (38.25, 168.3, 226.95)
RED = (229, 22.5, 22.5)
FILLED = -1
AA_LINE = 16
LOGO_PATH = "wrnch_logo-09.png"

class Visualizer:
    # dictionary of /details option keywords and corresponding /jobs/id json keywords
    TRANSLATION = {
        "hands": "hand_pose",
        "heads": "head_pose",
        "est_3d": "pose_3d_raw"
    }

    def __init__(self, video_source=0, json_path=None, processed=False, width=640, height=360):
        # See https://devportal.wrnch.ai/wrnchcloud/api_docs#get-job-results for JSON response format
        def load_data_from_json():
            data = {}
            with open(json_path) as json_file:
                data = json.load(json_file)
            return data

        self.video_source = video_source
        self.width = width
        self.height = height
        self.path = json_path
        self.processed = processed
        self.current_frame = 0
        if json_path is not None:
            self.displaying_skeleton = True
            self.data = load_data_from_json()
            self.frame_count = len(self.data['frames'])
            self.selected_options = {'pose2d'}
        else:
            self.displaying_skeleton = False
            self.data = {}
        self.updated_options = False
        self.dispatcher = {
            "pose_3d_raw": [self._pose3d, wr.wrCloud.get_default_joint_definition('pose3d_raw')],
            "hand_pose": [self._hands, wr.wrCloud.get_default_joint_definition('hands')],
            "head_pose": [self._head, wr.wrCloud.get_default_joint_definition('head')],
            "pose2d": [self._pose2d, wr.wrCloud.get_default_joint_definition()]
        }
        # Setup watermark
        self.watermark = cv2.imread(LOGO_PATH, cv2.IMREAD_UNCHANGED)
        self.watermark = cv2.resize(self.watermark,(173, 55))
        (self.wH, self.wW) = self.watermark.shape[:2]
        # Alpha masking to remove background
        (B, G, R, A) = cv2.split(self.watermark)
        B = cv2.bitwise_and(B,B, mask=A)
        G = cv2.bitwise_and(G,G, mask=A)
        R = cv2.bitwise_and(R,R, mask=A)
        self.watermark = cv2.merge([B, G, R, A])
        
    def __del__(self):
        self.close_cam()

    def close_cam(self):
        if self.vid.isOpened():
            self.vid.release()
            self.current_frame = 0

    def open_cam(self):
        self.vid = cv2.VideoCapture(self.video_source)
        if not self.vid.isOpened():
            raise ValueError("Unable to open video source", self.video_source)

    def get_frame(self):
        if self.vid.isOpened():
            ret, frame = self.vid.read()
            if ret:
                # Resizing done for video playback optimization
                if self.processed:
                    if self.vid.get(cv2.CAP_PROP_FRAME_COUNT) <= 1:  # Image
                        self.width = self.vid.get(cv2.CAP_PROP_FRAME_WIDTH)
                        self.height = self.vid.get(cv2.CAP_PROP_FRAME_HEIGHT)
                    else:
                        frame = cv2.resize(frame, (self.width, self.height))
                    frame = self.add_watermark(frame) if self.displaying_skeleton else frame
                # Webcam footage must be flipped
                self.frame = frame if self.processed else cv2.flip(frame, 1)
                
                self.frame = cv2.cvtColor(self.frame, cv2.COLOR_BGR2RGB)
                if self.displaying_skeleton:
                    self.backup_frame = copy(
                        self.frame) if self.frame_count == 1 else None
                    self.display_skeleton()
                return (ret, self.frame)
            elif self.displaying_skeleton and self.updated_options and self.frame_count == 1:  # JSON image
                self.current_frame = 0
                self.frame = copy(self.backup_frame)
                self.updated_options = False
                self.display_skeleton()
                return (True, self.frame)
            elif self.vid.get(cv2.CAP_PROP_FRAME_COUNT) > 1:  # Video looping
                self.current_frame = 0
                self.vid.set(cv2.CAP_PROP_POS_MSEC, 0)
                return (ret, None)
        return (False, None)

    def draw_points(self, points, colour=WRNCH_BLUE, joint_size=3):
        for i in range(len(points)//2):
            x = int(points[2 * i] * self.width)
            y = int(points[2 * i + 1] * self.height)

            if x >= 0 and y >= 0:
                cv2.circle(self.frame, (x, y), joint_size,
                           colour, FILLED, AA_LINE)

    def draw_points3d(self, points, colour=WRNCH_BLUE, joint_size=8):
        for i in range(len(points)//3):
            x = int(points[3 * i] * self.width)
            y = int(points[3 * i + 1] * self.height)
            # z = np.float32(points[3 * i + 2] * self.height) # Depth is store here

            if x >= 0 and y >= 0:
                cv2.circle(self.frame, (x, y), joint_size,
                           colour, FILLED, AA_LINE)

    def draw_lines(self, points, bone_pairs, colour=WRNCH_BLUE, bone_width=2):
        for joint_idx_0, joint_idx_1 in bone_pairs:
            x1 = int(points[joint_idx_0 * 2] * self.width)
            y1 = int(points[joint_idx_0 * 2 + 1] * self.height)
            x2 = int(points[joint_idx_1 * 2] * self.width)
            y2 = int(points[joint_idx_1 * 2 + 1] * self.height)

            if x1 > 0 and x2 > 0 and y1 > 0 and y2 > 0:
                cv2.line(self.frame, (x1, y1), (x2, y2), colour,
                         bone_width, AA_LINE)

    def display_skeleton(self):
        frame = self.data['frames'][self.current_frame]
        for person in frame['persons']:
            for option in person:
                if option in self.selected_options:
                    json_data = person[option]
                    command = self.dispatcher[option]
                    bone_pairs = command[1].get_bone_pairs()
                    command[0](json_data, bone_pairs)
        self.current_frame += 1

    def _pose2d(self, pose2d, bone_pairs=None):
        joints = pose2d['joints']
        self.draw_points(joints)
        self.draw_lines(joints, bone_pairs)

    def _pose3d(self, pose3d, bone_pairs=None):
        positions = pose3d['positions']
        self.draw_points3d(positions, colour=RED)

    def _head(self, head, bone_pairs=None):
        self.draw_points(head['landmarks'], joint_size=2, colour=RED)

    def _hands(self, hands, bone_pairs=None):
        for hand in hands.values():
            joints = hand['joints']
            self.draw_points(joints, joint_size=3, colour=RED)
            self.draw_lines(joints, bone_pairs, bone_width=2, colour=RED)

    def save_image(self, filename):
        return cv2.imwrite(filename, cv2.cvtColor(self.frame, cv2.COLOR_RGB2BGR))
    
    def add_watermark(self, frame):
        (h, w) = frame.shape[:2]
        frame = np.dstack([frame, np.ones((h, w), dtype="uint8")*255])
        overlay = np.zeros((h, w, 4), dtype="uint8")
        overlay[h - self.wH - 10:h - 10, w - self.wW - 10:w - 10] = self.watermark
        output = frame.copy()
        cv2.addWeighted(overlay, 1.0,output, 1.0, 0, output)
        return output