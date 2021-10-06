# Fencing AI v2

This is the frontend to the fencing AI referee project by Albert Tian. The goal is to create an automatic sabre referee on the browser that can tell right of way consistently. Bootstrapped using [Create React App](https://github.com/facebook/create-react-app).

# Technical Spec
General flow will follow these steps
1. Ingest webcam data from React frontend
2. Run pose detection using [MoveNet](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/src/movenet) to get useable pose data
3. Feed pose data into pre-trained, fencing specific classifier that outputs left, right or simultaneous
4. Display result

### Webcam: React webcam and Canvas
[react-webcam](https://www.npmjs.com/package/react-webcam) was chosen due to its ability to easily ingest the webcam feed in a react context

### Pose detection: MoveNet from TensorflowJS
MoveNet was chosen due to its [optimization for human and athletic movements](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html). Its ease of use in a React/JS context is also much appreciated. Previous iterations considered WrnchAI, OpenPose, and DensePose which required much more configuration out of the box to get started on the web.

### Touche classification: TODO
This is the hardest part. How do we intake pose data (and possibly light data) and output a decision?

# Product spec
Although fencing AI is purely a passion project at the moment, there are some baseline product decisions that are integral:
1. **Browser based.** 3 factors made me decide on pure browser hosted as opposed to using physical sensors or specialized camera equipment
   1. **Technological maturity** With advances of JS based pose detection models sensors become less and less necessary when a laptop webcam and an amazing model can output solid pose data.
   2. **Accessibility** Being browser based means that eventually a single codebase can serve any laptop with a webcam or smartphone with a camera. Which means if people want to try for themselves, they don't need to go out and buy a sensor kit or even download anything, just simply go to wherever it's hosted at the time.
   3. **Maintainability** The web is superior in maintainability IMO ince you only need to maintain one codebase forever. Some config changes may be necessary for different screen sizes or devices but those pale in comparrison to other alternatives. Also truth be told I'm just most accustomed to coding web apps which makes the learing curve so much easier. 

## Getting started

In the project directory, you can run:

### `yarn`
Installs dependencies. Run this before running `yarn start`

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
