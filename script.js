const apikey = "79905c1a250b4717409358103745e480";
const city = document.querySelector("#city");
const temp = document.querySelector("#temp");
const weather = document.querySelector("#weather");
const displayError = document.querySelector("#displayError");

const weatherImages = {
  clear: "images/clear.jpg",
  clouds: "images/clouds.jpg",
  fog: "images/fog.jpg",
  mist: "images/mist.jpg",
  haze: "images/haze.webp",
  smoke: "images/smoke.jpg",
  sunny: "images/sunny.jpg",
  cloudy: "images/cloudy.jpg",
  rain: "images/rain.png",
};

const content = document.querySelector(".content");

function clearInputField() {
  const inp = document.getElementById("inp");
  inp.value = "";
}

function changeWallpaper(weather) {
  const body = document.querySelector("body");

  if (weatherImages[weather]) {
    body.style.backgroundImage = `url(${weatherImages[weather]})`;
  } else {
    body.style.backgroundImage = `url(images/background-default.jpg)`;
  }
}

async function getWeatherData(cityName) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apikey}&units=metric`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("City not found");
    }
    const data = await response.json();

    city.innerHTML = data.name;
    temp.innerHTML = Math.round(data.main.temp) + "°C";
    weather.innerHTML = data.weather[0].main;

    displayError.textContent = "";
    content.style.display = "block";
    changeWallpaper(data.weather[0].main.toLowerCase());
  } catch (error) {
    content.style.display = "none";
    displayError.textContent = `${error}`;
    displayError.style.color = "red";
  }
}

const inp = document.querySelector("#inp");
inp.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    handleClick();
  }
});

function handleClick() {
  const rawInput = document.querySelector("#inp").value;
  if (rawInput) {
    getWeatherData(rawInput);
    clearInputField();
  } else {
    alert("Please enter a city name to continue");
  }
}

function getCityPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function successCallback(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
  getCityName(latitude, longitude);
}

function errorCallback(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.error("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      console.error("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      console.error("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      console.error("An unknown error occurred.");
      break;
  }
}

function getCityName(latitude, longitude) {
  // Example using the BigDataCloud API (check their terms of use for commercial projects):
  const apiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const cityName = data.city || data.locality;
      const country = data.countryName;
      console.log(`User is likely in: ${cityName}, ${country}`);

      getWeatherData(cityName);
    })
    .catch((error) => {
      console.error("Error with reverse geocoding API:", error);
    });
}

function handleLocationClick() {
  getCityPosition();
}
