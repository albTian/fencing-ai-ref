const PORT = process.env.PORT || 3000;
const express = require("express");
const { spawn } = require('child_process');
const app = express();

// I HAVE DEFATED CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://fencing-ai-ref.vercel.app"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.json());

const players = require('../data.json')

app.get('/', (req, res) => {
    // res.send('Hello World! I am changing')

    // Python testing here
    var dataToSend;
    // spawn new child process to call the python script
    const python = spawn('python', ['python/script2.py', 'aids', 'monkey']);
    // collect data from script
    python.stdout.on('data', data => {
        console.log('Pipe data from python script ...');
        dataToSend = data.toString();
    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        res.send(dataToSend)
    });
    // Python ending
})

app.get('/players/:id', (req, res) => {
    const player = players.find(p => p.id === parseInt(req.params.id));
    if (player) {
        res.send(player)
    } else {
        res.send("player not found...")
    }
})

app.post('/players', (req, res) => {
    const newPlayer = {
        id: players.length,
        name: req.body.name,
        weapon: req.body.weapon,
        rating: req.body.rating,
    }

    players.push(newPlayer)
    res.send(req.newPlayer)
})

app.get('/players', (req, res) => {
    res.send(players)
})

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({ region: 'us-east-1' });

// Create S3 service object
s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// Call S3 to list the buckets
s3.listBuckets(function (err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Success", data.Buckets);
    }
});

app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`);
})
