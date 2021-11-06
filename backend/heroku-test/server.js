const PORT = process.env.PORT || 3000;
const express = require("express");
const app = express();
app.use(express.json());

const players = require('./data.json')

app.get('/', (req, res) => {
    res.send('Hello World')
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
AWS.config.update({region: 'us-west-2'});

// Create S3 service object
s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Call S3 to list the buckets
s3.listBuckets(function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.Buckets);
  }
});

app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`);
})

