import * as store from '../store.js';
import { getLimit } from '../positionLimits.js';

export function initPressure(container) {
  container.innerHTML = `
    <div class="panel">
      <div class="panel-header"><span class="panel-title">Position Pressure</span></div>
      <div id="pressure-content" class="pressure-content"></div>
    </div>`;

  const content = container.querySelector('#pressure-content');

  function render() {
    const product = store.state.selectedProduct;
    const strategies = store.activeStrategies();
    if (!product || !strategies.length) {
      content.innerHTML = '<div class="panel-empty">No data</div>';
      return;
    }

    const { tick } = store.state.playback;
    const limit = getLimit(product);

    content.innerHTML = strategies.map(s => {
      const pd = s.ticks[tick]?.products?.[product];
      const pos = pd?.position ?? 0;
      const pct = Math.abs(pos) / limit;
      const clampedPct = Math.min(pct, 1);
      const color = pct > 0.8 ? '#f16c4e' : pct > 0.5 ? '#f1d44e' : '#4ef1a0';
      const dir = pos >= 0 ? 'LONG' : 'SHORT';
      const angle = -90 + clampedPct * (pos >= 0 ? 90 : -90);

      return `
        <div class="pressure-gauge">
          <div class="gauge-name" style="color:${s.color}">${s.name}</div>
          <svg viewBox="0 0 120 70" class="gauge-svg">
            <!-- Background arc -->
            <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="var(--border)" stroke-width="10" stroke-linecap="round"/>
            <!-- Fill arc -->
            <path d="M10,60 A50,50 0 0,1 110,60" fill="none"
              stroke="${color}" stroke-width="10" stroke-linecap="round"
              stroke-dasharray="${clampedPct * 157} 157"/>
            <!-- Needle -->
            <line x1="60" y1="60"
              x2="${60 + 38 * Math.cos((angle - 90) * Math.PI / 180)}"
              y2="${60 + 38 * Math.sin((angle - 90) * Math.PI / 180)}"
              stroke="var(--text-primary)" stroke-width="2" stroke-linecap="round"/>
            <circle cx="60" cy="60" r="4" fill="var(--text-primary)"/>
            <text x="60" y="52" text-anchor="middle" font-size="10" fill="${color}">${pos}</text>
            <text x="10" y="68" text-anchor="middle" font-size="8" fill="var(--text-muted)">-${limit}</text>
            <text x="110" y="68" text-anchor="middle" font-size="8" fill="var(--text-muted)">+${limit}</text>
          </svg>
          <div class="gauge-label" style="color:${color}">${dir} ${(pct * 100).toFixed(0)}%</div>
        </div>`;
    }).join('');
  }

  store.subscribe('tick', render);
  store.subscribe('strategies', render);
  store.subscribe('activeIds', render);
  store.subscribe('product', render);
  render();
}
