import './styles/globals.css';

import SearchBar from './components/SearchBar.js';
import CurrentWeather from './components/CurrentWeather.js';
import ForecastCard from './components/ForecastCard.js';
import HourlyForecast from './components/HourlyForecast.js';
import WeatherDetails from './components/WeatherDetails.js';
import SavedLocations from './components/SavedLocations.js';
import SettingsModal from './components/SettingsModal.js';
import AlertBanner from './components/AlertBanner.js';
import Toast from './components/Toast.js';

import {
  getCompleteWeather,
  parseForecastToDays,
  parseHourly
} from './utils/api.js';
import { isDay, getBackgroundKey } from './utils/helpers.js';
import { BACKGROUND_GRADIENTS } from './utils/constants.js';
import WeatherState from './context/WeatherState.js';

export default class App {
  constructor() {
    this.components = {};
    this.currentData = null;
    this.currentForecast = null;
    this.currentAqi = null;
    this._loading = false;
  }

  async init() {
    this._setupElements();
    this._initComponents();
    this._applyTheme();
    this._initParticles();
    this._restoreLastCity();
    this._schedulePrefetchIdle();
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
      (unit) => this._toggleUnit(unit),
      () => this._refreshCurrentWeather()
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

    // Trending cities quick links
    this.els.trendings?.forEach(btn => {
      btn.addEventListener('click', () => {
        const city = btn.dataset.city;
        this.components.search.setValue(city);
        this._loadWeather(city);
      });
    });
  }

  async _loadWeather(city, lat, lon, forceFresh = false) {
    if (this._loading) return;

    const targetCity = city || WeatherState.get('lastCity') || 'London';
    const hasActiveView = !!this.currentData;

    try {
      const weatherReq = await getCompleteWeather(targetCity, lat, lon);

      // SWR: If cached data exists and not forcing fresh, render instantly (0ms)
      if (weatherReq.cached && !forceFresh) {
        WeatherState.set({
          lastCity: weatherReq.cached.current.name,
          lastWeather: weatherReq.cached.current,
          dataSource: 'cached'
        });
        this._renderAll(weatherReq.cached.current, weatherReq.cached.forecast, weatherReq.cached.aqi);

        // Fetch fresh data in the background silently
        weatherReq.fetchFresh().then(fresh => {
          if (fresh && fresh.current) {
            WeatherState.set({
              lastCity: fresh.current.name,
              lastWeather: fresh.current,
              dataSource: fresh.isLive ? 'live' : 'simulation'
            });
            this._renderAll(fresh.current, fresh.forecast, fresh.aqi);
          }
        }).catch(() => {});
        return;
      }

      // If no cache exists, show inline skeletons
      this._loading = true;
      if (!hasActiveView) {
        this._showInlineSkeletons();
      }

      const fresh = await weatherReq.fetchFresh();

      WeatherState.set({
        lastCity: fresh.current.name,
        lastWeather: fresh.current,
        dataSource: fresh.isLive ? 'live' : 'simulation'
      });

      this._renderAll(fresh.current, fresh.forecast, fresh.aqi);

      // Prefetch saved locations in background
      this._prefetchSavedLocations();

    } catch (err) {
      console.error('Weather load error:', err);
      Toast.error('Could not load fresh weather. Displaying cached overview.');
    } finally {
      this._loading = false;
    }
  }

  _refreshCurrentWeather() {
    if (this.currentData) {
      Toast.info(`Refreshing ${this.currentData.name}...`, 1500);
      this._loadWeather(this.currentData.name, undefined, undefined, true);
    }
  }

