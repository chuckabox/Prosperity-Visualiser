import * as store from '../store.js';

/**
 * Initialize the execution history table
 * @param {HTMLElement} container - The container element
 */
export function initOwnFills(container) {
  container.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">Own Fills</span>
        <span class="panel-subtitle" id="fills-count"></span>
      </div>
      <div id="fills-content" class="fills-content">
        <table class="fills-table">
          <thead>
            <tr>
              <th>Strategy</th><th>Day</th><th>Ts</th><th>Symbol</th>
              <th>Qty</th><th>Price</th><th>Value</th>
            </tr>
          </thead>
          <tbody id="fills-body"></tbody>
        </table>
      </div>
    </div>`;

  const tbody = container.querySelector('#fills-body');
  const countEl = container.querySelector('#fills-count');

  function render() {
    const product = store.state.selectedProduct;
    const strategies = store.activeStrategies();
    const { tick } = store.state.playback;

    if (!strategies.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="fills-empty">No data</td></tr>';
      countEl.textContent = '';
      return;
    }

    const curTs = strategies[0]?.ticks[tick]?.timestamp ?? Infinity;
    const rows = [];

    for (const s of strategies) {
      const trades = s.trades.filter(t => {
        if (product && t.symbol !== product) return false;
        const tickTs = s.ticks[tick];
        if (!tickTs) return true;
        return t.timestamp <= tickTs.timestamp;
      });

      for (const t of trades) {
        rows.push({ ...t, stratName: s.name, stratColor: s.color });
      }
    }

    rows.sort((a, b) => b.timestamp - a.timestamp || b.day - a.day);
    countEl.textContent = `(${rows.length})`;

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="fills-empty">No fills</td></tr>';
      return;
    }

    tbody.innerHTML = rows.slice(0, 200).map(r => `
      <tr>
        <td><span class="dot" style="background:${r.stratColor}"></span>${r.stratName}</td>
        <td>${r.day}</td>
        <td>${r.timestamp}</td>
        <td>${r.symbol}</td>
        <td class="${r.quantity > 0 ? 'pos' : 'neg'}">${r.quantity > 0 ? '+' : ''}${r.quantity}</td>
        <td>${r.price.toFixed(1)}</td>
        <td class="${r.quantity * r.price > 0 ? 'neg' : 'pos'}">${(r.quantity * r.price).toFixed(0)}</td>
      </tr>`).join('');
  }

  store.subscribe('tick', render);
  store.subscribe('strategies', render);
  store.subscribe('activeIds', render);
  store.subscribe('product', render);
  render();
}
