# To add a new cell, type '# %%'
# To add a new markdown cell, type '# %% [markdown]'
# %%
import os
from tqdm import tqdm
os.makedirs('precut', exist_ok=True)
os.makedirs('scoreboard_classifier_data', exist_ok=True)


# %%

from threading import Thread
import functools

def timeout(timeout):
    def deco(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            res = [Exception('function [%s] timeout [%s seconds] exceeded!' % (func.__name__, timeout))]
            def newFunc():
                try:
                    res[0] = func(*args, **kwargs)
                except Exception as e:
                    res[0] = e
            t = Thread(target=newFunc)
            t.daemon = True
            try:
                t.start()
                t.join(timeout)
            except Exception as je:
                print ('error starting thread')
                raise je
            ret = res[0]
            if isinstance(ret, BaseException):
                raise ret
            return ret
        return wrapper
    return deco


# %%
from pytube import YouTube
## Run this to download all the videos from youtube.

@timeout(60)
def dld(video):
    if (f"{video.video_id}.mp4" not in os.listdir('precut')) and (f"{video.video_id}.json" not in os.listdir('per_vid_labels')):
        print(f'dlding {video}')
        video.streams.filter(file_extension='mp4', progressive=True, res='360p', fps=25)[0].download(output_path = 'staging', filename= video.video_id, timeout=100)
        os.rename(f'staging/{video.video_id}.mp4',f'precut/{video.video_id}.mp4')


def download_vid(i):
    dld(YouTube(i))


from pytube import Playlist    
def download_playlist(p):
    p = Playlist(p)
    for video in p.videos:
        try:
            
            dld(video)
        except Exception as e:
            print(e)


# %%
text_file = open("playlists.txt", "r")
playlists = text_file.read().split('\n')
print("First 3 links:", playlists[:3])
text_file.close()



for p in tqdm(playlists):
    print(p)
    download_playlist(p)


# %%
# for video in Playlist('https://www.youtube.com/playlist?list=PL_pQQho0KExy7P2io_hYjwmpJAhy2nRi7'):
#     print(YouTube(video).streams.filter(file_extension='mp4', progressive=True, res='360p', fps=25)[0])


# %%
# YouTube(video).streams


# %%



