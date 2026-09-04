import axios from 'axios';
import { API_BASE, GEO_BASE, DEFAULT_API_KEY } from './constants.js';
import WeatherState from '../context/WeatherState.js';

function getKey() {
  const stateKey = WeatherState.get('apiKey');
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_OWM_KEY : '';
  const key = (stateKey && String(stateKey).trim()) || (envKey && String(envKey).trim()) || DEFAULT_API_KEY || '';
  if (!key) throw new Error('NO_API_KEY');
  return key;
}

// ---- Current Weather ----
export async function fetchCurrentWeather(city) {
  const key = getKey();
  const res = await axios.get(`${API_BASE}/data/2.5/weather`, {
    params: { q: city, appid: key, units: 'metric' }
  });
  return res.data;
}

export async function fetchCurrentWeatherByCoords(lat, lon) {
  const key = getKey();
  const res = await axios.get(`${API_BASE}/data/2.5/weather`, {
    params: { lat, lon, appid: key, units: 'metric' }
  });
  return res.data;
}

// ---- 5-Day Forecast ----
export async function fetchForecast(city) {
  const key = getKey();
  const res = await axios.get(`${API_BASE}/data/2.5/forecast`, {
    params: { q: city, appid: key, units: 'metric', cnt: 40 }
  });
  return res.data;
}

export async function fetchForecastByCoords(lat, lon) {
  const key = getKey();
  const res = await axios.get(`${API_BASE}/data/2.5/forecast`, {
    params: { lat, lon, appid: key, units: 'metric', cnt: 40 }
  });
  return res.data;
}

// ---- Geocoding (autocomplete) ----
export async function fetchCitySuggestions(query) {
  const key = getKey();
  const res = await axios.get(`${GEO_BASE}/geo/1.0/direct`, {
    params: { q: query, limit: 5, appid: key }
  });
  return res.data; // array of { name, country, state, lat, lon }
}

// ---- Reverse Geocoding ----
export async function reverseGeocode(lat, lon) {
  const key = getKey();
  const res = await axios.get(`${GEO_BASE}/geo/1.0/reverse`, {
    params: { lat, lon, limit: 1, appid: key }
  });
  return res.data[0];
}

// ---- Air Quality ----
export async function fetchAirQuality(lat, lon) {
  const key = getKey();
  const res = await axios.get(`${API_BASE}/data/2.5/air_pollution`, {
    params: { lat, lon, appid: key }
  });
  return res.data;
}

// ---- Parse 5-day to daily ----
export function parseForecastToDays(forecastData) {
  const byDay = {};
  for (const item of forecastData.list) {
    const date = new Date(item.dt * 1000);
    const dayKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
    if (!byDay[dayKey]) byDay[dayKey] = [];
    byDay[dayKey].push(item);
  }
  return Object.entries(byDay).slice(0, 5).map(([, items]) => {
    const midday = items.find(i => {
      const h = new Date(i.dt * 1000).getUTCHours();
      return h >= 11 && h <= 14;
    }) || items[Math.floor(items.length / 2)];
    const temps = items.map(i => i.main.temp);
    return {
      dt: midday.dt,
      high: Math.max(...temps),
      low: Math.min(...temps),
      icon: midday.weather[0].icon,
      description: midday.weather[0].description,
      condition: midday.weather[0].id,
      pop: Math.max(...items.map(i => i.pop || 0)),
      wind: midday.wind.speed,
      humidity: midday.main.humidity,
    };
  });
}

// ---- Parse hourly (first 24h entries) ----
export function parseHourly(forecastData) {
  return forecastData.list.slice(0, 8).map(item => ({
    dt: item.dt,
    temp: item.main.temp,
    feelsLike: item.main.feels_like,
    icon: item.weather[0].icon,
    description: item.weather[0].description,
    condition: item.weather[0].id,
    pop: item.pop || 0,
    wind: item.wind.speed,
    humidity: item.main.humidity,
  }));
}
