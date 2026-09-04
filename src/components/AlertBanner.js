export default class AlertBanner {
  constructor(container) {
    this.container = container;
    this.visible = false;
  }

  show(alerts) {
    if (!alerts || alerts.length === 0) { this.hide(); return; }
    const alert = alerts[0];
    const event = alert.event || 'Weather Alert';
    const desc = alert.description ? alert.description.slice(0, 120) + '...' : '';
    const severity = this._getSeverity(event);

    this.container.innerHTML = `
      <div class="alert-icon" aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <div class="alert-content">
        <div class="alert-title" role="alert">${event}</div>
        ${desc ? `<div class="alert-desc">${desc}</div>` : ''}
        ${alerts.length > 1 ? `<div style="font-size:12px;opacity:0.8;margin-top:4px">+${alerts.length - 1} more alert${alerts.length > 2 ? 's' : ''}</div>` : ''}
      </div>
      <button class="alert-close" aria-label="Dismiss alert">✕</button>
    `;

    this.container.style.background = severity.gradient;
    this.container.classList.remove('hidden');
    this.visible = true;

    this.container.querySelector('.alert-close')?.addEventListener('click', () => this.hide());
  }

  hide() {
    this.container.classList.add('hidden');
    this.container.innerHTML = '';
    this.visible = false;
  }

  _getSeverity(event) {
    const e = event.toLowerCase();
    if (e.includes('extreme') || e.includes('hurricane') || e.includes('tornado')) {
      return { gradient: 'linear-gradient(90deg,#DC2626,#991B1B)' };
    }
    if (e.includes('severe') || e.includes('storm') || e.includes('warning')) {
      return { gradient: 'linear-gradient(90deg,#EA580C,#C2410C)' };
    }
    return { gradient: 'linear-gradient(90deg,#D97706,#B45309)' };
  }
}
