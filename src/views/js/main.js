// get current weather
function getWeather(zipCode){
    let url = `/api/weather/${zipCode}&units=imperial`;

    fetch(url)
    .then((resp) => {
        return resp.json().then(res => {                            // get json data
            if (res.status === 200) return res.data;                // 200 = Good response
            else throw new Error("Failed to retrieve weather data");// Failed response
        }).catch(console.error);
    })
    .then((data) => { displayWeather(data)})                        // send data to method for display
    //.then((data) => {console.log(data)})
    .catch(console.error)                                           // Handle error
}

// get 5 day forecast
function getForecast(zipCode){
    let url =`/api/forecast/${zipCode}&units=imperial`;
    fetch(url)
    .then((resp) => {
        return resp.json().then(res => {                            // get json data
            if (res.status === 200) return res.data;                // 200 = Good response
            else throw new Error("Failed to retrieve weather data");// Failed response
        }).catch(console.error);
    })
    .then((data) => { displayForecast(data)})                        // send data to method for display
    //.then((data) => { console.log(data)})
    .catch(console.error)
}

// shows current weather for selected zip code
function displayWeather(weather) {
    let city = weather.name;
    let temp = Math.round(weather.main.temp) + "°F";
    let wind = weather.wind.speed;
    let sunset = new Date(weather.sys.sunset);
    let pressure = weather.main.pressure;
    let humidity = weather.main.humidity;
    let weatherType = weather.weather[0].main;
    // ====== returns wrong time ========
    let time = sunset.getUTCHours() + ":" + sunset.getUTCMinutes();

    // display data on page
    document.getElementById('city').innerHTML = city;
    document.getElementById('temp').innerHTML = temp;
    document.getElementById('wind').innerHTML = wind + "mph";
    document.getElementById('humidity').innerHTML = humidity + "%";
    document.getElementById('pressure').innerHTML = pressure;
    document.getElementById('sunset').innerHTML = time // returns wrong time, need to fix

    // save icon svg's to variables
    rainyIcon = document.getElementById('rainyIcon');
    sunnyIcon = document.getElementById('sunnyIcon');
    cloudyIcon = document.getElementById('cloudyIcon');
    snowyIcon = document.getElementById('snowyIcon');

    // display the icon based on weather type (ex. Clear, Rain, Cloudy)
    displayIcon(weatherType);
}

// get the temp for the next five days
function displayForecast(weather) {
    const dayTemps = [];

    // store the temp for every 3 hours
    for(let i = 0; i < 40; i++){
        dayTemps[i] = Math.round(weather.list[i].main.temp);
    }

    // choose highest temp during that day
    day1temp = Math.max(dayTemps[0], dayTemps[7]);
    day2temp = Math.max(dayTemps[8], dayTemps[15]);
    day3temp = Math.max(dayTemps[16], dayTemps[23]);
    day4temp = Math.max(dayTemps[24], dayTemps[31]);
    day5temp = Math.max(dayTemps[32], dayTemps[39]);

    //console.log(day1temp, day2temp, day3temp, day4temp, day5temp);
    // send to html
    document.getElementById('day1temp').innerHTML = day1temp + "°F";
    document.getElementById('day2temp').innerHTML = day2temp + "°F";
    document.getElementById('day3temp').innerHTML = day3temp + "°F";
    document.getElementById('day4temp').innerHTML = day4temp + "°F";
    document.getElementById('day5temp').innerHTML = day5temp + "°F";
}

// get zipcode from search bar and display weather results
function displaySearch(){
    let zipCode = document.getElementById('searchInput').value;
    console.log(zipCode);
    getWeather(zipCode);
    getForecast(zipCode);
}

// call so when the page first loads it shows Chicago weather
getWeather(60622);
getForecast(60622);

// method to display the correct icon based on weather type
function displayIcon(weatherType){
    if(weatherType == 'Clouds')
        cloudyIcon.style.display = "inline-block";
    else if(weatherType == 'Rain' || weatherType == 'Drizzle' || weatherType == 'Thunderstorm')
        rainyIcon.style.display = "inline-block";
    else if(weatherType == 'Snow')
        snowyIcon.style.display = "inline-block"
    else if(weatherType == 'Clear')
        sunnyIcon.style.display = "inline-block";
    else
        sunnyIcon.style.display = "inline-block";
}