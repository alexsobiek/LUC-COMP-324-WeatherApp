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

getWeather(60622);