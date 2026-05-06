const weatherCodes = {
  0:  { desc: 'Clear Sky',        icon: '☀️' },
  1:  { desc: 'Mainly Clear',     icon: '🌤️' },
  2:  { desc: 'Partly Cloudy',    icon: '⛅' },
  3:  { desc: 'Overcast',         icon: '☁️' },
  45: { desc: 'Foggy',            icon: '🌫️' },
  48: { desc: 'Icy Fog',          icon: '🌫️' },
  51: { desc: 'Light Drizzle',    icon: '🌦️' },
  53: { desc: 'Drizzle',          icon: '🌦️' },
  55: { desc: 'Heavy Drizzle',    icon: '🌧️' },
  61: { desc: 'Light Rain',       icon: '🌧️' },
  63: { desc: 'Rain',             icon: '🌧️' },
  65: { desc: 'Heavy Rain',       icon: '🌧️' },
  71: { desc: 'Light Snow',       icon: '🌨️' },
  73: { desc: 'Snow',             icon: '❄️' },
  75: { desc: 'Heavy Snow',       icon: '❄️' },
  80: { desc: 'Rain Showers',     icon: '🌦️' },
  81: { desc: 'Rain Showers',     icon: '🌧️' },
  82: { desc: 'Heavy Showers',    icon: '⛈️' },
  95: { desc: 'Thunderstorm',     icon: '⛈️' },
  99: { desc: 'Heavy Thunderstorm', icon: '⛈️' }
};

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

async function getWeather() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) return;
  fetchWeather(city);
}

function quickSearch(city) {
  document.getElementById('cityInput').value = city;
  fetchWeather(city);
}

async function fetchWeather(city) {
  showLoader();

  try {
    // step 1 — geocode city to lat/lon
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoRes  = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      showError('City not found. Try another name!');
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // step 2 — get weather
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
    const weatherRes  = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    displayWeather(weatherData, name, country);

  } catch (err) {
    showError('Something went wrong. Check your connection!');
  }
}

function displayWeather(data, city, country) {
  const current  = data.current;
  const daily    = data.daily;
  const code     = current.weather_code;
  const weather  = weatherCodes[code] || { desc: 'Unknown', icon: '🌡️' };

  document.getElementById('cityName').textContent     = city;
  document.getElementById('country').textContent      = country;
  document.getElementById('weatherIcon').textContent  = weather.icon;
  document.getElementById('weatherDesc').textContent  = weather.desc;
  document.getElementById('temperature').textContent  = Math.round(current.temperature_2m) + '°C';
  document.getElementById('feelsLike').textContent    = 'Feels like ' + Math.round(current.apparent_temperature) + '°C';
  document.getElementById('humidity').textContent     = current.relative_humidity_2m + '%';
  document.getElementById('windSpeed').textContent    = Math.round(current.wind_speed_10m) + ' km/h';
  document.getElementById('maxTemp').textContent      = Math.round(daily.temperature_2m_max[0]) + '°C';
  document.getElementById('minTemp').textContent      = Math.round(daily.temperature_2m_min[0]) + '°C';

  // forecast
  const forecastList = document.getElementById('forecastList');
  forecastList.innerHTML = '';

  for (let i = 1; i < 7; i++) {
    const date    = new Date(daily.time[i]);
    const dayName = days[date.getDay()];
    const w       = weatherCodes[daily.weather_code[i]] || { desc: 'Unknown', icon: '🌡️' };
    const max     = Math.round(daily.temperature_2m_max[i]);
    const min     = Math.round(daily.temperature_2m_min[i]);

    const item = document.createElement('div');
    item.className = 'forecast-item';
    item.innerHTML = `
      <span class="forecast-day">${dayName}</span>
      <span class="forecast-icon">${w.icon}</span>
      <span class="forecast-desc">${w.desc}</span>
      <div class="forecast-temps">
        <span class="forecast-max">${max}°</span>
        <span class="forecast-min">${min}°</span>
      </div>
    `;
    forecastList.appendChild(item);
  }

  hideLoader();
  document.getElementById('defaultState').style.display  = 'none';
  document.getElementById('weatherDisplay').style.display = 'block';
  document.getElementById('errorBox').style.display       = 'none';
}

function showLoader() {
  document.getElementById('loader').style.display         = 'flex';
  document.getElementById('weatherDisplay').style.display = 'none';
  document.getElementById('defaultState').style.display   = 'none';
  document.getElementById('errorBox').style.display       = 'none';
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
}

function showError(msg) {
  document.getElementById('loader').style.display         = 'none';
  document.getElementById('errorBox').style.display       = 'block';
  document.getElementById('errorMsg').textContent         = msg;
  document.getElementById('defaultState').style.display   = 'block';
  document.getElementById('weatherDisplay').style.display = 'none';
}