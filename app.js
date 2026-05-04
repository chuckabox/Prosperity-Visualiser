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

// Initialize UI components and panels
initRail(document.getElementById('rail'));           // Sidebar for strategy management
initTopBar(document.getElementById('top-bar'));       // Playback controls and global settings
initKpi(document.getElementById('kpi-row'));          // Key performance indicators
initPnlChart(document.getElementById('pnl-chart-wrap')); // Profit & Loss visualization
initPriceChart(document.getElementById('price-chart-wrap')); // Price action visualization
initPositionChart(document.getElementById('position-chart-wrap')); // Position sizing visualization
initOrderBook(document.getElementById('order-book-wrap')); // L2 Order Book display
initPressure(document.getElementById('pressure-wrap')); // Buy/Sell pressure gauge
initOwnFills(document.getElementById('own-fills-wrap')); // Execution history
initLogs(document.getElementById('logs-wrap'));       // Strategy log output
initSummary(document.getElementById('summary-wrap')); // Trade summary statistics
initAbout();                                          // About modal and credits

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
