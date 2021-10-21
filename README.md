# The Fencing AI Referee Project
**Frontend hosted at https://fencing-ai-frontend.vercel.app/**
Welcome to the collection of parts that will make up the fencing AI referee. This main repo was created to centralize all the bits and pieces of the fencing AI project over time. There are 4 folders:
  
# data
Contains everything related to data collection and processing. **Huge thanks to Solto Douglas for the majority of the cutting and scripting.** The goal of this folder is to create a system to ingest a youtube link (playlist or video) of fencing footage and 
1. Download videos
2. Cut into 1 touch long videos
3. Classify videos into touches ex. left, split, right ...
4. Run pose estimation on each video
5. ... TBD
  
# frontend
Contains the frontend to the actual web app interface. Heavily based off the [tfjs demos.](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/demos) Goal of this folder is to
1. Ingest webcam data
2. Run live pose estimation
3. Feed pose data to model
4. Display fencing specific result
  
# model
Contains the model to classify fencing results. IMO hardest part and the section I have the least experience with. Goal of this folder is to
1. Create a functional model to classify fencing pose data...
2. ... TBD
  
# playground
Contains anything else that I import to test and experiment with. Will be quite a messy folder with no real structure, just a place to put anything interesting I find