let counter = 0;
export function uid() {
  return `s${Date.now().toString(36)}${(++counter).toString(36)}`;
}
