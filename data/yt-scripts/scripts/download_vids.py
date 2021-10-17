from pytube import Playlist, YouTube
import os
import traceback
import time
import sys


def main(pl_url, tournament_name):
    print("Download vids starting...")

    try:
        pl = Playlist(pl_url)
    except:
        print("Not a valid playlist URL")
        sys.exit()
    vids = list(pl.videos)
    output_path = "../videos-full/" + tournament_name
    if not os.path.exists(output_path):
        print("Creating directory {} ...".format(output_path))
        os.makedirs(output_path)

    # vids = vids[:2]
    counter = 0
    vids = vids[counter:]
    print("Downloading {0} videos....".format(len(vids)))
    for vid in vids:
            try:
                start = time.time()
                vid.streams.first().download(
                    output_path = output_path,
                    filename = tournament_name + "-" + str(counter),
                )
                print("Downloaded: {0}\nIn {1} seconds".format(vid.title, time.time() - start))
            except:
                traceback.print_exc()
                print("Failed-",vid)
            counter += 1
            print("Counter: ", counter, "\n")
    print("Finished downloading {} videos".format(counter))

