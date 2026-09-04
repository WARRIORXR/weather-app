import { formatDay, formatShortDate, formatTemp, formatPop } from '../utils/helpers.js';
import { getWeatherIconSvg } from '../utils/weatherIcons.js';
import WeatherState from '../context/WeatherState.js';

export default class ForecastCard {
  constructor(container) {
    this.container = container;
  }

  render(days, timezone = 0) {
    this.days = days;
    this.timezone = timezone;
    const unit = WeatherState.get('unit');

    this.container.className = '';
    this.container.innerHTML = `
      <div class="hourly-section animate-slideUp">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          5-Day Forecast
        </h2>
        <div class="forecast-strip" role="list" aria-label="5-day weather forecast">
          ${days.map((day, i) => `
            <div class="forecast-card ${i === 0 ? 'active' : ''}" role="listitem" tabindex="0"
              aria-label="${formatDay(day.dt, timezone)}: High ${formatTemp(day.high, unit)}, Low ${formatTemp(day.low, unit)}, ${day.description}">
              <div class="fc-day">${i === 0 ? 'Today' : formatDay(day.dt, timezone)}</div>
              <div class="fc-date">${formatShortDate(day.dt, timezone)}</div>
              <div class="fc-icon" aria-hidden="true">${getWeatherIconSvg(day.icon, 64)}</div>
              <div class="fc-temps">
                <span class="fc-high">${formatTemp(day.high, unit)}</span>
                <span class="fc-low">/ ${formatTemp(day.low, unit)}</span>
              </div>
              <div class="fc-rain" aria-label="Rain probability: ${formatPop(day.pop)}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#60A5FA" aria-hidden="true"><path d="M12 2C12 2 4 10 4 15a8 8 0 0 0 16 0C20 10 12 2 12 2z"/></svg>
                ${formatPop(day.pop)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  update(days, timezone = 0) { this.render(days, timezone); }
}
