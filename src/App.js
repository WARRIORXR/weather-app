import './styles/globals.css';

import SearchBar from './components/SearchBar.js';
import CurrentWeather from './components/CurrentWeather.js';
import ForecastCard from './components/ForecastCard.js';
import HourlyForecast from './components/HourlyForecast.js';
import WeatherDetails from './components/WeatherDetails.js';
import SavedLocations from './components/SavedLocations.js';
import SettingsModal from './components/SettingsModal.js';
import AlertBanner from './components/AlertBanner.js';

import {
  fetchCurrentWeather, fetchCurrentWeatherByCoords,
  fetchForecast, fetchForecastByCoords,
  fetchAirQuality, parseForecastToDays, parseHourly
} from './utils/api.js';
import { isDay, getBackgroundKey } from './utils/helpers.js';
import { BACKGROUND_GRADIENTS } from './utils/constants.js';
import WeatherState from './context/WeatherState.js';

export default class App {
  constructor() {
    this.components = {};
    this.currentData = null;
    this._loading = false;
  }

  async init() {
    this._setupElements();
    this._initComponents();
    this._applyTheme();
    this._initParticles();
    this._restoreLastCity();
  }

  _setupElements() {
    this.els = {
      alertBanner:    document.getElementById('alert-banner'),
      searchBar:      document.getElementById('search-bar'),
      emptyState:     document.getElementById('empty-state'),
      currentWeather: document.getElementById('current-weather'),
      hourly:         document.getElementById('hourly-forecast'),
      forecast:       document.getElementById('forecast-section'),
      details:        document.getElementById('weather-details'),
      saved:          document.getElementById('saved-locations'),
      settingsBtn:    document.getElementById('settings-btn'),
      settingsModal:  document.getElementById('settings-modal'),
      settingsContent:document.getElementById('settings-content'),
      trendings:      document.querySelectorAll('.trending-city'),
    };
  }

  _initComponents() {
    // Alert Banner
    this.components.alert = new AlertBanner(this.els.alertBanner);

    // Search Bar
    this.components.search = new SearchBar(
      this.els.searchBar,
      (city, lat, lon) => this._loadWeather(city, lat, lon),
      () => this._useGps()
    );

    // Current Weather
    this.components.current = new CurrentWeather(
      this.els.currentWeather,
      (data) => this._saveCity(data),
      (unit) => this._toggleUnit(unit)
    );

    // Forecast
    this.components.forecast = new ForecastCard(this.els.forecast);

    // Hourly
    this.components.hourly = new HourlyForecast(this.els.hourly);

    // Details
    this.components.details = new WeatherDetails(this.els.details);

    // Saved Locations
    this.components.saved = new SavedLocations(
      this.els.saved,
      (city, country) => this._loadWeather(city),
      () => this.els.searchBar.querySelector('#search-input')?.focus()
    );
    this.components.saved.render();

    // Settings Modal
    this.components.settings = new SettingsModal(
      this.els.settingsModal,
      this.els.settingsContent,
      () => {},
      () => {
        this._applyTheme();
        this._initParticles();
        if (this.currentData) this._refreshCurrentDisplay();
      }
    );

    // Settings button
    this.els.settingsBtn?.addEventListener('click', () => {
      this.components.settings.open();
    });

    // Trending cities
    this.els.trendings?.forEach(btn => {
      btn.addEventListener('click', () => {
        this._loadWeather(btn.dataset.city);
        this.components.search.setValue(btn.dataset.city);
      });
    });
  }

