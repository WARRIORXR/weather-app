import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { WIND_DIRECTIONS, WEATHER_CONDITION_MAP, AQI_LEVELS } from './constants.js';

try {
  dayjs.extend(utc);
} catch (e) {
  console.warn('Dayjs UTC extension error:', e);
}

const COUNTRY_NAMES = {
  GB: 'United Kingdom',
  US: 'United States',
  JP: 'Japan',
  FR: 'France',
  IN: 'India',
  DE: 'Germany',
  IT: 'Italy',
  ES: 'Spain',
  CA: 'Canada',
  AU: 'Australia',
  BR: 'Brazil',
  AE: 'United Arab Emirates',
  SG: 'Singapore',
  CN: 'China',
  RU: 'Russia',
  ZA: 'South Africa',
  MX: 'Mexico',
  NL: 'Netherlands',
  SE: 'Sweden',
  CH: 'Switzerland',
  NZ: 'New Zealand',
};

export function getCountryName(code) {
  if (!code) return '';
  return COUNTRY_NAMES[code.toUpperCase()] || code.toUpperCase();
}

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
  try {
    if (dayjs.prototype.utc) {
      return dayjs((timestamp + timezone) * 1000).utc().format('ddd, D MMM YYYY · HH:mm');
    }
  } catch {}
  const d = new Date((timestamp + timezone) * 1000);
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dayName = days[d.getUTCDay()];
  const date = d.getUTCDate();
  const monthName = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  return `${dayName}, ${date} ${monthName} ${year} · ${hours}:${minutes}`;
}

