import * as store from '../store.js';

/**
 * Initialize the L2 order book visualization
 * @param {HTMLElement} container - The container element
 */
export function initOrderBook(container) {
  container.innerHTML = `
    <div class="panel">
      <div class="panel-header"><span class="panel-title">Order Book</span></div>
      <div id="ob-content" class="ob-content"></div>
    </div>`;

  const content = container.querySelector('#ob-content');

  function render() {
    const product = store.state.selectedProduct;
    const strategies = store.activeStrategies();
    if (!product || !strategies.length) {
      content.innerHTML = '<div class="panel-empty">No data</div>';
      return;
    }

    const { tick } = store.state.playback;
    const s = strategies[0];
    const pd = s.ticks[tick]?.products?.[product];

    if (!pd) {
      content.innerHTML = '<div class="panel-empty">No tick data</div>';
      return;
    }

    const bids = pd.bids.slice(0, 5);
    const asks = pd.asks.slice(0, 5);
    const maxVol = Math.max(
      ...bids.map(b => b.volume),
      ...asks.map(a => a.volume),
      1
    );

    const askRows = [...asks].reverse().map(a => `
      <div class="ob-row ask">
        <span class="ob-price">${a.price}</span>
        <div class="ob-bar-wrap">
          <div class="ob-bar ask-bar" style="width:${(a.volume / maxVol * 100).toFixed(1)}%"></div>
        </div>
        <span class="ob-vol">${a.volume}</span>
      </div>`).join('');

    const bidRows = bids.map(b => `
      <div class="ob-row bid">
        <span class="ob-price">${b.price}</span>
        <div class="ob-bar-wrap">
          <div class="ob-bar bid-bar" style="width:${(b.volume / maxVol * 100).toFixed(1)}%"></div>
        </div>
        <span class="ob-vol">${b.volume}</span>
      </div>`).join('');

    const spread = asks[0] && bids[0] ? (asks[0].price - bids[0].price) : '—';
    content.innerHTML = `
      <div class="ob-product">${product}</div>
      ${askRows}
      <div class="ob-spread">Spread: ${spread}</div>
      ${bidRows}`;
  }

  store.subscribe('tick', render);
  store.subscribe('strategies', render);
  store.subscribe('activeIds', render);
  store.subscribe('product', render);
  render();
}
