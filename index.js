const WeatherCollector = require('./WeatherCollector');
const fs = require('fs');
const HashMap = require('hashmap');
// const uuid = require('uuid/v4');
const express = require('express');
const compression = require('compression');
const api = express();
const PORT = process.env.PORT || 8080;

let config;
let weatherCollectors = new HashMap();

// Create Server
let server = api.listen(PORT, () => {
    const args = process.argv.slice(2);
    if (args.length === 1) {
        config = {
            apiToken: args[0]
        };
        fs.writeFileSync('./config.json', JSON.stringify(config), 'utf8', (err) => {
            console.log('[Error] Error while writing config file');
        });
    } else if (fs.existsSync('./config.json')) {
        config = JSON.parse(fs.readFileSync('./config.json', 'utf-8', (err) => {
            console.log('[Error] Error while reading config file');
        }));
    }

    fs.exists('./weatherCollectors.json', (exists) => {
        if (exists) {
            readObjects();
        }
    });

    let host = server.address().address;
    let port = server.address().port;
    console.log("[API] [Start] Listening at http://%s:%s", host, port);
});

/**
 * Writes a string version of all WeatherCollector objects to file
 */
async function writeObjects() {
    let objects = [];
    weatherCollectors.forEach((value, key) => {
        console.log(key);
        objects.push({
            id: key,
            lon: value.lon,
            lat: value.lat
        })
    });
    fs.writeFile('./weatherCollectors.json', JSON.stringify(objects), 'utf8', (err) => {
        if (err) {
            console.log('[Error] error on writing weatherCollectors.json');
        }
    });
}

/**
 * Reads the string version of all WeatherCollector objects from file,
 * build the objects and start them collecting data.
 * @param {*} callback 
 */
async function readObjects(callback) {
    fs.readFile('./weatherCollectors.json', 'utf-8', (err, data) => {
        if (err) {
            console.log('[Error] Error while reading weatherCollectors.json');
        }
        else {
            let objects = JSON.parse(data);
            objects.forEach((o) => {
                let weatherCollector = new WeatherCollector(config.apiToken, o.lat, o.lon);
                weatherCollectors.set(o.id, weatherCollector);
                weatherCollector.start();
            });
        }
    });
}

// Setup Global Middlewares
api.use(compression());
api.use(express.json());
api.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Auth-Token,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', false);
    // Set response header to application/json
    res.setHeader('content-type', 'application/json');

    // Pass to next layer of middleware
    next();
});

api.post('/weathercollectors', (req, res, next) => {
    let lat = req.body.lat;
    let lon = req.body.lon;
    if (lat && lon) {
        let id = `lat:${Math.round(lat * 10) / 10}lon:${Math.round(lon * 10) / 10}`;
        // let id = uuid();
        /*
         * Use only 1 WeatherCollector object in this location (location rounded to 1 decimal)
         * Pay attention that anyone with this id can delete the object afterwards.
         * This can have side effects with multiple users
         */ 
        if (!weatherCollectors.has(id)) {
            let apiToken = config.apiToken;
            let weatherCollector = new WeatherCollector(apiToken, lat, lon);
            weatherCollector.start();
            weatherCollectors.set(id, weatherCollector);
            writeObjects();
        }
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
            writeObjects();

            res.status(200).end('Deleted');
        } else {
            res.status(400).end('Bad request: There is no such weatherColelctor');
        }
    } else {
        res.status(400).end('Bad request: id is not defined');
    }
});
