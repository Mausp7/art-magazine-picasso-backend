const express = require('express');
const app = express();
const cors = require('cors');
const fs = require("fs");
const crypto = require("crypto");
const saveTempImage = require("./store-image");

app.use(cors());
app.use(express.json());

const port = 5000;
const activeSessions = {"12345": {username: "JohnDoe", password: "f4hgv6beD5rHTf4h6FGfg4 "}};


app.get('/', (req, res) => {
    res.send('<h1>Picasso API Node Server is listening...</h1>')
});

app.get('/api/users', (req, res) => { // Endpoint returning all users.
    if (!req.header("Authorization")) return res.sendStatus(400);

    const authHeader = JSON.parse(req.header("Authorization"));
    if (!authHeader.username || !authHeader.password) return res.sendStatus(400);
    if (authHeader.username !== "admin"|| authHeader.password !== "admin") return res.sendStatus(401);

    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) res.sendStatus(500);

        const DB = JSON.parse(data);
        res.json(DB);
    });
});

app.post('/api/user', (req, res) => { // Endpoint to register a new user.
    if (!req.body.username || !req.body.password) return res.sendStatus(400);
    
    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) res.sendStatus(500);

        const DB = JSON.parse(data);
        const user = DB.find(user => user.username.toLowerCase() === req.body.username.toLowerCase())
        if (user) return res.sendStatus(409);

        const newUser = {
            id: DB.reduce((max, user) => user.id > max ? user.id : max, 0) + 1,
            username: req.body.username,
            password: req.body.password,
            collection: []
        };

        DB.push(newUser);
        fs.writeFileSync('./data/users.json', JSON.stringify(DB, null, 4), 'utf8', (err, data) => {})
        return res.json(newUser);
    });
});

app.get('/api/user', (req, res) => { // Endpoint to validate an existing user.
    if (!req.header("Authorization")) return res.sendStatus(400);

    const authHeader = JSON.parse(req.header("Authorization"));
    if (!authHeader.username || !authHeader.password) return res.sendStatus(400);

    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) res.sendStatus(500);

        const DB = JSON.parse(data);
        const user = DB.find(user => user.username === authHeader.username && user.password === authHeader.password);
        if (!user) return res.sendStatus(401);

        const sessionId = crypto.randomBytes(64).toString('hex');
        activeSessions[sessionId] = {username: user.username, password: user.password};
        setTimeout(() => {
            delete activeSessions[sessionId]
        }, 24*60*60*1000);

        return res.json(sessionId);
    });
});

app.delete('/api/user', (req, res) => { // Endpoint to delete a specific user.
    if (!req.header("Authorization")) return res.sendStatus(400);

    const sessionId = JSON.parse(req.header("Authorization"));
    if (!activeSessions[sessionId]) return res.sendStatus(401);

    const username = activeSessions[sessionId].username;

    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) res.sendStatus(500);

        let DB = JSON.parse(data);
        if (!DB.find(user => user.username === username)) return res.sendStatus(404);

        DB = DB.filter(user => user.username !== username);
        fs.writeFileSync('data/users.json', JSON.stringify(DB, null, 4),'utf8');
        return res.sendStatus(200);
    });
});

app.get('/api/user/collection', (req, res) => { // Endpoint to get user collection.
    if (!req.header("Authorization")) return res.sendStatus(400);

    const sessionId = JSON.parse(req.header("Authorization"));
    if (!activeSessions[sessionId]) return res.sendStatus(401);

    const username = activeSessions[sessionId].username;

    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) res.sendStatus(500);

        const DB = JSON.parse(data);
        const user = DB.find(user => user.username === username);
        if (!user) return res.sendStatus(404);

        return res.json(user.collection);
    });
});

app.post('/api/user/collection', (req, res) => { // Endpoint posting an artpiece into a specific users collection.
    if (!req.header("Authorization")) return res.sendStatus(400);

    const sessionId = JSON.parse(req.header("Authorization"));
    if (!activeSessions[sessionId]) return res.sendStatus(401);

    const username = activeSessions[sessionId].username;

    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) res.sendStatus(500);

        const DB = JSON.parse(data);
        const user = DB.find((user) => user.username === username);
        if (!user) return res.sendStatus(404);

        if (!req.body.artist || !req.body.title || !req.body.url) return res.sendStatus(400);

        if (user.collection.find(art => art.title === req.body.title) || user.collection.find(art => art.url === req.body.url)) return res.sendStatus(409);

        saveTempImage(req.body.url, `./temp/temp`);

        const newCollection = {
            artist: req.body.artist,
            title: req.body.title,
            url: req.body.url,
            tags: req.body.tags ? req.body.tags : [],
            rating: Number(req.body.rating) < 6 && Number(req.body.rating) > -1  ? Number(req.body.rating) : 0,
            description: req.body.description ? req.body.description : ""
        };

        user.collection.push(newCollection);
        fs.writeFileSync('data/users.json', JSON.stringify(DB, null, 4),'utf8');
        return res.json(user.collection);
    });
});

app.put('/api/user/collection', (req, res) => { //Endpoint to update a specific users specific artpiece.
    if (!req.body.artist || !req.body.title || !req.body.url) return res.sendStatus(400);

    if (!req.header("Authorization")) return res.sendStatus(400);
    
    const sessionId = JSON.parse(req.header("Authorization"));
    if (!activeSessions[sessionId]) return res.sendStatus(401);

    const username = activeSessions[sessionId].username;

    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) res.sendStatus(500);

        const DB = JSON.parse(data);
        const user = DB.find((user) => user.username === username);
        if (!user) return res.sendStatus(404);

        const art = user.collection.find(art => art.title === req.body.title) || user.collection.find(art => art.url === req.body.url);

        art.tags= req.body.tags ? req.body.tags : [];
        art.rating = Number(req.body.rating) < 6 && Number(req.body.rating) > -1  ? Number(req.body.rating) : 0;
        art.description = req.body.description ? req.body.description : "";

        fs.writeFileSync('data/users.json', JSON.stringify(DB, null, 4),'utf8');
        return res.json(user.collection);
    });
});

app.delete('/api/user/collection', (req, res) => { // Endpoint to delete a specific users artpiece by url or title.
    if (!req.query.url && !req.query.title) return res.sendStatus(400);

    if (!req.header("Authorization")) return res.sendStatus(400);

    const sessionId = JSON.parse(req.header("Authorization"));
    if (!activeSessions[sessionId]) return res.sendStatus(401);

    const username = activeSessions[sessionId].username;

    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) res.sendStatus(500);

        const DB = JSON.parse(data);
        const user = DB.find(user => user.username === username);
        if (!user) return res.sendStatus(404);

        user.collection = user.collection.filter(art => art.url !== req.query.url && art.title !== req.query.title);
        fs.writeFileSync('data/users.json', JSON.stringify(DB, null, 4),'utf8');
        return res.json(user.collection);
    });
});


app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
});