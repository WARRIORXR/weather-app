import dayjs from 'dayjs';
import { WIND_DIRECTIONS, WEATHER_CONDITION_MAP, AQI_LEVELS } from './constants.js';

// ---- Temperature conversion ----
export function celsiusToFahrenheit(c) { return Math.round((c * 9/5) + 32); }
export function convertTemp(celsius, unit) {
  return unit === 'fahrenheit' ? celsiusToFahrenheit(celsius) : Math.round(celsius);
}
export function formatTemp(celsius, unit) {
  return `${convertTemp(celsius, unit)}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
}

// ---- Date/Time ----
export function formatDateTime(timestamp, timezone = 0) {
  // timestamp in seconds, timezone offset in seconds
  const d = dayjs((timestamp + timezone) * 1000).utc();
  return d.format('ddd, D MMM YYYY · HH:mm');
}
export function formatTime(timestamp, timezone = 0) {
  return dayjs((timestamp + timezone) * 1000).utc().format('HH:mm');
}
export function formatDay(timestamp, timezone = 0) {
  return dayjs((timestamp + timezone) * 1000).utc().format('dddd');
}
export function formatShortDate(timestamp, timezone = 0) {
  return dayjs((timestamp + timezone) * 1000).utc().format('MMM D');
}
export function isDay(timestamp, sunrise, sunset) {
  return timestamp >= sunrise && timestamp < sunset;
}

// ---- Wind ----
export function degToDirection(deg) {
  const idx = Math.round(deg / 22.5) % 16;
  return WIND_DIRECTIONS[idx];
}
export function mpsToKmh(mps) { return Math.round(mps * 3.6); }
export function kmhToMph(kmh) { return Math.round(kmh * 0.621371); }
export function formatWindSpeed(mps, unit) {
  if (unit === 'mph') return `${kmhToMph(mpsToKmh(mps))} mph`;
  if (unit === 'ms') return `${Math.round(mps)} m/s`;
  return `${mpsToKmh(mps)} km/h`;
}

// ---- Pressure ----
export function formatPressure(hpa, unit) {
  if (unit === 'inhg') return `${(hpa * 0.02953).toFixed(2)} inHg`;
  return `${hpa} hPa`;
}

// ---- Visibility ----
export function formatVisibility(meters, unit) {
  const km = meters / 1000;
  if (unit === 'miles') return `${(km * 0.621371).toFixed(1)} mi`;
  return `${km.toFixed(1)} km`;
}

// ---- AQI ----
export function getAqiInfo(aqi) {
  // OWM AQI: 1-5
  const levels = ['Good','Fair','Moderate','Poor','Very Poor'];
  const colors = ['#10B981','#84CC16','#F59E0B','#EF4444','#7C3AED'];
  const idx = Math.min(aqi - 1, 4);
  return { label: levels[idx] || 'Unknown', color: colors[idx] || '#888', index: aqi * 50 };
}

// ---- Weather condition type ----
export function getConditionType(conditionId) {
  return WEATHER_CONDITION_MAP[conditionId] || 'clear';
}

// ---- Background gradient ----
export function getBackgroundKey(conditionId, isDayTime) {
  const type = getConditionType(conditionId);
  return `${type}_${isDayTime ? 'day' : 'night'}`;
}

// ---- Debounce ----
export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ---- Clamp ----
export function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

// ---- Country code to flag emoji ----
export function countryToFlag(code) {
  if (!code || code.length !== 2) return '';
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
}

// ---- Format rain probability ----
export function formatPop(pop) { return `${Math.round((pop || 0) * 100)}%`; }

// ---- Get OWM icon URL ----
export function getIconUrl(icon, size = '2x') {
  return `https://openweathermap.org/img/wn/${icon}@${size}.png`;
}

// ---- Percentage of day elapsed (for sun arc) ----
export function sunArcProgress(current, sunrise, sunset) {
  const range = sunset - sunrise;
  const elapsed = current - sunrise;
  return clamp(elapsed / range, 0, 1);
}

// ---- Format "last updated" ----
export function formatLastUpdated(timestamp) {
  return `Updated at ${dayjs(timestamp * 1000).format('HH:mm')}`;
}

// ---- Get moon phase label ----
export function getMoonPhase(phase) {
  if (phase < 0.03 || phase > 0.97) return '🌑 New Moon';
  if (phase < 0.22) return '🌒 Waxing Crescent';
  if (phase < 0.28) return '🌓 First Quarter';
  if (phase < 0.47) return '🌔 Waxing Gibbous';
  if (phase < 0.53) return '🌕 Full Moon';
  if (phase < 0.72) return '🌖 Waning Gibbous';
  if (phase < 0.78) return '🌗 Last Quarter';
  return '🌘 Waning Crescent';
}
