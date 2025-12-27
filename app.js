
const valueSearch = document.getElementById("valueSearch");
const cityNameEl = document.querySelector("#city span");
const flagImg = document.querySelector("#city img");
const weatherIcon = document.getElementById("weatherIcon");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const clouds = document.getElementById("clouds");
const humidity = document.getElementById("humidity");
const pressure = document.getElementById("pressure");
const wind = document.getElementById("wind");
const visibility = document.getElementById("visibility");
const uvIndex = document.getElementById("uvIndex");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const form = document.getElementById("form");
const main = document.querySelector("main");
const suggestionsBox = document.getElementById("suggestions");

const API_KEY = "e04c3b364f27dabb841418d9dcaa2e08";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = valueSearch.value.trim();
  if (query) await searchWeather(query);
});

async function searchWeather(cityName) {
  main.classList.add('loading');
  try {
    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`);
    const weatherData = await weatherRes.json();

    if (weatherData.cod !== 200) throw new Error('City not found');

    updateWeatherDisplay(weatherData);

    await fetchUVIndex(weatherData.coord.lat, weatherData.coord.lon);

    valueSearch.value = "";
    suggestionsBox.classList.remove("show");
  } catch (error) {
    console.error('Error:', error);
    showError();
  } finally {
    main.classList.remove('loading');
  }
}

function updateWeatherDisplay(data) {
  cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
  flagImg.src = `https://flagsapi.com/${data.sys.country}/shiny/64.png`;

  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
  tempEl.textContent = `${Math.round(data.main.temp)} °C`;
  descEl.textContent = data.weather[0].description.toUpperCase();

  clouds.textContent = data.clouds.all;
  humidity.textContent = data.main.humidity;
  pressure.textContent = data.main.pressure;
  wind.textContent = data.wind ? Math.round(data.wind.speed * 3.6) : 0;

  const visibilityKm = data.visibility ? (data.visibility / 1000).toFixed(1) : "N/A";
  visibility.textContent = visibilityKm;

  const sunriseTime = new Date(data.sys.sunrise * 1000);
  const sunsetTime = new Date(data.sys.sunset * 1000);
  sunrise.textContent = formatTime(sunriseTime);
  sunset.textContent = formatTime(sunsetTime);
}

async function fetchUVIndex(lat, lon) {
  try {
    const uvRes = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    const uvData = await uvRes.json();

    if (uvData.value !== undefined) {
      const uvValue = uvData.value;
      uvIndex.textContent = uvValue.toFixed(1);

      uvIndex.className = '';
      if (uvValue < 3) {
        uvIndex.classList.add('uv-low');
      } else if (uvValue < 6) {
        uvIndex.classList.add('uv-moderate');
      } else if (uvValue < 8) {
        uvIndex.classList.add('uv-high');
      } else if (uvValue < 11) {
        uvIndex.classList.add('uv-very-high');
      } else {
        uvIndex.classList.add('uv-extreme');
      }
    } else {
      uvIndex.textContent = "N/A";
    }
  } catch (error) {
    console.error('Error fetching UV index:', error);
    uvIndex.textContent = "N/A";
  }
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showError() {
  main.classList.add("error");
  setTimeout(() => main.classList.remove("error"), 800);
}

let debounceTimer;
valueSearch.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchCitySuggestions, 400);
  if (valueSearch.value.trim().length < 2) suggestionsBox.classList.remove("show");
});

async function fetchCitySuggestions() {
  const q = valueSearch.value.trim();
  if (q.length < 2) {
    suggestionsBox.innerHTML = "";
    suggestionsBox.classList.remove("show");
    return;
  }

  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=20&language=en&format=json`);
    const data = await res.json();

    suggestionsBox.innerHTML = "";
    if (!data.results || data.results.length === 0) {
      suggestionsBox.classList.remove("show");
      return;
    }

    const filtered = data.results
      .filter(p => (p.population || 0) > 20000 || ["PPLA", "PPLC"].includes(p.feature_code))
      .sort((a, b) => (b.population || 0) - (a.population || 0))
      .slice(0, 8);

    if (filtered.length === 0) {
      suggestionsBox.classList.remove("show");
      return;
    }

    filtered.forEach(place => {
      const div = document.createElement("div");
      const region = place.admin1 ? `, ${place.admin1}` : "";
      const country = place.country ? `, ${place.country}` : "";
      div.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${place.name}${region}${country}`;

      div.onclick = () => {
        valueSearch.value = place.name;
        suggestionsBox.classList.remove("show");
        fetchWeatherByCoords(place.latitude, place.longitude, place.name, place.country_code || place.country);
      };

      suggestionsBox.appendChild(div);
    });

    suggestionsBox.classList.add("show");
  } catch (err) {
    console.error(err);
    suggestionsBox.classList.remove("show");
  }
}

document.addEventListener("click", e => {
  if (!valueSearch.contains(e.target) && !suggestionsBox.contains(e.target)) {
    suggestionsBox.classList.remove("show");
  }
});

searchWeather("Rajkot");
