import os
import re
import cv2
import numpy as np

green_box = cv2.imread("./utils/greenbox.png")
red_box = cv2.imread("./utils/redbox.png")
white_box = cv2.imread("./utils/whitebox.png")


# Returns no touch, left touch, right touch
def replace_score(vid, left_score, right_score, tournament_len):
    vid_IDs = vid[tournament_len+1:]
    new_touch_num = str(int(re.search(r"\-(.*?)\[", vid_IDs).group(1)) + 1)

    # REPLACE WITH NEW SCORES AND NEW TOUCH NUMBER
    new_vid_ID = re.sub(r"\[(.*?)\]", "[{}-{}]".format(str(left_score), str(right_score)), vid_IDs)
    new_vid_ID = re.sub(r"\-(.*?)\[", "-" + new_touch_num + "[", new_vid_ID)

    return vid[:tournament_len + 1] + new_vid_ID

def main(tournament_name):
    # tournament_name = "seoul-2019-gp"

    # will split into one and two light as well
    touch_options = ["none", "left", "right", "split", "misc", "one-left", "one-right"]

    dir_location = "../videos-cut/{}-CUT".format(tournament_name)
    vid_list = os.listdir(dir_location)

    output_folder = "../videos-labeled/{}-LABELED/".format(tournament_name)
    output_list = [output_folder]

    for option in touch_options:
        output_list.append(output_folder + option)

    for output in output_list:
        if not os.path.exists(output):
            os.makedirs(output)

    tournament_len = len(tournament_name)


    for vid in vid_list:
        if not vid.endswith(".mp4"):
            continue
        # bout_num - touch_num - [left_score-right_score]
        # text_after = re.sub(regex_search_term, regex_replacement, text_before)
        vid_ID = vid[tournament_len+1:]
        score_list = re.search(r"\[(.*?)\]", vid_ID).group(1).split('-')
        left_score = int(score_list[0])
        right_score = int(score_list[1])

        no_touch = replace_score(vid, left_score, right_score, tournament_len)
        left_touch = replace_score(vid, left_score + 1, right_score, tournament_len)
        right_touch = replace_score(vid, left_score, right_score + 1, tournament_len)

        vid_location = dir_location + "/" + vid

        # Read the second to last frame, see if there are two lights
        cap = cv2.VideoCapture(dir_location + "/" + vid)
        cap.set(1, int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) - 1)
        ret, frame = cap.read()
        

        red_light = (np.sum(abs(frame[330:334, 140:260].astype(int)-red_box.astype(int))) <= 40000)
        green_light = (np.sum(abs(frame[330:334, 380:500].astype(int)-green_box.astype(int))) <= 40000)

        touch = ""
        if red_light and green_light:
            if no_touch in vid_list:
                touch = "none"
            elif left_touch in vid_list:
                touch = "left"
            elif right_touch in vid_list:
                touch = "right"
            else:
                if left_score == right_score:
                    touch = "split"
                elif left_score == 7 or left_score == 14:
                    touch = "left"
                elif right_score == 7 or right_score == 14:
                    touch = "right"
                else:
                    touch = "misc"
        elif red_light:
            touch = "one-left"
        elif green_light:
            touch = "one-right"
        else:
            touch = "misc"

        new_vid_location = output_folder + touch + "/" + vid[:-4] + touch + vid[-4:]
        print("Moving {} \nTo {}".format(vid_location, new_vid_location))
        os.rename(vid_location, new_vid_location)