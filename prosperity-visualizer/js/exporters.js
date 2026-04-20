export function exportPng(chart, fileName = 'chart.png') {
  const a = document.createElement('a');
  a.href = chart.toDataURL();
  a.download = fileName;
  a.click();
}

export function exportCsv(strategies, fileName = 'comparison.csv') {
  const rows = [['Strategy', 'Final PnL', 'Max PnL', 'Min PnL', 'Ticks', 'Products', 'Days']];
  for (const s of strategies.values()) {
    const pnls = s.ticks.map(t => t.pnl);
    rows.push([
      s.name,
      (pnls.at(-1) ?? 0).toFixed(2),
      Math.max(...pnls).toFixed(2),
      Math.min(...pnls).toFixed(2),
      s.ticks.length,
      s.products.join('|'),
      s.days.join('|'),
    ]);
  }
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  download(new Blob([csv], { type: 'text/csv' }), fileName);
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
