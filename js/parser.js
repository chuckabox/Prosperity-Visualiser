import { uid } from './uid.js';
import { nextColor } from './colors.js';

export function parseLog(text, fileName) {
  let sandboxSection = '';
  let activitySection = '';
  let tradeSection = '';

  const trimmed = text.trim();
  if (trimmed.startsWith('{')) {
    try {
      const obj = JSON.parse(trimmed);
      activitySection = obj.activitiesLog ?? obj.activityLog ?? '';
      sandboxSection = obj.logs ?? obj.sandboxLog ?? obj.sandboxLogs ?? '';
      tradeSection = obj.tradeHistory ?? obj.trades ?? '';
    } catch (e) {
      console.warn('Failed to parse log as JSON', e);
    }
  }

  if (!activitySection) {
    const sections = splitSections(text);
    sandboxSection = sections['Sandbox logs'] ?? '';
    activitySection = sections['Activities log'] ?? '';
    tradeSection = sections['Trade History'] ?? '';
  }

  // Fallback: if no sections found but text looks like activities CSV
  if (!activitySection && (text.includes('day;') || text.includes('day,'))) {
    activitySection = text;
  }

  const { sandboxLogs, algorithmLogs, traderDataLogs } = parseSandbox(sandboxSection);
  const activityRows = Array.isArray(activitySection) ? activitySection : parseCsv(activitySection);
  const tradeRows = Array.isArray(tradeSection) ? tradeSection : parseCsv(tradeSection);

  // Build tick map: `${day}:${ts}` -> tick object
  const tickMap = new Map();

  for (const row of activityRows) {
    const day = parseInt(row.day ?? 0);
    const ts = parseInt(row.timestamp ?? 0);
    const product = row.product?.trim();
    if (!product) continue;

    const key = `${day}:${ts}`;
    if (!tickMap.has(key)) tickMap.set(key, { timestamp: ts, day, products: {}, pnl: 0 });
    const tick = tickMap.get(key);

    const bids = [];
    for (let i = 1; i <= 3; i++) {
      const price = parseFloat(row[`bid_price_${i}`]);
      const volume = parseInt(row[`bid_volume_${i}`]);
      if (price > 0 && volume > 0) bids.push({ price, volume });
    }

    const asks = [];
    for (let i = 1; i <= 3; i++) {
      const price = parseFloat(row[`ask_price_${i}`]);
      const volume = parseInt(row[`ask_volume_${i}`]);
      if (price > 0 && volume > 0) asks.push({ price, volume });
    }

    const pnl = parseFloat(row.profit_and_loss) || 0;
    tick.products[product] = {
      bids,
      asks,
      midPrice: parseFloat(row.mid_price) || 0,
      pnl,
      position: 0,
    };
    tick.pnl += pnl;
  }

  const ticks = Array.from(tickMap.values()).sort((a, b) =>
    a.day !== b.day ? a.day - b.day : a.timestamp - b.timestamp
  );

  const trades = tradeRows.map(r => ({
    day: parseInt(r.day ?? 0),
    timestamp: parseInt(r.timestamp ?? 0),
    symbol: r.symbol?.trim() ?? '',
    currency: r.currency?.trim() ?? '',
    quantity: parseInt(r.quantity ?? 0),
    price: parseFloat(r.price ?? 0),
  }));

  fillPositions(ticks, trades);

  const productSet = new Set();
  for (const tick of ticks) Object.keys(tick.products).forEach(p => productSet.add(p));
  const products = [...productSet].sort();

  return {
    id: uid(),
    name: fileName.replace(/\.log$/i, ''),
    fileName,
    color: nextColor(),
    ticks,
    trades,
    products,
    days: [...new Set(ticks.map(t => t.day))].sort((a, b) => a - b),
    sandboxLogs,
    algorithmLogs,
    traderDataLogs,
  };
}

function fillPositions(ticks, trades) {
  const pos = {};
  let ti = 0;
  for (const tick of ticks) {
    while (ti < trades.length) {
      const tr = trades[ti];
      if (tr.day < tick.day || (tr.day === tick.day && tr.timestamp <= tick.timestamp)) {
        pos[tr.symbol] = (pos[tr.symbol] ?? 0) + tr.quantity;
        ti++;
      } else break;
    }
    for (const [prod, pd] of Object.entries(tick.products)) {
      pd.position = pos[prod] ?? 0;
    }
  }
}

function splitSections(text) {
  const result = {};
  // Section headers are lines ending with ':'
  const re = /^([A-Za-z][A-Za-z ]*?):\s*$/gm;
  const starts = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    starts.push({ 
      name: m[1].trim(), 
      pos: m.index + m[0].length,
      index: m.index 
    });
  }
  for (let i = 0; i < starts.length; i++) {
    const end = i + 1 < starts.length
      ? starts[i + 1].index
      : text.length;
    result[starts[i].name] = text.slice(starts[i].pos, end).trim();
  }
  return result;
}

function parseSandbox(input) {
  const sandboxLogs = [], algorithmLogs = [], traderDataLogs = [];
  if (!input) return { sandboxLogs, algorithmLogs, traderDataLogs };

  const lines = Array.isArray(input) ? input : input.split('\n');

  for (const line of lines) {
    const t = typeof line === 'string' ? line.trim() : line;
    if (!t) continue;

    let obj = null;
    if (typeof t === 'object' && t !== null) {
      obj = t;
    } else if (typeof t === 'string' && t.startsWith('{')) {
      try { obj = JSON.parse(t); } catch { /* not JSON */ }
    }

    if (obj) {
      if (obj.lambdaLog != null) {
        try {
          const decoded = atob(obj.lambdaLog);
          sandboxLogs.push({ timestamp: obj.timestamp ?? 0, day: obj.day ?? 0, logs: decoded });
          decoded.split('\n').filter(Boolean).forEach(l => algorithmLogs.push(l));
        } catch {
          sandboxLogs.push({ raw: typeof t === 'string' ? t : JSON.stringify(t) });
        }
      } else if (obj.traderData != null) {
        traderDataLogs.push({ timestamp: obj.timestamp ?? 0, data: obj.traderData });
        sandboxLogs.push({ raw: typeof t === 'string' ? t : JSON.stringify(t) });
      } else {
        if (obj.sandboxLog) algorithmLogs.push(obj.sandboxLog);
        sandboxLogs.push({ raw: typeof t === 'string' ? t : JSON.stringify(t) });
      }
      continue;
    }

    if (typeof t === 'string') {
      sandboxLogs.push({ raw: t });
      algorithmLogs.push(t);
    }
  }

  return { sandboxLogs, algorithmLogs, traderDataLogs };
}

function parseCsv(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Detect separator
  let sep = ';';
  if (lines[0].includes(',') && !lines[0].includes(';')) sep = ',';

  const headers = lines[0].split(sep).map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(sep);
    const row = {};
    headers.forEach((h, i) => { row[h] = vals[i]?.trim() ?? ''; });
    return row;
  });
}
