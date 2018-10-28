const WeatherCollector = require('./WeatherCollector');
const DBController = require('./DBController');
const fs = require('fs');

let config;

function init(callback) {
    const args = process.argv.slice(2);
    if (args.length === 3) {
        this.config = {
            apiToken: args[0],
            lat: args[1],
            lon: args[2]
        };
        fs.writeFileSync('./config.json', JSON.stringify(this.config), 'utf8', (err) => {
            console.log('[Error] Error while writing config file');
        });
        callback(config);
    } else if (fs.existsSync('./config.json')) {
        config = JSON.parse(fs.readFileSync('./config.json', 'utf-8', (err) => {
            console.log('[Error] Error while reading config file');
        }));
        callback(config);
    }
}
init((config) => {
    const weatherCollector = new WeatherCollector(config.apiToken, config.lat, config.lon);
    const db = new DBController();
    
    
    // weatherCollector.retrieveWeatherAndSave();
    db.getLatestWeatherFromDBByCoordinates(config.lat, config.lon, (result) => {
        console.log(result);
    });
})
