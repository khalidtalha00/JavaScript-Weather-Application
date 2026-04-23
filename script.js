const apikey = "79905c1a250b4717409358103745e480";
const city = document.querySelector("#city");
const temp = document.querySelector("#temp");
const weather = document.querySelector("#weather");
const humidity = document.querySelector("#humidity");
const displayError = document.querySelector("#displayError");
const loader = document.querySelector("#loader");

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
function getWeatherEmoji(weather) {
  let emj = "";
  switch (weather.toLowerCase()) {
    case "clear":
      emj = "☀️";
      break;
    case "clouds":
      emj = "☁️";
      break;
    case "fog":
      emj = "🌁";
      break;
    case "mist":
      emj = "♒";
      break;
    case "haze":
      emj = "🌁";
      break;
    case "smoke":
      emj = "😶‍🌫️";
      break;
    case "sunny":
      emj = "☀️";
      break;
    case "cloudy":
      emj = "☁️";
      break;
    case "rain":
      emj = "🌧️";
      break;
    default:
      emj = "❓";
  }
  return emj;
}

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

async function getWeatherData(cityName, country) {
  loader.style.display = "block";
  content.style.display = "none";
  displayError.textContent = "";

  let query = cityName;
  if (country) {
    query = `${cityName},${country}`;
  }
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apikey}&units=metric`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("City not found");
    }
    const data = await response.json();
    const emoji = getWeatherEmoji(data.weather[0].main);
    city.innerHTML = data.name + ", " + data.sys.country;
    temp.innerHTML = "🌡️ " + Math.round(data.main.temp) + "°C";
    weather.innerHTML = emoji + " " + data.weather[0].main;
    humidity.innerHTML = "♒ " + data.main.humidity + "% humidity";

    displayError.textContent = "";
    content.style.display = "block";
    changeWallpaper(data.weather[0].main.toLowerCase());

    // start/refresh local weather-news feed
    startNewsAutoRefresh(data.name, data.sys.country);
  } catch (error) {
    content.style.display = "none";
    displayError.textContent = `${error}`;
    displayError.style.color = "red";
  } finally {
    loader.style.display = "none";
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
function handleLocationClick() {
  loader.style.display = "block";
  content.style.display = "none";
  displayError.textContent = "";
  getCityPosition();
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
  
  getCityName(latitude, longitude);
}

function errorCallback(error) {
  loader.style.display = "none";
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
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
      const country = data.countryCode;
      getWeatherData(cityName, country);
    })
    .catch((error) => {
      loader.style.display = "none";
      console.error("Error with reverse geocoding API:", error);
    });
}

const THEME_KEY = "clarityweather-theme";

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-theme", isDark);

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.textContent = isDark ? "☀️" : "🌙";
    btn.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
}

window.toggleTheme = toggleTheme;
initTheme();

const newsLeft = document.getElementById("newsLeft");
const newsRight = document.getElementById("newsRight");
const NEWS_REFRESH_MS = 10 * 60 * 1000;
let newsIntervalId = null;

function setNewsMessage(message) {
  if (newsLeft) newsLeft.innerHTML = `<li>${message}</li>`;
  if (newsRight) newsRight.innerHTML = `<li>${message}</li>`;
}

function renderNews(items) {
  const safeItems = items.slice(0, 12);
  const leftItems = safeItems.filter((_, i) => i % 2 === 0);
  const rightItems = safeItems.filter((_, i) => i % 2 !== 0);

  const makeHtml = (arr) =>
    arr.length
      ? arr
          .map(
            (n) => `
            <li>
              <a href="${n.url}" target="_blank" rel="noopener noreferrer">${n.title}</a>
              <div style="opacity:.8;font-size:.75rem;margin-top:4px;">${n.source || "Unknown source"}</div>
            </li>`
          )
          .join("")
      : "<li>No recent weather news found.</li>";

  if (newsLeft) newsLeft.innerHTML = makeHtml(leftItems);
  if (newsRight) newsRight.innerHTML = makeHtml(rightItems);
}

async function fetchWeatherNews(cityName, countryCode) {
  if (!cityName) return;

  setNewsMessage("Loading nearby weather news...");

  const query = encodeURIComponent(`(weather OR storm OR flood OR heatwave) AND ${cityName} ${countryCode || ""}`);
  const newsUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=ArtList&maxrecords=20&format=json&sort=DateDesc`;

  try {
    const response = await fetch(newsUrl);
    if (!response.ok) throw new Error("News request failed");

    const data = await response.json();
    const articles = (data.articles || []).map((a) => ({
      title: a.title || "Untitled",
      url: a.url,
      source: a.sourceCommonName || a.domain
    }))
    .filter((a) => a.url);

    renderNews(articles);
  } catch (err) {
    setNewsMessage("Could not load weather news right now.");
    console.error("Weather news error:", err);
  }
}

function startNewsAutoRefresh(cityName, countryCode) {
  if (newsIntervalId) clearInterval(newsIntervalId);

  fetchWeatherNews(cityName, countryCode);
  newsIntervalId = setInterval(() => {
    fetchWeatherNews(cityName, countryCode);
  }, NEWS_REFRESH_MS);
}

