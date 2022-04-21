// Selectors
const navSearch = document.getElementById("navSearch");
const navSearchInput = document.getElementById("navSearchInput");
const headerConditionIcon = document.getElementById("header-condition-icon");
const citySelectors = document.querySelectorAll(".city");
const conditionSelectors = document.querySelectorAll(".condition");
const tempSelectors = document.querySelectorAll(".temp");
const feelTempSelectors = document.querySelectorAll(".feel-temp");
const highTempSelectors = document.querySelectorAll(".high-temp");
const lowTempSelectors = document.querySelectorAll(".low-temp");
const windSpeedSelectors = document.querySelectorAll(".wind");
const humiditySelectors = document.querySelectorAll(".humidity");
const pressureSelectors = document.querySelectorAll(".pressure");
const sunsetProgressSelector = document.getElementById("sunset-progress");
const sunriseTimeSelectors = document.querySelectorAll(".sunrise-time");
const sunsetTimeSelectors = document.querySelectorAll(".sunset-time");

// Variables
const updateGraph = new Event("updateGraph");
let units = "imperial";

// call so when the page first loads it shows Chicago weather
getWeather((query !== "undefined") ? query : 60622).catch(console.error);

// Handle nav search form
navSearch.addEventListener("submit", event => {
    event.preventDefault(); // Stop from refreshing page

    // Sanitize form data
    let val = navSearchInput.value;
    val = val.trim();

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
                window.history.pushState(city, "", encodeURI(query));
            } else throw new Error("Failed to retrieve weather data");
        });
    });
}

// shows current weather for selected zip code
function displayWeather(weather) {
    const city = weather.name;
    const temp = formatTemp(weather.main.temp);
    const feelTemp = formatTemp(weather.main.feels_like);
    const highTemp = formatTemp(weather.main.temp_max);
    const lowTemp = formatTemp(weather.main.temp_min);
    const wind = weather.wind.speed + (units === "imperial" ? " mph" : " m/s");
    const currentTime = new Date(weather.dt * 1000);
    const timeOffset = weather.timezone;
    const sunrise = new Date(weather.sys.sunrise * 1000);
    const sunset = new Date(weather.sys.sunset * 1000);
    const pressure = weather.main.pressure + " hPa";
    const humidity = weather.main.humidity + "%";
    const weatherType = weather.weather[0].main;

    citySelectors.forEach(elem => elem.innerHTML = city);
    conditionSelectors.forEach(elem => elem.innerHTML = weatherType);
    tempSelectors.forEach(elem => {
        if (Math.round(weather.main.temp) < 70) elem.classList.add("text-primary");
        else elem.classList.add("text-red");
        elem.innerHTML = temp
    });


    // Display data on page
    sunriseTimeSelectors.forEach(elem => elem.innerHTML = dateToLocaleHHMM(timeOffset, sunrise));
    sunsetTimeSelectors.forEach(elem => elem.innerHTML = dateToLocaleHHMM(timeOffset, sunset));
    feelTempSelectors.forEach(elem => elem.innerHTML = feelTemp);
    highTempSelectors.forEach(elem => elem.innerHTML = highTemp);
    lowTempSelectors.forEach(elem => elem.innerHTML = lowTemp);
    windSpeedSelectors.forEach(elem => elem.innerHTML = wind);
    humiditySelectors.forEach(elem => elem.innerHTML = humidity);
    pressureSelectors.forEach(elem => elem.innerHTML = pressure);

    if (currentTime < sunrise) { // sun has set already, wait for next day
        sunsetProgressSelector.dataset.progress = "100";
    } else { // we're somewhere between sunrise and sunset, calculate percentage
        sunsetProgressSelector.dataset.progress = `${((currentTime - sunrise) * 100) / (sunset - sunrise)}`;
    }
    sunsetProgressSelector.dispatchEvent(updateGraph);

    headerConditionIcon.innerHTML = `<i class="summary-icon bi bi-${convertIconName(weatherType)}"></i>`
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
function convertIconName(weatherType) {
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

function formatTemp(temp) {
    return Math.round(temp) + (units === "imperial" ? "°F" : "°C");
}

function dateToLocaleHHMM(offset, date) {
    // For displaying times, we want to show them in local time. Therefore, we calculate the offset between the local
    // time of the browser, and the timezone offset of the queried location.
    return new Date(date.getTime() + (((new Date().getTimezoneOffset() * 60) + offset) * 1000)).toLocaleTimeString('en-US');
}
