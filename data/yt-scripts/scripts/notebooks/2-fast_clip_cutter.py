## Cuts the videos into a set of short clips where each actual hit happens. These clips are used by the data_labeller to 
## label the clips where the referee had to distinguish whos priority.
import cv2
import tensorflow as tf
import numpy as np
import argparse
import time
import cv
import subprocess as sp
import os
from pylab import *
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
# from pickle_dump_to_file_1 import SimpleObject

## testing git commit all


green_box = cv2.imread("./utils/greenbox.png")
red_box = cv2.imread("./utils/redbox.png")
white_box = cv2.imread("./utils/whitebox.png")

# Prelim info, FOTR light box is frame[329:334, 380:500]
# therefore FOTL box is frame[329:334, 140:260]
# FOTL OFF-TARGET frame[337:348, 234:250]
# FOTR OFF-TARGET frame[337:348, 390:406]
#      scoreleft = frame[310:325, 265:285]
#      scoreRight = frame[310:325, 355:375]
    
FFMPEG_BIN = "ffmpeg"

## Load a pretrained logisitc classifier which distinguishes between numbers 0-15.
# Change from cPickle to pickle
import pickle
print("what\n\n")
with open("./utils/logistic_classifier_0-15.pkl", 'rb') as fid:
    model = pickle.load(fid, encoding='latin1')



# fps = str(13)
# jump_length = 260 # this is how long our 'recording time' will be, where we don't check for lights, actual recording time, its so long because we want to skip people testing their blades after hits
# # is jump length - hide length = 'clip length'
# hide_length = 200 # where we're not actually interested in keeping the frames, but don't want them to be seen by 'not in record mode'
# video_number = 0
# videos_to_cut = 0

# # Change this !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# pl_title = "budapest-2019-wc"
# pl_location = "./videos-full/" + pl_title


# output_location = "./videos-cut/{0}-CUT".format(pl_title)
# if not os.path.exists(output_location):
#     os.makedirs(output_location)

# vid_list = sort(os.listdir(pl_location))
# print( "Cutting", len(vid_list), "videos" )
# print("vidlist: ", vid_list)
# print("output location: ", output_location)


# left_score = 0
# right_score = 0

# # Lies on assumption that they are named single numbers
# # Change vid.replace -------------------------------------

# already_processed = 0
# # For vids inside precut, might change to "title"
# # vid is already a string (so why he casting??)
# for vid in vid_list:
#     if not vid.endswith(".mp4"):
#         print("NOT MP4 FILE OR DIRECTORY")
#         continue
#     vid_replaced_mp4 = vid.replace(".mp4", "")
#     # Assumes ends in n.mp4
#     v_number = int(vid[-5])
    
#     # If a valid video
#     if v_number >= already_processed :
        
#         clips_recorded = 0
#         recording_mode = False
#         ## Too long to start out, missing touches
#         position = 300
    
#         cap = cv2.VideoCapture(pl_location + "/" + vid)
#         # cap.open(0)
#         cap_end_point =int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
#         # cap.release()
#         cap_end_point = cap_end_point - jump_length # ensures videos don't overrun
        
#         print( "Video:", vid , "---------------------------------------------")
#         # print( "Length of Vid:", cap_end_point )
#         # print( "Beginning to cut --------------------------------------------" )

#         # 
#         while position < cap_end_point:
#             # print( position, " - out of - ", cap_end_point )

#             # If recording, set a bunch of values
#             if recording_mode == True:
#                 # print( "Recording Mode On" )
#                 # output_file = 'videos/' + vid_replaced_mp4 +"-" + str(clips_recorded) + '.mp4'
#                 output_file = "{output_location}/{vid_title}-{clip_num}[{l_score}:{r_score}].mp4".format(
#                     output_location = output_location,
#                     vid_title = vid_replaced_mp4,
#                     clip_num = clips_recorded,
#                     l_score = left_score,
#                     r_score = right_score)
#                 # print("output file:", output_file)
                
           
#                 command = [FFMPEG_BIN,
#                 '-y',
#                 '-f', 'rawvideo',
#                 '-vcodec','rawvideo',
#                 '-s', '640*360',
#                 '-pix_fmt', 'bgr24',
#                 '-r', fps,
#                 '-i', '-',
#                 '-an',
#                 '-vcodec', 'mpeg4',
#                 '-b:v', '5000k',
#                 output_file ]

