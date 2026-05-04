import * as store from '../store.js';
import { LineChart } from '../chart.js';
import { getLimit } from '../positionLimits.js';

/**
 * Initialize the position sizing chart
 * @param {HTMLElement} container - The container element
 */
export function initPositionChart(container) {
  container.innerHTML = `
    <div class="chart-panel">
      <div class="chart-header">
        <span class="chart-title">Position</span>
      </div>
      <div class="chart-body">
        <canvas id="pos-canvas"></canvas>
      </div>
    </div>`;

  const canvas = container.querySelector('#pos-canvas');
  const chart = new LineChart(canvas, { yLabel: 'Position' });

  function buildSeries() {
    const product = store.state.selectedProduct;
    const strategies = store.activeStrategies();
    if (!product || !strategies.length) { chart.setSeries([]); return; }

    const limit = getLimit(product);
    const { normalizeX } = store.state.prefs;

    const series = strategies.map(s => ({
      label: s.name,
      color: s.color,
      data: s.ticks
        .map(t => ({ x: t.timestamp, y: t.products[product]?.position ?? 0 })),
    }));

    // Limit bands as constant series
    series.push({ label: `+${limit}`, color: 'rgba(255,80,80,0.4)', data: strategies[0]?.ticks?.map(t => ({ x: t.timestamp, y: limit })) ?? [] });
    series.push({ label: `-${limit}`, color: 'rgba(255,80,80,0.4)', data: strategies[0]?.ticks?.map(t => ({ x: t.timestamp, y: -limit })) ?? [] });

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
