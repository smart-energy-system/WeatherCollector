const WeatherCollector = require('./WeatherCollector');
const DBController = require('./DBController');

const token = '&APPID=4717b615b907e7397d0b5fd0b0e02d60';
let w = new WeatherCollector(token, 48.777111, 9.180770);
// w.retrieveWeatherAndSave();
let w2 = new WeatherCollector(token, 31.230391, 121.473701);
// w2.retrieveWeatherAndSave();
let db = new DBController();
db.getAllWeatherFromDBByCoordinates(31.230391, 121.473701, (result) => {
    console.log(result);
});
