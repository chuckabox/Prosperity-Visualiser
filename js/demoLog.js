export async function loadDemoLog() {
  const res = await fetch('./demo.log');
  if (!res.ok) throw new Error(`Failed to load demo log: ${res.status}`);
  return res.text();
}
