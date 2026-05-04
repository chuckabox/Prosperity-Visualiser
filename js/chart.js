import { lttb } from './downsample.js';

const PAD = { top: 24, right: 16, bottom: 40, left: 72 };
const MAX_PTS = 600;
const TICKS = 5;

function axisLabel(v) {
  const a = Math.abs(v);
  if (a >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (a >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  return v.toFixed(a < 10 ? 1 : 0);
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export class LineChart {
  /**
   * Create a new custom Canvas line chart
   * @param {HTMLCanvasElement} canvas - The canvas element to draw on
   * @param {Object} [opts={}] - Chart options
   */
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = { yLabel: '', xLabel: 'Timestamp', normalizeX: false, diffMode: false, ...opts };
    this.series = [];
    this._tickMarker = null;
    this._mouseX = null;
    this._mouseY = null;
    
    this._tooltip = document.createElement('div');
    this._tooltip.style.cssText = `
      position: fixed; pointer-events: none; background: var(--bg-tertiary);
      border: 1px solid var(--border); border-radius: 4px; padding: 6px 10px;
      font-size: 11px; font-family: monospace; z-index: 1000; display: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3); line-height: 1.4; color: var(--text-primary);
    `;
    document.body.appendChild(this._tooltip);

    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(canvas.parentElement ?? canvas);
    
    canvas.addEventListener('mousemove', e => this._onMouseMove(e));
    canvas.addEventListener('mouseleave', () => this._onMouseLeave());
    
    this._resize();
  }

  /**
   * Update the data series to be displayed
   * @param {Array} series - List of series objects {label, color, data}
   */
  setSeries(series) {
    this.series = series;
    this.render();
  }

  /**
   * Update chart options
   * @param {Object} opts - Options object to merge
   */
  setOpts(opts) {
    Object.assign(this.opts, opts);
    this.render();
  }

  /**
   * Set the horizontal position of the vertical tick marker
   * @param {number|null} x - X value (timestamp) for the marker
   */
  setTickMarker(x) {
    this._tickMarker = x;
    this.render();
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const el = this.canvas.parentElement ?? this.canvas;
    const rect = el.getBoundingClientRect();
    const w = Math.max(rect.width, 10);
    const h = Math.max(rect.height, 10);
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._w = w;
    this._h = h;
    this.render();
  }

  _onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this._mouseX = e.clientX - rect.left;
    this._mouseY = e.clientY - rect.top;
    this._tooltipX = e.clientX;
    this._tooltipY = e.clientY;
    this.render();
  }

  _onMouseLeave() {
    this._mouseX = null;
    this._mouseY = null;
    this._tooltip.style.display = 'none';
    this.render();
  }

  /**
   * Main draw loop for the chart
   */
  render() {
    const { ctx, series, opts } = this;
    const w = this._w || this.canvas.clientWidth;
    const h = this._h || this.canvas.clientHeight;
    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);

    const bg = cssVar('--bg-primary') || '#0f0f1a';
    const gridCol = cssVar('--border') || 'rgba(255,255,255,0.08)';
    const labelCol = cssVar('--text-muted') || '#6b7280';
    const textCol = cssVar('--text-primary') || '#e5e7eb';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    if (!series.length) {
      ctx.fillStyle = labelCol;
      ctx.font = '13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No data loaded', w / 2, h / 2);
      return;
    }

    const plotW = w - PAD.left - PAD.right;
    const plotH = h - PAD.top - PAD.bottom;

    const sampled = series.map(s => ({ ...s, pts: lttb(s.data, MAX_PTS) }));

    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
    for (const s of sampled) {
      for (const p of s.pts) {
        if (p.x < xMin) xMin = p.x;
        if (p.x > xMax) xMax = p.x;
        if (p.y < yMin) yMin = p.y;
        if (p.y > yMax) yMax = p.y;
      }
    }
    if (!isFinite(xMin)) return;

    const yRange = yMax - yMin || 1;
    yMin -= yRange * 0.05;
    yMax += yRange * 0.05;
    const xRange = xMax - xMin || 1;

    const toX = (x) => PAD.left + ((x - xMin) / xRange) * plotW;
    const toY = (y) => PAD.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

    // Grid + axes
    ctx.strokeStyle = gridCol;
    ctx.lineWidth = 1;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= TICKS; i++) {
      const frac = i / TICKS;
      const y = PAD.top + frac * plotH;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + plotW, y); ctx.stroke();
      const val = yMax - (yMax - yMin) * frac;
      ctx.fillStyle = labelCol;
      ctx.textAlign = 'right';
      ctx.fillText(axisLabel(val), PAD.left - 6, y);

      const x = PAD.left + frac * plotW;
      ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + plotH); ctx.stroke();
      let xLabel;
      if (opts.normalizeX) xLabel = `${(frac * 100).toFixed(0)}%`;
      else xLabel = axisLabel(xMin + xRange * frac);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(xLabel, x, PAD.top + plotH + 6);
    }

    // Y axis label
    if (opts.yLabel) {
      ctx.save();
      ctx.translate(12, PAD.top + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = labelCol;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText(opts.yLabel, 0, 0);
      ctx.restore();
    }

    // Zero line
    if (yMin < 0 && yMax > 0) {
      const y0 = toY(0);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(PAD.left, y0); ctx.lineTo(PAD.left + plotW, y0); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Series lines
    for (const s of sampled) {
      if (!s.pts.length) continue;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      s.pts.forEach((p, i) => {
        const px = opts.normalizeX ? PAD.left + (i / (s.pts.length - 1 || 1)) * plotW : toX(p.x);
        const py = toY(p.y);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    // Hover tooltip / guide
    if (this._mouseX != null && this._mouseX >= PAD.left && this._mouseX <= PAD.left + plotW) {
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(this._mouseX, PAD.top); ctx.lineTo(this._mouseX, PAD.top + plotH); ctx.stroke();
      ctx.setLineDash([]);

      const tooltipItems = [];
      let nearestXValue = null;

      for (const s of series) {
        if (!s.data.length) continue;
        let pMatch = null;
        if (opts.normalizeX) {
          const idx = Math.round((this._mouseX - PAD.left) / plotW * (s.data.length - 1));
          pMatch = s.data[Math.max(0, Math.min(idx, s.data.length - 1))];
        } else {
          const xVal = xMin + ((this._mouseX - PAD.left) / plotW) * xRange;
          // Binary search for nearest x
          let low = 0, high = s.data.length - 1;
          while (low <= high) {
            let mid = (low + high) >> 1;
            if (s.data[mid].x < xVal) low = mid + 1;
            else high = mid - 1;
          }
          const i1 = Math.max(0, Math.min(low, s.data.length - 1));
          const i2 = Math.max(0, Math.min(high, s.data.length - 1));
          pMatch = Math.abs(s.data[i1].x - xVal) < Math.abs(s.data[i2].x - xVal) ? s.data[i1] : s.data[i2];
        }

        if (pMatch) {
          tooltipItems.push(`<div style="display:flex;align-items:center;gap:8px;">
            <span style="width:8px;height:8px;border-radius:50%;background:${s.color}"></span>
            <span style="flex:1">${s.label}</span>
            <span style="font-weight:bold">${pMatch.y.toLocaleString()}</span>
          </div>`);
          nearestXValue = pMatch.x;
          
          // Draw a small dot on the sampled line for this series
          // (Using toY on the actual match value)
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(this._mouseX, toY(pMatch.y), 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (tooltipItems.length) {
        const xTitle = opts.normalizeX ? `${((this._mouseX - PAD.left) / plotW * 100).toFixed(1)}%` : `T=${nearestXValue}`;
        this._tooltip.innerHTML = `<div style="font-weight:bold;margin-bottom:4px;border-bottom:1px solid var(--border);padding-bottom:2px">${xTitle}</div>` + tooltipItems.join('');
        this._tooltip.style.display = 'block';
        
        const tRect = this._tooltip.getBoundingClientRect();
        let tx = this._tooltipX + 15;
        let ty = this._tooltipY + 15;
        if (tx + tRect.width > window.innerWidth) tx = this._tooltipX - tRect.width - 15;
        if (ty + tRect.height > window.innerHeight) ty = this._tooltipY - tRect.height - 15;
        this._tooltip.style.left = `${tx}px`;
        this._tooltip.style.top = `${ty}px`;
      }
    } else {
      this._tooltip.style.display = 'none';
    }

    // Tick marker
    if (this._tickMarker != null && !opts.normalizeX) {
      const x = toX(this._tickMarker);
      if (x >= PAD.left && x <= PAD.left + plotW) {
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + plotH); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Legend
    let lx = PAD.left + 8;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    for (const s of series) {
      ctx.fillStyle = s.color;
      ctx.fillRect(lx, PAD.top - 14, 14, 3);
      ctx.fillStyle = textCol;
      ctx.fillText(s.label, lx + 18, PAD.top - 12);
      lx += ctx.measureText(s.label).width + 36;
    }
  }

  /**
   * Clean up observers and DOM elements
   */
  destroy() {
    this._ro.disconnect();
    this._tooltip.remove();
  }

  /**
   * Export the current chart view as a base64 PNG
   * @returns {string} - Data URL
   */
  toDataURL() {
    return this.canvas.toDataURL('image/png');
  }
}
