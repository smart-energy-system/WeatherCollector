const WeatherCollector = require('./WeatherCollector');
const DBController = require('./DBController');
const fs = require('fs');
const HashMap = require('hashmap');
const uuid = require('uuid/v4');
const express = require('express');
const compression = require('compression');
const api = express();
const PORT = process.env.PORT || 8080;

let config;
let weatherCollectors = new HashMap();

// Create Server
let server = api.listen(PORT, () => {
    const args = process.argv.slice(2);
    if (args.length === 3) {
        config = {
            apiToken: args[0],
            lat: args[1],
            lon: args[2]
        };
        fs.writeFileSync('./config.json', JSON.stringify(config), 'utf8', (err) => {
            console.log('[Error] Error while writing config file');
        });
    } else if (fs.existsSync('./config.json')) {
        config = JSON.parse(fs.readFileSync('./config.json', 'utf-8', (err) => {
            console.log('[Error] Error while reading config file');
        }));
    }


    let host = server.address().address;
    let port = server.address().port;
    console.log("[API] [Start] Listening at http://%s:%s", host, port);
});

// Setup Global Middlewares
api.use(compression());
api.use(express.json());
api.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Auth-Token,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', false);

    // Pass to next layer of middleware
    next();
});

api.post('/weathercollectors', (req, res, next) => {
    let lat = req.body.lat;
    let lon = req.body.lon;
    if (lat && lon) {
        let apiToken = config.apiToken;
        let weatherCollector = new WeatherCollector(apiToken, lat, lon);
        weatherCollector.start();
        let id = uuid();
        weatherCollectors.set(id, weatherCollector);
        res.status(201).end(JSON.stringify({
            lat: lat,
            lon: lon,
            id: id
        }));
    } else {
        res.status(400).end('Bad request: body properties are not defined');
    }
});

api.delete('/weathercollectors', (req, res, next) => {
    let id = req.body.id;
    if (id) {
        if (weatherCollectors.has(id)) {
            weatherCollectors.remove(id);
            res.status(200).end('Deleted');
        } else {
            res.status(400).end('Bad request: There is no such weatherColelctor');
        }
    } else {
        res.status(400).end('Bad request: id is not defined');
    }
});
