import { DEFAULT_API_KEY } from '../utils/constants.js';

const STORAGE_KEY = 'weather_app_state';
const CACHE_STORAGE_KEY = 'weather_app_cache_v2';
const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL for weather data

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
  searchHistory: [],        // ['London', 'Tokyo', 'Paris']
  alertsEnabled: true,
  dailyForecastTime: '08:00',
  severeWarnings: true,
  autoLocation: true,
  saveHistory: true,
  lastCity: 'London',
  lastWeather: null,
  dataSource: 'live',       // live | cached | simulation
};

let state = { ...defaults };
const memoryCache = new Map();

// Load state from localStorage
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
if (!Array.isArray(state.searchHistory)) {
  state.searchHistory = [];
}

// Hydrate memory cache from localStorage
try {
  const diskCache = JSON.parse(localStorage.getItem(CACHE_STORAGE_KEY) || '{}');
  const now = Date.now();
  Object.entries(diskCache).forEach(([k, item]) => {
    if (item && item.expires > now) {
      memoryCache.set(k, item);
    }
  });
} catch { /* ignore */ }

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
    if (locs.find(l => l.city.toLowerCase() === loc.city.toLowerCase() && l.country === loc.country)) return;
    if (locs.length >= 10) return;
    this.set({ savedLocations: [...locs, loc] });
  },

  removeSavedLocation(city, country) {
    const locs = (state.savedLocations || []).filter(
      l => !(l.city.toLowerCase() === city.toLowerCase() && l.country === country)
    );
    this.set({ savedLocations: locs });
  },

  addSearchHistory(city) {
    if (!city || !state.saveHistory) return;
    const trimmed = city.trim();
    const existing = (state.searchHistory || []).filter(c => c.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...existing].slice(0, 6);
    this.set({ searchHistory: updated });
  },

  clearSearchHistory() {
    this.set({ searchHistory: [] });
  },

  // ---- Caching Layer ----
  getCached(key) {
    const item = memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      memoryCache.delete(key);
      this._saveDiskCache();
      return null;
    }
    return item.data;
  },

  setCached(key, data, ttlMs = DEFAULT_TTL_MS) {
    const item = {
      data,
      storedAt: Date.now(),
      expires: Date.now() + ttlMs,
    };
    memoryCache.set(key, item);
    this._saveDiskCache();
  },

  _saveDiskCache() {
    try {
      const obj = {};
      const now = Date.now();
      memoryCache.forEach((val, k) => {
        if (val.expires > now) obj[k] = val;
      });
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(obj));
    } catch { /* ignore */ }
  },

  clearCache() {
    memoryCache.clear();
    try { localStorage.removeItem(CACHE_STORAGE_KEY); } catch { /* ignore */ }
  }
};

export default WeatherState;
