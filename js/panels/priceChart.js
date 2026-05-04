import * as store from '../store.js';
import { LineChart } from '../chart.js';

/**
 * Initialize the price and liquidity chart
 * @param {HTMLElement} container - The container element
 */
export function initPriceChart(container) {
  container.innerHTML = `
    <div class="chart-panel">
      <div class="chart-header">
        <span class="chart-title">Price & Liquidity</span>
      </div>
      <div class="chart-body">
        <canvas id="price-canvas"></canvas>
      </div>
    </div>`;

  const canvas = container.querySelector('#price-canvas');
  const chart = new LineChart(canvas, { yLabel: 'Price' });

  function buildSeries() {
    const product = store.state.selectedProduct;
    const strategies = store.activeStrategies();
    if (!product || !strategies.length) { chart.setSeries([]); return; }

    const { normalizeX } = store.state.prefs;

    const series = [];
    for (const s of strategies) {
      const midData = s.ticks.map(t => ({
        x: t.timestamp,
        y: t.products[product]?.midPrice ?? null,
      })).filter(p => p.y != null);

      const bidData = s.ticks.map(t => ({
        x: t.timestamp,
        y: t.products[product]?.bids?.[0]?.price ?? null,
      })).filter(p => p.y != null);

      const askData = s.ticks.map(t => ({
        x: t.timestamp,
        y: t.products[product]?.asks?.[0]?.price ?? null,
      })).filter(p => p.y != null);

      if (strategies.length === 1) {
        series.push({ label: 'Best Bid', color: '#4ef1a0', data: bidData });
        series.push({ label: 'Mid', color: s.color, data: midData });
        series.push({ label: 'Best Ask', color: '#f16c4e', data: askData });
      } else {
        series.push({ label: `${s.name} mid`, color: s.color, data: midData });
      }
    }

    chart.setOpts({ normalizeX });
    chart.setSeries(series);
  }

  function updateMarker() {
    const strategies = store.activeStrategies();
    if (!strategies.length) return;
    const t = strategies[0].ticks[store.state.playback.tick];
    chart.setTickMarker(t?.timestamp ?? null);
  }

  store.subscribe('strategies', buildSeries);
  store.subscribe('activeIds', buildSeries);
  store.subscribe('product', buildSeries);
  store.subscribe('prefs', buildSeries);
  store.subscribe('tick', updateMarker);
  buildSeries();
}
