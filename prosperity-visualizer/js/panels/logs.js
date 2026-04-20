import * as store from '../store.js';

export function initLogs(container) {
  container.innerHTML = `
    <div class="panel logs-panel">
      <div class="panel-header">
        <span class="panel-title">Logs</span>
        <div class="log-tabs">
          <button class="log-tab active" data-tab="algo">Algorithm</button>
          <button class="log-tab" data-tab="trader">Trader Data</button>
          <button class="log-tab" data-tab="sandbox">Sandbox</button>
        </div>
      </div>
      <div id="log-content" class="log-content"></div>
    </div>`;

  const logContent = container.querySelector('#log-content');
  let activeTab = 'algo';

  container.querySelectorAll('.log-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.log-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      render();
    });
  });

  function render() {
    const strategies = store.activeStrategies();
    if (!strategies.length) {
      logContent.textContent = 'No strategy loaded.';
      return;
    }

    const s = strategies[0];
    let lines = [];

    if (activeTab === 'algo') lines = s.algorithmLogs ?? [];
    else if (activeTab === 'trader') lines = (s.traderDataLogs ?? []).map(e => `[${e.timestamp}] ${JSON.stringify(e.data)}`);
    else lines = (s.sandboxLogs ?? []).map(e => e.raw ?? JSON.stringify(e));

    if (!lines.length) {
      logContent.textContent = '(empty)';
      return;
    }

    logContent.textContent = lines.join('\n');
  }

  store.subscribe('strategies', render);
  store.subscribe('activeIds', render);
  render();
}
