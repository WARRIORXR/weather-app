import { formatTime, getAqiInfo, degToDirection, formatWindSpeed, formatVisibility, sunArcProgress, getMoonPhase } from '../utils/helpers.js';
import WeatherState from '../context/WeatherState.js';

export default class WeatherDetails {
  constructor(container) {
    this.container = container;
    this.openSections = new Set(['aqi']);
  }

  render(currentData, aqiData) {
    this.currentData = currentData;
    this.aqiData = aqiData;
    const tz = currentData.timezone || 0;
    const windUnit = WeatherState.get('windUnit') || 'kmh';
    const distUnit = WeatherState.get('distanceUnit') || 'km';

    // AQI
    const aqiVal = aqiData?.list?.[0]?.main?.aqi || 1;
    const aqiInfo = getAqiInfo(aqiVal);
    const comp = aqiData?.list?.[0]?.components || {};

    // Sun
    const sunrise = currentData.sys.sunrise;
    const sunset = currentData.sys.sunset;
    const now = currentData.dt;
    const arcPct = sunArcProgress(now, sunrise, sunset);
    const arcDeg = Math.round(arcPct * 180); // 0 = east, 180 = west

    // Wind
    const windDeg = currentData.wind?.deg || 0;
    const windSpeed = currentData.wind?.speed || 0;
    const windGust = currentData.wind?.gust;

    // Visibility
    const visMeters = currentData.visibility || 10000;
    const visKm = visMeters / 1000;
    const visBarPct = Math.min(100, (visKm / 10) * 100);

    // Clouds
    const clouds = currentData.clouds?.all || 0;

    this.container.className = '';
    this.container.innerHTML = `
      <div class="glass details-panel animate-slideUp">
        <h3>Weather Details</h3>

        ${this._accordion('aqi', '🌫️ Air Quality', this._aqiContent(aqiVal, aqiInfo, comp))}
        ${this._accordion('sun', '☀️ Sun & Moon', this._sunContent(sunrise, sunset, now, tz, arcPct))}
        ${this._accordion('wind', '💨 Wind', this._windContent(windDeg, windSpeed, windGust, windUnit))}
        ${this._accordion('vis', '👁 Visibility & Clouds', this._visContent(visMeters, visBarPct, visKm, clouds, distUnit))}
      </div>
    `;

    this._bindAccordions();
  }

  _accordion(id, title, content) {
    const isOpen = this.openSections.has(id);
    return `
      <div class="accordion-item ${isOpen ? 'open' : ''}" data-accordion="${id}">
        <div class="accordion-header" role="button" tabindex="0" aria-expanded="${isOpen}" aria-controls="acc-${id}">
          <span class="accordion-title">${title}</span>
          <svg class="accordion-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="accordion-body" id="acc-${id}">
          <div class="accordion-content">${content}</div>
        </div>
      </div>
    `;
  }

  _aqiContent(aqiVal, info, comp) {
    const r = 40; const circ = 2 * Math.PI * r;
    const pct = Math.min(100, (aqiVal / 5) * 100);
    const dash = (pct / 100) * circ;
    return `
      <div class="aqi-circular">
        <svg width="100" height="100" viewBox="0 0 100 100" role="img" aria-label="AQI ${info.index}">
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8"/>
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="${info.color}" stroke-width="8"
            stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"
            stroke-dashoffset="${(circ * 0.25).toFixed(1)}" stroke-linecap="round"
            style="transition:stroke-dasharray 1s ease"/>
          <text x="50" y="47" text-anchor="middle" font-size="18" font-weight="700" fill="white">${info.index}</text>
          <text x="50" y="62" text-anchor="middle" font-size="9" fill="${info.color}">${info.label}</text>
        </svg>
      </div>
      <div class="pollutants">
        ${comp.pm2_5 !== undefined ? `<div class="pollutant"><span class="pollutant-name">PM2.5</span><span class="pollutant-value">${comp.pm2_5.toFixed(1)}</span></div>` : ''}
        ${comp.pm10 !== undefined ? `<div class="pollutant"><span class="pollutant-name">PM10</span><span class="pollutant-value">${comp.pm10.toFixed(1)}</span></div>` : ''}
        ${comp.o3 !== undefined ? `<div class="pollutant"><span class="pollutant-name">O₃</span><span class="pollutant-value">${comp.o3.toFixed(1)}</span></div>` : ''}
        ${comp.no2 !== undefined ? `<div class="pollutant"><span class="pollutant-name">NO₂</span><span class="pollutant-value">${comp.no2.toFixed(1)}</span></div>` : ''}
      </div>
    `;
  }

