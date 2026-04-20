let _open = () => {};

export function initAbout() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay hidden';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>OpenProsperity Visualizer</h2>
        <button class="modal-close">✕</button>
      </div>
      <div class="modal-body">
        <p>Local-first dashboard for IMC Prosperity algorithmic trading competitions.</p>
        <h3>Features</h3>
        <ul>
          <li>Drop 1–N .log files; each gets a unique color</li>
          <li>Playback with variable speed (1×–50×), scrubber, keyboard shortcuts</li>
          <li>PnL performance, price/liquidity, position charts</li>
          <li>Live order book, position pressure gauge</li>
          <li>Own fills table, sandbox/algorithm/trader-data logs</li>
          <li>Diff mode: variant − baseline on PnL chart</li>
          <li>Normalized-X: compare runs of different lengths</li>
          <li>Export PnL → PNG, summary → CSV</li>
          <li>Optional IndexedDB persistence across reloads</li>
        </ul>
        <h3>Keyboard Shortcuts</h3>
        <ul>
          <li><kbd>Space</kbd> — Play / Pause</li>
          <li><kbd>←</kbd> / <kbd>→</kbd> — Step one tick</li>
          <li><kbd>Shift+←</kbd> / <kbd>Shift+→</kbd> — Step 10 ticks</li>
        </ul>
        <h3>Data Handling</h3>
        <p>Files are read client-side with the File API and parsed in a Web Worker.
        No data ever leaves your browser. No analytics, no cookies, no telemetry.</p>
        <h3>Credits</h3>
        <p>Inspired by <a href="https://github.com/jmerle/imc-prosperity-3-visualizer" target="_blank" rel="noopener">jmerle/imc-prosperity-3-visualizer</a>.
        IMC Prosperity is © IMC Trading. This is an independent fan tool.</p>
        <p>License: MIT</p>
      </div>
    </div>`;

  document.body.appendChild(modal);

  const close = () => modal.classList.add('hidden');
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  _open = () => modal.classList.remove('hidden');
}

export function openAbout() {
  _open();
}
