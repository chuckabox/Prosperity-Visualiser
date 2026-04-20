import * as store from '../store.js';
import { fmtPnl, fmtInt } from '../format.js';

export function initKpi(container) {
  container.innerHTML = `<div class="kpi-row" id="kpi-inner"></div>`;
  const inner = container.querySelector('#kpi-inner');

  function render() {
    const { tick } = store.state.playback;
    const strategies = store.activeStrategies();
    const product = store.state.selectedProduct;

    if (!strategies.length) {
      inner.innerHTML = `<div class="kpi-empty">Drop a .log file to get started</div>`;
      return;
    }

    inner.innerHTML = strategies.map(s => {
      const t = s.ticks[tick];
      const pd = t?.products?.[product];
      const finalPnl = s.ticks.at(-1)?.pnl ?? 0;
      const curPnl = t?.pnl ?? 0;
      const pos = pd?.position ?? 0;
      const mid = pd?.midPrice ?? 0;
      const bestBid = pd?.bids?.[0]?.price ?? 0;
      const bestAsk = pd?.asks?.[0]?.price ?? 0;
      const spread = bestBid && bestAsk ? bestAsk - bestBid : 0;

      return `
        <div class="kpi-card" style="border-top:3px solid ${s.color}">
          <div class="kpi-name">${s.name}</div>
          <div class="kpi-grid">
            <div class="kpi-item">
              <div class="kpi-label">Total PnL</div>
              <div class="kpi-value ${finalPnl >= 0 ? 'pos' : 'neg'}">${fmtPnl(finalPnl)}</div>
            </div>
            <div class="kpi-item">
              <div class="kpi-label">PnL @ tick</div>
              <div class="kpi-value ${curPnl >= 0 ? 'pos' : 'neg'}">${fmtPnl(curPnl)}</div>
            </div>
            <div class="kpi-item">
              <div class="kpi-label">Position</div>
              <div class="kpi-value">${fmtInt(pos)}</div>
            </div>
            <div class="kpi-item">
              <div class="kpi-label">Mid Price</div>
              <div class="kpi-value">${mid ? mid.toFixed(1) : '—'}</div>
            </div>
            <div class="kpi-item">
              <div class="kpi-label">Best Bid</div>
              <div class="kpi-value pos">${bestBid || '—'}</div>
            </div>
            <div class="kpi-item">
              <div class="kpi-label">Spread</div>
              <div class="kpi-value">${spread ? spread.toFixed(1) : '—'}</div>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  store.subscribe('tick', render);
  store.subscribe('strategies', render);
  store.subscribe('activeIds', render);
  store.subscribe('product', render);
  render();
}