  _sunContent(sunrise, sunset, now, tz, arcPct) {
    // Sun arc SVG
    const arcAngle = arcPct * 180; // 0 to 180 degrees along semicircle
    const rad = (arcAngle - 180) * Math.PI / 180;
    const cx = 100, cy = 70, r = 60;
    const sx = cx + r * Math.cos(rad);
    const sy = cy + r * Math.sin(rad);
    return `
      <div class="sun-arc-wrap">
        <svg width="200" height="80" viewBox="0 0 200 80" aria-label="Sun position arc">
          <!-- Arc path -->
          <path d="M 40 70 A 60 60 0 0 1 160 70" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
          <!-- Progress arc -->
          <path d="M 40 70 A 60 60 0 0 1 ${sx.toFixed(1)} ${sy.toFixed(1)}" fill="none"
            stroke="#F59E0B" stroke-width="3" stroke-linecap="round"
            style="animation:arcMove 1.5s ease forwards"/>
          <!-- Sun dot -->
          <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="8" fill="#F59E0B">
            <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite"/>
          </circle>
          <!-- Horizon markers -->
          <circle cx="40" cy="70" r="4" fill="#F97316" opacity="0.7"/>
          <circle cx="160" cy="70" r="4" fill="#818CF8" opacity="0.7"/>
          <line x1="30" y1="74" x2="170" y2="74" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        </svg>
      </div>
      <div class="sun-times">
        <div>
          <div>🌅 Sunrise</div>
          <div style="font-weight:600;font-size:var(--text-lg)">${formatTime(sunrise, tz)}</div>
        </div>
        <div style="text-align:right">
          <div>🌇 Sunset</div>
          <div style="font-weight:600;font-size:var(--text-lg)">${formatTime(sunset, tz)}</div>
        </div>
      </div>
      <div class="moon-row">
        <span>Moon Phase</span>
        <span style="font-weight:600">${getMoonPhase(arcPct)}</span>
      </div>
    `;
  }

  _windContent(deg, speed, gust, windUnit) {
    const dir = degToDirection(deg);
    const needleStyle = `transform:rotate(${deg}deg)`;
    return `
      <div class="compass-wrap">
        <div class="compass" aria-label="Wind direction: ${dir}">
          <div class="compass-dir n">N</div>
          <div class="compass-dir s">S</div>
          <div class="compass-dir e">E</div>
          <div class="compass-dir w">W</div>
          <div class="compass-needle" style="${needleStyle}"></div>
        </div>
        <div class="wind-stats">
          <div>
            <div class="wind-stat-label">Speed</div>
            <div class="wind-stat-val">${formatWindSpeed(speed, windUnit)}</div>
          </div>
          <div>
            <div class="wind-stat-label">Direction</div>
            <div class="wind-stat-val">${dir}</div>
          </div>
          ${gust ? `<div><div class="wind-stat-label">Gust</div><div class="wind-stat-val" style="color:#EF4444">${formatWindSpeed(gust, windUnit)}</div></div>` : ''}
        </div>
      </div>
    `;
  }

  _visContent(visMeters, visBarPct, visKm, clouds, distUnit) {
    const distUnit2 = WeatherState.get('distanceUnit') || 'km';
    const distStr = distUnit2 === 'miles' ? `${(visKm * 0.621371).toFixed(1)} mi` : `${visKm.toFixed(1)} km`;
    return `
      <div style="margin-bottom:var(--space-md)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span style="font-size:var(--text-sm);color:var(--text-muted)">Visibility</span>
          <span style="margin-left:auto;font-weight:600">${distStr}</span>
        </div>
        <div class="vis-bar-wrap">
          <div class="vis-bar-bg">
            <div class="vis-bar-fill" style="--target-width:${visBarPct}%;width:${visBarPct}%"></div>
          </div>
          <div class="vis-info"><span>0</span><span>10 km</span></div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
        <span style="font-size:var(--text-sm);color:var(--text-muted)">Cloud Cover</span>
        <span style="margin-left:auto;font-weight:600">${clouds}%</span>
      </div>
    `;
  }

  _bindAccordions() {
    this.container.querySelectorAll('.accordion-header').forEach(header => {
      const item = header.closest('.accordion-item');
      const id = item.dataset.accordion;
      const open = (e) => {
        if (this.openSections.has(id)) {
          this.openSections.delete(id);
          item.classList.remove('open');
          header.setAttribute('aria-expanded', 'false');
        } else {
          this.openSections.add(id);
          item.classList.add('open');
          header.setAttribute('aria-expanded', 'true');
        }
      };
      header.addEventListener('click', open);
      header.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
  }

  update(currentData, aqiData) { this.render(currentData, aqiData); }
}
