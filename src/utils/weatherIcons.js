/**
 * Pure CSS/SVG animated weather icons.
 * Each function returns an HTML string to inject into a container.
 */

export function getSunIcon(size = 120) {
  return `
  <svg class="icon-sun weather-icon-wrap" width="${size}" height="${size}" viewBox="0 0 120 120" aria-label="Sunny weather icon">
    <!-- Rays -->
    <g class="sun-rays" transform-origin="60 60">
      ${Array.from({length:8},(_,i)=>{
        const angle = i * 45;
        const rad = angle * Math.PI / 180;
        const x1 = 60 + 38 * Math.cos(rad); const y1 = 60 + 38 * Math.sin(rad);
        const x2 = 60 + 52 * Math.cos(rad); const y2 = 60 + 52 * Math.sin(rad);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#FCD34D" stroke-width="4" stroke-linecap="round"/>`;
      }).join('')}
    </g>
    <!-- Core -->
    <circle class="sun-circle" cx="60" cy="60" r="26" fill="url(#sunGrad)"/>
    <defs>
      <radialGradient id="sunGrad" cx="40%" cy="40%">
        <stop offset="0%" stop-color="#FEF08A"/>
        <stop offset="100%" stop-color="#F59E0B"/>
      </radialGradient>
    </defs>
  </svg>`;
}

export function getCloudIcon(size = 120) {
  return `
  <svg class="icon-cloud weather-icon-wrap" width="${size}" height="${size}" viewBox="0 0 120 120" aria-label="Cloudy weather icon">
    <g class="cloud-back">
      <ellipse cx="70" cy="58" rx="32" ry="22" fill="#9CA3AF"/>
      <circle cx="55" cy="62" r="18" fill="#9CA3AF"/>
      <circle cx="80" cy="62" r="14" fill="#9CA3AF"/>
      <rect x="37" y="62" width="57" height="18" fill="#9CA3AF" rx="9"/>
    </g>
    <g class="cloud-front">
      <ellipse cx="52" cy="68" rx="28" ry="20" fill="#E5E7EB"/>
      <circle cx="38" cy="72" r="16" fill="#E5E7EB"/>
      <circle cx="66" cy="72" r="13" fill="#E5E7EB"/>
      <rect x="22" y="72" width="57" height="16" fill="#E5E7EB" rx="8"/>
    </g>
  </svg>`;
}

export function getFewCloudsIcon(size = 120) {
  return `
  <svg class="weather-icon-wrap" width="${size}" height="${size}" viewBox="0 0 120 120" aria-label="Partly cloudy icon">
    <!-- Sun behind -->
    <g transform="translate(15,15)">
      <circle cx="38" cy="38" r="20" fill="#F59E0B" opacity="0.9"/>
      <g transform-origin="38 38" style="animation:sunRotate 20s linear infinite">
        ${Array.from({length:6},(_,i)=>{
          const a=i*60*Math.PI/180;
          return `<line x1="${(38+28*Math.cos(a)).toFixed(1)}" y1="${(38+28*Math.sin(a)).toFixed(1)}" x2="${(38+36*Math.cos(a)).toFixed(1)}" y2="${(38+36*Math.sin(a)).toFixed(1)}" stroke="#FCD34D" stroke-width="3" stroke-linecap="round"/>`;
        }).join('')}
      </g>
    </g>
    <!-- Cloud in front -->
    <g transform="translate(20,50)" style="animation:cloudFloat 3.5s ease-in-out infinite">
      <ellipse cx="42" cy="22" rx="26" ry="18" fill="#D1D5DB"/>
      <circle cx="30" cy="26" r="14" fill="#D1D5DB"/>
      <circle cx="54" cy="26" r="12" fill="#D1D5DB"/>
      <rect x="16" y="26" width="52" height="14" fill="#D1D5DB" rx="7"/>
    </g>
  </svg>`;
}

export function getRainIcon(size = 120) {
  return `
  <svg class="weather-icon-wrap" width="${size}" height="${size}" viewBox="0 0 120 120" aria-label="Rainy weather icon" style="overflow:visible">
    <!-- Cloud -->
    <ellipse cx="60" cy="46" rx="30" ry="20" fill="#4B5563"/>
    <circle cx="44" cy="50" r="16" fill="#4B5563"/>
    <circle cx="76" cy="50" r="13" fill="#4B5563"/>
    <rect x="28" y="50" width="64" height="16" fill="#4B5563" rx="8"/>
    <!-- Drops -->
    ${Array.from({length:5},(_,i)=>`
    <line class="rain-drop" x1="${34+i*13}" y1="72" x2="${30+i*13}" y2="90"
      stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round"
      style="animation-delay:${i*0.18}s"/>
    `).join('')}
  </svg>`;
}

export function getSnowIcon(size = 120) {
  const flakes = [[40,76],[60,82],[80,76],[50,92],[70,90]];
  return `
  <svg class="weather-icon-wrap" width="${size}" height="${size}" viewBox="0 0 120 120" aria-label="Snowy weather icon" style="overflow:visible">
    <!-- Cloud -->
    <ellipse cx="60" cy="46" rx="30" ry="20" fill="#6B7280"/>
    <circle cx="44" cy="50" r="16" fill="#6B7280"/>
    <circle cx="76" cy="50" r="13" fill="#6B7280"/>
    <rect x="28" y="50" width="64" height="16" fill="#6B7280" rx="8"/>
    <!-- Snowflakes -->
    ${flakes.map(([x,y],i)=>`
    <g class="snow-flake" style="animation-delay:${i*0.4}s" transform-origin="${x} ${y}">
      <circle cx="${x}" cy="${y}" r="4" fill="white" opacity="0.9"/>
      <line x1="${x-6}" y1="${y}" x2="${x+6}" y2="${y}" stroke="white" stroke-width="1.5"/>
      <line x1="${x}" y1="${y-6}" x2="${x}" y2="${y+6}" stroke="white" stroke-width="1.5"/>
    </g>`).join('')}
  </svg>`;
}

export function getThunderstormIcon(size = 120) {
  return `
  <svg class="icon-thunder weather-icon-wrap" width="${size}" height="${size}" viewBox="0 0 120 120" aria-label="Thunderstorm icon" style="overflow:visible">
    <!-- Dark cloud -->
    <g class="cloud">
      <ellipse cx="60" cy="40" rx="32" ry="22" fill="#1F2937"/>
      <circle cx="42" cy="45" r="18" fill="#1F2937"/>
      <circle cx="78" cy="45" r="15" fill="#1F2937"/>
      <rect x="24" y="45" width="72" height="18" fill="#1F2937" rx="9"/>
    </g>
    <!-- Rain bg -->
    ${Array.from({length:4},(_,i)=>`
    <line class="rain-drop" x1="${36+i*14}" y1="68" x2="${32+i*14}" y2="84"
      stroke="#60A5FA" stroke-width="2" stroke-linecap="round"
      style="animation-delay:${i*0.2}s"/>`).join('')}
    <!-- Lightning -->
    <g class="lightning">
      <polyline points="64,63 56,82 63,82 55,100" stroke="#FCD34D" stroke-width="3.5"
        stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>
  </svg>`;
}

export function getMistIcon(size = 120) {
  return `
  <svg class="weather-icon-wrap" width="${size}" height="${size}" viewBox="0 0 120 120" aria-label="Mist or fog icon">
    ${[35,50,65,80].map((y,i)=>`
    <line class="mist-line" x1="20" y1="${y}" x2="100" y2="${y}"
      stroke="#9CA3AF" stroke-width="5" stroke-linecap="round"
      style="animation-delay:${i*0.3}s"/>`).join('')}
  </svg>`;
}

export function getNightClearIcon(size = 120) {
  return `
  <svg class="icon-night weather-icon-wrap" width="${size}" height="${size}" viewBox="0 0 120 120" aria-label="Clear night icon">
    <!-- Stars -->
    ${[[20,20],[90,18],[15,70],[95,65],[50,12]].map(([x,y],i)=>`
    <circle class="star" cx="${x}" cy="${y}" r="2.5" fill="white"
      style="animation-delay:${i*0.35}s"/>`).join('')}
    <!-- Moon -->
    <g class="moon">
      <circle cx="65" cy="60" r="26" fill="#818CF8"/>
      <circle cx="75" cy="50" r="22" fill="#0F172A"/>
    </g>
    <circle cx="65" cy="60" r="6" fill="rgba(129,140,248,0.3)"/>
  </svg>`;
}

export function getNightCloudIcon(size = 120) {
  return `
  <svg class="weather-icon-wrap" width="${size}" height="${size}" viewBox="0 0 120 120" aria-label="Cloudy night icon">
    <!-- Moon peaking -->
    <g style="opacity:0.7">
      <circle cx="38" cy="42" r="20" fill="#818CF8"/>
      <circle cx="46" cy="34" r="16" fill="#1E293B"/>
    </g>
    <!-- Cloud in front -->
    <g style="animation:cloudFloat 4s ease-in-out infinite">
      <ellipse cx="68" cy="58" rx="28" ry="18" fill="#4B5563"/>
      <circle cx="54" cy="62" r="14" fill="#4B5563"/>
      <circle cx="82" cy="62" r="12" fill="#4B5563"/>
      <rect x="40" y="62" width="54" height="14" fill="#4B5563" rx="7"/>
    </g>
  </svg>`;
}

/**
 * Returns the appropriate SVG icon HTML for a given OWM icon code
 */
export function getWeatherIconSvg(iconCode, size = 120) {
  if (!iconCode) return getSunIcon(size);
  const isNight = iconCode.endsWith('n');
  const id = iconCode.slice(0, 2);

  if (id === '01') return isNight ? getNightClearIcon(size) : getSunIcon(size);
  if (id === '02') return isNight ? getNightCloudIcon(size) : getFewCloudsIcon(size);
  if (id === '03' || id === '04') return getCloudIcon(size);
  if (id === '09' || id === '10') return getRainIcon(size);
  if (id === '11') return getThunderstormIcon(size);
  if (id === '13') return getSnowIcon(size);
  if (id === '50') return getMistIcon(size);
  return getSunIcon(size);
}