export function formatTime(timestamp, timezone = 0) {
  try {
    if (dayjs.prototype.utc) {
      return dayjs((timestamp + timezone) * 1000).utc().format('HH:mm');
    }
  } catch {}
  const d = new Date((timestamp + timezone) * 1000);
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDay(timestamp, timezone = 0) {
  try {
    if (dayjs.prototype.utc) {
      return dayjs((timestamp + timezone) * 1000).utc().format('dddd');
    }
  } catch {}
  const d = new Date((timestamp + timezone) * 1000);
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return days[d.getUTCDay()];
}

export function formatShortDay(timestamp, timezone = 0) {
  try {
    if (dayjs.prototype.utc) {
      return dayjs((timestamp + timezone) * 1000).utc().format('ddd');
    }
  } catch {}
  const d = new Date((timestamp + timezone) * 1000);
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return days[d.getUTCDay()];
}

export function formatShortDate(timestamp, timezone = 0) {
  try {
    if (dayjs.prototype.utc) {
      return dayjs((timestamp + timezone) * 1000).utc().format('MMM D');
    }
  } catch {}
  const d = new Date((timestamp + timezone) * 1000);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function isDay(timestamp, sunrise, sunset) {
  if (!sunrise || !sunset) return true;
  return timestamp >= sunrise && timestamp < sunset;
}

// ---- Wind ----
export function degToDirection(deg) {
  const idx = Math.round(deg / 22.5) % 16;
  return WIND_DIRECTIONS[idx] || 'N';
}
export function mpsToKmh(mps) { return Math.round(mps * 3.6); }
export function kmhToMph(kmh) { return Math.round(kmh * 0.621371); }
export function formatWindSpeed(mps, unit) {
  if (unit === 'mph') return `${kmhToMph(mpsToKmh(mps))} mph`;
  if (unit === 'ms') return `${Math.round(mps)} m/s`;
  return `${mpsToKmh(mps)} km/h`;
}

export function getBeaufortScale(mps) {
  const kmh = mpsToKmh(mps);
  if (kmh < 2) return { scale: 0, label: 'Calm', desc: 'Smoke rises vertically' };
  if (kmh <= 5) return { scale: 1, label: 'Light Air', desc: 'Smoke drift indicates wind direction' };
  if (kmh <= 11) return { scale: 2, label: 'Light Breeze', desc: 'Wind felt on face; leaves rustle' };
  if (kmh <= 19) return { scale: 3, label: 'Gentle Breeze', desc: 'Leaves & small twigs in constant motion' };
  if (kmh <= 28) return { scale: 4, label: 'Moderate Breeze', desc: 'Raises dust & loose paper; small branches move' };
  if (kmh <= 38) return { scale: 5, label: 'Fresh Breeze', desc: 'Small trees sway; crested wavelets form' };
  if (kmh <= 49) return { scale: 6, label: 'Strong Breeze', desc: 'Large branches in motion; umbrellas hard to use' };
  if (kmh <= 61) return { scale: 7, label: 'High Wind', desc: 'Whole trees in motion; walking against wind is difficult' };
  if (kmh <= 74) return { scale: 8, label: 'Gale', desc: 'Twigs break off trees; generally impedes progress' };
  return { scale: 9, label: 'Severe Gale / Storm', desc: 'Slight structural damage occurs' };
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

export function getVisibilityDescription(meters) {
  const km = meters / 1000;
  if (km >= 10) return 'Exceptional clarity — view the horizon clearly';
  if (km >= 6) return 'Good visibility — clear conditions';
  if (km >= 3) return 'Moderate visibility — mild haze or mist';
  return 'Low visibility — caution advised when driving';
}

// ---- Dew point calculation ----
export function calculateDewPoint(tempC, humidity) {
  // Simple Magnus approximation
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100.0);
  const dewPoint = (b * alpha) / (a - alpha);
  return Math.round(dewPoint);
}

// ---- AQI ----
export function getAqiInfo(aqi) {
  // OWM AQI: 1-5
  const levels = [
    { label: 'Good', color: '#10B981', advice: 'Air quality is satisfactory with little or no risk.' },
    { label: 'Fair', color: '#84CC16', advice: 'Air quality is acceptable; sensitive individuals may notice.' },
    { label: 'Moderate', color: '#F59E0B', advice: 'Sensitive groups should reduce heavy outdoor exertion.' },
    { label: 'Poor', color: '#EF4444', advice: 'Everyone may begin to experience health effects.' },
    { label: 'Very Poor', color: '#7C3AED', advice: 'Health alert: risk of health effects is high for everyone.' }
  ];
  const idx = Math.max(0, Math.min(aqi - 1, 4));
  return {
    index: aqi * 50,
    label: levels[idx].label,
    color: levels[idx].color,
    advice: levels[idx].advice,
  };
}

// ---- UV Index estimation based on time & sun altitude ----
export function getUvInfo(sunProgress, clouds = 0) {
  // Estimated UV peak at noon (progress ~ 0.5)
  let rawUv = 0;
  if (sunProgress > 0 && sunProgress < 1) {
    const peakFactor = Math.sin(sunProgress * Math.PI);
    rawUv = peakFactor * 8.5 * (1 - (clouds / 150));
  }
  const uv = Math.max(0, Math.round(rawUv * 10) / 10);
  if (uv <= 2) return { value: uv, level: 'Low', color: '#10B981', advice: 'No protection needed' };
  if (uv <= 5) return { value: uv, level: 'Moderate', color: '#F59E0B', advice: 'Wear sunglasses & SPF 30+' };
  if (uv <= 7) return { value: uv, level: 'High', color: '#F97316', advice: 'Seek shade during midday' };
  if (uv <= 10) return { value: uv, level: 'Very High', color: '#EF4444', advice: 'Minimize sun exposure 10am-4pm' };
  return { value: uv, level: 'Extreme', color: '#7C3AED', advice: 'Avoid sun exposure' };
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

// ---- Weather narrative advice ----
export function getWeatherAdvice(weatherId, tempC, windMps, pop) {
  const isCold = tempC < 8;
  const isHot = tempC > 28;
  const isWindy = windMps > 8;

  if (weatherId >= 200 && weatherId < 300) {
    return 'Thunderstorms detected. Stay indoors and avoid open areas.';
  }
  if (weatherId >= 300 && weatherId < 600) {
    return 'Rain expected. Don’t forget an umbrella or a rain jacket!';
  }
  if (weatherId >= 600 && weatherId < 700) {
    return 'Snowfall expected. Bundle up warm and drive carefully!';
  }
  if (weatherId === 800) {
    if (isHot) return 'Sunny and hot outside. Stay hydrated and use sun protection.';
    if (isCold) return 'Clear but chilly skies. Great day to dress in warm layers.';
    return 'Clear skies and pleasant conditions. Ideal weather for outdoor activities!';
  }
  if (isWindy) {
    return 'Breezy winds outside today. Keep hats and lightweight items secure.';
  }
  return 'Partly cloudy skies with comfortable ambient temperatures.';
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
  if (!code || typeof code !== 'string' || code.length !== 2) return '';
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
}

// ---- Format rain probability ----
export function formatPop(pop) { return `${Math.round((pop || 0) * 100)}%`; }

// ---- Sun arc progress (0 = sunrise, 0.5 = solar noon, 1 = sunset) ----
export function sunArcProgress(current, sunrise, sunset) {
  if (!sunrise || !sunset || sunset <= sunrise) return 0.5;
  const range = sunset - sunrise;
  const elapsed = current - sunrise;
  const val = elapsed / range;
  return isNaN(val) ? 0.5 : clamp(val, 0, 1);
}

// ---- Daylight remaining or passed ----
export function formatDaylightSummary(now, sunrise, sunset) {
  if (!sunrise || !sunset) return '';
  if (now < sunrise) {
    const diffMins = Math.round((sunrise - now) / 60);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `Sunrise in ${hrs > 0 ? hrs + 'h ' : ''}${mins}m`;
  }
  if (now <= sunset) {
    const diffMins = Math.round((sunset - now) / 60);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs > 0 ? hrs + 'h ' : ''}${mins}m daylight left`;
  }
  const diffMins = Math.round((now - sunset) / 60);
  const hrs = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `Sunset was ${hrs > 0 ? hrs + 'h ' : ''}${mins}m ago`;
}

// ---- Format "last updated" ----
export function formatLastUpdated(timestamp) {
  try {
    return `Updated at ${dayjs(timestamp * 1000).format('HH:mm')}`;
  } catch {
    const d = new Date(timestamp * 1000);
    return `Updated at ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
}

// ---- Get moon phase label ----
export function getMoonPhase(phase) {
  if (typeof phase !== 'number' || isNaN(phase)) return '🌕 Full Moon';
  if (phase < 0.03 || phase > 0.97) return '🌑 New Moon';
  if (phase < 0.22) return '🌒 Waxing Crescent';
  if (phase < 0.28) return '🌓 First Quarter';
  if (phase < 0.47) return '🌔 Waxing Gibbous';
  if (phase < 0.53) return '🌕 Full Moon';
  if (phase < 0.72) return '🌖 Waning Gibbous';
  if (phase < 0.78) return '🌗 Last Quarter';
  return '🌘 Waning Crescent';
}
