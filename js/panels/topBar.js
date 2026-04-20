import * as store from '../store.js';

let _raf = null;
let _lastTime = null;

export function initTopBar(container) {
  container.innerHTML = `
    <div class="top-bar">
      <div class="top-bar-left">
        <button class="tb-btn" id="tb-play" title="Play/Pause (Space)">&#9654;</button>
        <button class="tb-btn" id="tb-prev" title="Prev tick (←)">&#8592;</button>
        <button class="tb-btn" id="tb-next" title="Next tick (→)">&#8594;</button>
        <input type="range" id="tb-scrubber" min="0" max="0" value="0" class="scrubber">
        <span class="tb-tick-label" id="tb-tick-label">0 / 0</span>
      </div>
      <div class="top-bar-center">
        <select id="tb-day" class="tb-select" title="Filter by day"></select>
        <select id="tb-product" class="tb-select" title="Select product"></select>
        <select id="tb-speed" class="tb-select">
          <option value="1">1×</option>
          <option value="5">5×</option>
          <option value="10">10×</option>
          <option value="20">20×</option>
          <option value="50">50×</option>
        </select>
      </div>
      <div class="top-bar-right">
        <label class="toggle-row" title="Normalize X axis">
          <input type="checkbox" id="tb-norm-x">
          <span>Norm-X</span>
        </label>
        <label class="toggle-row" title="Diff mode: variant − baseline">
          <input type="checkbox" id="tb-diff">
          <span>Diff</span>
        </label>
        <button class="tb-btn" id="tb-theme" title="Toggle theme">&#9790;</button>
      </div>
    </div>`;

  const playBtn = container.querySelector('#tb-play');
  const scrubber = container.querySelector('#tb-scrubber');
  const tickLabel = container.querySelector('#tb-tick-label');
  const daySel = container.querySelector('#tb-day');
  const productSel = container.querySelector('#tb-product');
  const speedSel = container.querySelector('#tb-speed');
  const normX = container.querySelector('#tb-norm-x');
  const diffCk = container.querySelector('#tb-diff');
  const themeBtn = container.querySelector('#tb-theme');

  function updateScrubber() {
    const { tick, maxTick } = store.state.playback;
    scrubber.max = maxTick;
    scrubber.value = tick;
    tickLabel.textContent = `${tick} / ${maxTick}`;
  }

  function updateProducts() {
    const products = store.allProducts();
    productSel.innerHTML = products.map(p =>
      `<option value="${p}"${p === store.state.selectedProduct ? ' selected' : ''}>${p}</option>`
    ).join('');
    if (!products.length) productSel.innerHTML = '<option value="">— no product —</option>';
  }

  function updateDays() {
    const days = store.allDays();
    daySel.innerHTML = '<option value="auto">All Days</option>' + days.map(d =>
      `<option value="${d}"${d === store.state.selectedDay ? ' selected' : ''}>Day ${d}</option>`
    ).join('');
    daySel.style.display = days.length > 1 ? 'inline-block' : 'none';
  }

  store.subscribe('tick', updateScrubber);
  store.subscribe('maxTick', () => { updateScrubber(); updateProducts(); updateDays(); });
  store.subscribe('strategies', () => { updateProducts(); updateDays(); });
  store.subscribe('playing', v => { playBtn.innerHTML = v ? '&#9646;&#9646;' : '&#9654;'; });
  store.subscribe('product', () => updateProducts());
  store.subscribe('day', () => { updateDays(); updateScrubber(); });

  playBtn.addEventListener('click', () => togglePlay());
  scrubber.addEventListener('input', () => { store.setTick(+scrubber.value); });
  daySel.addEventListener('change', () => store.setDay(daySel.value));
  productSel.addEventListener('change', () => store.setProduct(productSel.value));
  speedSel.addEventListener('change', () => store.setSpeed(+speedSel.value));
  normX.addEventListener('change', () => store.setPref('normalizeX', normX.checked));
  diffCk.addEventListener('change', () => store.setPref('diffMode', diffCk.checked));
  themeBtn.addEventListener('click', () => {
    store.setTheme(store.state.theme === 'dark' ? 'light' : 'dark');
  });

  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); store.setTick(store.state.playback.tick - (e.shiftKey ? 10 : 1)); }
    if (e.key === 'ArrowRight') { e.preventDefault(); store.setTick(store.state.playback.tick + (e.shiftKey ? 10 : 1)); }
  });

  updateScrubber();
  updateProducts();
  updateDays();
}

function togglePlay() {
  const playing = !store.state.playback.playing;
  store.setPlaying(playing);
  if (playing) startLoop();
  else stopLoop();
}

function startLoop() {
  _lastTime = null;
  function tick(now) {
    if (!store.state.playback.playing) return;
    _raf = requestAnimationFrame(tick);
    if (_lastTime == null) { _lastTime = now; return; }
    const elapsed = now - _lastTime;
    const msPerTick = 100 / store.state.playback.speed;
    if (elapsed < msPerTick) return;
    _lastTime = now;
    const { tick: cur, maxTick } = store.state.playback;
    if (cur >= maxTick) { store.setPlaying(false); return; }
    store.setTick(cur + 1);
  }
  _raf = requestAnimationFrame(tick);
}

function stopLoop() {
  if (_raf) cancelAnimationFrame(_raf);
  _raf = null;
}
