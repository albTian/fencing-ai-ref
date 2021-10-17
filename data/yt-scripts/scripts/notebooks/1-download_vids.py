from pytube import YouTube
from pytube import Playlist
import os

## testing git commit all
## Run this to download all the videos from youtube.

import signal
import time
import traceback
## Timeout for use with try/except so that pytube doesn't randomly freeze.
class Timeout():
    """Timeout class using ALARM signal."""
    class Timeout(Exception):
        pass
 
    def __init__(self, sec):
        self.sec = sec
 
    def __enter__(self):
        signal.signal(signal.SIGALRM, self.raise_timeout)
        signal.alarm(self.sec)
 
    def __exit__(self, *args):
        signal.alarm(0)    # disable alarm
 
    def raise_timeout(self, *args):
        raise Timeout.Timeout()

# Add to urls, just change filename
# budapest-2019-wc.txt
# cairo-2019-gp.txt
# moscow-2018-gp.txt
# budapest-2019-wch.txt
# warsaw-2019-wc.txt
# montreal-2020-gp.txt
# moscow-2019-gp.txt
# seoul-2019-gp.txt
# wuxi-2018-wch.txt

# JUST HAVE TO CHANGE THE PLAYLIST URL 
pl_url = "https://www.youtube.com/playlist?list=PL_pQQho0KExzQcebARi_PZ_9IZZzsY1ol"
pl = Playlist(pl_url)

filename = "given name" or pl.title()
output_path = "./videos-full/" + filename


vids = pl.video_urls()

# Opens from urls
# text_file = open("./urls/{0}.txt".format(filename), "r")
print("First 3 links:", vids[:3])

# Loop through all the videos, download them and put them in the named folder.
counter = 0
vids = vids[counter:]
print(output_path)
for i in vids:
	print(i)
	try:
		with Timeout(300):
			start = time.time()
			yt = YouTube(i)
			yt.streams.first().download(
				output_path = output_path,
				filename = filename + "-" + str(counter),
			)
			print("Downloaded: ", i, "   " ,(time.time() - start), "s")
	except:
		traceback.print_exc()
		print("Failed-",i)

	print("Counter: ", counter)