  _renderAll(current, forecast, aqiData) {
    this.currentData = current;
    this.currentForecast = forecast;
    this.currentAqi = aqiData;

    const tz = current.timezone || 0;
    const dayNight = isDay(current.dt, current.sys?.sunrise, current.sys?.sunset);
    const bgKey = getBackgroundKey(current.weather[0].id, dayNight);
    const grad = BACKGROUND_GRADIENTS[bgKey] || BACKGROUND_GRADIENTS['clear_day'];

    // Update dynamic atmospheric background
    document.body.style.setProperty('--bg-start', grad.start);
    document.body.style.setProperty('--bg-end', grad.end);

    // Reveal UI sections
    this.els.emptyState.classList.add('hidden');
    this.els.currentWeather.classList.remove('hidden');
    this.els.hourly.classList.remove('hidden');
    this.els.forecast.classList.remove('hidden');
    this.els.details.classList.remove('hidden');

    // Render components
    this.components.current.render(current);
    this.components.forecast.render(parseForecastToDays(forecast), tz, current.main.temp);
    this.components.hourly.render(parseHourly(forecast), tz);
    this.components.details.render(current, aqiData);

    // Update saved locations cache
    this.components.saved.setWeatherData(current.name, current.sys?.country, current);

    // Subtle particles update
    this._updateParticles(current.weather[0].id, dayNight);
  }

  _showInlineSkeletons() {
    this.els.emptyState.classList.add('hidden');
    this.els.currentWeather.classList.remove('hidden');
    this.els.currentWeather.innerHTML = `
      <div class="glass current-weather-card skeleton-card">
        <div class="skeleton" style="width: 200px; height: 28px; margin-bottom: 12px;"></div>
        <div class="skeleton" style="width: 140px; height: 16px; margin-bottom: 24px;"></div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div class="skeleton" style="width: 160px; height: 72px;"></div>
          <div class="skeleton" style="width: 100px; height: 100px; border-radius: 50%;"></div>
        </div>
        <div class="skeleton" style="width: 100%; height: 80px;"></div>
      </div>
    `;
  }

  _refreshCurrentDisplay() {
    if (!this.currentData) return;
    this.components.current.render(this.currentData);
  }

  _saveCity(data) {
    WeatherState.addSavedLocation({
      city: data.name,
      country: data.sys?.country,
      lat: data.coord?.lat,
      lon: data.coord?.lon,
    });
    this.components.current.render(data);
    this.components.saved.setWeatherData(data.name, data.sys?.country, data);
    Toast.success(`Added ${data.name} to saved locations!`);
  }

  _toggleUnit(unit) {
    WeatherState.set({ unit });
    if (this.currentData) this.components.current.render(this.currentData);
    if (this.currentForecast) {
      const tz = this.currentData ? this.currentData.timezone : 0;
      this.components.forecast.render(parseForecastToDays(this.currentForecast), tz, this.currentData?.main?.temp);
      this.components.hourly.render(parseHourly(this.currentForecast), tz);
    }
    if (this.currentData && this.currentAqi) {
      this.components.details.render(this.currentData, this.currentAqi);
    }
    this.components.saved.update();
  }

  async _useGps() {
    if (!navigator.geolocation) {
      Toast.error('Geolocation is not supported by your browser.');
      return;
    }

    Toast.info('Detecting your current location...', 2000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        Toast.success('Location detected! Loading weather...', 1500);
        await this._loadWeather(null, lat, lon);
      },
      (err) => {
        Toast.warning('Could not access GPS. Please search for your city manually.');
      },
      { timeout: 8000 }
    );
  }

  async _prefetchSavedLocations() {
    const locs = WeatherState.get('savedLocations') || [];
    for (const loc of locs) {
      try {
        const req = await getCompleteWeather(loc.city);
        const data = req.cached?.current || (await req.fetchFresh()).current;
        this.components.saved.setWeatherData(loc.city, loc.country, data);
      } catch { /* non-critical */ }
    }
  }

  _schedulePrefetchIdle() {
    // Use requestIdleCallback or setTimeout to prefetch popular cities in background
    const popular = ['London', 'New York', 'Tokyo', 'Paris', 'Mumbai'];
    const prefetch = async () => {
      for (const city of popular) {
        try {
          await getCompleteWeather(city);
        } catch {}
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(prefetch);
    } else {
      setTimeout(prefetch, 2500);
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
    this._initParticles();
  }

  _restoreLastCity() {
    const city = WeatherState.get('lastCity') || 'London';
    this.components.search.setValue(city);
    this._loadWeather(city);
  }
}
