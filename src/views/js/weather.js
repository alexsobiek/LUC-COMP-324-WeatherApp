// Selectors
const navSearch = document.getElementById("navSearch");
const navSearchInput = document.getElementById("navSearchInput");

// Variables
let units = "imperial";

// call so when the page first loads it shows Chicago weather
getWeather((query !== "undefined") ? query : 60622).catch(console.error);

// Handle nav search form
navSearch.addEventListener("submit", event => {
    event.preventDefault(); // Stop from refreshing page

    // Sanitize form data
    let val = navSearchInput.value;
    val = val.replace(/\s+/, ",");

    getWeather(val).then(() => {
        navSearchInput.value = ""; // Clear search bar
    }).catch(error => {
        navSearch.classList.add("search-error");
        setTimeout(() => {
            navSearch.classList.remove("search-error");
        }, 300)
        console.error(error);
    });
});

function getWeather(query) {
    console.log(`Getting weather data for ${query}`);
    return Promise.all([
        fetch(`/api/weather/${query}&units=${units}`),
        fetch(`/api/forecast/${query}&units=${units}`)
    ]).then(resps => {
        return Promise.all([
            resps[0].json(),
            resps[1].json(),
        ]).then(json => {
            if (json[0].status === 200 && json[1].status === 200) {
                displayWeather(json[0].data);
                displayForecast(json[1].data);
                let city = json[0].data.name;
                window.history.pushState(city, "", query);
            } else throw new Error("Failed to retrieve weather data");
        });
    })
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

    // change color of temp reading
    // (blue if less than 50 degrees, red if more than)
    if(Math.round(weather.main.temp) < 50)
        document.getElementById('temp').classList.add("text-primary");
    else
        document.getElementById('temp').classList.add("text-red");
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

// method to display the correct icon based on weather type
function displayIcon(weatherType){
    sunnyIcon.style.display = "none";
    snowyIcon.style.display = "none"
    rainyIcon.style.display = "none";
    cloudyIcon.style.display = "none";
    if(weatherType == 'Clouds')
        cloudyIcon.style.display = "inline-block";
    else if(weatherType == 'Rain' || weatherType == 'Drizzle' || weatherType == 'Thunderstorm')
        rainyIcon.style.display = "inline-block";
    else if(weatherType == 'Snow')
        snowyIcon.style.display = "inline-block"
    else if(weatherType == 'Clear')
        sunnyIcon.style.display = "inline-block";
}