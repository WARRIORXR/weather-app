import { Chart, registerables } from 'chart.js';
import { formatTemp, formatTime, formatPop, formatWindSpeed, mpsToKmh, kmhToMph } from '../utils/helpers.js';
import { getWeatherIconSvg } from '../utils/weatherIcons.js';
import WeatherState from '../context/WeatherState.js';

Chart.register(...registerables);

export default class HourlyForecast {
  constructor(container) {
    this.container = container;
    this.chart = null;
    this.activeTab = 'temp'; // temp | pop | wind
    this.hourlyData = [];
    this.timezone = 0;
  }

  render(hourlyData, timezone = 0) {
    this.hourlyData = hourlyData || [];
    this.timezone = timezone;
    const unit = WeatherState.get('unit');
    const windUnit = WeatherState.get('windUnit') || 'kmh';

    this.container.className = '';
    this.container.innerHTML = `
      <div class="glass hourly-forecast-card animate-slideUp">
        <div class="hf-header">
          <div class="hf-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Hourly Forecast</span>
          </div>

          <!-- Tab Switcher -->
          <div class="hf-tabs" role="tablist" aria-label="Forecast Metric">
            <button class="hf-tab ${this.activeTab === 'temp' ? 'active' : ''}" data-tab="temp" role="tab" aria-selected="${this.activeTab === 'temp'}">
              Temp
            </button>
            <button class="hf-tab ${this.activeTab === 'pop' ? 'active' : ''}" data-tab="pop" role="tab" aria-selected="${this.activeTab === 'pop'}">
              Rain %
            </button>
            <button class="hf-tab ${this.activeTab === 'wind' ? 'active' : ''}" data-tab="wind" role="tab" aria-selected="${this.activeTab === 'wind'}">
              Wind
            </button>
          </div>
        </div>

        <!-- Scrollable Hourly Timeline Cards -->
        <div class="hf-timeline-wrap" role="region" aria-label="Hourly weather timeline">
          <div class="hf-timeline">
            ${this.hourlyData.map((h, i) => {
              const isNow = i === 0;
              let metricDisplay = '';
              if (this.activeTab === 'temp') {
                metricDisplay = `<span class="hf-card-val temp">${formatTemp(h.temp, unit)}</span>`;
              } else if (this.activeTab === 'pop') {
                metricDisplay = `<span class="hf-card-val pop">💧 ${formatPop(h.pop)}</span>`;
              } else {
                metricDisplay = `<span class="hf-card-val wind">💨 ${formatWindSpeed(h.wind, windUnit)}</span>`;
              }

              return `
                <div class="hf-card ${isNow ? 'active' : ''}" tabindex="0"
                  aria-label="${isNow ? 'Now' : formatTime(h.dt, timezone)}: ${formatTemp(h.temp, unit)}, ${h.description}">
                  <span class="hf-card-time">${isNow ? 'Now' : formatTime(h.dt, timezone)}</span>
                  <div class="hf-card-icon" aria-hidden="true">
                    ${getWeatherIconSvg(h.icon, 44)}
                  </div>
                  ${metricDisplay}
                  <span class="hf-card-pop-sub">${formatPop(h.pop)}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Interactive Chart -->
        <div class="hf-chart-wrap">
          <canvas id="hourly-chart-canvas" aria-label="Hourly weather visual graph" role="img"></canvas>
        </div>
      </div>
    `;

    this._bindEvents();
    this._renderChart();
  }

  _bindEvents() {
    this.container.querySelectorAll('.hf-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (this.activeTab === tab) return;
        this.activeTab = tab;
        this.container.querySelectorAll('.hf-tab').forEach(b => {
          const isAct = b.dataset.tab === tab;
          b.classList.toggle('active', isAct);
          b.setAttribute('aria-selected', isAct);
        });

        // Re-render timeline card values & chart
        this.render(this.hourlyData, this.timezone);
      });
    });
  }

  _renderChart() {
    const canvas = this.container.querySelector('#hourly-chart-canvas');
    if (!canvas || !this.hourlyData.length) return;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const unit = WeatherState.get('unit');
    const windUnit = WeatherState.get('windUnit') || 'kmh';
    const labels = this.hourlyData.map((h, i) => i === 0 ? 'Now' : formatTime(h.dt, this.timezone));

    let datasetLabel = '';
    let datasetValues = [];
    let strokeColor = '#38BDF8';
    let gradientStart = 'rgba(56, 189, 248, 0.35)';
    let gradientEnd = 'rgba(56, 189, 248, 0.0)';
    let pointColor = '#38BDF8';
    let valueSuffix = '';

    if (this.activeTab === 'temp') {
      datasetLabel = `Temperature (°${unit === 'fahrenheit' ? 'F' : 'C'})`;
      datasetValues = this.hourlyData.map(h => Math.round(unit === 'fahrenheit' ? (h.temp * 9/5 + 32) : h.temp));
      strokeColor = '#F59E0B';
      gradientStart = 'rgba(245, 158, 11, 0.35)';
      gradientEnd = 'rgba(245, 158, 11, 0.0)';
      pointColor = '#F59E0B';
      valueSuffix = '°';
    } else if (this.activeTab === 'pop') {
      datasetLabel = 'Precipitation Chance (%)';
      datasetValues = this.hourlyData.map(h => Math.round((h.pop || 0) * 100));
      strokeColor = '#60A5FA';
      gradientStart = 'rgba(96, 165, 250, 0.45)';
      gradientEnd = 'rgba(96, 165, 250, 0.0)';
      pointColor = '#60A5FA';
      valueSuffix = '%';
    } else {
      datasetLabel = `Wind Speed (${windUnit})`;
      datasetValues = this.hourlyData.map(h => {
        const kmh = mpsToKmh(h.wind);
        if (windUnit === 'mph') return kmhToMph(kmh);
        if (windUnit === 'ms') return Math.round(h.wind);
        return kmh;
      });
      strokeColor = '#A78BFA';
      gradientStart = 'rgba(167, 139, 250, 0.35)';
      gradientEnd = 'rgba(167, 139, 250, 0.0)';
      pointColor = '#A78BFA';
      valueSuffix = ` ${windUnit}`;
    }

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: datasetLabel,
          data: datasetValues,
          borderColor: strokeColor,
          backgroundColor: (ctx) => {
            const chartCtx = ctx.chart?.ctx;
            if (!chartCtx) return gradientStart;
            const gradient = chartCtx.createLinearGradient(0, 0, 0, 140);
            gradient.addColorStop(0, gradientStart);
            gradient.addColorStop(1, gradientEnd);
            return gradient;
          },
          borderWidth: 2.8,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: pointColor,
          pointBorderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: pointColor,
          pointHoverBorderColor: '#FFFFFF',
          tension: 0.38,
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
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            borderColor: strokeColor,
            borderWidth: 1,
            titleColor: '#FFFFFF',
            bodyColor: '#E2E8F0',
            padding: 10,
            displayColors: false,
            callbacks: {
              title: (items) => `${items[0].label} Forecast`,
              label: (item) => ` ${item.raw}${valueSuffix}`,
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: 'rgba(255,255,255,0.6)',
              font: { size: 11, family: 'Inter' }
            }
          },
          y: {
            display: false,
            grid: { display: false },
            suggestedMin: Math.min(...datasetValues) - (this.activeTab === 'pop' ? 10 : 2),
            suggestedMax: Math.max(...datasetValues) + (this.activeTab === 'pop' ? 10 : 2),
          }
        }
      }
    });
  }

  update(hourlyData, timezone = 0) { this.render(hourlyData, timezone); }

  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
