const uuid = require('uuid/v4');
const HashMap = require('hashmap');
const sqlite3 = require('sqlite3').verbose();

let preparedStatements = new HashMap();
let db = new sqlite3.Database('./weather.db');

/**
 * Function for sql prepared statements
 * @param {*} statement 
 * @param {*} next 
 */
function prepare(statement, next) {
    if (preparedStatements.has(statement)) {
        try {
            const sql = preparedStatements.get(statement);
            sql.reset(); // provoke error if statement is finalized
            return sql;
        } catch (error) { } // don't use finalized statements
    }
    var stmt = db.prepare(statement, function (err) {
        if (err) {
            console.log('[DB] [FAIL] Error Preparing Statement "' + statement + '" \n' +
                'Error Text: ' + err.message);
            if (next) {
                err = new Error('Error while preparing statement! \n' +
                    'Statement: "' + statement + '"\n' +
                    'Error: ' + err.message);
                return next(err);
            }
        }
    });
    preparedStatements.set(statement, stmt);
    return stmt;
}

/**
 * Saves and loads weather data 
 */
module.exports = class DBController {

    /**
     * Sores weather forecast on hourly basis in the DB
     * @param {*} weatherData JSON Object of retrieved weather data
     * @param {*} lat latitute of the location
     * @param {*} lon longitute of the location
     */
    async storeWeatherForecastData(weatherData, lat, lon) {
        try {
            await this.deleteAllWeatherForecastByCoordinates(lat, lon);
            let stmt = prepare('INSERT INTO WeatherForecast(id, lat, lon, timestamp, temp, windspeed, airpressure, humidity) VALUES (?, ?, ?, ?, ?, ?, ?, ?);');
            let data = weatherData.data;
            let timestamp = Date.now();
            // iterate over Array and save all data
            data.forEach((singleWeatherData) => {
                let temp = singleWeatherData.temp;
                let windspeed = singleWeatherData.wind_spd;
                let airpressure = singleWeatherData.pres;
                let humidity = singleWeatherData.rh;
                stmt.run(uuid(), lat, lon, timestamp, temp, windspeed, airpressure, humidity, (err) => {
                    if (err) {
                        console.log('[Error] Error on inserting new weather data')
                    }
                });
                // Update milliseconds timestamp for next entry
                timestamp += 3600000;
            });
        } catch (error) {
            console.log('[Log] Catched error on storing new forecast data');
        }
    }

    /**
     * Stores weather data in the DB.
     * @param {*} weatherData JSON Object of retrieved weather data
     * @param {*} lat latitute of the location
     * @param {*} lon longitute of the location
     */
    storeWeatherData(weatherData, lat, lon) {
        let stmt = prepare('INSERT INTO Weather(id, lat, lon, timestamp, temp, windspeed, airpressure, humidity) VALUES (?, ?, ?, ?, ?, ?, ?, ?);');
        let timestamp = new Date();
        let temp = weatherData.data[0].temp;
        let windspeed = weatherData.data[0].wind_spd;
        let airpressure = weatherData.data[0].pres;
        let humidity = weatherData.data[0].rh;
        stmt.run(uuid(), lat, lon, timestamp, temp, windspeed, airpressure, humidity, (err) => {
            if (err) {
                console.log('[Error] Error on inserting new weather data')
            }
        });
    }

    /**
     * Deletes all weather forecast data of specific coordinates from DB.
     * @param {*} lat latitute
     * @param {*} lon longitute
     * @param {*} callback function with result in parameter if no error exists else null
     */
    deleteAllWeatherForecastByCoordinates(lat, lon) {
        let stmt = prepare('DELETE FROM WeatherForecast WHERE lat = ? AND lon = ?;');
        return new Promise((resolve, reject) => {
            stmt.run(lat, lon, (err) => {
                if (err) {
                    console.log('[Error] Error on deleting WeatherForecast');
                    reject(err);
                    return;
                } else {
                    resolve();
                }
            })
        });
    }

    /**
     * Gets all weather data of specific coordinates from DB.
     * @param {*} lat latitute
     * @param {*} lon longitute
     * @param {*} callback function with result in parameter if no error exists else null
     */
    getAllWeatherFromDBByCoordinates(lat, lon, callback) {
        let stmt = prepare('SELECT id, lat, lon, timestamp, temp, windspeed, airpressure, humidity FROM Weather WHERE lat = ? AND lon = ? ORDER BY timestamp DESC;');
        stmt.all(lat, lon, function (err, result) {
            if (err) {
                console.log('[Error] Error on receiving all weatherdata of specified coordinates');
                callback(null);
            }
            callback(result);
        });
    }

    /**
     * Gets latest weather data of specific coordinates from DB.
     * @param {*} lat latitute
     * @param {*} lon longitute
     * @param {*} callback function with result in parameter if no error exists else null
     */
    getLatestWeatherFromDBByCoordinates(lat, lon, callback) {
        this.getAllWeatherFromDBByCoordinates(lat, lon, (result) => {
            callback(result[0]);
        })
    }

    /**
     * Gets 24 hour weather forecast of specific coordinates from DB.
     * @param {*} lat latitute
     * @param {*} lon longitute
     * @param {*} callback function with result in parameter if no error exists else null
     */
    getWeatherForecastByCoordinates(lat, lon, callback) {
        let stmt = prepare('SELECT id, lat, lon, timestamp, temp, windspeed, airpressure, humidity FROM WeatherForecast WHERE lat = ? AND lon = ? ORDER BY timestamp DESC;');
        stmt.all(lat, lon, function (err, result) {
            if (err) {
                console.log('[Error] Error on receiving 24 hour weather forecast of specified coordinates');
                callback(null);
            }
            callback(result);
        });
    }

}