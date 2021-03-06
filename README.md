# The Fencing AI Referee Project
**Frontend hosted [here](https://fencing-ai-ref.vercel.app/)**  

Welcome to the collection of parts that will make up the fencing AI referee. This main repo was created to centralize all the bits and pieces of the fencing AI project over time. There are 4 folders:
  
# backend
Contains backend related experiments. This is the intermediate layer between the frontend and the data / database layer. Currently experimenting with Node.js, Express hosted on Heroku. Goal of this folder is
1. Recieve REST requests from the frontend
2. Process requests and run the **data** scripts
3. Upload to databases (MongoDB, AWS S3)

# data
Contains everything related to data collection and processing. **Huge thanks to Solto Douglas for the majority of the cutting and scripting.** The goal of this folder is to create a system to ingest a youtube link (playlist or video) of fencing footage and 
1. Download videos
2. Cut into 1 touch long videos
3. Classify videos into touches ex. left, split, right ...
4. Run pose estimation on each video
5. ... TBD, potentially will need to create a system to store the vast amounts of video and pose data that comes with it ...
  
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