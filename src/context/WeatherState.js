import { DEFAULT_API_KEY } from '../utils/constants.js';

const STORAGE_KEY = 'weather_app_state';

const defaults = {
  apiKey: DEFAULT_API_KEY,
  unit: 'celsius',          // celsius | fahrenheit
  windUnit: 'kmh',          // kmh | mph | ms
  pressureUnit: 'hpa',      // hpa | inhg
  distanceUnit: 'km',       // km | miles
  theme: 'dark',            // dark | light | auto
  colorScheme: 0,           // index of preset gradient
  animationsEnabled: true,
  particlesEnabled: true,
  savedLocations: [],       // [{ city, country, lat, lon }]
  alertsEnabled: true,
  dailyForecastTime: '08:00',
  severeWarnings: true,
  autoLocation: true,
  saveHistory: true,
  lastCity: 'London',
  lastWeather: null,
};

let state = { ...defaults };

// Load from localStorage
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  state = { ...defaults, ...saved };
} catch { /* ignore */ }

// Ensure valid apiKey and lastCity
if (!state.apiKey || typeof state.apiKey !== 'string' || !state.apiKey.trim()) {
  state.apiKey = defaults.apiKey;
}
if (!state.lastCity) {
  state.lastCity = defaults.lastCity;
}

const listeners = new Set();

const WeatherState = {
  get(key) { return key ? state[key] : { ...state }; },

  set(updates) {
    if (updates.apiKey !== undefined && (!updates.apiKey || typeof updates.apiKey !== 'string' || !updates.apiKey.trim())) {
      updates.apiKey = defaults.apiKey;
    }
    state = { ...state, ...updates };
    this._save();
    listeners.forEach(fn => fn(state));
  },

  _save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  addSavedLocation(loc) {
    const locs = state.savedLocations || [];
    if (locs.find(l => l.city === loc.city && l.country === loc.country)) return;
    if (locs.length >= 10) return;
    this.set({ savedLocations: [...locs, loc] });
  },

  removeSavedLocation(city, country) {
    const locs = (state.savedLocations || []).filter(
      l => !(l.city === city && l.country === country)
    );
    this.set({ savedLocations: locs });
  },
};

export default WeatherState;
