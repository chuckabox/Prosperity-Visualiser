/**
 * Largest-Triangle-Three-Buckets downsampling.
 * @param {Array<{x:number,y:number}>} data
 * @param {number} threshold max output points
 */
export function lttb(data, threshold) {
  if (threshold >= data.length || threshold === 0) return data;

  const sampled = [];
  const bucketSize = (data.length - 2) / (threshold - 2);
  let a = 0;

  sampled.push(data[0]);

  for (let i = 0; i < threshold - 2; i++) {
    let avgX = 0, avgY = 0;
    const avgStart = Math.floor((i + 1) * bucketSize) + 1;
    let avgEnd = Math.floor((i + 2) * bucketSize) + 1;
    avgEnd = avgEnd < data.length ? avgEnd : data.length;
    const avgLen = avgEnd - avgStart;

    for (let j = avgStart; j < avgEnd; j++) {
      avgX += data[j].x;
      avgY += data[j].y;
    }
    avgX /= avgLen;
    avgY /= avgLen;

    let rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeTo = Math.floor((i + 1) * bucketSize) + 1;
    const aX = data[a].x, aY = data[a].y;
    let maxArea = -1, nextA = rangeStart;

    for (let j = rangeStart; j < rangeTo; j++) {
      const area = Math.abs(
        (aX - avgX) * (data[j].y - aY) -
        (aX - data[j].x) * (avgY - aY)
      ) * 0.5;
      if (area > maxArea) { maxArea = area; nextA = j; }
    }

    sampled.push(data[nextA]);
    a = nextA;
  }

  sampled.push(data[data.length - 1]);
  return sampled;
}
