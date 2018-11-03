const request = require('request');
const DBController = require('./DBController');


module.exports = class WeatherCollector {

    constructor(apiToken, lat, lon) {
        this.apiToken = apiToken;
        this.lon = lon;
        this.lat = lat;
        this.db = new DBController();
        this.canStart = true;
    }

    /**
     * Starts the WeatherCollector object
     */
    async start() {
        setTimeout(() => {
            this.retrieveWeatherAndSave();
            this.start();
        }, 6000);
    }


    /**
     * Function to retrieve weather data and save them to an SQLite3 DB.
     */
    async retrieveWeatherAndSave() {
        try {
            const weatherData = await this.getWeatherDataByCoord(this.lat, this.lon);
            // Save weather data in DB
            this.db.storeWeatherData(weatherData, this.lat, this.lon);
            //return weatherData;
        } catch (error) {

        };
    }

    /**
     * Gets weather data from OpenWeather.org by specified coordinates.
     * @param {} lat The latitute coordinate
     * @param {*} lon The longitute coordinate
     */
    getWeatherDataByCoord(lat, lon) {
        return new Promise((resolve, reject) => {
            request({
                uri: `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric${this.apiToken}`,
                method: 'GET'
            }, (error, response, body) => {
                if (error) {
                    console.log('Error on retrieving weather data');
                    reject(error);
                    return;
                }
                resolve(JSON.parse(body));
            });
        });
    }

}