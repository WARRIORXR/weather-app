import { formatTemp, countryToFlag, formatTime } from '../utils/helpers.js';
import { getWeatherIconSvg } from '../utils/weatherIcons.js';
import WeatherState from '../context/WeatherState.js';
import Toast from './Toast.js';

export default class SavedLocations {
  constructor(container, onSelectCity, onSearchCity) {
    this.container = container;
    this.onSelectCity = onSelectCity;
    this.onSearchCity = onSearchCity;
    this.weatherCache = {};
  }

  render() {
    const locs = WeatherState.get('savedLocations') || [];
    const unit = WeatherState.get('unit');
    const active = WeatherState.get('lastCity');

    this.container.className = '';
    this.container.innerHTML = `
      <div class="glass saved-locations-panel animate-slideUp">
        <div class="saved-header">
          <div class="saved-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>Saved Locations</span>
          </div>
          <span class="saved-counter">${locs.length} / 10</span>
        </div>

        <div class="locations-grid" role="list">
          ${locs.length === 0 ? `
            <div class="saved-empty-state">
              <div class="saved-empty-icon">⭐</div>
              <p>No saved cities yet</p>
              <span>Click the Save button on any city to pin it here for instant 0ms access.</span>
            </div>
          ` : locs.map(loc => {
            const wd = this.weatherCache[`${loc.city.toLowerCase()}_${loc.country}`] || this.weatherCache[loc.city.toLowerCase()];
            const isActive = active && active.toLowerCase() === loc.city.toLowerCase();
            const timeStr = wd ? formatTime(Date.now() / 1000, wd.timezone) : '';

            return `
              <div class="location-card ${isActive ? 'active' : ''}" role="listitem"
                data-city="${loc.city}" data-country="${loc.country}"
                tabindex="0"
                aria-label="${loc.city}, ${loc.country}${wd ? ', ' + Math.round(wd.main.temp) + '°' : ''}">
                <div class="lc-info">
                  <div class="lc-top-row">
                    <span class="lc-city-title">${loc.city}</span>
                    <span class="lc-country-pill">${loc.country}</span>
                  </div>
                  <div class="lc-meta-sub">
                    ${timeStr ? `<span>Local time ${timeStr}</span>` : `<span>Saved location</span>`}
                  </div>
                </div>

                ${wd ? `
                  <div class="lc-weather-side">
                    <div class="lc-temp">${formatTemp(wd.main.temp, unit)}</div>
                    <div class="lc-icon" aria-hidden="true">${getWeatherIconSvg(wd.weather[0].icon, 38)}</div>
                  </div>
                ` : `<div class="skeleton lc-skeleton"></div>`}

                <button class="lc-remove" data-city="${loc.city}" data-country="${loc.country}"
                  aria-label="Remove ${loc.city} from saved locations" title="Remove">×</button>
              </div>
            `;
          }).join('')}
        </div>

        ${locs.length < 10 ? `
          <button class="add-location-btn" id="add-location-btn" aria-label="Add a new location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Explore More Cities</span>
          </button>
        ` : ''}
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    this.container.querySelectorAll('.location-card').forEach(card => {
      const city = card.dataset.city;
      const country = card.dataset.country;
      card.addEventListener('click', (e) => {
        if (e.target.closest('.lc-remove')) return;
        this.onSelectCity(city, country);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.target.closest('.lc-remove')) {
          this.onSelectCity(city, country);
        }
      });
    });

    this.container.querySelectorAll('.lc-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const { city, country } = btn.dataset;
        WeatherState.removeSavedLocation(city, country);
        delete this.weatherCache[`${city.toLowerCase()}_${country}`];
        delete this.weatherCache[city.toLowerCase()];
        Toast.info(`Removed ${city} from saved locations`);
        this.render();
      });
    });

    this.container.querySelector('#add-location-btn')?.addEventListener('click', () => {
      this.onSearchCity();
    });
  }

  setWeatherData(city, country, data) {
    if (!city) return;
    this.weatherCache[`${city.toLowerCase()}_${country}`] = data;
    this.weatherCache[city.toLowerCase()] = data;
    this.render();
  }

  update() { this.render(); }
}
