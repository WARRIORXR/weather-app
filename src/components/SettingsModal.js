import WeatherState from '../context/WeatherState.js';
import { DEFAULT_API_KEY } from '../utils/constants.js';
import Toast from './Toast.js';

const COLOR_SCHEMES = [
  { label: 'Ocean Blue', start: '#1E3A8A', end: '#3730A3' },
  { label: 'Sunset',     start: '#FF6B35', end: '#F7931E' },
  { label: 'Forest',     start: '#064E3B', end: '#065F46' },
  { label: 'Violet',     start: '#4C1D95', end: '#7C3AED' },
  { label: 'Slate',      start: '#0F172A', end: '#1E293B' },
];

export default class SettingsModal {
  constructor(overlay, contentEl, onClose, onSave) {
    this.overlay = overlay;
    this.contentEl = contentEl;
    this.onClose = onClose;
    this.onSave = onSave;
    this.tempSettings = {};
    this._escHandler = null;
  }

  open() {
    this.tempSettings = { ...WeatherState.get() };
    this.overlay.classList.remove('hidden');
    this.render();
    document.body.style.overflow = 'hidden';
    // Focus trap
    setTimeout(() => {
      this.contentEl.querySelector('.modal-close')?.focus();
    }, 100);
  }

  close() {
    this.overlay.classList.add('hidden');
    document.body.style.overflow = '';
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
    this.onClose();
  }

  render() {
    const s = this.tempSettings;
    this.contentEl.innerHTML = `
      <div class="glass settings-modal" role="document">
        <div class="modal-header">
          <h2>⚙️ Settings</h2>
          <button class="modal-close" id="modal-close" aria-label="Close settings">✕</button>
        </div>

        <!-- API Key -->
        <div class="settings-section">
          <h3>🔑 API Key</h3>
          <div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:8px">
            <label class="settings-label" for="api-key-input">OpenWeatherMap API Key</label>
            <input id="api-key-input" type="password"
              placeholder="Paste your API key here..."
              value="${s.apiKey || ''}"
              style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.08);border:1px solid var(--glass-border);border-radius:var(--radius-md);color:var(--text-primary);font-family:var(--font-primary);font-size:var(--text-sm)"
              aria-label="OpenWeatherMap API key"/>
            <div style="font-size:11px;color:var(--text-muted)">
              Get a free key at <a href="https://openweathermap.org/api" target="_blank" rel="noopener" style="color:var(--primary)">openweathermap.org</a>
            </div>
          </div>
        </div>

        <!-- Units -->
        <div class="settings-section">
          <h3>📏 Units</h3>
          <div class="settings-row">
            <div>
              <div class="settings-label">Temperature</div>
            </div>
            <div class="radio-group" role="group" aria-label="Temperature unit">
              <label class="radio-option ${s.unit === 'celsius' ? 'selected' : ''}">
                <input type="radio" name="unit" value="celsius" ${s.unit === 'celsius' ? 'checked' : ''}> °C
              </label>
              <label class="radio-option ${s.unit === 'fahrenheit' ? 'selected' : ''}">
                <input type="radio" name="unit" value="fahrenheit" ${s.unit === 'fahrenheit' ? 'checked' : ''}> °F
              </label>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-label">Wind Speed</div>
            <div class="radio-group" role="group" aria-label="Wind speed unit">
              ${['kmh','mph','ms'].map(u => `
                <label class="radio-option ${s.windUnit === u ? 'selected' : ''}">
                  <input type="radio" name="windUnit" value="${u}" ${s.windUnit === u ? 'checked' : ''}> ${u === 'ms' ? 'm/s' : u}
                </label>`).join('')}
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-label">Pressure</div>
            <div class="radio-group" role="group" aria-label="Pressure unit">
              ${['hpa','inhg'].map(u => `
                <label class="radio-option ${s.pressureUnit === u ? 'selected' : ''}">
                  <input type="radio" name="pressureUnit" value="${u}" ${s.pressureUnit === u ? 'checked' : ''}> ${u === 'inhg' ? 'inHg' : 'hPa'}
                </label>`).join('')}
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-label">Distance</div>
            <div class="radio-group" role="group" aria-label="Distance unit">
              ${['km','miles'].map(u => `
                <label class="radio-option ${s.distanceUnit === u ? 'selected' : ''}">
                  <input type="radio" name="distanceUnit" value="${u}" ${s.distanceUnit === u ? 'checked' : ''}> ${u}
                </label>`).join('')}
            </div>
          </div>
        </div>

        <!-- Appearance -->
        <div class="settings-section">
          <h3>🎨 Appearance</h3>
          <div class="settings-row">
            <div>
              <div class="settings-label">Theme</div>
            </div>
            <div class="radio-group" role="group" aria-label="Theme">
              ${['dark','light','auto'].map(t => `
                <label class="radio-option ${s.theme === t ? 'selected' : ''}">
                  <input type="radio" name="theme" value="${t}" ${s.theme === t ? 'checked' : ''}> ${t.charAt(0).toUpperCase()+t.slice(1)}
                </label>`).join('')}
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-label">Background Animations</div>
            <label class="toggle-switch" aria-label="Background animations">
              <input type="checkbox" id="toggle-animations" ${s.animationsEnabled ? 'checked' : ''}/>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="settings-row">
            <div class="settings-label">Particle Effects</div>
            <label class="toggle-switch" aria-label="Particle effects">
              <input type="checkbox" id="toggle-particles" ${s.particlesEnabled ? 'checked' : ''}/>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:10px">
            <div class="settings-label">Color Scheme</div>
            <div class="color-swatches" role="group" aria-label="Color scheme selection">
              ${COLOR_SCHEMES.map((c,i) => `
                <button class="color-swatch ${s.colorScheme === i ? 'active' : ''}"
                  data-scheme="${i}" title="${c.label}"
                  style="background:linear-gradient(135deg,${c.start},${c.end})"
                  aria-pressed="${s.colorScheme === i}" aria-label="${c.label}">
                </button>`).join('')}
            </div>
          </div>
        </div>

        <!-- Data & Privacy -->
        <div class="settings-section">
          <h3>🔒 Data & Privacy</h3>
          <div class="settings-row">
            <div>
              <div class="settings-label">Auto-Detect Location</div>
              <div class="settings-sub">Use GPS on load</div>
            </div>
            <label class="toggle-switch" aria-label="Auto-detect location">
              <input type="checkbox" id="toggle-autoloc" ${s.autoLocation ? 'checked' : ''}/>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-label">Save Search History</div>
            </div>
            <label class="toggle-switch" aria-label="Save search history">
              <input type="checkbox" id="toggle-history" ${s.saveHistory ? 'checked' : ''}/>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="settings-row">
            <div class="settings-label">Clear All Cache</div>
            <button id="clear-cache-btn" style="padding:6px 16px;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);border-radius:var(--radius-pill);color:#EF4444;font-size:var(--text-sm)">Clear</button>
          </div>
        </div>

        <button class="settings-save" id="settings-save">Save Settings</button>
      </div>
    `;

    this._bindModalEvents();
  }

