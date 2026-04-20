import { parseLog } from './parser.js';

self.onmessage = function (e) {
  const { id, text, fileName } = e.data;
  try {
    const strategy = parseLog(text, fileName);
    self.postMessage({ id, strategy });
  } catch (err) {
    self.postMessage({ id, error: err.message });
  }
};
