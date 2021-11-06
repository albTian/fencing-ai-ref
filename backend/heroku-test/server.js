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
    console.log(`req: ${req}`);
    console.log(`res: ${res}`);
    const newPlayer = {
        id: players.length + 1,
        name: req.body.name + "fuck",
        weapon: req.body.weapon + "??",
        rating: req.body.rating + "lol",
    }

    players.push(newPlayer)
    res.send(req.body)
})

app.get('/players', (req, res) => {
    res.send(players)
})

app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`);
})