  _bindModalEvents() {
    // Close
    this.contentEl.querySelector('#modal-close')?.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.close(); });

    // Keyboard: close on Escape
    document.addEventListener('keydown', this._escHandler = (e) => {
      if (e.key === 'Escape') this.close();
    });

    // Radio groups - visual feedback
    this.contentEl.querySelectorAll('.radio-option input').forEach(input => {
      input.addEventListener('change', () => {
        const name = input.name;
        this.contentEl.querySelectorAll(`[name="${name}"]`).forEach(el => {
          el.closest('.radio-option')?.classList.toggle('selected', el.checked);
        });
        this.tempSettings[name] = input.value;
      });
    });

    // Color swatches
    this.contentEl.querySelectorAll('.color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        this.contentEl.querySelectorAll('.color-swatch').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        this.tempSettings.colorScheme = parseInt(btn.dataset.scheme);
      });
    });

    // Clear cache
    this.contentEl.querySelector('#clear-cache-btn')?.addEventListener('click', () => {
      localStorage.clear();
      WeatherState.clearCache();
      Toast.success('Cache and stored history cleared!');
    });

    // Save
    this.contentEl.querySelector('#settings-save')?.addEventListener('click', () => {
      // Gather all values
      const apiKeyInput = this.contentEl.querySelector('#api-key-input')?.value.trim();
      const apiKey = apiKeyInput || DEFAULT_API_KEY;
      const animationsEnabled = this.contentEl.querySelector('#toggle-animations')?.checked ?? true;
      const particlesEnabled = this.contentEl.querySelector('#toggle-particles')?.checked ?? true;
      const autoLocation = this.contentEl.querySelector('#toggle-autoloc')?.checked ?? true;
      const saveHistory = this.contentEl.querySelector('#toggle-history')?.checked ?? true;

      WeatherState.set({
        ...this.tempSettings,
        apiKey,
        animationsEnabled,
        particlesEnabled,
        autoLocation,
        saveHistory,
      });

      this.onSave();
      this.close();
    });
  }
}
