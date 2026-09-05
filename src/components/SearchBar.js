import { debounce, countryToFlag } from '../utils/helpers.js';
import { fetchCitySuggestions } from '../utils/api.js';
import WeatherState from '../context/WeatherState.js';

export default class SearchBar {
  constructor(container, onSearch, onGps) {
    this.container = container;
    this.onSearch = onSearch;
    this.onGps = onGps;
    this.suggestions = [];
    this.selectedIndex = -1;
    this.render();
    this.bindEvents();
  }

  render() {
    const history = WeatherState.get('searchHistory') || [];

    this.container.innerHTML = `
      <div class="search-component">
        <div class="search-bar" id="search-bar-inner" role="search">
          <div class="search-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            id="search-input"
            class="search-input"
            type="search"
            autocomplete="off"
            spellcheck="false"
            placeholder="Search city, state or country..."
            aria-label="Search for a city"
            aria-autocomplete="list"
            aria-controls="search-results"
          />
          <button class="search-clear hidden" id="search-clear" aria-label="Clear search" title="Clear">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
              <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="gps-btn" id="gps-btn" aria-label="Use my current location" title="Use current location">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              <path d="M12 7A5 5 0 1 0 17 12"/>
            </svg>
          </button>
        </div>

        <!-- Recent Search Chips -->
        <div class="search-chips-row" id="search-chips">
          ${history.length > 0 ? `
            <span class="chip-label">Recent:</span>
            ${history.map(city => `
              <button class="search-chip" data-city="${city}">${city}</button>
            `).join('')}
          ` : ''}
        </div>

        <div id="search-results" class="search-dropdown hidden" role="listbox" aria-label="City suggestions"></div>
      </div>
    `;
  }

  bindEvents() {
    this.input = this.container.querySelector('#search-input');
    this.clearBtn = this.container.querySelector('#search-clear');
    this.gpsBtn = this.container.querySelector('#gps-btn');
    this.dropdown = this.container.querySelector('#search-results');
    this.chipsContainer = this.container.querySelector('#search-chips');

    const debouncedSearch = debounce(async (query) => {
      if (query.length < 2) {
        this.hideDropdown();
        return;
      }
      try {
        const results = await fetchCitySuggestions(query);
        this.suggestions = results;
        this.selectedIndex = -1;
        this.showDropdown(results);
      } catch {
        this.hideDropdown();
      }
    }, 220); // Fast 220ms debounce for snappy feel

    this.input.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      this.clearBtn.classList.toggle('hidden', !val);
      debouncedSearch(val);
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this._navigateDropdown(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this._navigateDropdown(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.selectedIndex >= 0 && this.suggestions[this.selectedIndex]) {
          const r = this.suggestions[this.selectedIndex];
          this.selectCity(r.name, r.lat, r.lon);
        } else {
          const val = this.input.value.trim();
          if (val) {
            this.selectCity(val);
          }
        }
      } else if (e.key === 'Escape') {
        this.hideDropdown();
      }
    });

    this.clearBtn.addEventListener('click', () => {
      this.input.value = '';
      this.clearBtn.classList.add('hidden');
      this.hideDropdown();
      this.input.focus();
    });

    this.gpsBtn.addEventListener('click', () => {
      this.gpsBtn.classList.add('locating');
      this.onGps();
      setTimeout(() => this.gpsBtn.classList.remove('locating'), 2000);
    });

    this._bindChips();

    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.hideDropdown();
      }
    });
  }

  _bindChips() {
    this.container.querySelectorAll('.search-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const city = btn.dataset.city;
        this.setValue(city);
        this.selectCity(city);
      });
    });
  }

  _navigateDropdown(direction) {
    if (!this.suggestions.length || this.dropdown.classList.contains('hidden')) return;
    this.selectedIndex += direction;
    if (this.selectedIndex < 0) this.selectedIndex = this.suggestions.length - 1;
    if (this.selectedIndex >= this.suggestions.length) this.selectedIndex = 0;

    const items = this.dropdown.querySelectorAll('.search-suggestion');
    items.forEach((el, i) => {
      el.classList.toggle('highlighted', i === this.selectedIndex);
      if (i === this.selectedIndex) el.scrollIntoView({ block: 'nearest' });
    });
  }

  showDropdown(results) {
    if (!results || results.length === 0) {
      this.hideDropdown();
      return;
    }

    this.dropdown.innerHTML = results.map((r, i) => `
      <div class="search-suggestion ${i === this.selectedIndex ? 'highlighted' : ''}" role="option" tabindex="0" data-index="${i}" aria-label="${r.name}, ${r.country}">
        <span class="suggestion-flag" aria-hidden="true">${r.country || '📍'}</span>
        <div class="suggestion-text">
          <div class="suggestion-name">${r.name}</div>
          <div class="suggestion-detail">${r.state ? r.state + ', ' : ''}${r.country} · ${r.lat.toFixed(2)}, ${r.lon.toFixed(2)}</div>
        </div>
        <span class="suggestion-arrow" aria-hidden="true">↵</span>
      </div>
    `).join('');

    this.dropdown.querySelectorAll('.search-suggestion').forEach((el, i) => {
      el.addEventListener('click', () => {
        const r = results[i];
        this.selectCity(r.name, r.lat, r.lon);
      });
      el.addEventListener('mouseenter', () => {
        this.selectedIndex = i;
        this.dropdown.querySelectorAll('.search-suggestion').forEach((item, idx) => {
          item.classList.toggle('highlighted', idx === i);
        });
      });
    });

    this.dropdown.classList.remove('hidden');
  }

  hideDropdown() {
    this.dropdown.classList.add('hidden');
    this.dropdown.innerHTML = '';
    this.selectedIndex = -1;
  }

  selectCity(cityName, lat, lon) {
    this.input.value = cityName;
    this.hideDropdown();
    WeatherState.addSearchHistory(cityName);
    this._refreshChips();
    this.onSearch(cityName, lat, lon);
  }

  _refreshChips() {
    const history = WeatherState.get('searchHistory') || [];
    if (!this.chipsContainer) return;
    if (history.length === 0) {
      this.chipsContainer.innerHTML = '';
      return;
    }
    this.chipsContainer.innerHTML = `
      <span class="chip-label">Recent:</span>
      ${history.map(city => `
        <button class="search-chip" data-city="${city}">${city}</button>
      `).join('')}
    `;
    this._bindChips();
  }

  setValue(city) {
    if (this.input) {
      this.input.value = city;
      this.clearBtn?.classList.toggle('hidden', !city);
    }
  }
}
