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

module.exports = class DBController {

    /**
     * Stores weather data in the DB.
     * @param {*} weatherData JSON Object of retrieved weather data
     */
    storeWeatherData(weatherData, lat, lon) {
        let stmt = prepare('INSERT INTO Weather(id, lat, lon, timestamp, temp, windspeed, airpressure, humidity) VALUES (?, ?, ?, ?, ?, ?, ?, ?);');
        let timestamp = new Date().getDate();
        let temp = weatherData.main.temp;
        let windspeed = weatherData.wind.speed;
        let airpressure = weatherData.main.pressure;
        let humidity = weatherData.main.humidity;
        stmt.run(uuid(), lat, lon, timestamp, temp, windspeed, airpressure, humidity, (err) => {
            if (err) {
                console.log('[Error] Error on inserting new weather data')
            }
        });
    }

    /**
     * Gets all weather data of specific coordinates from DB.
     * @param {*} lat latitute
     * @param {*} lon longitute
     * @param {*} callback function with result in parameter if no error exists else null
     */
    getAllWeatherFromDBByCoordinates(lat, lon, callback) {
        let stmt = prepare('SELECT id, lat, lon, timestamp, temp, windspeed, airpressure, humidity FROM Weather WHERE lat = ? AND lon = ?;');
        stmt.all(lat, lon, function (err, result) {
            if (err) {
                console.log('[Error] Error on receiving all weatherdata of specified coordinates');
                callback(null);
            }
            callback(result);
        });
    }

}