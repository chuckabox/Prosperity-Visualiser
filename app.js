import { initRail } from './js/panels/rail.js';
import { initTopBar } from './js/panels/topBar.js';
import { initKpi } from './js/panels/kpi.js';
import { initPnlChart } from './js/panels/pnlChart.js';
import { initPriceChart } from './js/panels/priceChart.js';
import { initPositionChart } from './js/panels/positionChart.js';
import { initOrderBook } from './js/panels/orderBook.js';
import { initPressure } from './js/panels/pressure.js';
import { initOwnFills } from './js/panels/ownFills.js';
import { initLogs } from './js/panels/logs.js';
import { initSummary } from './js/panels/summary.js';
import { initAbout } from './js/panels/about.js';
import * as store from './js/store.js';
import { loadStrategies } from './js/persistence.js';

// Apply saved theme
document.documentElement.setAttribute('data-theme', store.state.theme);

// Init all panels
initRail(document.getElementById('rail'));
initTopBar(document.getElementById('top-bar'));
initKpi(document.getElementById('kpi-row'));
initPnlChart(document.getElementById('pnl-chart-wrap'));
initPriceChart(document.getElementById('price-chart-wrap'));
initPositionChart(document.getElementById('position-chart-wrap'));
initOrderBook(document.getElementById('order-book-wrap'));
initPressure(document.getElementById('pressure-wrap'));
initOwnFills(document.getElementById('own-fills-wrap'));
initLogs(document.getElementById('logs-wrap'));
initSummary(document.getElementById('summary-wrap'));
initAbout();

// Loading overlay
const loadingEl = document.getElementById('loading-overlay');
store.subscribe('loading', v => {
  if (loadingEl) loadingEl.classList.toggle('hidden', !v);
});

// Restore IndexedDB strategies if pref was saved
const savedIdb = localStorage.getItem('op-idb') === 'true';
if (savedIdb) {
  store.setPref('indexedDB', true);
  loadStrategies().then(strats => {
    strats.forEach(s => store.addStrategy(s));
  }).catch(console.error);
}

// Bottom panel tab switching
document.querySelectorAll('[data-panel]').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.dataset.panel;
    store.setPanel(panel);
    document.querySelectorAll('[data-panel]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.bottom-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById(`panel-${panel}`)?.classList.remove('hidden');
  });
});
