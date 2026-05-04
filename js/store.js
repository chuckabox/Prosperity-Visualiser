const savedPrefs = JSON.parse(localStorage.getItem('op-prefs') || '{}');
const _state = {
  strategies: new Map(),
  activeIds: new Set(),
  playback: { tick: 0, playing: false, speed: 1, maxTick: 0 },
  selectedProduct: localStorage.getItem('op-product'),
  selectedDay: null,
  theme: localStorage.getItem('op-theme') || 'dark',
  prefs: { 
    indexedDB: savedPrefs.indexedDB ?? false, 
    normalizeX: savedPrefs.normalizeX ?? false, 
    diffMode: savedPrefs.diffMode ?? false 
  },
  loading: false,
  panel: 'pnl', // active bottom panel tab
};

const _listeners = new Map();

export const state = _state;

/**
 * Subscribe to state changes for a specific key
 * @param {string} key - The state key to watch
 * @param {Function} fn - Callback function
 * @returns {Function} - Unsubscribe function
 */
export function subscribe(key, fn) {
  if (!_listeners.has(key)) _listeners.set(key, new Set());
  _listeners.get(key).add(fn);
  return () => _listeners.get(key)?.delete(fn);
}

/**
 * Emit a state change event
 * @param {string} key - The state key that changed
 * @param {any} data - The new value
 */
export function emit(key, data) {
  _listeners.get(key)?.forEach(fn => fn(data));
}

/**
 * Add a new strategy to the store
 * @param {Object} strategy - The strategy object to add
 */
export function addStrategy(strategy) {
  if (_state.strategies.has(strategy.id)) return;
  _state.strategies.set(strategy.id, strategy);
  _state.activeIds.add(strategy.id);
  if (!_state.selectedProduct && strategy.products.length) {
    _state.selectedProduct = strategy.products[0];
    emit('product', _state.selectedProduct);
  }
  emit('strategies', _state.strategies);
  _recalcMaxTick();
}

/**
 * Remove a strategy from the store by ID
 * @param {string} id - The strategy ID to remove
 */
export function removeStrategy(id) {
  _state.strategies.delete(id);
  _state.activeIds.delete(id);
  emit('strategies', _state.strategies);
  _recalcMaxTick();
}

/**
 * Clear all strategies and reset playback state
 */
export function clearAll() {
  _state.strategies.clear();
  _state.activeIds.clear();
  _state.selectedProduct = null;
  _state.playback.tick = 0;
  _state.playback.maxTick = 0;
  emit('strategies', _state.strategies);
  emit('tick', 0);
  emit('maxTick', 0);
  _recalcMaxTick();
}

export function toggleStrategy(id) {
  if (_state.activeIds.has(id)) _state.activeIds.delete(id);
  else _state.activeIds.add(id);
  emit('activeIds', _state.activeIds);
}

export function setTick(tick) {
  _state.playback.tick = Math.max(0, Math.min(tick, _state.playback.maxTick));
  emit('tick', _state.playback.tick);
}

export function setPlaying(v) {
  _state.playback.playing = v;
  emit('playing', v);
}

export function setSpeed(v) {
  _state.playback.speed = v;
  emit('speed', v);
}

export function setProduct(p) {
  _state.selectedProduct = p;
  localStorage.setItem('op-product', p);
  emit('product', p);
}

export function setDay(d) {
  _state.selectedDay = d === 'auto' ? null : parseInt(d);
  emit('day', _state.selectedDay);
  _recalcMaxTick();
}

export function setTheme(t) {
  _state.theme = t;
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('op-theme', t);
  emit('theme', t);
}

export function setPref(key, val) {
  _state.prefs[key] = val;
  localStorage.setItem('op-prefs', JSON.stringify(_state.prefs));
  emit('prefs', _state.prefs);
}

export function setLoading(v) {
  _state.loading = v;
  emit('loading', v);
}

export function setPanel(p) {
  _state.panel = p;
  emit('panel', p);
}

function _recalcMaxTick() {
  let max = 0;
  for (const s of _state.strategies.values()) {
    const ticks = _state.selectedDay === null ? s.ticks : s.ticks.filter(t => t.day === _state.selectedDay);
    if (ticks?.length > max) max = ticks.length;
  }
  _state.playback.maxTick = Math.max(0, max - 1);
  if (_state.playback.tick > _state.playback.maxTick) {
    _state.playback.tick = _state.playback.maxTick;
  }
  emit('maxTick', _state.playback.maxTick);
}

// All products across all loaded strategies
export function allProducts() {
  const set = new Set();
  for (const s of _state.strategies.values()) {
    s.products.forEach(p => set.add(p));
  }
  return [...set].sort();
}

// All unique days across all loaded strategies
export function allDays() {
  const set = new Set();
  for (const s of _state.strategies.values()) {
     s.days.forEach(d => set.add(d));
  }
  return [...set].sort((a, b) => a - b);
}

// Active strategies array (filtered by day if needed)
export function activeStrategies() {
  return [..._state.activeIds]
    .map(id => {
      const s = _state.strategies.get(id);
      if (!s) return null;
      if (_state.selectedDay === null) return s;
      return {
        ...s,
        ticks: s.ticks.filter(t => t.day === _state.selectedDay)
      };
    })
    .filter(Boolean);
}
