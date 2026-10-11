import { pick } from './types.js';
import { fmt } from './dom.js';
const PAD = { l: 74, r: 18, t: 16, b: 46 };
const AXIS = '#5F5E5A';
const GRID = 'rgba(95,94,90,0.14)';
const TEXT = '#2C2C2A';
const MUTED = '#888780';
/** 创建一块自适应、HiDPI、可交互读数的 2D 图表 */
export function createPlot(opts) {
    const root = document.createElement('div');
    root.className = 'plot';
    const canvas = document.createElement('canvas');
    canvas.className = 'plot-canvas';
    const height = opts.height ?? 340;
    canvas.style.height = `${height}px`;
    canvas.style.width = '100%';
    root.appendChild(canvas);
    const tip = document.createElement('div');
    tip.className = 'plot-tip';
    tip.style.display = 'none';
    root.appendChild(tip);
    const legend = document.createElement('div');
    legend.className = 'plot-legend';
    root.appendChild(legend);
    let series = opts.series;
    let xRange = opts.xRange;
    let yRange = opts.yRange;
    let hoverX = null;
    function draw() {
        const cssW = canvas.clientWidth || root.clientWidth || 600;
        const cssH = height;
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cssW, cssH);
        const x0 = PAD.l;
        const x1 = cssW - PAD.r;
        const y0 = PAD.t;
        const y1 = cssH - PAD.b;
        if (x1 <= x0 || y1 <= y0)
            return;
        const finite = [];
        for (const s of series)
            for (const p of s.points) {
                if (Number.isFinite(p[0]) && Number.isFinite(p[1]))
                    finite.push(p);
            }
        if (finite.length === 0) {
            ctx.fillStyle = MUTED;
            ctx.font = '13px var(--font-sans, sans-serif)';
            ctx.textAlign = 'center';
            ctx.fillText('(no data)', (x0 + x1) / 2, (y0 + y1) / 2);
            return;
        }
        const xr = sanitizeRange(xRange ?? autoRange(finite.map((p) => p[0]), opts.xLog), opts.xLog);
        const yr = sanitizeRange(yRange ?? autoRange(finite.map((p) => p[1]), opts.yLog), opts.yLog);
        const X = (v) => {
            if (opts.xLog) {
                const a = Math.log10(Math.max(xr[0], 1e-300)) - 0;
                const b = Math.log10(xr[1]);
                const t = (Math.log10(Math.max(v, 1e-300)) - a) / Math.max(b - a, 1e-9);
                return x0 + clamp01(t) * (x1 - x0);
            }
            return x0 + ((v - xr[0]) / (xr[1] - xr[0] || 1)) * (x1 - x0);
        };
        const Y = (v) => {
            if (opts.yLog) {
                const b = Math.log10(yr[1]);
                const t = (Math.log10(Math.max(v, 1e-300)) - Math.log10(yr[0])) / Math.max(b - Math.log10(yr[0]), 1e-9);
                return y1 - clamp01(t) * (y1 - y0);
            }
            return y1 - ((v - yr[0]) / (yr[1] - yr[0] || 1)) * (y1 - y0);
        };
        // 网格
        ctx.strokeStyle = GRID;
        ctx.lineWidth = 1;
        const xt = ticks(xr, opts.xLog);
        const yt = ticks(yr, opts.yLog);
        ctx.beginPath();
        for (const v of xt) {
            const px = Math.round(X(v)) + 0.5;
            ctx.moveTo(px, y0);
            ctx.lineTo(px, y1);
        }
        for (const v of yt) {
            const py = Math.round(Y(v)) + 0.5;
            ctx.moveTo(x0, py);
            ctx.lineTo(x1, py);
        }
        ctx.stroke();
        // 坐标轴
        ctx.strokeStyle = AXIS;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0 + 0.5, y0);
        ctx.lineTo(x0 + 0.5, y1);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        // 刻度标签
        ctx.fillStyle = TEXT;
        ctx.font = '12px var(--font-sans, sans-serif)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (const v of yt) {
            const py = Y(v);
            if (py < y0 - 2 || py > y1 + 2)
                continue;
            ctx.fillText(labelOf(v, yr), x0 - 8, py);
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (const v of xt) {
            const px = X(v);
            if (px < x0 - 2 || px > x1 + 2)
                continue;
            ctx.fillText(labelOf(v, xr), px, y1 + 8);
        }
        // 轴名
        ctx.fillStyle = MUTED;
        ctx.font = '12px var(--font-sans, sans-serif)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(opts.xlabel, (x0 + x1) / 2, cssH - 6);
        ctx.save();
        ctx.translate(14, (y0 + y1) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textBaseline = 'top';
        ctx.fillText(opts.ylabel, 0, 0);
        ctx.restore();
        // 曲线
        for (const s of series) {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 2;
            ctx.setLineDash(s.dash ? [5, 4] : []);
            ctx.beginPath();
            let started = false;
            for (const p of s.points) {
                if (!Number.isFinite(p[0]) || !Number.isFinite(p[1]))
                    continue;
                const px = X(p[0]);
                const py = Y(p[1]);
                if (!started) {
                    ctx.moveTo(px, py);
                    started = true;
                }
                else
                    ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }
        // hover 竖线 + 数据点标记
        if (hoverX !== null) {
            const px = X(hoverX);
            if (px >= x0 && px <= x1) {
                ctx.strokeStyle = 'rgba(24,95,165,0.5)';
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(px + 0.5, y0);
                ctx.lineTo(px + 0.5, y1);
                ctx.stroke();
                ctx.setLineDash([]);
                const rows = [];
                for (const s of series) {
                    const v = interp(s.points, hoverX);
                    if (v === null)
                        continue;
                    ctx.fillStyle = s.color;
                    ctx.beginPath();
                    ctx.arc(px, Y(v), 3.5, 0, Math.PI * 2);
                    ctx.fill();
                    const lb = s.label ? pick(s.label, opts.lang) : '';
                    rows.push(`<span style="color:${s.color}">■</span> ${lb || ''} ${fmt(v, 4)}`);
                }
                tip.innerHTML = `<div class="tip-x">${opts.xlabel} = ${fmt(hoverX, 4)}</div>` + rows.join('<br>');
                tip.style.display = 'block';
                const tw = tip.offsetWidth || 120;
                tip.style.left = `${Math.min(Math.max(px - tw / 2, 4), cssW - tw - 4)}px`;
                tip.style.top = `${y0 + 4}px`;
            }
            else {
                tip.style.display = 'none';
            }
        }
    }
    canvas.addEventListener('mousemove', (ev) => {
        const rect = canvas.getBoundingClientRect();
        const cssW = rect.width;
        const x0 = PAD.l, x1 = cssW - PAD.r;
        const px = ev.clientX - rect.left;
        const finite = [];
        for (const s of series)
            for (const p of s.points) {
                if (Number.isFinite(p[0]) && Number.isFinite(p[1]))
                    finite.push(p);
            }
        if (!finite.length)
            return;
        const xr = sanitizeRange(xRange ?? autoRange(finite.map((p) => p[0]), opts.xLog), opts.xLog);
        const t = (px - x0) / Math.max(x1 - x0, 1);
        hoverX = opts.xLog
            ? Math.pow(10, Math.log10(xr[0]) + t * (Math.log10(xr[1]) - Math.log10(xr[0])))
            : xr[0] + t * (xr[1] - xr[0]);
        draw();
    });
    canvas.addEventListener('mouseleave', () => { hoverX = null; tip.style.display = 'none'; draw(); });
    function renderLegend() {
        legend.textContent = '';
        for (const s of series) {
            const chip = document.createElement('span');
            chip.className = 'legend-item';
            const dot = document.createElement('i');
            dot.style.background = s.color;
            chip.appendChild(dot);
            chip.appendChild(document.createTextNode(s.label ? pick(s.label, opts.lang) : ''));
            legend.appendChild(chip);
        }
    }
    let raf = 0;
    const scheduleDraw = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
    };
    const ro = new ResizeObserver(scheduleDraw);
    ro.observe(canvas);
    renderLegend();
    requestAnimationFrame(draw);
    return {
        root,
        update(newSeries, nx, ny) {
            series = newSeries;
            if (nx)
                xRange = nx;
            if (ny)
                yRange = ny;
            renderLegend();
            scheduleDraw();
        },
    };
}
function clamp01(t) {
    return t < 0 ? 0 : t > 1 ? 1 : t;
}
function autoRange(vals, log) {
    let mn = Infinity, mx = -Infinity;
    for (const v of vals) {
        if (v < mn)
            mn = v;
        if (v > mx)
            mx = v;
    }
    if (!Number.isFinite(mn) || !Number.isFinite(mx))
        return [0, 1];
    if (log) {
        const lo = Math.floor(Math.log10(Math.max(mn, 1e-10)));
        const hi = Math.ceil(Math.log10(mx));
        return [Math.pow(10, lo), Math.pow(10, hi)];
    }
    if (mn === mx) {
        const d = Math.max(Math.abs(mn) * 0.1, 1e-6);
        return [mn - d, mx + d];
    }
    const pad = (mx - mn) * 0.06;
    return [mn - pad, mx + pad];
}
function sanitizeRange(r, log) {
    let [a, b] = r;
    if (!Number.isFinite(a) || !Number.isFinite(b))
        return [0, 1];
    if (log) {
        a = Math.max(a, 1e-12);
        b = Math.max(b, a * 10);
    }
    if (a === b) {
        const d = Math.max(Math.abs(a) * 0.1, 1e-9);
        a -= d;
        b += d;
    }
    return [a, b];
}
function ticks(range, log) {
    const [a, b] = range;
    if (log) {
        const out = [];
        const lo = Math.floor(Math.log10(Math.max(a, 1e-12)));
        const hi = Math.ceil(Math.log10(b));
        for (let e = lo; e <= hi; e++)
            out.push(Math.pow(10, e));
        return out;
    }
    const target = 6;
    const span = b - a;
    if (span <= 0)
        return [a];
    const rawStep = span / target;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const norm = rawStep / mag;
    const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
    const start = Math.ceil(a / step) * step;
    const out = [];
    for (let v = start; v <= b + step * 1e-6; v += step) {
        out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
    }
    return out;
}
function labelOf(v, range) {
    const span = Math.abs(range[1] - range[0]);
    if (v === 0)
        return '0';
    if (span >= 1e5 || (span < 1e-2 && Math.abs(v) < 1e-2))
        return v.toExponential(1);
    if (Number.isInteger(v) && Math.abs(v) < 1e5)
        return String(v);
    const digits = span >= 1 ? 2 : Math.min(4, Math.max(2, Math.ceil(-Math.log10(span)) + 1));
    return parseFloat(v.toFixed(digits)).toString();
}
function interp(points, x) {
    if (points.length === 0)
        return null;
    let best = null;
    let bestD = Infinity;
    for (const p of points) {
        const d = Math.abs(p[0] - x);
        if (d < bestD) {
            bestD = d;
            best = p;
        }
    }
    if (!best)
        return null;
    return best[1];
}
//# sourceMappingURL=plot.js.map