import * as store from '../store.js';
import { parseLogFile } from '../parserClient.js';
import { saveStrategy, deleteStrategy } from '../persistence.js';
import { loadDemoLog } from '../demoLog.js';
import { openAbout } from './about.js';

export function initRail(container) {
  container.innerHTML = `
    <div class="rail">
      <div class="rail-header">
        <span class="rail-title">Strategies</span>
        <button class="btn-ghost" id="load-demo" aria-label="Load demo log">Demo</button>
      </div>
      <div class="drop-zone" id="drop-zone" role="button" tabindex="0" aria-label="Drop log files here">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p>Drop .log files</p>
        <p class="drop-hint">or click to browse</p>
        <input type="file" id="file-input" accept=".log,.json" multiple style="display:none">
      </div>
      <div id="strategy-list" class="strategy-list"></div>
      <div class="rail-footer">
        <label class="toggle-row" title="Save to IndexedDB">
          <input type="checkbox" id="idb-toggle" aria-label="Persist strategies to local database">
          <span>Persist</span>
        </label>
        <button class="btn-ghost" id="clear-all" style="color:var(--neg)" aria-label="Clear all loaded strategies">Clear All</button>
      </div>
    </div>`;

  const dropZone = container.querySelector('#drop-zone');
  const fileInput = container.querySelector('#file-input');
  const list = container.querySelector('#strategy-list');

  // File drop
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    loadFiles([...e.dataTransfer.files]);
  });
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
  fileInput.addEventListener('change', () => { loadFiles([...fileInput.files]); fileInput.value = ''; });

  // Demo button
  container.querySelector('#load-demo').addEventListener('click', async () => {
    try {
      store.setLoading(true);
      const text = await loadDemoLog();
      const strategy = await parseLogFile(text, 'demo.log');
      store.addStrategy(strategy);
      if (store.state.prefs.indexedDB) await saveStrategy(strategy);
    } catch (e) {
      alert(`Failed to load demo: ${e.message}`);
    } finally {
      store.setLoading(false);
    }
  });

  // IDB toggle
  const idbToggle = container.querySelector('#idb-toggle');
  idbToggle.checked = store.state.prefs.indexedDB;
  idbToggle.addEventListener('change', () => store.setPref('indexedDB', idbToggle.checked));

  // Render strategy list
  function renderList() {
    list.innerHTML = '';
    for (const s of store.state.strategies.values()) {
      const active = store.state.activeIds.has(s.id);
      const row = document.createElement('div');
      row.className = `strategy-row${active ? ' active' : ''}`;
      row.innerHTML = `
        <span class="strategy-dot" style="background:${s.color}"></span>
        <span class="strategy-name" title="${s.fileName}">${s.name}</span>
        <button class="strategy-remove" data-id="${s.id}" title="Remove">✕</button>`;
      row.addEventListener('click', e => {
        if (e.target.classList.contains('strategy-remove')) return;
        store.toggleStrategy(s.id);
      });
      row.querySelector('.strategy-remove').addEventListener('click', async (e) => {
        e.stopPropagation();
        store.removeStrategy(s.id);
        if (store.state.prefs.indexedDB) await deleteStrategy(s.id);
      });
      list.appendChild(row);
    }
  }

  store.subscribe('strategies', renderList);
  store.subscribe('activeIds', renderList);
  renderList();

  // Clear all
  container.querySelector('#clear-all').addEventListener('click', async () => {
    if (!confirm('Clear all strategies?')) return;
    store.clearAll();
    localStorage.removeItem('op-idb'); // or keep it
    // if (store.state.prefs.indexedDB) ... need clearDB
  });
}

async function loadFiles(files) {
  for (const file of files) {
    const name = file.name.toLowerCase();
    if (!name.endsWith('.log') && !name.endsWith('.json')) continue;
    store.setLoading(true);
    try {
      const text = await file.text();
      const strategy = await parseLogFile(text, file.name);
      store.addStrategy(strategy);
      if (store.state.prefs.indexedDB) await saveStrategy(strategy);
    } catch (e) {
      alert(`Failed to parse ${file.name}: ${e.message}`);
    } finally {
      store.setLoading(false);
    }
  }
}
