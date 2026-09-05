// Glassmorphism Toast Notification Manager

class ToastManager {
  constructor() {
    this.container = null;
    this._ensureContainer();
  }

  _ensureContainer() {
    let el = document.getElementById('toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast-container';
      el.className = 'toast-container';
      document.body.appendChild(el);
    }
    this.container = el;
  }

  show(message, type = 'info', durationMs = 3500) {
    this._ensureContainer();
    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type} animate-slideDown`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '✕';

    toast.innerHTML = `
      <div class="toast-icon-wrap" aria-hidden="true">${icon}</div>
      <div class="toast-msg">${message}</div>
      <button class="toast-close" aria-label="Dismiss">×</button>
    `;

    const removeToast = () => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 250);
    };

    toast.querySelector('.toast-close').addEventListener('click', removeToast);
    this.container.appendChild(toast);

    if (durationMs > 0) {
      setTimeout(removeToast, durationMs);
    }
  }

  success(msg, duration) { this.show(msg, 'success', duration); }
  error(msg, duration) { this.show(msg, 'error', duration); }
  warning(msg, duration) { this.show(msg, 'warning', duration); }
  info(msg, duration) { this.show(msg, 'info', duration); }
}

const Toast = new ToastManager();
export default Toast;
