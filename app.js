const express = require('express');
const app = express();
const cors = require('cors');
const fs = require("fs")

app.use(cors());
app.use(express.json());

const port = 5000;


app.get('/', (req, res) => {
    res.send('<h1>Picasso API Node Server is listening...</h1>')
});

app.get('/api/users', (req, res) => { // Endpoint returning all users.
    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) {
            res.json(err)
            return
        }
        const DB = JSON.parse(data);
        res.json(DB);
    });
});

app.post('/api/user/signup', (req, res) => { // Endpoint to register a new user.
    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) res.sendStatus(500);

        if (!req.body.username || !req.body.password) {
            return res.sendStatus(400);
        };

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

app.get('/api/user/:id', (req, res) => { // Endpint to return a specific user.
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

app.delete('/api/users/:id', (req, res) => { // Endpoint to delete a specific user.
    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) res.sendStatus(500);

        const userID = Number(req.params.id);
        if (!userID || userID < 1) return res.sendStatus(400);
        
        let DB = JSON.parse(data);
        if (!DB.find(user => user.id === userID)) return res.sendStatus(404);

        DB = DB.filter(user => user.id !== userID)
        fs.writeFileSync('data/users.json', JSON.stringify(DB, null, 4),'utf8')
        return res.sendStatus(200);
    });
});

app.post('/api/user/:id', (req, res) => { // Endpoint posting an artpiece into a specific users collection.
    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) res.sendStatus(500);

        const userID = Number(req.params.id);
        if (!userID || userID < 1) return res.sendStatus(400);

        const DB = JSON.parse(data);
        const user = DB.find(user => user.id === userID)
        if (!user) return res.sendStatus(404);

        if (!req.body.artist || !req.body.title || !req.body.url) return res.sendStatus(400);

        if (user.collection.find((art) => art.title === req.body.title) || user.collection.find((art) => art.url === req.body.url)) return res.sendStatus(409);

        const newCollection = {
            artist: req.body.artist,
            title: req.body.title,
            url: req.body.url,
            tags: req.body.tags ? req.body.tags : [],
            rating: Number(req.body.rating) < 6 && Number(req.body.rating) > -1  ? Number(req.body.rating) : 0,
            description: req.body.description ? req.body.description : ""
        };

        user.collection.push(newCollection);
        fs.writeFileSync('data/users.json', JSON.stringify(DB, null, 4),'utf8')

        return res.json(user.collection);
    });
});

app.put('/api/user/:id', (req, res) => { //Endpoint to update a specific users specific artpiece.
    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) res.sendStatus(500);


        const userID = Number(req.params.id);
        if (!userID || userID < 1) return res.sendStatus(400);

        if (!req.body.artist || !req.body.title || !req.body.url) return res.sendStatus(400);

        const DB = JSON.parse(data);
        const user = DB.find(user => user.id === userID)
        if (!user) return res.sendStatus(404);
        

        const art = user.collection.find((art) => art.title === req.body.title) || user.collection.find((art) => art.url === req.body.url);

        
            art.tags= req.body.tags ? req.body.tags : [];
            art.rating = Number(req.body.rating) < 6 && Number(req.body.rating) > -1  ? Number(req.body.rating) : 0;
            art.description = req.body.description ? req.body.description : "";
        


        fs.writeFileSync('data/users.json', JSON.stringify(DB, null, 4),'utf8')
        return res.json(user.collection);

    });
});

app.delete('/api/user/:id', (req, res) => { // Endpoint to delete a specific users artpiece by url or title.
    fs.readFile('data/users.json', 'utf8', (err, data) => {
        if (err) res.sendStatus(500);

        if (!req.query.url && !req.query.title) return res.sendStatus(400);

        const userID = Number(req.params.id);
        if (!userID || userID < 1) return res.sendStatus(400);

        const DB = JSON.parse(data);
        const user = DB.find(user => user.id === userID)
        if (!user) return res.sendStatus(404);

        user.collection = user.collection.filter(art => art.url !== req.query.url && art.title !== req.query.title);
        fs.writeFileSync('data/users.json', JSON.stringify(DB, null, 4),'utf8')
        return res.json(user.collection);
    });
});


app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
});