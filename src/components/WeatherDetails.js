import {
  formatTime, getAqiInfo, degToDirection, formatWindSpeed,
  formatVisibility, sunArcProgress, getMoonPhase, formatPressure,
  getUvInfo, getBeaufortScale, calculateDewPoint, formatDaylightSummary,
  getVisibilityDescription, formatTemp
} from '../utils/helpers.js';
import WeatherState from '../context/WeatherState.js';

export default class WeatherDetails {
  constructor(container) {
    this.container = container;
  }

  render(currentData, aqiData) {
    this.currentData = currentData;
    this.aqiData = aqiData;

    const tz = currentData.timezone || 0;
    const unit = WeatherState.get('unit');
    const windUnit = WeatherState.get('windUnit') || 'kmh';
    const distUnit = WeatherState.get('distanceUnit') || 'km';
    const pressUnit = WeatherState.get('pressureUnit') || 'hpa';

    // AQI Info
    const aqiVal = aqiData?.list?.[0]?.main?.aqi || 2;
    const aqiInfo = getAqiInfo(aqiVal);
    const comp = aqiData?.list?.[0]?.components || { pm2_5: 11.2, pm10: 21.4, o3: 51.0, no2: 13.8 };

    // Sun & Moon
    const sunrise = currentData.sys?.sunrise || (currentData.dt - 21600);
    const sunset = currentData.sys?.sunset || (currentData.dt + 21600);
    const now = currentData.dt;
    const arcPct = sunArcProgress(now, sunrise, sunset);
    const daylightSummary = formatDaylightSummary(now, sunrise, sunset);

    // UV info
    const uvInfo = getUvInfo(arcPct, currentData.clouds?.all || 0);

    // Wind & Beaufort
    const windSpeed = currentData.wind?.speed || 0;
    const windDeg = currentData.wind?.deg || 0;
    const windGust = currentData.wind?.gust;
    const beaufort = getBeaufortScale(windSpeed);

    // Humidity & Dew Point
    const humidity = currentData.main?.humidity || 50;
    const tempC = currentData.main?.temp || 20;
    const dewPointC = calculateDewPoint(tempC, humidity);

    // Visibility
    const visMeters = currentData.visibility || 10000;
    const visDesc = getVisibilityDescription(visMeters);

    this.container.className = '';
    this.container.innerHTML = `
      <div class="weather-details-section animate-slideUp">
        <div class="wd-section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span>Weather Insights & Details</span>
        </div>

        <div class="bento-grid">
          <!-- Card 1: Air Quality Index -->
          <div class="glass bento-card aqi-card">
            <div class="bento-header">
              <span class="bento-label">AIR QUALITY</span>
              <span class="aqi-badge" style="background: ${aqiInfo.color}22; color: ${aqiInfo.color}; border: 1px solid ${aqiInfo.color}55;">
                ${aqiInfo.label}
              </span>
            </div>
            
            <div class="aqi-body">
              <div class="aqi-circle-wrap">
                <svg width="84" height="84" viewBox="0 0 100 100" role="img" aria-label="AQI ${aqiInfo.index}">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="9"/>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="${aqiInfo.color}" stroke-width="9"
                    stroke-dasharray="${((aqiVal / 5) * 251.3).toFixed(1)} 251.3"
                    stroke-dashoffset="${(251.3 * 0.25).toFixed(1)}" stroke-linecap="round"
                    style="transition: stroke-dasharray 1.2s ease"/>
                  <text x="50" y="48" text-anchor="middle" font-size="20" font-weight="700" fill="#FFFFFF">${aqiInfo.index}</text>
                  <text x="50" y="64" text-anchor="middle" font-size="10" font-weight="600" fill="${aqiInfo.color}">AQI</text>
                </svg>
              </div>
              <div class="aqi-details">
                <p class="aqi-advice">${aqiInfo.advice}</p>
                <div class="pollutant-mini-grid">
                  <div class="pollutant-pill"><span>PM2.5</span><b>${comp.pm2_5 ? comp.pm2_5.toFixed(1) : '12.0'}</b></div>
                  <div class="pollutant-pill"><span>PM10</span><b>${comp.pm10 ? comp.pm10.toFixed(1) : '24.0'}</b></div>
                  <div class="pollutant-pill"><span>O₃</span><b>${comp.o3 ? comp.o3.toFixed(1) : '52.0'}</b></div>
                  <div class="pollutant-pill"><span>NO₂</span><b>${comp.no2 ? comp.no2.toFixed(1) : '14.0'}</b></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: UV Index -->
          <div class="glass bento-card uv-card">
            <div class="bento-header">
              <span class="bento-label">UV INDEX</span>
              <span class="uv-badge" style="color: ${uvInfo.color}; font-weight: 600;">${uvInfo.level}</span>
            </div>
            <div class="uv-value-row">
              <span class="uv-big-num">${uvInfo.value}</span>
              <span class="uv-peak-label">Peak at solar noon</span>
            </div>
            <div class="uv-bar-wrap" aria-hidden="true">
              <div class="uv-bar-gradient"></div>
              <div class="uv-bar-marker" style="left: ${Math.min(100, (uvInfo.value / 11) * 100)}%;"></div>
            </div>
            <p class="bento-subtext">${uvInfo.advice}</p>
          </div>

          <!-- Card 3: Sunrise & Sunset (Daylight Arc) -->
          <div class="glass bento-card sun-card">
            <div class="bento-header">
              <span class="bento-label">SUNRISE & SUNSET</span>
              <span class="bento-subtle">${daylightSummary}</span>
            </div>

            <div class="sun-arc-container" aria-label="Sun arc representation">
              <svg width="100%" height="86" viewBox="0 0 240 90" preserveAspectRatio="xMidYMid meet">
                <!-- Arc baseline -->
                <path d="M 30 75 A 90 70 0 0 1 210 75" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="3" stroke-dasharray="4 4"/>
                
                ${this._generateSunArcPath(arcPct)}
                
                <!-- Horizon line -->
                <line x1="20" y1="76" x2="220" y2="76" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
              </svg>
            </div>

            <div class="sun-times-row">
              <div class="sun-time-item">
                <span class="sun-icon-emoji">🌅</span>
                <div>
                  <span class="st-label">Sunrise</span>
                  <span class="st-val">${formatTime(sunrise, tz)}</span>
                </div>
              </div>
              <div class="sun-time-item right">
                <div>
                  <span class="st-label">Sunset</span>
                  <span class="st-val">${formatTime(sunset, tz)}</span>
                </div>
                <span class="sun-icon-emoji">🌇</span>
              </div>
            </div>

            <div class="moon-mini-row">
              <span>Current Moon</span>
              <span class="moon-tag">${getMoonPhase(arcPct)}</span>
            </div>
          </div>

          <!-- Card 4: Wind & Compass -->
          <div class="glass bento-card wind-card">
            <div class="bento-header">
              <span class="bento-label">WIND DYNAMICS</span>
              <span class="bento-subtle">${beaufort.label}</span>
            </div>

            <div class="wind-body">
              <div class="compass-widget" aria-label="Wind direction: ${degToDirection(windDeg)}">
                <div class="compass-dial">
                  <span class="cp-label n">N</span>
                  <span class="cp-label e">E</span>
                  <span class="cp-label s">S</span>
                  <span class="cp-label w">W</span>
                  <div class="compass-arrow" style="transform: rotate(${windDeg}deg);">
                    <div class="arrow-head"></div>
                  </div>
                </div>
              </div>

              <div class="wind-metrics">
                <div class="wm-row">
                  <span class="wm-label">Speed</span>
                  <span class="wm-val">${formatWindSpeed(windSpeed, windUnit)}</span>
                </div>
                <div class="wm-row">
                  <span class="wm-label">Direction</span>
                  <span class="wm-val">${degToDirection(windDeg)} (${windDeg}°)</span>
                </div>
                ${windGust ? `
                  <div class="wm-row">
                    <span class="wm-label">Gusts</span>
                    <span class="wm-val highlight">${formatWindSpeed(windGust, windUnit)}</span>
                  </div>
                ` : ''}
                <p class="beaufort-desc">${beaufort.desc}</p>
              </div>
            </div>
          </div>

          <!-- Card 5: Humidity & Dew Point -->
          <div class="glass bento-card humidity-card">
            <div class="bento-header">
              <span class="bento-label">HUMIDITY</span>
              <span class="bento-subtle">${humidity > 70 ? 'High' : humidity < 35 ? 'Dry' : 'Comfortable'}</span>
            </div>
            <div class="humidity-val-row">
              <span class="huge-stat">${humidity}%</span>
            </div>
            <div class="vis-bar-bg">
              <div class="vis-bar-fill" style="width: ${humidity}%;"></div>
            </div>
            <p class="bento-subtext">The dew point is ${formatTemp(dewPointC, unit)} right now.</p>
          </div>

          <!-- Card 6: Visibility & Clarity -->
          <div class="glass bento-card visibility-card">
            <div class="bento-header">
              <span class="bento-label">VISIBILITY</span>
              <span class="bento-subtle">${formatVisibility(visMeters, distUnit)}</span>
            </div>
            <div class="vis-val-row">
              <span class="huge-stat">${formatVisibility(visMeters, distUnit)}</span>
            </div>
            <div class="vis-bar-bg">
              <div class="vis-bar-fill" style="width: ${Math.min(100, (visMeters / 10000) * 100)}%;"></div>
            </div>
            <p class="bento-subtext">${visDesc}</p>
          </div>
        </div>
      </div>
    `;
  }

  _generateSunArcPath(arcPct) {
    // 0 to 180 degrees along ellipse
    const angleRad = (180 - (arcPct * 180)) * (Math.PI / 180);
    const cx = 120, cy = 75, rx = 90, ry = 60;
    const sx = cx + rx * Math.cos(angleRad);
    const sy = cy - ry * Math.sin(angleRad);

    return `
      <!-- Progress arc -->
      <path d="M 30 75 A 90 70 0 0 1 ${sx.toFixed(1)} ${sy.toFixed(1)}" fill="none"
        stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round"/>
      
      <!-- Sun orb -->
      <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="7" fill="#FBBF24" stroke="#FFFFFF" stroke-width="2.5"
        filter="drop-shadow(0 0 8px rgba(251, 191, 36, 0.9))"/>
    `;
  }

  update(currentData, aqiData) {
    this.render(currentData, aqiData);
  }
}
