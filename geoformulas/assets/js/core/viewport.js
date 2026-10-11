/**
 * SVG 视口的缩放 / 平移控制器。
 *
 * 为什么需要：全局依赖图的世界坐标是 1606 × 11070 px，若沿用 `width:100%` + viewBox
 * 自适应，浏览器会把整张图压到容器宽度（缩放比约 0.685），12px 的文字实际只渲染 8px，
 * 什么都看不清。这里改成「固定视口 + 手动 viewBox」：viewBox 的尺寸等于视口的 CSS 像素，
 * 于是 1 世界单位 = 1 屏幕像素，缩放比恒为 1，文字始终清晰，放大才缩小。
 */
import { el } from './dom.js';
const SVG_NS = 'http://www.w3.org/2000/svg';
export function createViewport(o) {
    const live = {};
    const min = o.min ?? 0.25;
    const max = o.max ?? 4;
    const minFit = o.minFit ?? 0.04;
    let k = o.initial ?? 1;
    // viewBox 原点（左上角）在世界坐标中的位置
    let ox = 0;
    let oy = 0;
    let cw = 800;
    let ch = 600;
    const clampK = (v) => Math.min(max, Math.max(min, v));
    function apply() {
        o.svg.setAttribute('viewBox', `${ox} ${oy} ${cw} ${ch}`);
        o.root.setAttribute('transform', `scale(${k})`);
        live.onScale?.(k);
    }
    /**
     * 容器 CSS 像素尺寸 → viewBox 尺寸，二者相等即 1:1 渲染。
     *
     * 注意：createViewport 可能在元素尚未插入 DOM 时被调用，此时 rect 全为 0。
     * 此时只记录「尚未测量」，不写 viewBox —— 否则首帧会画出 120×120 的错误画面。
     * ResizeObserver 在插入后一定会触发一次，尺寸随之补正。
     */
    let measured = false;
    function measure() {
        const r = o.box.getBoundingClientRect();
        const w = Math.round(r.width);
        const h = Math.round(r.height);
        if (w < 1 || h < 1)
            return false;
        cw = w;
        ch = h;
        o.svg.setAttribute('width', String(cw));
        o.svg.setAttribute('height', String(ch));
        measured = true;
        return true;
    }
    function centerOn(wx, wy) {
        ox = wx - cw / (2 * k);
        oy = wy - ch / (2 * k);
    }
    function refresh() {
        if (!measure())
            return;
        apply();
    }
    /**
     * 以视口内某点为锚缩放，保证该点下的世界坐标不动。
     * 锚点用容器相对坐标（CSS px），默认取中心。
     */
    function zoomBy(factor, cx, cy) {
        if (!measured && !measure())
            return;
        const px = cx ?? cw / 2;
        const py = cy ?? ch / 2;
        // 锚点对应的世界坐标
        const wx = ox + px / k;
        const wy = oy + py / k;
        const k2 = clampK(k * factor);
        if (k2 === k)
            return;
        k = k2;
        // 反解 ox/oy 使锚点下的世界坐标保持不变
        ox = wx - px / k;
        oy = wy - py / k;
        apply();
    }
    /**
     * 缩放到刚好装下整个世界。
     *
     * 这里刻意不复用 clampK：`min` 是「用户手动缩放」的下限，而全览需要的比例
     * 往往远小于它（全局依赖图 1606×11070 在 1100×640 视口里只需 k≈0.058）。
     * 若走钳位，「适应窗口」就会名不副实地看不到全貌。因此 fit 用自己的下限
     * fitFloor，仅防止极端情况下缩得无法辨认。
     */
    function fit() {
        if (!measured && !measure())
            return;
        const raw = Math.min(cw / o.world.w, ch / o.world.h);
        const floor = Math.min(minFit, raw);
        k = Math.max(floor, Math.min(raw, max));
        centerOn(o.world.w / 2, o.world.h / 2);
        apply();
    }
    /** 回到 1:1 并定位到左上角 */
    function reset() {
        if (!measured && !measure())
            return;
        k = o.initial ?? 1;
        ox = 0;
        oy = 0;
        apply();
    }
    /* ── 滚轮缩放 ─────────────────────────────────────── */
    function onWheel(ev) {
        ev.preventDefault();
        const r = o.box.getBoundingClientRect();
        zoomBy(Math.exp(-ev.deltaY * 0.0016), ev.clientX - r.left, ev.clientY - r.top);
    }
    /* ── 拖拽平移 / 触摸双指缩放 ───────────────────────── */
    const pointers = new Map();
    let panning = false;
    let lastX = 0;
    let lastY = 0;
    let pinchDist = 0;
    /** 本次按下是否已拖动超过阈值——用来吞掉拖拽末尾的误点击 */
    let dragged = false;
    function onPointerDown(ev) {
        pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
        if (pointers.size === 1) {
            panning = true;
            dragged = false;
            lastX = ev.clientX;
            lastY = ev.clientY;
            o.svg.setPointerCapture?.(ev.pointerId);
        }
        else if (pointers.size === 2) {
            panning = false;
            const [a, b] = [...pointers.values()];
            pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
        }
    }
    function onPointerMove(ev) {
        if (!pointers.has(ev.pointerId))
            return;
        pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
        const r = o.box.getBoundingClientRect();
        if (pointers.size >= 2) {
            // 双指捏合：以两指中点为锚
            const [a, b] = [...pointers.values()];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (pinchDist > 0 && d > 0) {
                const cx = (a.x + b.x) / 2 - r.left;
                const cy = (a.y + b.y) / 2 - r.top;
                zoomBy(d / pinchDist, cx, cy);
            }
            pinchDist = d;
            return;
        }
        if (!panning)
            return;
        const dx = ev.clientX - lastX;
        const dy = ev.clientY - lastY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3)
            dragged = true;
        lastX = ev.clientX;
        lastY = ev.clientY;
        // 屏幕位移换算成世界位移要除以缩放比
        ox -= dx / k;
        oy -= dy / k;
        apply();
    }
    function onPointerUp(ev) {
        pointers.delete(ev.pointerId);
        if (pointers.size < 2)
            pinchDist = 0;
        if (pointers.size === 0)
            panning = false;
    }
    /** 拖拽结束时不要顺带触发节点的链接点击 */
    function swallowClick(ev) {
        if (dragged) {
            ev.preventDefault();
            ev.stopPropagation();
        }
    }
    o.svg.addEventListener('wheel', onWheel, { passive: false });
    o.svg.addEventListener('pointerdown', onPointerDown);
    o.svg.addEventListener('pointermove', onPointerMove);
    o.svg.addEventListener('pointerup', onPointerUp);
    o.svg.addEventListener('pointercancel', onPointerUp);
    o.svg.addEventListener('pointerleave', onPointerUp);
    o.svg.addEventListener('click', swallowClick, true);
    // 触摸时禁止页面跟着滚动，否则无法平移画布
    o.svg.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    refresh();
    /** 尚未完成测量时排队的操作，测量完成后按序执行一次 */
    const pending = [];
    const ro = new ResizeObserver(() => {
        const wasMeasured = measured;
        refresh();
        if (!wasMeasured && measured) {
            const q = pending.splice(0, pending.length);
            for (const fn of q)
                fn();
        }
    });
    ro.observe(o.box);
    // 元素可能已入 DOM（同步布局可得），直接结算
    if (measured) {
        const q = pending.splice(0, pending.length);
        for (const fn of q)
            fn();
    }
    const vp = {
        refresh,
        onceMeasured: (fn) => {
            if (measured)
                fn();
            else
                pending.push(fn);
        },
        zoomBy: (f, cx, cy) => zoomBy(f, cx, cy),
        fit,
        reset,
        destroy: () => {
            ro.disconnect();
            o.svg.removeEventListener('wheel', onWheel);
            o.svg.removeEventListener('pointerdown', onPointerDown);
            o.svg.removeEventListener('pointermove', onPointerMove);
            o.svg.removeEventListener('pointerup', onPointerUp);
            o.svg.removeEventListener('pointercancel', onPointerUp);
            o.svg.removeEventListener('pointerleave', onPointerUp);
            o.svg.removeEventListener('click', swallowClick, true);
        },
        scale: () => k,
        measured: () => measured,
    };
    Object.defineProperty(vp, 'onScale', {
        get: () => live.onScale,
        set: (v) => { live.onScale = v; },
        enumerable: true,
    });
    return vp;
}
/** 生成一组缩放按钮，返回容器与视口的操作句柄 */
export function zoomBar(lang, vp) {
    const pct = el('span', { class: 'zoom-pct', text: '100%' });
    const mk = (label, title, fn) => {
        const b = el('button', { class: 'toggle zoom-btn', type: 'button', text: label, title });
        b.addEventListener('click', fn);
        return b;
    };
    const bar = el('div', { class: 'filter-bar viz-tools zoom-bar' });
    bar.appendChild(mk('−', lang === 'zh' ? '缩小' : 'Zoom out', () => vp.zoomBy(1 / 1.3)));
    bar.appendChild(pct);
    bar.appendChild(mk('+', lang === 'zh' ? '放大' : 'Zoom in', () => vp.zoomBy(1.3)));
    bar.appendChild(mk(lang === 'zh' ? '适应窗口' : 'Fit', lang === 'zh' ? '缩放到刚好装下整张图' : 'Fit the whole graph', () => vp.fit()));
    bar.appendChild(mk(lang === 'zh' ? '1:1' : '1:1', lang === 'zh' ? '恢复原始大小' : 'Back to actual size', () => vp.reset()));
    bar.appendChild(el('span', {
        class: 'legend-note',
        text: lang === 'zh'
            ? '滚轮缩放 · 拖拽平移 · 双指捏合'
            : 'Wheel to zoom · drag to pan · pinch on touch',
    }));
    return {
        el: bar,
        setScale: (k) => { pct.textContent = `${Math.round(k * 100)}%`; },
    };
}
export { SVG_NS };
//# sourceMappingURL=viewport.js.map