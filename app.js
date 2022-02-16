const express = require('express');
const app = express();
const cors = require('cors');
const fs = require("fs")

app.use(cors());
app.use(express.json());

const port = 5000;


app.get('/', (req, res) => {
    res.send('<h1>Server is ON</h1>')
});

app.get('/api/users', (req, res) => {
    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) {
            res.json(err)
            return
        }
        const DB = JSON.parse(data);
        res.json(DB);
    });
});

app.get('/api/user/:id', (req, res) => {
    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) res.sendStatus(500);

        const userID = Number(req.params.id);
        if (!userID || userID < 1) return res.sendStatus(400);

        const DB = JSON.parse(data);
        const user = DB.find(user => user.id === userID)
        if (!user) return res.sendStatus(404);

        return res.json(user);
    });
});


app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
});