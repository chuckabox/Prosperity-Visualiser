import * as store from '../store.js';
import { LineChart } from '../chart.js';
import { exportPng } from '../exporters.js';

/**
 * Initialize the PnL performance chart
 * @param {HTMLElement} container - The container element
 */
export function initPnlChart(container) {
  container.innerHTML = `
    <div class="chart-panel">
      <div class="chart-header">
        <span class="chart-title">PnL Performance</span>
        <button class="btn-ghost" id="pnl-export" aria-label="Export PnL chart as PNG image">PNG</button>
      </div>
      <div class="chart-body">
        <canvas id="pnl-canvas"></canvas>
      </div>
    </div>`;

  const canvas = container.querySelector('#pnl-canvas');
  const chart = new LineChart(canvas, { yLabel: 'PnL' });

  container.querySelector('#pnl-export').addEventListener('click', () => {
    exportPng(chart, 'pnl-chart.png');
  });

  function buildSeries() {
    const strategies = store.activeStrategies();
    const { diffMode, normalizeX } = store.state.prefs;

    let series = strategies.map(s => ({
      label: s.name,
      color: s.color,
      data: s.ticks.map((t, i) => ({ x: t.timestamp, y: t.pnl })),
    }));

    if (diffMode && series.length >= 2) {
      const base = series[0].data;
      series = series.slice(1).map(s => ({
        label: `${s.label} − baseline`,
        color: s.color,
        data: s.data.map((p, i) => ({ x: p.x, y: p.y - (base[i]?.y ?? 0) })),
      }));
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
  store.subscribe('prefs', buildSeries);
  store.subscribe('tick', updateMarker);
  buildSeries();
}
