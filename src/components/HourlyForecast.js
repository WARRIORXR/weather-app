import { Chart, registerables } from 'chart.js';
import { formatTemp, formatTime, formatPop, formatWindSpeed } from '../utils/helpers.js';
import { getWeatherIconSvg } from '../utils/weatherIcons.js';
import WeatherState from '../context/WeatherState.js';

Chart.register(...registerables);

export default class HourlyForecast {
  constructor(container) {
    this.container = container;
    this.chart = null;
    this.isOpen = false;
  }

  render(hourlyData, timezone = 0) {
    this.hourlyData = hourlyData;
    this.timezone = timezone;
    const unit = WeatherState.get('unit');

    this.container.className = '';
    this.container.innerHTML = `
      <div class="hourly-section animate-slideUp">
        <button class="hourly-toggle-btn" id="hourly-toggle" aria-expanded="${this.isOpen}" aria-controls="hourly-body">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Hourly Forecast
          <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        <div class="glass hourly-chart-container ${this.isOpen ? 'open' : ''}" id="hourly-body">
          <!-- Icons row -->
          <div style="display:flex;justify-content:space-around;margin-bottom:8px;overflow-x:auto;gap:8px;">
            ${hourlyData.map(h => `
              <div style="flex-shrink:0;text-align:center;min-width:60px">
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">${formatTime(h.dt, timezone)}</div>
                <div aria-hidden="true">${getWeatherIconSvg(h.icon, 48)}</div>
                <div style="font-size:10px;color:#60A5FA;margin-top:4px">${formatPop(h.pop)}</div>
              </div>
            `).join('')}
          </div>

          <!-- Chart -->
          <div class="hourly-chart" style="position:relative;height:160px">
            <canvas id="hourly-chart-canvas" aria-label="Hourly temperature chart" role="img"></canvas>
          </div>

          <!-- Wind row -->
          <div style="display:flex;justify-content:space-around;margin-top:8px;overflow-x:auto;gap:8px;">
            ${hourlyData.map(h => `
              <div style="flex-shrink:0;text-align:center;min-width:60px;font-size:11px;color:var(--text-muted)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin:0 auto 2px"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
                ${formatWindSpeed(h.wind, WeatherState.get('windUnit') || 'kmh')}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this._bindToggle();
    if (this.isOpen) this._renderChart(hourlyData, timezone, unit);
  }

  _bindToggle() {
    const btn = this.container.querySelector('#hourly-toggle');
    const body = this.container.querySelector('#hourly-body');
    btn?.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      btn.classList.toggle('expanded', this.isOpen);
      body.classList.toggle('open', this.isOpen);
      btn.setAttribute('aria-expanded', this.isOpen);
      if (this.isOpen && !this.chart) {
        this._renderChart(this.hourlyData, this.timezone, WeatherState.get('unit'));
      }
    });
  }

  _renderChart(hourlyData, timezone, unit) {
    const canvas = this.container.querySelector('#hourly-chart-canvas');
    if (!canvas) return;

    if (this.chart) { this.chart.destroy(); this.chart = null; }

    const labels = hourlyData.map(h => formatTime(h.dt, timezone));
    const temps = hourlyData.map(h => Math.round(
      unit === 'fahrenheit' ? (h.temp * 9/5 + 32) : h.temp
    ));

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `Temperature (°${unit === 'fahrenheit' ? 'F' : 'C'})`,
          data: temps,
          borderColor: 'rgba(147,197,253,1)',
          backgroundColor: (ctx) => {
            try {
              const canvasCtx = ctx.chart?.ctx;
              if (!canvasCtx) return 'rgba(59,130,246,0.2)';
              const gradient = canvasCtx.createLinearGradient(0, 0, 0, 160);
              gradient.addColorStop(0, 'rgba(59,130,246,0.35)');
              gradient.addColorStop(1, 'rgba(59,130,246,0)');
              return gradient;
            } catch {
              return 'rgba(59,130,246,0.2)';
            }
          },
          borderWidth: 3,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#3B82F6',
          pointRadius: 5,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.95)',
            borderColor: 'rgba(59,130,246,0.5)',
            borderWidth: 1,
            titleColor: '#fff',
            bodyColor: '#93C5FD',
            padding: 12,
            callbacks: {
              title: (items) => labels[items[0].dataIndex],
              label: (item) => ` ${item.raw}°${unit === 'fahrenheit' ? 'F' : 'C'}`,
              afterLabel: (item) => {
                const h = hourlyData[item.dataIndex];
                return [
                  ` 💧 ${formatPop(h.pop)} rain chance`,
                  ` 💨 ${formatWindSpeed(h.wind, WeatherState.get('windUnit') || 'kmh')}`,
                ];
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: {
              color: 'rgba(255,255,255,0.5)', font: { size: 11 },
              callback: (v) => `${v}°`
            }
          }
        }
      }
    });
  }

  update(hourlyData, timezone = 0) { this.render(hourlyData, timezone); }

  destroy() { if (this.chart) { this.chart.destroy(); this.chart = null; } }
}
