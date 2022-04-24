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
const dailyForecastSelector = document.getElementById("daily-forecast");
const hourlyForecastSelector = document.getElementById("hourly-forecast");

// Variables
const updateGraph = new Event("updateGraph");
let units = "imperial";
let timeOffset = 0;
let sunset;
let sunrise;

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
    timeOffset = weather.timezone;
    sunrise = new Date(weather.sys.sunrise * 1000);
    sunset = new Date(weather.sys.sunset * 1000);
    const pressure = weather.main.pressure + " hPa";
    const humidity = weather.main.humidity + "%";
    const weatherType = weather.weather[0].main;

    citySelectors.forEach(elem => elem.innerHTML = city);
    conditionSelectors.forEach(elem => elem.innerHTML = weatherType);
    tempSelectors.forEach(elem => {
        formatTempElement(elem, weather.main.temp)
        elem.innerText = temp
    });

    // Display data on page
    sunriseTimeSelectors.forEach(elem => elem.innerText = toLocalDate(sunrise).toLocaleTimeString('en-US'));
    sunsetTimeSelectors.forEach(elem => elem.innerText = toLocalDate(sunset).toLocaleTimeString('en-US'));
    feelTempSelectors.forEach(elem => elem.innerText = feelTemp);
    highTempSelectors.forEach(elem => elem.innerText = highTemp);
    lowTempSelectors.forEach(elem => elem.innerText = lowTemp);
    windSpeedSelectors.forEach(elem => elem.innerText = wind);
    humiditySelectors.forEach(elem => elem.innerText = humidity);
    pressureSelectors.forEach(elem => elem.innerText = pressure);

    if (currentTime < sunrise) { // sun has set already, wait for next day
        sunsetProgressSelector.dataset.progress = "100";
    } else { // we're somewhere between sunrise and sunset, calculate percentage
        sunsetProgressSelector.dataset.progress = `${Math.min(((currentTime - sunrise) * 100) / (sunset - sunrise), 100)}`;
    }
    sunsetProgressSelector.dispatchEvent(updateGraph);

    const headerIcon = document.createElement("i");
    headerIcon.classList.add("summary-icon");
    headerIcon.classList.add("bi");
    headerIcon.classList.add(`bi-${iconFromId(weather.weather[0].id, !isNight(currentTime))}`);
    clearElements(headerConditionIcon);
    headerConditionIcon.append(headerIcon);
}

// get the temp for the next five days
function displayForecast(weather) {
    clearElements(hourlyForecastSelector);

    const highs = new Map();
    const lows = new Map();
    const pop = new Map();
    const conditions = new Map();

    for (const hour of weather.list) {
        const date = new Date(hour.dt * 1000);
        const day = date.getDay();
        if (!highs.has(day) || highs.get(day) < hour.main.temp_max) highs.set(day, hour.main.temp_max);
        if (!lows.has(day) || lows.get(day) > hour.main.temp_min) lows.set(day, hour.main.temp_min);
        if (!pop.has(day) || pop.get(day) < hour.pop) pop.set(day, hour.pop);

        // Custom logic for determining "overall" condition
        /* IDs:
        200 range = thunderstorm
        300 range = drizzle
        500 range = rain
        600 range = snow
        700 range = fog-like
        800 = clear
        801+ = clouds

        Weighting
        1 - 200 Thunderstorm
        2 - 600 Snow
        3 - 500 Rain
        4 - 300 Drizzle
        5 - 700 Fog like
        6 - 801 Clouds
        7 - 800 Clear
         */

        let weights = [200, 600, 500, 300, 700, 801, 800];
        let conditionId = (hour.weather[0].id > 800) ? 801 : Math.floor(hour.weather[0].id / 100) * 100
        if (!conditions.has(day) || weights.indexOf(conditions.get(day)) > weights.indexOf(conditionId)) conditions.set(day, conditionId);
        addHourlyWeather(hour);
    }

    const today = new Date();
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    for (const [day, high] of highs) {
        const low = lows.get(day);
        const precip = pop.get(day);
        const condition = conditions.get(day);

        const entryElem = document.createElement("div");
        entryElem.classList.add("daily-forecast-entry");
        entryElem.classList.add("text-center");

        const titleElem = document.createElement("span");
        titleElem.innerText = (day === today.getDay()) ? "Today" : days[day];

        const iconElem = document.createElement("i");
        iconElem.classList.add("bi");
        iconElem.classList.add(`bi-${iconFromId(condition)}`);

        iconElem.classList.add("text-xlg");

        const tempElem = document.createElement("p");
        tempElem.innerText = formatTemp(high);

        const precipElem = document.createElement("p");
        const precipIcon = document.createElement("i");
        precipIcon.classList.add("bi");
        precipIcon.classList.add("bi-droplet");

        const precipValElem = document.createElement("span");
        precipValElem.innerText = ` ${Math.ceil(precip * 100)}%`;
        precipElem.append(precipIcon);
        precipElem.append(precipValElem);

        entryElem.append(titleElem);
        entryElem.append(iconElem);
        entryElem.append(tempElem);
        entryElem.append(precipElem);
        dailyForecastSelector.append(entryElem);
    }
}

