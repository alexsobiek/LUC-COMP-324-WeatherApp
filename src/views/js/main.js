function getWeather(zipCode){
    let apiKey = 'd5064516cc8bdc14fcbe9857888299c4';
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${zipCode}&appid=${apiKey}&units=imperial`;

    fetch(url)
    .then((resp) => {return resp.json()})      // get json data
    .then((data) => displayWeather(data));      // send data to method for display
}

function displayWeather(weather){
    let city = weather.name;
    let temp = weather.main.temp + "°F";
    console.log("City: " + city + "\n" + "Temp: " + temp);
}

getWeather(60622);