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

export function parseLogFile(text, fileName) {
  return new Promise((resolve, reject) => {
    const id = ++_reqId;
    _pending.set(id, { resolve, reject });
    getWorker().postMessage({ id, text, fileName });
  });
}
