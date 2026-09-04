import { debounce, countryToFlag } from '../utils/helpers.js';
import { fetchCitySuggestions } from '../utils/api.js';

export default class SearchBar {
  constructor(container, onSearch, onGps) {
    this.container = container;
    this.onSearch = onSearch;
    this.onGps = onGps;
    this.suggestions = [];
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="search-bar" id="search-bar-inner" role="search">
        <div class="search-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <input
          id="search-input"
          class="search-input"
          type="search"
          autocomplete="off"
          spellcheck="false"
          placeholder="Search for a city..."
          aria-label="Search for a city"
          aria-autocomplete="list"
          aria-controls="search-results"
        />
        <button class="search-clear hidden" id="search-clear" aria-label="Clear search" title="Clear">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <button class="gps-btn" id="gps-btn" aria-label="Use my location" title="Use current location">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            <path d="M12 7A5 5 0 1 0 17 12"/>
          </svg>
        </button>
      </div>
      <div id="search-results" class="search-dropdown hidden" role="listbox" aria-label="City suggestions"></div>
    `;
  }

  bindEvents() {
    this.input = this.container.querySelector('#search-input');
    this.clearBtn = this.container.querySelector('#search-clear');
    this.gpsBtn = this.container.querySelector('#gps-btn');
    this.dropdown = this.container.querySelector('#search-results');

    const debouncedSearch = debounce(async (query) => {
      if (query.length < 2) { this.hideDropdown(); return; }
      try {
        const results = await fetchCitySuggestions(query);
        this.showDropdown(results);
      } catch { this.hideDropdown(); }
    }, 320);

    this.input.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      this.clearBtn.classList.toggle('hidden', !val);
      debouncedSearch(val);
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = this.input.value.trim();
        if (val) { this.hideDropdown(); this.onSearch(val); }
      }
      if (e.key === 'Escape') this.hideDropdown();
    });

    this.clearBtn.addEventListener('click', () => {
      this.input.value = '';
      this.clearBtn.classList.add('hidden');
      this.hideDropdown();
      this.input.focus();
    });

    this.gpsBtn.addEventListener('click', () => { this.onGps(); });

    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) this.hideDropdown();
    });
  }

  showDropdown(results) {
    if (!results || results.length === 0) { this.hideDropdown(); return; }
    this.dropdown.innerHTML = results.map((r, i) => `
      <div class="search-suggestion" role="option" tabindex="0" data-index="${i}" aria-label="${r.name}, ${r.country}">
        <span style="font-size:22px" aria-hidden="true">${countryToFlag(r.country) || '🌍'}</span>
        <div>
          <div class="suggestion-name">${r.name}</div>
          <div class="suggestion-detail">${r.state ? r.state + ', ' : ''}${r.country} · ${r.lat.toFixed(2)}, ${r.lon.toFixed(2)}</div>
        </div>
      </div>
    `).join('');

    this.dropdown.querySelectorAll('.search-suggestion').forEach((el, i) => {
      el.addEventListener('click', () => {
        const r = results[i];
        this.input.value = r.name;
        this.hideDropdown();
        this.onSearch(r.name, r.lat, r.lon);
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') el.click();
      });
    });

    this.dropdown.classList.remove('hidden');
  }

  hideDropdown() {
    this.dropdown.classList.add('hidden');
    this.dropdown.innerHTML = '';
  }

  setValue(city) {
    this.input.value = city;
    this.clearBtn.classList.toggle('hidden', !city);
  }
}