function addHourlyWeather(weather) {
    const forecastElem = document.createElement("div");
    forecastElem.classList.add("box");
    forecastElem.classList.add("hourly-forecast-entry");

    const date = new Date(weather.dt * 1000);
    const localDate = toLocalDate(date);

    const dateElem = document.createElement("div");
    dateElem.classList.add("hourly-date");
    const monthElem = document.createElement("span");
    monthElem.classList.add("text-lg");
    monthElem.innerText = toLocaleMMDD(localDate);
    const timeElem = document.createElement("span");
    timeElem.classList.add("text-muted");
    timeElem.innerText = toLocaleMM(localDate);
    dateElem.append(monthElem);
    dateElem.append(timeElem);

    const conditionElem = document.createElement("div");
    conditionElem.classList.add("hourly-condition");
    const conditionContainer = document.createElement("div");
    conditionContainer.classList.add("text-lg");
    const conditionIcon = document.createElement("i");
    conditionIcon.classList.add("bi");

    conditionIcon.classList.add(`bi-${iconFromId(weather.weather[0].id, !isNight(date))}`);
    const conditionSpan = document.createElement("span");
    conditionSpan.innerText = ` ${weather.weather[0].main}`;
    conditionContainer.append(conditionIcon);
    conditionContainer.append(conditionSpan);
    conditionElem.append(conditionContainer);

    const tempsElem = document.createElement("div");
    tempsElem.classList.add("hourly-temp");
    tempsElem.classList.add("text-center");

    const tempElem = document.createElement("span");
    tempElem.classList.add("text-lg");
    tempElem.innerText = formatTemp(weather.main.temp);
    formatTempElement(tempElem, weather.main.temp);
    tempsElem.append(tempElem);


    const precipElem = document.createElement("div");
    precipElem.classList.add("hourly-precip");
    precipElem.classList.add("text-end");

    const precipContainer = document.createElement("div");
    const precipIcon = document.createElement("i");
    precipIcon.classList.add("bi");
    precipIcon.classList.add("bi-droplet");
    const precipSpan = document.createElement("span");
    precipSpan.innerText = ` ${Math.round(weather.pop * 100)}%`
    precipContainer.append(precipIcon);
    precipContainer.append(precipSpan);
    precipElem.append(precipContainer);

    forecastElem.append(dateElem);
    forecastElem.append(conditionElem);
    forecastElem.append(tempsElem);
    forecastElem.append(precipElem);

    hourlyForecastSelector.append(forecastElem);
}

// convert weather type into icon name for that weather
// ex Clouds --> cloud-sun-fill
function iconFromId(id, day = true) {

    /*
    200 range = thunderstorm
    300 range = drizzle
    500 range = rain
    600 range = snow
    700 range = fog-like
    800 = clear
    801+ = clouds
     */

    if (id >= 200 && id < 300) return "cloud-lightning-rain-fill";
    else if (id >= 300 && id < 400) return "cloud-drizzle-fill";
    else if (id >= 500 && id < 600) return "cloud-rain-fill";
    else if (id >= 600 && id < 700) return "cloud-snow-fill";
    else if (id >= 700 && id < 800) return "cloud-fog2-fill";
    else if (id > 800) return (day) ? "cloud-sun-fill" : "cloud-moon-fill";
    else if (id === 800) return (day) ? "brightness-high-fill" : "moon-stars-fill";
    else return "question";
}

function formatTempElement(elem, temp) {
    if (temp <= 70) elem.classList.add("text-primary");
    else elem.classList.add("text-red");
}

function formatTemp(temp) {
    return Math.round(temp) + (units === "imperial" ? "°F" : "°C");
}

function toLocalDate(date) {
    // For displaying times, we want to show them in local time. Therefore, we calculate the offset between the local
    // time of the browser, and the timezone offset of the queried location.
    return new Date(date.getTime() + (((new Date().getTimezoneOffset() * 60) + timeOffset) * 1000));
}

function toLocaleMMDD(date) {
    let s = date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit'
    });
    if (s.startsWith("0")) s = s.substring(1);
    return s;
}

function toLocaleMM(date) {
    let s = date.toLocaleString('en-US', {
        hour: '2-digit',
    });
    if (s.startsWith("0")) s = s.substring(1);
    return s;
}

function getDaySeconds(date) {
    return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
}

function isNight(date) {
    return getDaySeconds(sunrise) > getDaySeconds(date) || getDaySeconds(date) > getDaySeconds(sunset);
}

function clearElements(elem) {
    while (elem.firstChild) elem.removeChild(elem.firstChild);
}