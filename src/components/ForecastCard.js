import { formatDay, formatShortDate, formatTemp, formatPop } from '../utils/helpers.js';
import { getWeatherIconSvg } from '../utils/weatherIcons.js';
import WeatherState from '../context/WeatherState.js';

export default class ForecastCard {
  constructor(container) {
    this.container = container;
    this.days = [];
    this.timezone = 0;
  }

  render(days, timezone = 0, currentTemp = null) {
    this.days = days || [];
    this.timezone = timezone;
    const unit = WeatherState.get('unit');

    if (!this.days.length) return;

    // Calculate global weekly min and max to scale horizontal bars
    const allLows = this.days.map(d => d.low);
    const allHighs = this.days.map(d => d.high);
    const globalMin = Math.min(...allLows);
    const globalMax = Math.max(...allHighs);
    const globalSpan = Math.max(1, globalMax - globalMin);

    this.container.className = '';
    this.container.innerHTML = `
      <div class="glass forecast-panel animate-slideUp">
        <div class="forecast-header">
          <div class="forecast-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>5-Day Forecast</span>
          </div>
          <span class="forecast-badge">Next 5 Days</span>
        </div>

        <div class="forecast-rows" role="list" aria-label="5-day weather forecast">
          ${this.days.map((day, i) => {
            const isToday = i === 0;
            const dayName = isToday ? 'Today' : formatDay(day.dt, timezone);
            const dateStr = formatShortDate(day.dt, timezone);

            // Compute bar start % and width % relative to weekly min/max
            const leftPct = Math.max(0, Math.min(100, ((day.low - globalMin) / globalSpan) * 100));
            const rightPct = Math.max(0, Math.min(100, ((day.high - globalMin) / globalSpan) * 100));
            const widthPct = Math.max(8, rightPct - leftPct);

            let todayDot = '';
            if (isToday && currentTemp !== null) {
              const currentPct = Math.max(0, Math.min(100, ((currentTemp - globalMin) / globalSpan) * 100));
              todayDot = `<div class="range-curr-dot" style="left: ${currentPct}%;" title="Current: ${formatTemp(currentTemp, unit)}"></div>`;
            }

            return `
              <div class="forecast-row ${isToday ? 'today' : ''}" role="listitem" tabindex="0"
                aria-label="${dayName}: High ${formatTemp(day.high, unit)}, Low ${formatTemp(day.low, unit)}, ${day.description}">
                
                <!-- Day Info -->
                <div class="fr-day-col">
                  <span class="fr-day-name">${dayName}</span>
                  <span class="fr-date-str">${dateStr}</span>
                </div>

                <!-- Weather Icon & Condition -->
                <div class="fr-condition-col">
                  <div class="fr-icon" aria-hidden="true">
                    ${getWeatherIconSvg(day.icon, 36)}
                  </div>
                  ${day.pop > 0.15 ? `
                    <span class="fr-pop">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#60A5FA" aria-hidden="true"><path d="M12 2C12 2 4 10 4 15a8 8 0 0 0 16 0C20 10 12 2 12 2z"/></svg>
                      ${formatPop(day.pop)}
                    </span>
                  ` : ''}
                </div>

                <!-- Low Temp -->
                <span class="fr-temp-low">${formatTemp(day.low, unit)}</span>

                <!-- Range Gradient Bar (Apple Weather Style) -->
                <div class="fr-range-track" aria-hidden="true">
                  <div class="fr-range-segment" style="left: ${leftPct}%; width: ${widthPct}%;"></div>
                  ${todayDot}
                </div>

                <!-- High Temp -->
                <span class="fr-temp-high">${formatTemp(day.high, unit)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  update(days, timezone = 0, currentTemp = null) {
    this.render(days, timezone, currentTemp);
  }
}