  async _loadWeather(city, lat, lon) {
    if (this._loading) return;
    const apiKey = WeatherState.get('apiKey');
    if (!apiKey) {
      this._showApiKeyPrompt();
      return;
    }

    this._loading = true;
    this._showLoading();

    try {
      let current, forecast;

      if (lat !== undefined && lon !== undefined) {
        [current, forecast] = await Promise.all([
          fetchCurrentWeatherByCoords(lat, lon),
          fetchForecastByCoords(lat, lon),
        ]);
      } else {
        [current, forecast] = await Promise.all([
          fetchCurrentWeather(city),
          fetchForecast(city),
        ]);
      }

      this.currentData = current;
      WeatherState.set({ lastCity: current.name, lastWeather: current });

      // Air quality (non-blocking)
      let aqiData = null;
      try {
        aqiData = await fetchAirQuality(current.coord.lat, current.coord.lon);
      } catch { /* optional */ }

      this._hideLoading();
      this._renderAll(current, forecast, aqiData);

      // Prefetch saved locations weather
      this._prefetchSavedLocations();

    } catch (err) {
      this._hideLoading();
      this._showError(err);
    } finally {
      this._loading = false;
    }
  }

  _renderAll(current, forecast, aqiData) {
    const tz = current.timezone || 0;
    const dayNight = isDay(current.dt, current.sys.sunrise, current.sys.sunset);
    const bgKey = getBackgroundKey(current.weather[0].id, dayNight);
    const grad = BACKGROUND_GRADIENTS[bgKey] || BACKGROUND_GRADIENTS['clear_day'];

    // Update background
    document.body.style.setProperty('--bg-start', grad.start);
    document.body.style.setProperty('--bg-end', grad.end);

    // Show sections, hide empty
    this.els.emptyState.classList.add('hidden');
    this.els.currentWeather.classList.remove('hidden');
    this.els.hourly.classList.remove('hidden');
    this.els.forecast.classList.remove('hidden');
    this.els.details.classList.remove('hidden');

    // Render components
    this.components.current.render(current);
    this.components.forecast.render(parseForecastToDays(forecast), tz);
    this.components.hourly.render(parseHourly(forecast), tz);
    this.components.details.render(current, aqiData);

    // Update saved locations UI
    this.components.saved.update();

    // Particles update
    this._updateParticles(current.weather[0].id, dayNight);
  }

  _refreshCurrentDisplay() {
    if (!this.currentData) return;
    this.components.current.render(this.currentData);
  }

  _saveCity(data) {
    WeatherState.addSavedLocation({
      city: data.name,
      country: data.sys.country,
      lat: data.coord.lat,
      lon: data.coord.lon,
    });
    this.components.current.render(data); // refresh star state
    this.components.saved.setWeatherData(data.name, data.sys.country, data);
  }

  _toggleUnit(unit) {
    WeatherState.set({ unit });
    if (this.currentData) this.components.current.render(this.currentData);
    if (this.components.hourly.hourlyData) {
      this.components.hourly.render(this.components.hourly.hourlyData, this.components.hourly.timezone);
    }
    if (this.components.forecast.days) {
      this.components.forecast.render(this.components.forecast.days, this.components.forecast.timezone);
    }
    this.components.saved.update();
  }