#                 frames_till_video_end = jump_length
                
#                 proc = sp.Popen(command, stdin=sp.PIPE, stderr=sp.PIPE)

#             # Main work
#             if cap.isOpened():
#                 # Set the reading position to "position"
#                 # Why fps so high??
#                 cap.set(1,position)
#                 cap.set(cv2.CAP_PROP_FPS, 10000)

#                 while cap.isOpened():
#                     # Pinging around in this for loop

#                     ret,frame = cap.read()
#                     position = position + 1

#                     if recording_mode == False:
#                         # print("RECORDING MODE OFF")
                        
#                         # To check progress??
#                         # if position % 100 == 0:
#                             # Make sure these are synced every 100
#                             # print( "Position: ", position )
#                             # print( "CAP_PROP_POS_FRAMES: ", cap.get(cv2.CAP_PROP_POS_FRAMES) )
#                         # this check is here because the vid should be prevented from 
#                         # starting a clip less than frames_till_vid_end away from 
#                         # the end

#                         # End checks
#                         if position == (cap_end_point):
#                             break
#                         elif cap.get(cv2.CAP_PROP_POS_FRAMES) >= cap_end_point:
#                             print( "break" )
#                             position = cap.get(cv2.CAP_PROP_POS_FRAMES)
#                             break

#                         # Analyze the clips to see if the score increments (?)
#                         # Sets recording_mode to True if so
#                         try:

#                             # Huge if statement, now picking up one light actions?
#                             # white_left_light  = (np.sum(abs(frame[337:348, 234:250].astype(int)-white_box.astype(int))) <= 7000)
#                             # white_right_light = (np.sum(abs(frame[337:348, 390:406].astype(int)-white_box.astype(int))) <= 7000)
#                             red_light = (np.sum(abs(frame[330:334, 140:260].astype(int)-red_box.astype(int))) <= 40000)
#                             green_light = (np.sum(abs(frame[330:334, 380:500].astype(int)-green_box.astype(int))) <= 40000)

#                             # For saber, we only want 2 light actions
#                             if ( red_light and green_light ):
                                
#                                 left_score  = model.predict(frame[309:325, 265:285].reshape(1,-1))[0]
#                                 right_score = model.predict(frame[309:325, 355:375].reshape(1,-1))[0]
#                                 print("LEFT: {0} - RIGHT: {1}".format(left_score, right_score))
#                                 # left_score = left_score_prediction if left_score_prediction >= left_score else left_score + 1
#                                 # right_score = right_score_prediction if right_score_prediction >= right_score else right_score + 1
                        
#                                 # Why don't we want to record the 15th or 0th hit?? lets record 
#                                 if (left_score == 15) or (right_score == 15):
#                                     # print( "dont record this hit" )
#                                     position = position + 25
#                                     break
#                                 elif (left_score == 0) and (right_score == 0):
#                                     # print( "dont record this hit" )
#                                     position = position + 25
#                                     break
#                                 else:
#                                     # print( "recording hit" )
#                                     ## jump back 50 frames to the action of the hit
#                                     position = position - 50
                                    
#                                     # print( "Light seen, position-", position )
#                                     recording_mode = True
#                                     break
#                         except:
#                             break
                    
                    
#                     if recording_mode == True:
#                         # print("RECORDING MODE ON!!")

#                         # Idk what this does yet
#                         if frames_till_video_end >= hide_length:
#                             if position % 2 == 0:
#                                 proc.stdin.write(frame.tostring())
                        
#                         # Decrement frames_till_video_end, if its finished turn recording mode off
#                         frames_till_video_end = frames_till_video_end - 1
#                         if frames_till_video_end == 0:
#                             # print( "finished clip" )
#                             recording_mode = False
#                             proc.stdin.close()
#                             proc.stderr.close()
#                             print(clips_recorded)
#                             clips_recorded = clips_recorded+1
#                             break   

#             # else cooresponding to cap.isOpened, failed video open
#             else:
#                 print("Failed to open video")

#             # why release in here??
#             # cap.release()
#             video_number += 1

#         cap.release()

#     # If not an .mp4
#     else:
#         print("already processed", vid)
    
#     print("----------------------------------------------------")

# print("DONE -----------------------------------------")
