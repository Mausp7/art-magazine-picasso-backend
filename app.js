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

app.get('/api/dummy', (req, res) => {
    fs.readFile('data/dummy.json', 'utf8', (err, data) => {
        if (err) {
            res.json(err)
            return
        }
        const DB = JSON.parse(data);
        res.json(DB);
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
});