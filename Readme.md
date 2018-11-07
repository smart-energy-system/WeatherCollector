# Readme

Server runs a NodeJS express server with two endpoints to create or delete WeatherCollector objects.
A WeatherCollector object gathers every hour current weather data for a given location as well as 24 hours weather forecast on a hourly basis and stores the data in a database. While gathering new forecast data, the old deprecated data is getting replaced, so there is always the latest 24 hour forecast data.
Multiple WeatherCollector objects are possible to collect weather data for different locations at the same time.

## Install dependencies and create database

There are several dependencies you have to install before running the server. Since the the code runs on NodeJS version 8 or higher with a current npm, you need to have this installed first.

First, run `npm install` to install needed dependancy packages. You can look up the installed libraries and their versions in `package.json` file. After installing the packages, you need to create the database. Therefore, run `node DBCreator.js` to create the database file and required SQL tables. Now you are nearly ready to run the server.

## Test functionalities
Skip this section if you directly want to run the server. Otherwise you can test functionality without running the complete server. You just need to run `WeatherCollectorTest.js` to play around with some locations. 
On the first run of the module you need to provide it with your weatherbit.io api key, latitute and longitute of the location: `node WeatherCollectorTest.js "<API Key>" <lat> <lon> "<mode>"`. 
If you haven't any api key from [weatherbit.io](https://www.weatherbit.io/), see the section of requesting one ([Requesting weatherbit.io api key](#requesting-weatherbitio-api-key)) and return afterwards.
There are 5 modes available to test:

 - `collect` Collects a current weather data of the given location and stores it into the database
 - `get` Gets the latest stored current weather data of the given location
 - `collect forecast` Collects a 24 hour  weather forecast on hourly basis for a given location and stores it into the database
 - `get forecast` Gets the latest version of the forecast weather data of the given location 
 - `start` Starts a WeatherCollector object on hourly picking new weather data (current and forecast) and stores the data into the database.

If you did run the complete run command once, a test config file was created. So unless you want to change your API key or the location you can shorten the run command a bit, using only `node WeatherCollectorTest.js "<mode>"`.

## Run the server
If you have already requested a [weather.io](https://www.weatherbit.io/) API key, you can simply run the server with `npm start <API key>`. This will create a config file with your API key, so later you can start the server just running `npm start` command. If you haven't requested a weather.io API key, take a look at the section of requesting one ([Requesting weatherbit.io api key](#requesting-weatherbitio-api-key)).

## Available REST API endpoints
There are two endpoints available on the server. 

To create a new WeatherCollector object, you can send an POST request against `<basepath>/weathercollectors` providing the following data as content-type `application/json` in body :`{ "lat":<lat>, "lon": <lon> }`. 
If lat and lon are correct and the object is created successfully you will get status 201 and the following JSON object in return: `{ "lat": <lat>, "lon":<lon>, "id":<id> }`. The id is the id of the object created. You will need it to delete the object later, so don't forget it. After creating the object, the object is requesting the weather data (current and forecast) every hour.
If one of the request body properties is not defined you will get a status 400 in return.

To delete a WeatherCollector object of given id, you can send an DELETE request against `<basepath>/weathercollectors` providing the following data as content-type `application/json` in body :`{ "id":<id> }`.
 If id is set and there is a WeatherCollector object with such an id, it will be deleted and therefore stops gathering data. The return will be status 200.
 If id is not set or there is no WeatherCollector object with such an id, the return will be status 400.



## Requesting [weatherbit.io](https://www.weatherbit.io/) API key

Go to [weatherbit.io](https://www.weatherbit.io/) and sign up for a new account. Once you have down this, you can choose the free plan and request your API key. The creation of the key should not take long. You can find it on the dashboard.

## Licence
MIT