  async _useGps() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    this._showLoading();
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        await this._loadWeather(null, lat, lon);
      },
      (err) => {
        this._hideLoading();
        alert('Could not get your location. Please search manually.');
      },
      { timeout: 8000 }
    );
  }

  async _prefetchSavedLocations() {
    const locs = WeatherState.get('savedLocations') || [];
    for (const loc of locs) {
      try {
        const data = await fetchCurrentWeather(loc.city);
        this.components.saved.setWeatherData(loc.city, loc.country, data);
      } catch { /* ignore */ }
    }
  }

  _applyTheme() {
    const theme = WeatherState.get('theme');
    if (theme === 'light') document.documentElement.dataset.theme = 'light';
    else if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = prefersDark ? '' : 'light';
    } else {
      delete document.documentElement.dataset.theme;
    }

    const animations = WeatherState.get('animationsEnabled');
    document.body.style.animationPlayState = animations ? 'running' : 'paused';

    // Color scheme
    const idx = WeatherState.get('colorScheme') || 0;
    const schemes = [
      { start: '#1E3A8A', end: '#3730A3' },
      { start: '#FF6B35', end: '#F7931E' },
      { start: '#064E3B', end: '#065F46' },
      { start: '#4C1D95', end: '#7C3AED' },
      { start: '#0F172A', end: '#1E293B' },
    ];
    if (!this.currentData && schemes[idx]) {
      document.body.style.setProperty('--bg-start', schemes[idx].start);
      document.body.style.setProperty('--bg-end', schemes[idx].end);
    }
  }

  _initParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    container.innerHTML = '';
    if (!WeatherState.get('particlesEnabled')) return;

    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 6 + 2;
      p.style.cssText = `
        width:${size}px;height:${size}px;
        left:${Math.random()*100}%;
        bottom:-${size}px;
        background:rgba(255,255,255,${Math.random()*0.15+0.03});
        animation-duration:${Math.random()*15+10}s;
        animation-delay:${Math.random()*10}s;
      `;
      container.appendChild(p);
    }
  }

  _updateParticles(conditionId, isDay) {
    // Could be enhanced per condition - for now just re-init
    this._initParticles();
  }

  _restoreLastCity() {
    const city = WeatherState.get('lastCity') || 'London';
    this.components.search.setValue(city);
    this._loadWeather(city);
  }

  _showLoading() {
    if (document.getElementById('loading-overlay')) return;
    const div = document.createElement('div');
    div.className = 'loading-overlay';
    div.id = 'loading-overlay';
    div.setAttribute('role', 'status');
    div.setAttribute('aria-live', 'polite');
    div.setAttribute('aria-label', 'Loading weather data');
    div.innerHTML = `
      <svg class="loading-spinner" viewBox="0 0 50 50" aria-hidden="true">
        <circle cx="25" cy="25" r="20" fill="none" stroke="#3B82F6" stroke-width="4"
          stroke-dasharray="120 40" stroke-linecap="round"/>
      </svg>
      <div class="loading-text">Fetching weather data</div>
      <div class="loading-dots" aria-hidden="true">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    `;
    document.body.appendChild(div);
  }

  _hideLoading() {
    document.getElementById('loading-overlay')?.remove();
  }

  _showError(err) {
    console.error('Weather load error:', err);
    let msg = 'Connection error. Please check your internet connection.';
    if (err.message === 'NO_API_KEY') {
      msg = 'Please add your OpenWeatherMap API key in Settings (⚙️).';
    } else if (err.response?.status === 404) {
      msg = 'City not found. Please check the spelling and try again.';
    } else if (err.response?.status === 401) {
      msg = 'Invalid API key. Please check your OpenWeatherMap API key in Settings (⚙️).';
    } else if (err.message && err.message !== 'Network Error') {
      msg = `Error: ${err.message}`;
    }

    this.els.emptyState.classList.remove('hidden');
    this.els.emptyState.innerHTML = `
      <div class="error-state">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
          <circle cx="36" cy="36" r="32" stroke="rgba(239,68,68,0.3)" stroke-width="3"/>
          <path d="M36 24v16M36 44v4" stroke="#EF4444" stroke-width="3" stroke-linecap="round"/>
        </svg>
        <h3>Oops! Something went wrong</h3>
        <p>${msg}</p>
        ${err.message !== 'NO_API_KEY' ? `<button class="retry-btn" id="retry-btn">Try Again</button>` : ''}
        <button class="retry-btn" id="open-settings-btn" style="background:var(--secondary)">Open Settings ⚙️</button>
      </div>
    `;

    this.els.emptyState.querySelector('#retry-btn')?.addEventListener('click', () => {
      const city = WeatherState.get('lastCity') || 'London';
      if (city) this._loadWeather(city);
    });
    this.els.emptyState.querySelector('#open-settings-btn')?.addEventListener('click', () => {
      this.components.settings.open();
    });
  }

  _showApiKeyPrompt() {
    this.components.settings.open();
  }
}
