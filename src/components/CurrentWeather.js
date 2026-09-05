import {
  formatTemp, formatDateTime, formatLastUpdated,
  degToDirection, formatWindSpeed, formatPressure,
  formatVisibility, getCountryName, getWeatherAdvice, formatTime
} from '../utils/helpers.js';
import { getWeatherIconSvg } from '../utils/weatherIcons.js';
import WeatherState from '../context/WeatherState.js';
import Toast from './Toast.js';

export default class CurrentWeather {
  constructor(container, onSaveCity, onUnitToggle, onRefresh) {
    this.container = container;
    this.onSaveCity = onSaveCity;
    this.onUnitToggle = onUnitToggle;
    this.onRefresh = onRefresh;
    this.data = null;
    this.unit = WeatherState.get('unit');
    this.timer = null;
  }

  render(data) {
    this.data = data;
    this.unit = WeatherState.get('unit');
    this.container.className = '';
    this.container.innerHTML = this._buildHTML(data);
    this.container.classList.add('glass', 'current-weather-card', 'animate-fadeInScale');
    this._bindEvents();
    this._startLiveClock(data.timezone);
  }

  _buildHTML(d) {
    const unit = this.unit;
    const windUnit = WeatherState.get('windUnit') || 'kmh';
    const pressureUnit = WeatherState.get('pressureUnit') || 'hpa';
    const distUnit = WeatherState.get('distanceUnit') || 'km';
    const countryName = getCountryName(d.sys?.country);
    const savedLocs = WeatherState.get('savedLocations') || [];
    const isSaved = savedLocs.some(l => l.city.toLowerCase() === d.name.toLowerCase());

    const minTemp = d.main.temp_min !== undefined ? d.main.temp_min : d.main.temp - 3;
    const maxTemp = d.main.temp_max !== undefined ? d.main.temp_max : d.main.temp + 4;
    const advice = getWeatherAdvice(d.weather[0].id, d.main.temp, d.wind?.speed || 0, d.pop || 0);

    // Calculate position for temp range bar (0 to 100%)
    const tempRange = Math.max(1, maxTemp - minTemp);
    const currentProgress = Math.min(100, Math.max(0, ((d.main.temp - minTemp) / tempRange) * 100));

    // Clean location name
    let cleanName = d.name || 'Unknown City';
    if (d.sys?.country && cleanName.endsWith(`, ${d.sys.country}`)) {
      cleanName = cleanName.replace(`, ${d.sys.country}`, '');
    }

    let countryDisplay = countryName;
    if (cleanName.toLowerCase() === countryName.toLowerCase()) {
      countryDisplay = '';
    }

    const dataSource = WeatherState.get('dataSource') || (d.isSimulation ? 'simulation' : 'live');
    let sourceBadge = '';
    if (dataSource === 'simulation') {
      sourceBadge = `<span class="data-source-badge simulation" title="Offline simulated data based on climatology">Simulation Mode</span>`;
    } else if (dataSource === 'cached') {
      sourceBadge = `<span class="data-source-badge cached" title="Serving high-speed cached data">⚡ Cached</span>`;
    } else {
      sourceBadge = `<span class="data-source-badge live" title="Real-time live weather data from OpenWeather"><span class="pulse-dot"></span> Live</span>`;
    }

    return `
      <!-- Top Bar: Location & Actions -->
      <div class="cw-header">
        <div class="cw-location-group">
          <div class="cw-location-title" aria-label="Location: ${cleanName}${countryDisplay ? ', ' + countryDisplay : ''}">
            <svg class="cw-pin-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span class="cw-city-name">${cleanName}</span>
            ${countryDisplay ? `<span class="cw-country-pill">${countryDisplay}</span>` : ''}
          </div>

          <div class="cw-meta-row">
            <span class="cw-local-time" id="cw-live-clock">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${formatDateTime(d.dt, d.timezone)}
            </span>
            ${sourceBadge}
          </div>
        </div>

        <div class="cw-actions">
          <button class="cw-action-btn" id="cw-refresh-btn" title="Refresh weather data" aria-label="Refresh">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
          <button class="cw-action-btn" id="cw-share-btn" title="Copy weather summary" aria-label="Copy weather summary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="save-city-btn ${isSaved ? 'saved' : ''}" id="save-city-btn"
            aria-pressed="${isSaved}" aria-label="${isSaved ? 'Remove from saved' : 'Save city'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? '#F59E0B' : 'none'}" stroke="${isSaved ? '#F59E0B' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>${isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      <!-- Hero Weather Block -->
      <div class="cw-hero">
        <div class="cw-hero-left">
          <div class="cw-temp-row">
            <div class="cw-temp" aria-label="Current temperature: ${formatTemp(d.main.temp, unit)}">
              ${formatTemp(d.main.temp, unit)}
            </div>
            <div class="cw-unit-switcher" role="group" aria-label="Temperature unit selector">
              <button class="unit-btn ${unit === 'celsius' ? 'active' : ''}" id="unit-c" aria-pressed="${unit === 'celsius'}">°C</button>
              <button class="unit-btn ${unit === 'fahrenheit' ? 'active' : ''}" id="unit-f" aria-pressed="${unit === 'fahrenheit'}">°F</button>
            </div>
          </div>

          <div class="cw-condition-badge">
            <span class="cw-desc-text">${d.weather[0].description}</span>
            <span class="cw-dot">•</span>
            <span class="cw-feels-text">Feels like ${formatTemp(d.main.feels_like, unit)}</span>
          </div>

          <!-- Temp Range Slider (Apple Weather style) -->
          <div class="cw-range-bar-wrap">
            <span class="cw-range-label">${formatTemp(minTemp, unit)}</span>
            <div class="cw-range-bar">
              <div class="cw-range-gradient"></div>
              <div class="cw-range-thumb" style="left: ${currentProgress}%;"></div>
            </div>
            <span class="cw-range-label">${formatTemp(maxTemp, unit)}</span>
          </div>

          <!-- Weather Narrative Tagline -->
          <div class="cw-advice-pill">
            <span class="cw-advice-sparkle">✨</span>
            <span class="cw-advice-content">${advice}</span>
          </div>
        </div>

        <div class="cw-hero-right" aria-hidden="true">
          <div class="cw-icon-glow"></div>
          <div class="cw-icon-wrapper">
            ${getWeatherIconSvg(d.weather[0].icon, 180)}
          </div>
        </div>
      </div>

      <!-- Quick Stats Grid (Apple Weather Bento style) -->
      <div class="cw-grid" aria-label="Key Weather Metrics">
        <div class="cw-metric-card">
          <div class="cw-metric-header">
            <div class="cw-metric-icon humidity" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10.5M12 2l-3 4M12 2l3 4"/><path d="M12 22a4 4 0 0 1-4-4c0-2 4-8 4-8s4 6 4 8a4 4 0 0 1-4 4z"/></svg>
            </div>
            <span class="cw-metric-name">HUMIDITY</span>
          </div>
          <div class="cw-metric-num">${d.main.humidity}%</div>
          <div class="cw-metric-sub">The dew point is ${formatTemp(d.main.temp - ((100 - d.main.humidity) / 5), unit)}</div>
        </div>

        <div class="cw-metric-card">
          <div class="cw-metric-header">
            <div class="cw-metric-icon wind" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
            </div>
            <span class="cw-metric-name">WIND</span>
          </div>
          <div class="cw-metric-num">${formatWindSpeed(d.wind?.speed || 0, windUnit)}</div>
          <div class="cw-metric-sub">${degToDirection(d.wind?.deg || 0)} · Gusts to ${formatWindSpeed((d.wind?.gust || (d.wind?.speed || 0) * 1.3), windUnit)}</div>
        </div>

        <div class="cw-metric-card">
          <div class="cw-metric-header">
            <div class="cw-metric-icon pressure" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </div>
            <span class="cw-metric-name">PRESSURE</span>
          </div>
          <div class="cw-metric-num">${formatPressure(d.main.pressure, pressureUnit)}</div>
          <div class="cw-metric-sub">Standard barometric pressure</div>
        </div>

        <div class="cw-metric-card">
          <div class="cw-metric-header">
            <div class="cw-metric-icon visibility" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <span class="cw-metric-name">VISIBILITY</span>
          </div>
          <div class="cw-metric-num">${formatVisibility(d.visibility || 10000, distUnit)}</div>
          <div class="cw-metric-sub">Clear view to horizon</div>
        </div>
      </div>

      <!-- Footer timestamp -->
      <div class="cw-footer">
        <span class="cw-timestamp">${formatLastUpdated(d.dt)}</span>
      </div>
    `;
  }

