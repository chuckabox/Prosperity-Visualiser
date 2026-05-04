import * as store from '../store.js';
import { fmtPnl } from '../format.js';
import { exportCsv } from '../exporters.js';

/**
 * Initialize the strategy comparison summary table
 * @param {HTMLElement} container - The container element
 */
export function initSummary(container) {
  container.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">Comparison Summary</span>
        <button class="btn-ghost" id="summary-export" aria-label="Export comparison summary as CSV">CSV</button>
      </div>
      <div id="summary-content" class="summary-content">
        <table class="summary-table">
          <thead>
            <tr>
              <th>Strategy</th><th>Final PnL</th><th>Max PnL</th>
              <th>Min PnL</th><th>Ticks</th><th>Products</th>
            </tr>
          </thead>
          <tbody id="summary-body"></tbody>
        </table>
      </div>
    </div>`;

  const tbody = container.querySelector('#summary-body');
  container.querySelector('#summary-export').addEventListener('click', () => {
    exportCsv(store.state.strategies);
  });

  function render() {
    const strategies = store.activeStrategies();
    if (!strategies.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="fills-empty">No strategies loaded</td></tr>';
      return;
    }

    tbody.innerHTML = strategies.map(s => {
      const pnls = s.ticks.map(t => t.pnl);
      const final = pnls.at(-1) ?? 0;
      const max = Math.max(...pnls);
      const min = Math.min(...pnls);
      return `
        <tr>
          <td><span class="dot" style="background:${s.color}"></span>${s.name}</td>
          <td class="${final >= 0 ? 'pos' : 'neg'}">${fmtPnl(final)}</td>
          <td class="pos">${fmtPnl(max)}</td>
          <td class="neg">${fmtPnl(min)}</td>
          <td>${s.ticks.length}</td>
          <td>${s.products.join(', ')}</td>
        </tr>`;
    }).join('');
  }

  store.subscribe('strategies', render);
  store.subscribe('activeIds', render);
  render();
}
