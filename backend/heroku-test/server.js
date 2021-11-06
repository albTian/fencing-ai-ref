const express = require('express')
const app = express()
app.use(express.json());

const players = require('./data.json')
let port = process.env.PORT || 3000

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
        id: players.length + 1,
        name: req.body.name,
        weapon: req.body.weapon,
        rating: req.body.rating,
    }

    players.push(newPlayer)
    res.send(newPlayer)
})

app.get('/players', (req, res) => {
    res.send(players)
})

app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
})