  _bindEvents() {
    this.container.querySelector('#unit-c')?.addEventListener('click', () => {
      this.onUnitToggle('celsius');
    });
    this.container.querySelector('#unit-f')?.addEventListener('click', () => {
      this.onUnitToggle('fahrenheit');
    });
    this.container.querySelector('#save-city-btn')?.addEventListener('click', () => {
      if (this.data) {
        this.onSaveCity(this.data);
      }
    });

    const refreshBtn = this.container.querySelector('#cw-refresh-btn');
    refreshBtn?.addEventListener('click', () => {
      refreshBtn.classList.add('spinning');
      if (this.onRefresh) {
        this.onRefresh();
      }
      setTimeout(() => refreshBtn.classList.remove('spinning'), 800);
    });

    this.container.querySelector('#cw-share-btn')?.addEventListener('click', () => {
      if (!this.data) return;
      const d = this.data;
      const text = `🌤️ Weather in ${d.name}: ${formatTemp(d.main.temp, this.unit)}, ${d.weather[0].description}. Humidity: ${d.main.humidity}%, Wind: ${formatWindSpeed(d.wind?.speed || 0, 'kmh')}.`;
      navigator.clipboard.writeText(text).then(() => {
        Toast.success('Weather report copied to clipboard!');
      }).catch(() => {
        Toast.info(text);
      });
    });
  }

  _startLiveClock(timezone = 0) {
    if (this.timer) clearInterval(this.timer);
    const clockEl = this.container.querySelector('#cw-live-clock');
    if (!clockEl) return;

    this.timer = setInterval(() => {
      const nowSec = Math.floor(Date.now() / 1000);
      clockEl.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${formatDateTime(nowSec, timezone)}
      `;
    }, 60000);
  }

  update(data) { this.render(data); }

  destroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
