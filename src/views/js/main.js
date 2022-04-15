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
    .catch(console.error)                                           // Handle error
}

function displayWeather(weather) {
    let city = weather.name;
    let temp = weather.main.temp + "°F";
    console.log("City: " + city + "\n" + "Temp: " + temp);
}

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

function displayForecast(weather) {
    const dayTemps = [];
    const highTemps = [];
    for(let i = 0; i < 39; i++){
        dayTemps[i] = weather.list[i].main.temp;
    }

    

    temp = Math.max(...dayTemps);
    console.log(dayTemps);
    console.log(temp);
    //let temp = Math.round(weather.list[0].main.temp) + "°F";
    //console.log("Temp: " + temp);
    //document.getElementById('day1').innerHTML = temp;
}

getWeather(60622);
getForecast(60622);