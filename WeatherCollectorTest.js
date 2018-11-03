const WeatherCollector = require('./WeatherCollector');
const DBController = require('./DBController');
const fs = require('fs');
let config;
function init(callback) {
    const args = process.argv.slice(2);
    if (args.length === 3) {
        config = {
            apiToken: args[0],
            lat: args[1],
            lon: args[2]
        };
        fs.writeFileSync('./testconfig.json', JSON.stringify(config), 'utf8', (err) => {
            console.log('[Error] Error while writing test config file');
        });
        callback(config);
    } else if (fs.existsSync('./testconfig.json')) {
        config = JSON.parse(fs.readFileSync('./testconfig.json', 'utf-8', (err) => {
            console.log('[Error] Error while reading test config file');
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
});