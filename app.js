const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const port = 5000;


app.get('/', (req, res) => {
    res.send('<h1>Server is ON</h1>')
});


app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
});