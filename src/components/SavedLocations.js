import { formatTemp, countryToFlag } from '../utils/helpers.js';
import { getWeatherIconSvg } from '../utils/weatherIcons.js';
import WeatherState from '../context/WeatherState.js';

export default class SavedLocations {
  constructor(container, onSelectCity, onSearchCity) {
    this.container = container;
    this.onSelectCity = onSelectCity;
    this.onSearchCity = onSearchCity;
    this.weatherCache = {}; // city+country => weatherData
  }

  render() {
    const locs = WeatherState.get('savedLocations') || [];
    const unit = WeatherState.get('unit');
    const active = WeatherState.get('lastCity');

    this.container.className = '';
    this.container.innerHTML = `
      <div class="glass saved-locations-panel animate-slideUp">
        <h3>
          Saved Locations
          <span style="font-size:var(--text-xs);color:var(--text-muted);font-weight:400">${locs.length}/10</span>
        </h3>
        <div class="locations-grid" role="list">
          ${locs.length === 0 ? `
            <div style="text-align:center;padding:var(--space-lg) 0;color:var(--text-muted);font-size:var(--text-sm)">
              No saved locations yet.<br/>Save a city using the ⭐ button.
            </div>
          ` : locs.map(loc => {
            const wd = this.weatherCache[`${loc.city}_${loc.country}`];
            const isActive = active === loc.city;
            return `
              <div class="location-card ${isActive ? 'active' : ''}" role="listitem"
                data-city="${loc.city}" data-country="${loc.country}"
                tabindex="0"
                aria-label="${loc.city}, ${loc.country}${wd ? ', ' + Math.round(wd.main.temp) + '°' : ''}">
                <div class="lc-info">
                  <h4>${loc.city} ${countryToFlag(loc.country)}</h4>
                  <span>${loc.country}</span>
                </div>
                ${wd ? `
                  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
                    <div class="lc-temp">${formatTemp(wd.main.temp, unit)}</div>
                    <div aria-hidden="true" style="width:42px;height:42px">${getWeatherIconSvg(wd.weather[0].icon, 42)}</div>
                  </div>
                ` : `<div class="skeleton" style="width:60px;height:40px;border-radius:8px"></div>`}
                <button class="lc-remove" data-city="${loc.city}" data-country="${loc.country}"
                  aria-label="Remove ${loc.city} from saved locations">×</button>
              </div>
            `;
          }).join('')}
        </div>
        ${locs.length < 10 ? `
          <button class="add-location-btn" id="add-location-btn" aria-label="Add a new location">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Location
          </button>
        ` : ''}
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    // Click location card
    this.container.querySelectorAll('.location-card').forEach(card => {
      const city = card.dataset.city;
      const country = card.dataset.country;
      card.addEventListener('click', (e) => {
        if (e.target.closest('.lc-remove')) return;
        this.onSelectCity(city, country);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.target.closest('.lc-remove')) this.onSelectCity(city, country);
      });
    });

    // Remove buttons
    this.container.querySelectorAll('.lc-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const { city, country } = btn.dataset;
        WeatherState.removeSavedLocation(city, country);
        delete this.weatherCache[`${city}_${country}`];
        this.render();
      });
    });

    // Add location
    this.container.querySelector('#add-location-btn')?.addEventListener('click', () => {
      this.onSearchCity();
    });
  }

  setWeatherData(city, country, data) {
    this.weatherCache[`${city}_${country}`] = data;
    this.render();
  }

  update() { this.render(); }
}
