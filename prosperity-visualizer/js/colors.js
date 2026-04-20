export const PALETTE = [
  '#4e9af1',
  '#f16c4e',
  '#4ef1a0',
  '#f1d44e',
  '#c44ef1',
  '#f14e8a',
  '#4ef1e5',
  '#f1994e',
  '#8af14e',
  '#4e6af1',
];

let idx = 0;

export function nextColor() {
  return PALETTE[idx++ % PALETTE.length];
}

export function resetColors() {
  idx = 0;
}
