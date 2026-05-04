let _open = () => {};

/**
 * Initialize the About modal and its event listeners
 */
export function initAbout() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay hidden';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>Prosperity Visualiser</h2>
        <button class="modal-close">✕</button>
      </div>
      <div class="modal-body">
        <p><strong>Prosperity Visualiser v1.2.0</strong></p>
        <p>A specialized tool for analyzing trading logs from the IMC Prosperity competition. Designed for speed, privacy, and deep data inspection.</p>
        
        <h3>Key Features</h3>
        <ul>
          <li><strong>Multithreaded Parsing</strong>: Processes logs without blocking the main thread.</li>
          <li><strong>Diff Mode</strong>: Instantly spot variance between strategy versions.</li>
          <li><strong>Zero Latency Charts</strong>: Custom canvas implementation for smooth scrubbing.</li>
        </ul>

        <h3>Shortcuts</h3>
        <ul>
          <li><kbd>Space</kbd> Play/Pause playback</li>
          <li><kbd>←</kbd> / <kbd>→</kbd> Step single tick</li>
          <li><kbd>Shift</kbd> + <kbd>←</kbd> / <kbd>→</kbd> Jump 10 ticks</li>
        </ul>
      <div class="modal-body">
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

/**
 * Open the About modal
 */
export function openAbout() {
  _open();
}
