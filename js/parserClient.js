let _worker = null;
const _pending = new Map();
let _reqId = 0;

function getWorker() {
  if (!_worker) {
    _worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    _worker.onmessage = (e) => {
      const { id, strategy, error } = e.data;
      const cb = _pending.get(id);
      if (cb) {
        _pending.delete(id);
        error ? cb.reject(new Error(error)) : cb.resolve(strategy);
      }
    };
    _worker.onerror = (e) => {
      console.error('Worker error', e);
    };
  }
  return _worker;
}

/**
 * Parse a log file string using a background Web Worker
 * @param {string} text - The log file content
 * @param {string} fileName - Original name of the file
 * @returns {Promise<Object>} - Parsed strategy data
 */
export function parseLogFile(text, fileName) {
  return new Promise((resolve, reject) => {
    const id = ++_reqId;
    _pending.set(id, { resolve, reject });
    getWorker().postMessage({ id, text, fileName });
  });
}
