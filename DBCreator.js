const sqlite3 = require('sqlite3');

function recreateDB() {
    let db = new sqlite3.Database('./weather.db');
    db.serialize(function () {
        // create DB tables
        db.run('DROP TABLE IF EXISTS Weather;');
        db.run('CREATE TABLE Weather (id VARCHAR(255) PRIMARY KEY, lat REAL, lon REAL, timestamp INTEGER, temp REAL, windspeed REAL, airpressure REAL, humidity REAL, ghi REAL);');
        db.run('DROP TABLE IF EXISTS WeatherForecast;');
        db.run('CREATE TABLE WeatherForecast (id VARCHAR(255) PRIMARY KEY, lat REAL, lon REAL, timestamp INTEGER, temp REAL, windspeed REAL, airpressure REAL, humidity REAL, ghi REAL);');
        db.run('DROP TABLE IF EXISTS WeatherHistory;');
        db.run('CREATE TABLE WeatherHistory (id VARCHAR(255) PRIMARY KEY, lat REAL, lon REAL, timestamp INTEGER, temp REAL, windspeed REAL, airpressure REAL, humidity REAL, ghi REAL);');
        db.run('DROP TABLE IF EXISTS TotalWeather;');
        db.run('CREATE TABLE TotalWeather (id VARCHAR(255) PRIMARY KEY, lat REAL, lon REAL, timestamp INTEGER, temp REAL, windspeed REAL, airpressure REAL, humidity REAL, ghi REAL);');
    });
    db.close();

    console.log("The database was created at: ./weather.db");
}

recreateDB();