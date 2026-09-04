// ===========================
// CONSTANTS
// ===========================

export const API_BASE = 'https://api.openweathermap.org';
export const GEO_BASE = 'http://api.openweathermap.org';

export const WEATHER_CONDITION_MAP = {
  // Thunderstorm 2xx
  200: 'thunderstorm', 201: 'thunderstorm', 202: 'thunderstorm',
  210: 'thunderstorm', 211: 'thunderstorm', 212: 'thunderstorm',
  221: 'thunderstorm', 230: 'thunderstorm', 231: 'thunderstorm',
  232: 'thunderstorm',
  // Drizzle 3xx
  300: 'rain', 301: 'rain', 302: 'rain',
  310: 'rain', 311: 'rain', 312: 'rain',
  313: 'rain', 314: 'rain', 321: 'rain',
  // Rain 5xx
  500: 'rain', 501: 'rain', 502: 'rain', 503: 'rain', 504: 'rain',
  511: 'snow', 520: 'rain', 521: 'rain', 522: 'rain', 531: 'rain',
  // Snow 6xx
  600: 'snow', 601: 'snow', 602: 'snow', 611: 'snow', 612: 'snow',
  613: 'snow', 615: 'snow', 616: 'snow', 620: 'snow', 621: 'snow', 622: 'snow',
  // Atmosphere 7xx
  701: 'mist', 711: 'mist', 721: 'mist', 731: 'mist', 741: 'mist',
  751: 'mist', 761: 'mist', 762: 'mist', 771: 'mist', 781: 'mist',
  // Clear 800
  800: 'clear',
  // Clouds 8xx
  801: 'fewclouds', 802: 'clouds', 803: 'clouds', 804: 'clouds',
};

export const BACKGROUND_GRADIENTS = {
  clear_day:       { start: '#FF6B35', end: '#F7931E' },
  fewclouds_day:   { start: '#F97316', end: '#FBBF24' },
  clouds_day:      { start: '#4A5568', end: '#718096' },
  rain_day:        { start: '#1E3A8A', end: '#3730A3' },
  thunderstorm_day:{ start: '#1E1B4B', end: '#312E81' },
  snow_day:        { start: '#93C5FD', end: '#DBEAFE' },
  mist_day:        { start: '#374151', end: '#6B7280' },
  clear_night:     { start: '#0F172A', end: '#1E1B4B' },
  fewclouds_night: { start: '#1E293B', end: '#0F172A' },
  clouds_night:    { start: '#1E293B', end: '#374151' },
  rain_night:      { start: '#0C1445', end: '#1E1B4B' },
  thunderstorm_night: { start: '#0F0E1A', end: '#1E1B4B' },
  snow_night:      { start: '#1E3A8A', end: '#93C5FD' },
  mist_night:      { start: '#1E293B', end: '#374151' },
};

export const AQI_LEVELS = [
  { label: 'Good',      color: '#10B981', max: 50 },
  { label: 'Fair',      color: '#84CC16', max: 100 },
  { label: 'Moderate',  color: '#F59E0B', max: 150 },
  { label: 'Poor',      color: '#EF4444', max: 200 },
  { label: 'Very Poor', color: '#7C3AED', max: 300 },
];

export const WIND_DIRECTIONS = [
  'N','NNE','NE','ENE','E','ESE','SE','SSE',
  'S','SSW','SW','WSW','W','WNW','NW','NNW','N'
];

export const DEFAULT_API_KEY = ''; // User must provide their own
