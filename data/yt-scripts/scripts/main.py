import sys
import time
import download_vids
import fast_clip_cutter
import data_labeler
import wrnch_AI_feeder

# INPUTS MUST BE PLAYLUST URL, THEN TOURNEY NAME
pl_url = input("Paste playlist URL and press enter...")
tournament_name = input("Give a readable name for the tournament, ex: seoul-2019-gp and press enter...")
print("playlist url: {}, tournament name: {}".format(pl_url, tournament_name))

download_vids.main(pl_url, tournament_name)

print("Check that ../videos-full/{} exists and is full of videos".format(tournament_name))
input("Press Enter to cut videos after checking...")
fast_clip_cutter.main(tournament_name)

print("Check that ../videos-cut/{}-CUT exists and is full of cut videos".format(tournament_name))
input("Press Enter to label videos after checking...")
data_labeler.main(tournament_name)

print("Check that ../videos-labeled/{}-LABELED exists and is split into left, right, none, split and misc touches".format(tournament_name))
input("Press Enter to run pose estimation after checking...")
wrnch_AI_feeder.main(tournament_name)
# ^ COMMENT THIS OUT TO EXCLUDE POSE ESTIMATION ^

print("Check that ../videos-wrnch-annotated/{}-WRNCH exists".format(tournament_name))
print("Done. Data collected.")