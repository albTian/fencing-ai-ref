## Cuts the videos into a set of short clips where each actual hit happens. These clips are used by the data_labeller to 
## label the clips where the referee had to distinguish whos priority.
import cv2
# import tensorflow as tf
import numpy as np
# import argparse
import time
import cv
import subprocess as sp
import os
from pylab import *
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import sys





def compare_pics(reference, tester):
    return np.sum(abs(reference - tester))

# Up to caller to pass in correct pics dictionary and frame
# What if scores increment by more than 1 at time?
def score(current_score, pics, frame):
    min_diff = 100000
    score = -1
    for i in range(current_score - 1, current_score + 2):
        if i < 0 or i > 15:
            continue
        test_pic = pics[i]
        diff = compare_pics(frame, test_pic)
        if diff < min_diff:
            min_diff = diff
            score = i
    
    return score

def main(tournament_name):
    print("Starting clip cutter...")

    left_pics = [cv2.imread("./utils/left-score/{}.png".format(i)) for i in range(0, 16)]
    right_pics = [cv2.imread("./utils/right-score/{}.png".format(i)) for i in range(0, 16)]

    # Video processing
    green_box = cv2.imread("./utils/greenbox.png")
    red_box = cv2.imread("./utils/redbox.png")
    white_box = cv2.imread("./utils/whitebox.png")

    FFMPEG_BIN = "ffmpeg"
    # Prelim info, FOTR light box is frame[329:334, 380:500]
    # therefore FOTL box is frame[329:334, 140:260]
    # FOTL OFF-TARGET frame[337:348, 234:250]
    # FOTR OFF-TARGET frame[337:348, 390:406]

    fps = str(13)
    jump_length = 260 # this is how long our 'recording time' will be, where we don't check for lights, actual recording time, its so long because we want to skip people testing their blades after hits
    # is jump length - hide length = 'clip length'
    hide_length = 200 # where we're not actually interested in keeping the frames, but don't want them to be seen by 'not in record mode'
    already_processed = 0
    video_number = 0

    # CHANGE TOURNAMENT NAME TO CHANGE WHICH FOLDER TO PROCESS
    # tournament_name = "seoul-2019-gp"
    # TOURNAMENT NAME CHANGE

    pl_location = "../videos-full/" + tournament_name
    output_location = "../videos-cut/{0}-CUT".format(tournament_name)

    if not os.path.exists(output_location):
        os.makedirs(output_location)
    
    try:
        vid_list = sort(os.listdir(pl_location))
    except:
        print("Couldn't find {} before cutting clips. Double check that download vids script worked.".format(pl_location))
        sys.exit()
    
    start = 0
    limit = len(vid_list)
    vid_list = vid_list[start:limit]

    print("Cutting {} videos into {}...".format(len(vid_list), output_location))





    # For vids inside precut, might change to "title"
    # vid is already a string (so why he casting??)
    # TODO: Clean this shit up, better abstraction

    for vid in vid_list:
        if not vid.endswith(".mp4"):
            print("NOT MP4 FILE OR DIRECTORY")
            continue
        vid_replaced_mp4 = vid.replace(".mp4", "")
        # Assumes ends in n.mp4
        v_number = int(vid[-5])

        left_score = right_score = left_score_last = right_score_last = 0
        
        # If a valid video
        if v_number >= already_processed :
            
            clips_recorded = 0
            recording_mode = False
            ## Too long to start out, missing touches
            position = 300
        
            cap = cv2.VideoCapture(pl_location + "/" + vid)
            # cap.open(0)
            cap_end_point = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            # cap.release()
            cap_end_point = cap_end_point - jump_length # ensures videos don't overrun
            
            print("Cutting vid #{} : {} into clips...".format(video_number, vid))

            while position < cap_end_point:

                # If recording, set a bunch of values
                if recording_mode == True:
                    # print( "Recording Mode On" )
                    output_file = "{output_location}/{vid_title}-{clip_num}[{l_score}-{r_score}].mp4".format(
                        output_location = output_location,
                        vid_title = vid_replaced_mp4,
                        clip_num = clips_recorded,
                        l_score = left_score,
                        r_score = right_score)
                    
                    command = [FFMPEG_BIN,
                    '-y',
                    '-f', 'rawvideo',
                    '-vcodec','rawvideo',
                    '-s', '640*360',
                    '-pix_fmt', 'bgr24',
                    '-r', fps,
                    '-i', '-',
                    '-an',
                    '-vcodec', 'mpeg4',
                    '-b:v', '5000k',
                    output_file ]

                    frames_till_video_end = jump_length
                    
                    proc = sp.Popen(command, stdin=sp.PIPE, stderr=sp.PIPE)

                # Main work
                if cap.isOpened():

                    cap.set(1,position)
                    cap.set(cv2.CAP_PROP_FPS, 10000)

                    while cap.isOpened():
                        # Pinging around in this for loop

                        ret,frame = cap.read()
                        position = position + 1
                        # print("POSITION: ", position)

                        if recording_mode == False:
                            # print("RECORDING MODE OFF")
                            
                            # To check progress
                            # if position % 100 == 0:
                            #     # Make sure these are synced every 100
                            #     print( "Position: ", position )
                            #     print( "CAP_PROP_POS_FRAMES: ", cap.get(cv2.CAP_PROP_POS_FRAMES) )
                            # this check is here because the vid should be prevented from 
                            # starting a clip less than frames_till_vid_end away from 
                            # the end

                            # End checks
                            if position == (cap_end_point):
                                break
                            elif cap.get(cv2.CAP_PROP_POS_FRAMES) >= cap_end_point:
                                print( "break" )
                                position = cap.get(cv2.CAP_PROP_POS_FRAMES)
                                break

                            # Analyze the clips to see if the score increments (?)
                            # Sets recording_mode to True if so
                            try:
                                # white_left_light  = (np.sum(abs(frame[337:348, 234:250].astype(int)-white_box.astype(int))) <= 7000)
                                # white_right_light = (np.sum(abs(frame[337:348, 390:406].astype(int)-white_box.astype(int))) <= 7000)
                                red_light = (np.sum(abs(frame[330:334, 140:260].astype(int)-red_box.astype(int))) <= 40000)
                                green_light = (np.sum(abs(frame[330:334, 380:500].astype(int)-green_box.astype(int))) <= 40000)

                                # Custom values
                                left_frame = frame[310:310+15, 265:265+19].astype(int)
                                right_frame = frame[310:310+15, 356:356+19].astype(int)

                                # SIKE, lets record every action
                                if ( red_light or green_light ):

                                    left_score = score(left_score, left_pics, left_frame)
                                    right_score = score(right_score, right_pics, right_frame)

                                    if left_score < 0 or right_score < 0:
                                        print("scorenotfound?")

                            
                                    # Don't record 0-0 since itll be testing
                                    # Same goes for 8 
                                    if (left_score == 15) or (right_score == 15):
                                        # print( "dont record this hit" )
                                        position = position + 25
                                        break
                                    elif (left_score == 0) and (right_score == 0):
                                        position = position + 25
                                        break
                                    # params to skip a touch at 8 
                                    elif (left_score == 8 and right_score < 8) or (right_score == 8 and left_score < 8):
                                        # print( "dont record this hit" )
                                        position = position + 25
                                        break
                                    else:
                                        ## jump back 50 frames to the action of the hit
                                        position = position - 50
                                        recording_mode = True
                                        break
                            except:
                                break
                        
                        
                        if recording_mode == True:
                            # print("RECORDING MODE ON!!")

                            # Idk what this does yet
                            if frames_till_video_end >= hide_length:
                                if position % 2 == 0:
                                    proc.stdin.write(frame.tostring())
                            
                            # Decrement frames_till_video_end, if its finished turn recording mode off
                            frames_till_video_end = frames_till_video_end - 1
                            if frames_till_video_end == 0:
                                print( "Clip number: ", clips_recorded )
                                recording_mode = False
                                proc.stdin.close()
                                proc.stderr.close()
                                clips_recorded = clips_recorded+1
                                break   

                # else cooresponding to cap.isOpened, failed video open
                else:
                    print("Failed to open video")
            video_number += 1

            cap.release()
        # If not an .mp4
        else:
            print("already processed", vid)
        
        print("----------------------------------------------------")

    print("DONE -----------------------------------------")
