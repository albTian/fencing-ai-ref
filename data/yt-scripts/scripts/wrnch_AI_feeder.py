from api import API
import os
import time
## Goal: to process 1 video and spit the results into a different file
# API = API(username, password)

# Abstraction: 
# Class runner with all instance variables.
# Load things into our Runner instance
# runner.run() will use all the instance to run
categories_ALL = {
        'annotated_media': 'Annotated Media',
        'fbx': 'FBX',
        'json': 'JSON'
    }
category_targets_ALL = {
    'annotated_media': ['2D', 'heads', 'hands', 'greenscreen', 'tracking'],
    'fbx': [],
    'json': ['2D', 'heads', 'hands', 'est_3d']
}
options_ALL = {
    '2D': 'Add 2D Pose Estimation',  # JSON + Annotated Media
    'heads': 'Add Head Pose Estimation',  # JSON + Annotated Media
    'hands': 'Add Hand Pose Estimation',  # JSON + Annotated Media
    'greenscreen': 'Add Green Screen Estimation',  # Annotated Media
    'tracking': 'Enable Tracking',  # Annotated Media
    'est_3d': 'Add 3D Pose Estimation'  # JSON
}
success = "green"
failure = "red"
base = "black"
dimensions = (640, 360)



class Runner:
    def __init__(self, params, categories, pl_location, out_location, touch_options):
        print("init")
        # what information do we need?
        self.API = None
        self.params = params
        self.categories = categories
        self.pl_location = pl_location
        self.out_location = out_location
        self.touch_options = touch_options

        # pl_location will contain left, right, none, split subdirectories


    
    # Call to run the script on all files
    # Needs overhaul, not listdir
    def run(self):
        print("run")
        # pl_files_list = os.listdir(self.pl_location)
        # for vid in pl_files_list:
        #     print("vid location: ", vid)
        #     # Submit and save vid

        #     file_path = self.pl_location + vid
        #     categories = self.categories
        #     options = self.params
        #     out_path = self.out_location + vid

        #     job_id = 0
        #     timeout, job_id = self.API.submit_job(file_path, categories, options, out_path)

        #     print("processed {vid} with job ID {job_id}".format(vid=vid, job_id=job_id))
        count = 0
        gen = os.walk(self.pl_location)
        for root, dirs, files in gen:
            touch_folder = "misc"
            for option in self.touch_options:
                if option in root:
                    touch_folder = option
            print("touch_folder: ", touch_folder)
            for vid in files:
                if not vid.endswith(".mp4"):
                    continue

                file_path = root + "/" + vid
                categories = self.categories
                options = self.params
                out_path = self.out_location + touch_folder + "/" + vid
                
                start = time.time()

                job_id = 0
                timeout, job_id = self.API.submit_job(file_path, categories, options, out_path)
                print("processed {} with ID {} in {} seconds".format(vid, job_id, time.time() - start))
                print()
                count += 1
        print("number of clips:", count)

        # Will be the one calling API.submit
        # Loop through file_list

    
    def login(self, username: str, password: str):
        print("login")
        self.API = API(username, password)


def main(tournament_name):
    print("Pose estimation beginning...")
    # Variables to change around, ASK FOR USERNAME AND PASSWORD (wrnchAI login)
    username: str = "atian"
    password: str = "Sjzs20!("

    categories = ['annotated_media', 'json']
    params = {'2D': True, 'tracking': True}

    # CHANGE TOURNAMENT NAME TO PASS DIFFERENT VIDS
    # tournament_name = "test-2020-CUT"

    pl_location = "../videos-labeled/{}-LABELED/".format(tournament_name)
    out_location = "../videos-wrnch-annotated/{}-WRNCH/".format(tournament_name)

    # Make sure this is consistent with others
    touch_options = ["none", "left", "right", "split", "misc", "one-left", "one-right"]
    output_list = [out_location]

    for option in touch_options:
        output_list.append(out_location + option)

    for output in output_list:
        if not os.path.exists(output):
            os.makedirs(output)

    runner = Runner(params, categories, pl_location, out_location, touch_options)
    runner.login(username, password)
    runner.run()