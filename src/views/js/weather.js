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
    });
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
    let time = (sunset.getUTCHours()+5) + ":" + sunset.getUTCMinutes() + "PM";

    // display data on page
    document.getElementById('city').innerHTML = `<i class="bi bi-${convertIconName(weatherType)}"></i> ${city}`;
    document.getElementById('temp').innerHTML = temp;
    document.getElementById('wind').innerHTML = wind + "mph";
    document.getElementById('humidity').innerHTML = humidity + "%";
    document.getElementById('pressure').innerHTML = pressure;
    document.getElementById('sunset').innerHTML = time // returns wrong time, need to fix

    // change color of temp reading
    // (blue if less than 50 degrees, red if more than)
    if (Math.round(weather.main.temp) < 50)
        document.getElementById('temp').classList.add("text-primary");
    else
        document.getElementById('temp').classList.add("text-red");
}

// get the temp for the next five days
function displayForecast(weather) {
    const dayTemps = [];

    // store the temp for every 3 hours
    for (let i = 0; i < 40; i++) {
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

    // get the type of weather for each of the next 5 days
    let weatherDay1 = weather.list[0].weather[0].main;
    let weatherDay2 = weather.list[8].weather[0].main;
    let weatherDay3 = weather.list[16].weather[0].main;
    let weatherDay4 = weather.list[32].weather[0].main;
    let weatherDay5 = weather.list[39].weather[0].main;

    // display data on page
    document.getElementById('day1icon').innerHTML = `<i class="bi bi-${convertIconName(weatherDay1)}"></i>`;
    document.getElementById('day2icon').innerHTML = `<i class="bi bi-${convertIconName(weatherDay2)}"></i>`;
    document.getElementById('day3icon').innerHTML = `<i class="bi bi-${convertIconName(weatherDay3)}"></i>`;
    document.getElementById('day4icon').innerHTML = `<i class="bi bi-${convertIconName(weatherDay4)}"></i>`;
    document.getElementById('day5icon').innerHTML = `<i class="bi bi-${convertIconName(weatherDay5)}"></i>`;

}

// convert weather type into icon name for that weather
// ex Clouds --> cloud-sun-fill
function convertIconName(weatherType){
    if (weatherType === 'Clouds')
        weatherType = "cloud-sun-fill";
    else if (weatherType === 'Rain' || weatherType === 'Drizzle' || weatherType === 'Thunderstorm')
        weatherType = "cloud-rain-fill";
    else if (weatherType === 'Snow')
        weatherType = "cloud-snow-fill"
    else if (weatherType === 'Clear')
        weatherType = "brightness-high-fill"

    return weatherType;
}