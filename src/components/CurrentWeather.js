import {
  formatTemp, formatDateTime, formatLastUpdated,
  degToDirection, formatWindSpeed, formatPressure,
  formatVisibility, countryToFlag
} from '../utils/helpers.js';
import { getWeatherIconSvg } from '../utils/weatherIcons.js';
import WeatherState from '../context/WeatherState.js';

export default class CurrentWeather {
  constructor(container, onSaveCity, onUnitToggle) {
    this.container = container;
    this.onSaveCity = onSaveCity;
    this.onUnitToggle = onUnitToggle;
    this.data = null;
    this.unit = WeatherState.get('unit');
  }

  render(data) {
    this.data = data;
    this.unit = WeatherState.get('unit');
    this.container.className = '';
    this.container.innerHTML = this._buildHTML(data);
    this.container.classList.add('glass', 'current-weather-card', 'animate-fadeInScale');
    this._bindEvents();
  }

  _buildHTML(d) {
    const unit = this.unit;
    const windUnit = WeatherState.get('windUnit') || 'kmh';
    const pressureUnit = WeatherState.get('pressureUnit') || 'hpa';
    const distUnit = WeatherState.get('distanceUnit') || 'km';
    const flag = countryToFlag(d.sys.country);
    const savedLocs = WeatherState.get('savedLocations') || [];
    const isSaved = savedLocs.some(l => l.city === d.name && l.country === d.sys.country);

    return `
      <div class="cw-location" aria-label="Location: ${d.name}, ${d.sys.country}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>${d.name}</span>
        <span aria-hidden="true">${flag}</span>
        <span style="font-size:var(--text-base);color:var(--text-muted)">${d.sys.country}</span>
      </div>
      <div class="cw-datetime">${formatDateTime(d.dt, d.timezone)}</div>

      <div class="cw-main">
        <div class="cw-temp-block">
          <div class="cw-temp" aria-label="Temperature: ${formatTemp(d.main.temp, unit)}">${formatTemp(d.main.temp, unit)}</div>
          <div class="cw-feels-like">Feels like ${formatTemp(d.main.feels_like, unit)}</div>
          <div class="cw-description">${d.weather[0].description}</div>
        </div>
        <div class="cw-icon-wrapper" aria-hidden="true">
          ${getWeatherIconSvg(d.weather[0].icon, 160)}
        </div>
      </div>

      <div class="cw-grid" aria-label="Weather details">
        <div class="cw-metric">
          <div class="cw-metric-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10.5M12 2l-3 4M12 2l3 4"/><path d="M12 22a4 4 0 0 1-4-4c0-2 4-8 4-8s4 6 4 8a4 4 0 0 1-4 4z"/></svg>
          </div>
          <div>
            <div class="cw-metric-label">Humidity</div>
            <div class="cw-metric-value">${d.main.humidity}%</div>
          </div>
        </div>
        <div class="cw-metric">
          <div class="cw-metric-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
          </div>
          <div>
            <div class="cw-metric-label">Wind</div>
            <div class="cw-metric-value">${formatWindSpeed(d.wind.speed, windUnit)} ${degToDirection(d.wind.deg || 0)}</div>
          </div>
        </div>
        <div class="cw-metric">
          <div class="cw-metric-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          </div>
          <div>
            <div class="cw-metric-label">Pressure</div>
            <div class="cw-metric-value">${formatPressure(d.main.pressure, pressureUnit)}</div>
          </div>
        </div>
        <div class="cw-metric">
          <div class="cw-metric-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div>
            <div class="cw-metric-label">Visibility</div>
            <div class="cw-metric-value">${formatVisibility(d.visibility || 10000, distUnit)}</div>
          </div>
        </div>
      </div>

      <div class="cw-bottom">
        <div class="unit-toggle" role="group" aria-label="Temperature unit">
          <button class="unit-btn ${unit === 'celsius' ? 'active' : ''}" id="unit-c" aria-pressed="${unit === 'celsius'}">°C</button>
          <button class="unit-btn ${unit === 'fahrenheit' ? 'active' : ''}" id="unit-f" aria-pressed="${unit === 'fahrenheit'}">°F</button>
        </div>
        <div class="last-updated">${formatLastUpdated(d.dt)}</div>
        <button class="save-city-btn ${isSaved ? 'saved' : ''}" id="save-city-btn"
          aria-pressed="${isSaved}" aria-label="${isSaved ? 'Remove from saved' : 'Save city'}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? '#F59E0B' : 'none'}" stroke="${isSaved ? '#F59E0B' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ${isSaved ? 'Saved' : 'Save City'}
        </button>
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
      if (this.data) this.onSaveCity(this.data);
    });
  }

  update(data) { this.render(data); }
}
