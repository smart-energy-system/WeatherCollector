const sqlite3 = require('sqlite3');

function recreateDB() {
    let db = new sqlite3.Database('./weather.db');
    db.serialize(function () {
        // create DB tables
        db.run('DROP TABLE IF EXISTS Weather;');
        db.run('CREATE TABLE Weather (id VARCHAR(255) PRIMARY KEY, lat REAL, lon REAL, timestamp VARCHAR(255), temp REAL, windspeed REAL, airpressure REAL, humidity REAL);');
    });
    db.close();

    console.log("The database was created at: ./weather.db");
}

recreateDB();