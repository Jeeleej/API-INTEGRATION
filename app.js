let valueSearch = document.getElementById("valueSearch");
let city = document.getElementById("city");
let temperature = document.getElementById("temperature");
let clouds = document.querySelector(".description");
let humidity = document.getElementById("humidity");
let pressure = document.getElementById("pressure");
let form = document.querySelector("form");
let main = document.querySelector("main");

let id = "e04c3b364f27dabb841418d9dcaa2e08";
let url =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&appid=" + id;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (valueSearch.value !== "") {
    searchWeather();
  }
});

const searchWeather = () => {
  fetch(url + "&q=" + valueSearch.value)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      if (data.cod == 200) {
        city.querySelector("figcaption").innerText = data.name;
        city.querySelector("img").src = "https://flagsapi.com/" + data.sys.country + "/shiny/32.png";
        temperature.querySelector("img").src ="https://openweathermap.org/img/wn/" + data.weather[0].icon + "@4x.png";
        temperature.querySelector("figcaption span").innerText = data.main.temp;
        clouds.innerText = data.weather[0].description;
        document.getElementById("clouds").innerText = data.clouds.all;
        humidity.innerText = data.main.humidity;
        pressure.innerText = data.main.pressure;
      } else {
        main.classList.add("error");
        setTimeout(() => {
          main.classList.remove("error");
        }, 1000);
      }

      valueSearch.value = "";
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      main.classList.add("error");
      setTimeout(() => {
        main.classList.remove("error");
      }, 1000);
    });
};

const initApp = () => {
  valueSearch.value = "Rajkot";
  searchWeather();
};

initApp();
