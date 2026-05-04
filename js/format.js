/**
 * Format a PnL value into a human-readable string (e.g. +1.2M, -500K)
 * @param {number} v - The PnL value
 * @returns {string} - Formatted string
 */
export function fmtPnl(v) {
  if (v == null || isNaN(v)) return '—';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : v > 0 ? '+' : '';
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K`;
  return `${sign}${abs.toFixed(2)}`;
}

/**
 * Format a number with localized thousands separators and fixed decimals
 * @param {number} v - The number to format
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} - Formatted string
 */
export function fmtNum(v, decimals = 2) {
  if (v == null || isNaN(v)) return '—';
  return Number(v).toLocaleString('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

/**
 * Format a number as a localized integer
 * @param {number} v - The number to format
 * @returns {string} - Formatted string
 */
export function fmtInt(v) {
  if (v == null || isNaN(v)) return '—';
  return Math.round(v).toLocaleString('en-US');
}

/**
 * Format a timestamp into a localized string
 * @param {number|Date} ts - The timestamp
 * @returns {string} - Formatted string
 */
export function fmtTs(ts) {
  if (ts == null) return '—';
  return ts.toLocaleString();
}
