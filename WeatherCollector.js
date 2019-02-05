const request = require('request');
const DBController = require('./DBController');

function dateToISOString(year, month, day, hour) {
    if (month < 10) {
        month = `0${month}`;
    }
    if (day < 10) {
        day = `0${day}`;
    }
    return `${year}-${month}-${day}:${hour}`;
}

function getDateArray() {
    let dates = [];
    let date = new Date();
    let hour = date.getUTCHours();
    for (let i = 6; i > 0; --i) {
        let year = date.getUTCFullYear();
        let month = date.getUTCMonth() + 1;
        let day = date.getUTCDate();
        dates.push(dateToISOString(year, month, day, hour));
        // Update date one day before
        // TODO Pay attention for months with less than 31 days
        date.setDate(date.getDate() - 1);
    }
    return dates;
}


/**
 * Collects weather data from weatherbit.io
 */
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
        this.retrieveWeatherAndSave();
        this.retrieveForecastAndSave();
        setInterval(() => {
            this.retrieveWeatherAndSave();
            this.retrieveForecastAndSave();
        }, 3600000);

        this.retrieveHistoryAndSave();
        setInterval(() => {
            this.retrieveHistoryAndSave();
        }, 86400000);
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
            console.log('[Log] Catched error in retrieving current weather data and store it into DB');
        };
    }

    /**
     * Function to retrieve weather forecast data and save them to an SQLite3 DB.
     */
    async retrieveForecastAndSave() {
        try {
            const weatherData = await this.getWeatherForecast(this.lat, this.lon);
            // Save weather data in DB
            this.db.storeWeatherForecastData(weatherData, this.lat, this.lon);
            //return weatherData;
        } catch (error) {
            console.log('[Log] Catched error in retrieving forecast and store it into DB');
        };
    }

    async retrieveHistoryAndSave() {
        try {
            let dates = getDateArray();
            // Iterate through dates and collect history of each day
            const weatherData = [];
            for (let i = 0; i < dates.length - 1; ++i) {
                let dayHistory = await this.getWeatherHistory(dates[i + 1], dates[i], this.lat, this.lon);
                dayHistory.data.forEach((element) => {
                    weatherData.push(element);
                });
            }
            // Save weather data in DB
            this.db.storeWeatherHistoryData(weatherData, this.lat, this.lon);
            //return weatherData;
        } catch (error) {
            console.log('[Log] Catched error in retrieving forecast and store it into DB');
        };
    }

    async retrieveTotalWeatherAndSave() {
        try {
            let dates = getDateArray();
            // Iterate through dates and collect history of each day
            const weatherData = [];
            for (let i = 0; i < dates.length - 1; ++i) {
                let dayHistory = await this.getWeatherHistory(dates[i + 1], dates[i], this.lat, this.lon);
                dayHistory.data.forEach((element) => {
                    weatherData.push(element);
                });
            }
            let forecast = await this.getWeatherForecast(this.lat, this.lon);
            this.db.storeTotalWeatherData(weatherData, forecast, this.lat, this.lon);
        } catch (error) {
            console.log('[Log] Catched error in retrieving forecast and store it into DB');
        }
    }

    /**
     * Gets weather data from weatherbit.io by specified coordinates.
     * @param {} lat The latitute coordinate
     * @param {*} lon The longitute coordinate
     */
    getWeatherDataByCoord(lat, lon) {
        return new Promise((resolve, reject) => {
            request({
                uri: `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&key=${this.apiToken}`,
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

    /**
     * Gets 24 hours weather forecast on hourly basis data from weatherbit.io by specified coordinates.
     * @param {} lat The latitute coordinate
     * @param {*} lon The longitute coordinate
     */
    getWeatherForecast(lat, lon) {
        return new Promise((resolve, reject) => {
            request({
                uri: `https://api.weatherbit.io/v2.0/forecast/hourly?lat=${lat}&lon=${lon}&key=${this.apiToken}&hours=24`,
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

    /**
     * Gets weather history on hourly basis data from weatherbit.io by specified coordinates.
     * @param {} startdate The startdate of the history
     * @param {} enddate The enddate of the history
     * @param {} lat The latitute coordinate
     * @param {*} lon The longitute coordinate
     */
    getWeatherHistory(startdate, enddate, lat, lon) {
        return new Promise((resolve, reject) => {
            request({
                uri: `https://api.weatherbit.io/v2.0/history/hourly?lat=${lat}&lon=${lon}&start_date=${startdate}&end_date=${enddate}&tz=utc&key=${this.apiToken}`,
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