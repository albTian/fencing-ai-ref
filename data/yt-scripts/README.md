# Fencing AI ref project
Using computer vision, pose estimation, AI/ML to create a sabre ref. **Huge thanks to Shotlo Douglas** for the shotlo-scripts to download, cut and parse videos.

## How to collect data using the scripts
1. `cd scripts`
2. `pip3 install -r requirements.txt`
3. Get a playlist url and tournament name ready. Tournament name should be in the format of **location-year-type**, like **seoul-2019-gp** 
4. There are 9 men's saber tournaments in `tournaments.txt` with their playlist URLS.
5. `python3 main.py`
6. Check between each step that the required directories are created and filled with data.
7. To run WITHOUT POSE ESTIMATION, comment `wrnch_AI_feeder.main(tournament_name)` out inside `main.py`.

## Useful links
Debate on AI fencing refs: https://www.reddit.com/r/Fencing/comments/jncgti/feelings_on_an_electronic_referee/  
Database: https://www.fencingdatabase.com/stats  
wrnchAI devportal (@nathaniel lmk if you don't have access): https://devportal.wrnch.ai/  
Sholto Douglas' repo: https://github.com/sholtodouglas/fencing-AI

## Steps:
1. Cut videos into only 2 light actions [DONE]
2. Extract pose data [DONE]
3. GET DATA (fencing database)
4. Create/train model
5. Port onto iPhone using coreML(?)
6. Use iOS Vision API to detect poses, fit using our trained model

## Notes:
Scripts won't work unless you download the videos first. Run 10-download_vids.ipynb by changing the playlist name and assigning a tournament. I can't commit the videos because there are too many of them and too much data.

Can either classify **right of way or actions.** Either will be more acurate than just "left touch" or "right touch". Classifying actions will make highlighting much easier(?), whereas right of way might be more generalizable. Right of way is not constrained to the specific actions.  

Easiest way to get familiar with the wrnch python API is through the **demo-wrnch** folder. Run `python3 ui.py` in the folder to see it. Ask me for the user or login if need.

Sometimes Jupyter won't load modules, use
`pip3 install ipykernel --upgrade`
`python3 -m ipykernel install --user`