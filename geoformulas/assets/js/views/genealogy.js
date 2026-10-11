import { el, clear } from '../core/dom.js';
import { getLang } from '../core/i18n.js';
import { store } from '../core/store.js';
import { SYSTEMS, AUDIENCE_META } from '../taxonomy.js';
import { sectionTitle } from './common.js';
import { createViewport, zoomBar, SVG_NS } from '../core/viewport.js';
const NODE_W = 168;
const NODE_H = 46;
const COL_GAP = NODE_W + 78;
const ROW_H = NODE_H + 34;
/** 一级学科 → 边框色（按 S 编号取色，超出则循环，覆盖到 S20） */
const SYS_PALETTE = [
    '#4B5563', // S0 数学基础
    '#185FA5', // S1 弹性力学
    '#0F6E56', // S2 体波与射线
    '#BA7517', // S3 反射与成像
    '#7F77DD', // S4 震源物理
    '#D4537E', // S5 面波与自由振荡
    '#639922', // S6 衰减与 Q
    '#378ADD', // S7 内部结构
    '#993C1D', // S8 观测与仪器
    '#534AB7', // S9 信号处理
    '#B03060', // S10 反演
    '#2E8B8B', // S11 强地面运动
    '#C05A2B', // S12 统计地震学
    '#7A8A25', // S13 岩石物理
    '#8E44AD', // S14
    '#1685A9', // S15
    '#A0522D', // S16
    '#5D6D7E', // S17
    '#B7791F', // S18
    '#2C7A7B', // S19
    '#9B2C2C', // S20
];
function sysColor(card) {
    const top = card.node.split('.')[0];
    const idx = Math.max(0, Number(top.replace(/\D/g, '')) || 0);
    return SYS_PALETTE[idx % SYS_PALETTE.length];
}
/** 一级学科编号（用于层内聚簇的 tie-break） */
function subjIdx(c) {
    const top = c.node.split('.')[0];
    return Math.max(0, Number(top.replace(/\D/g, '')) || 0);
}
export function renderGenealogy(host, mode, focusId) {
    const lang = getLang();
    clear(host);
    const wrap = el('div', { class: 'viz-page' });
    const bar = el('div', { class: 'filter-bar' });
    bar.appendChild(el('a', {
        class: `pill${mode === 'graph' ? ' active' : ''}`,
        href: '#/tree',
        text: lang === 'zh' ? '全局依赖图' : 'Global dependency graph',
    }));
    if (focusId) {
        const fc = store.byId.get(focusId);
        if (fc) {
            bar.appendChild(el('span', { class: 'f-label', text: '›' }));
            bar.appendChild(el('a', {
                class: `pill${mode === 'pedigree' ? ' active' : ''}`,
                href: `#/tree/${focusId}`,
                text: fc.name[lang],
            }));
        }
    }
    wrap.appendChild(bar);
    if (mode === 'graph') {
        wrap.appendChild(sectionTitle(lang === 'zh' ? '全局依赖图（按依赖深度分层）' : 'Global dependency graph (layered by depth)', lang === 'zh' ? '越靠右越依赖先前结论；颜色区分一级学科；悬停节点高亮其上下游' : 'Rightward means more derived; colours separate subjects; hover a node to spotlight its neighbourhood'));
        wrap.appendChild(el('p', { class: 'muted', text: store.issues.length
                ? (lang === 'zh' ? '注意数据自检提示：' : 'Data check warnings: ') + store.issues.join('；')
                : (lang === 'zh' ? '数据自检通过：所有依赖引用均有效' : 'Data check passed: all references resolve') }));
        wrap.appendChild(buildGlobalGraph());
    }
    else if (focusId) {
        const fc = store.byId.get(focusId);
        if (fc) {
            wrap.appendChild(sectionTitle(lang === 'zh' ? '系谱图：祖先与后代' : 'Pedigree: ancestors and descendants', fc.name[lang]));
            wrap.appendChild(buildPedigree(fc));
        }
        else {
            wrap.appendChild(el('p', { class: 'muted', text: lang === 'zh' ? '未找到该公式' : 'Formula not found' }));
        }
    }
    host.appendChild(wrap);
}
/**
 * 分层布局（Sugiyama）：层由 rankOf（最长上游路径）固定，层内做多趟
 * barycenter/median 排序以最小化边交叉、缩短垂直跨度；tie-break 按一级学科
 * 编号，让同色节点尽量相邻成组。310 节点在加载时一次算完，不逐帧重算。
 */
function layoutGlobal(cards) {
    // 1) 按 rank 分层
    const byRank = new Map();
    for (const c of cards) {
        const r = store.rankOf(c.id);
        const arr = byRank.get(r) ?? [];
        arr.push(c);
        byRank.set(r, arr);
    }
    const ranks = [...byRank.keys()].sort((a, b) => a - b);
    const layers = ranks.map((r) => byRank.get(r));
    // 2) 无向邻接表
    const adj = new Map();
    for (const c of cards)
        adj.set(c.id, new Set());
    for (const e of store.edges) {
        adj.get(e.from)?.add(e.to);
        adj.get(e.to)?.add(e.from);
    }
    // 节点在其层内的当前序号（y 索引），每趟排序后重建
    const idx = new Map();
    const rebuildIdx = () => layers.forEach((layer) => layer.forEach((c, i) => idx.set(c.id, i)));
    // 初始序：先按一级学科聚组，同组内按 id，让同色从一开始就相邻
    for (const layer of layers) {
        layer.sort((a, b) => subjIdx(a) - subjIdx(b) || a.id.localeCompare(b.id));
    }
    rebuildIdx();
    // 3) 多趟 median 排序：左→右、再右→左交替，共 8 趟
    const SWEEPS = 8;
    for (let s = 0; s < SWEEPS; s++) {
        // [待排序层, 参照层]
        const passes = [];
        if (s % 2 === 0) {
            for (let i = 1; i < layers.length; i++)
                passes.push([layers[i], layers[i - 1]]);
        }
        else {
            for (let i = layers.length - 2; i >= 0; i--)
                passes.push([layers[i], layers[i + 1]]);
        }
        for (const [layer, ref] of passes) {
            const refHas = new Set(ref.map((c) => c.id));
            const keys = new Map();
            for (const c of layer) {
                const neigh = [...(adj.get(c.id) ?? [])]
                    .filter((n) => refHas.has(n))
                    .map((n) => idx.get(n))
                    .sort((a, b) => a - b);
                let k;
                if (neigh.length) {
                    const mid = Math.floor(neigh.length / 2);
                    // 取中位数（偶数个取两中点平均），对度数差异更稳健
                    k = neigh.length % 2 ? neigh[mid] : (neigh[mid - 1] + neigh[mid]) / 2;
                }
                else {
                    k = idx.get(c.id); // 与参照层无连接：保持原位作为锚点
                }
                keys.set(c.id, k);
            }
            layer.sort((a, b) => {
                const ka = keys.get(a.id);
                const kb = keys.get(b.id);
                if (Math.abs(ka - kb) > 0.05)
                    return ka - kb;
                // 接近时按学科编号聚组
                return subjIdx(a) - subjIdx(b) || a.id.localeCompare(b.id);
            });
        }
        rebuildIdx();
    }
    // 4) 分配世界坐标
    const pos = new Map();
    let maxY = 0;
    layers.forEach((layer, li) => {
        const r = ranks[li];
        layer.forEach((c, i) => {
            const x = 70 + r * COL_GAP;
            const y = 70 + i * ROW_H;
            pos.set(c.id, { x, y });
            maxY = Math.max(maxY, y);
        });
    });
    const width = 70 + ranks.length * COL_GAP + 60;
    const height = maxY + 140;
    return { pos, ranks, width, height, adj };
}
function buildGlobalGraph() {
    const lang = getLang();
    const cards = store.cards;
    const { pos, ranks, width, height, adj } = layoutGlobal(cards);
    const box = el('div', { class: 'graph-viewport-box' });
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'graph-svg graph-viewport');
    box.appendChild(svg);
    // 内容全部放进 root <g>，缩放平移只作用在它身上
    const root = document.createElementNS(SVG_NS, 'g');
    svg.appendChild(root);
    // 列标题
    for (const r of ranks) {
        const t = document.createElementNS(SVG_NS, 'text');
        t.setAttribute('x', String(70 + r * COL_GAP + NODE_W / 2));
        t.setAttribute('y', '34');
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('class', 'g-colhead');
        t.textContent = lang === 'zh' ? `第 ${r} 层` : `depth ${r}`;
        root.appendChild(t);
    }
    const edgeRecs = [];
    for (const e of store.edges) {
        const a = pos.get(e.from);
        const b = pos.get(e.to);
        if (!a || !b)
            continue;
        const x1 = a.x + NODE_W;
        const y1 = a.y + NODE_H / 2;
        const x2 = b.x;
        const y2 = b.y + NODE_H / 2;
        const span = store.rankOf(e.to) - store.rankOf(e.from);
        const long = span >= 2;
        const mx = (x1 + x2) / 2;
        const p = document.createElementNS(SVG_NS, 'path');
        p.setAttribute('d', `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`);
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke', '#B4B2A9');
        // 描边不随缩放缩放：全览（~9%）时仍能看到整体结构云，1:1 下视觉不变
        p.setAttribute('vector-effect', 'non-scaling-stroke');
        const baseW = long ? 0.7 : 1.0;
        const baseOp = long ? 0.22 : 0.5;
        p.setAttribute('stroke-width', String(baseW));
        p.setAttribute('opacity', String(baseOp));
        root.appendChild(p);
        edgeRecs.push({ el: p, from: e.from, to: e.to, baseOp, baseW });
    }
    // 节点 + hover 聚焦
    const nodeEls = new Map();
    const applyFocus = (activeId) => {
        for (const [id, g] of nodeEls) {
            const rect = g.firstElementChild;
            if (!activeId) {
                g.setAttribute('opacity', '1');
                rect?.setAttribute('stroke-width', '1.6');
                continue;
            }
            const isSelf = id === activeId;
            const isNeighbor = adj.get(activeId)?.has(id) ?? false;
            g.setAttribute('opacity', isSelf || isNeighbor ? '1' : '0.12');
            rect?.setAttribute('stroke-width', isSelf ? '2.6' : '1.6');
        }
        for (const er of edgeRecs) {
            if (!activeId) {
                er.el.setAttribute('opacity', String(er.baseOp));
                er.el.setAttribute('stroke-width', String(er.baseW));
                continue;
            }
            const on = er.from === activeId || er.to === activeId;
            er.el.setAttribute('opacity', on ? '0.9' : '0.05');
            er.el.setAttribute('stroke-width', on ? '1.7' : String(er.baseW));
        }
    };
    for (const c of cards) {
        const p = pos.get(c.id);
        if (!p)
            continue;
        const a = document.createElementNS(SVG_NS, 'a');
        a.setAttribute('href', `#/card/${c.id}`);
        const g = document.createElementNS(SVG_NS, 'g');
        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('x', String(p.x));
        rect.setAttribute('y', String(p.y));
        rect.setAttribute('width', String(NODE_W));
        rect.setAttribute('height', String(NODE_H));
        rect.setAttribute('rx', '9');
        rect.setAttribute('fill', '#FFFFFF');
        rect.setAttribute('stroke', sysColor(c));
        rect.setAttribute('stroke-width', '1.6');
        rect.setAttribute('vector-effect', 'non-scaling-stroke');
        const t = document.createElementNS(SVG_NS, 'text');
        t.setAttribute('x', String(p.x + 12));
        t.setAttribute('y', String(p.y + 20));
        t.setAttribute('class', 'g-name');
        t.textContent = clip(c.name[lang], 15);
        const sub = document.createElementNS(SVG_NS, 'text');
        sub.setAttribute('x', String(p.x + 12));
        sub.setAttribute('y', String(p.y + 35));
        sub.setAttribute('class', 'g-sub');
        sub.textContent = `${c.node} · ${c.complete} · ${AUDIENCE_META[c.audience]?.[lang] ?? ''}`;
        g.appendChild(rect);
        g.appendChild(t);
        g.appendChild(sub);
        g.addEventListener('mouseenter', () => applyFocus(c.id));
        g.addEventListener('mouseleave', () => applyFocus(null));
        a.appendChild(g);
        root.appendChild(a);
        nodeEls.set(c.id, g);
    }
    const wrap2 = el('div', { class: 'graph-zoom-wrap' });
    const vp = createViewport({
        world: { w: width, h: height },
        box, svg, root, lang, initial: 1,
    });
    const bar = zoomBar(lang, vp);
    vp.onScale = bar.setScale;
    bar.setScale(vp.scale());
    // 初始视图：先 fit 全览，再放大到「标签可读」的倍率（约 3× 全览），
    // 以图心为锚；用户可随时点「适应窗口」看全貌。
    vp.onceMeasured(() => {
        vp.fit();
        const kFit = vp.scale();
        const target = Math.min(1.05, Math.max(0.55, kFit * 3.0));
        if (target > kFit)
            vp.zoomBy(target / kFit);
        bar.setScale(vp.scale());
    });
    wrap2.appendChild(bar.el);
    wrap2.appendChild(box);
    return wrap2;
}
function buildPedigree(card) {
    const lang = getLang();
    const anc = store.ancestors(card.id);
    const des = store.descendants(card.id);
    const rows = [];
    const maxDist = Math.max(...[...anc.values(), ...des.values(), 0]);
    for (let d = maxDist; d >= 1; d--) {
        const up = [...anc.entries()].filter(([, v]) => v === d).map(([k]) => store.byId.get(k)).filter(Boolean);
        const down = [...des.entries()].filter(([, v]) => v === d).map(([k]) => store.byId.get(k)).filter(Boolean);
        rows.push({ dist: d, up, down });
    }
    const width = 980;
    const rowH = 96;
    const height = (rows.length * 2 + 1) * rowH + 60;
    const box = el('div', { class: 'graph-viewport-box' });
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'graph-svg graph-viewport');
    box.appendChild(svg);
    const root = document.createElementNS(SVG_NS, 'g');
    svg.appendChild(root);
    const centerY = rows.length * rowH + rowH / 2 + 20;
    const drawNode = (c, cx, cy, strong) => {
        const a = document.createElementNS(SVG_NS, 'a');
        a.setAttribute('href', `#/card/${c.id}`);
        const g = document.createElementNS(SVG_NS, 'g');
        const w = 190;
        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('x', String(cx - w / 2));
        rect.setAttribute('y', String(cy - 23));
        rect.setAttribute('width', String(w));
        rect.setAttribute('height', '46');
        rect.setAttribute('rx', '9');
        rect.setAttribute('fill', strong ? '#EEEDFE' : '#FFFFFF');
        rect.setAttribute('stroke', sysColor(c));
        rect.setAttribute('stroke-width', strong ? '2.4' : '1.4');
        const t = document.createElementNS(SVG_NS, 'text');
        t.setAttribute('x', String(cx - w / 2 + 12));
        t.setAttribute('y', String(cy - 4));
        t.setAttribute('class', 'g-name');
        t.textContent = clip(c.name[lang], 16);
        const sub = document.createElementNS(SVG_NS, 'text');
        sub.setAttribute('x', String(cx - w / 2 + 12));
        sub.setAttribute('y', String(cy + 13));
        sub.setAttribute('class', 'g-sub');
        sub.textContent = `${c.node} · ${c.complete}`;
        g.appendChild(rect);
        g.appendChild(t);
        g.appendChild(sub);
        a.appendChild(g);
        root.appendChild(a);
    };
    const line = (x1, y1, x2, y2) => {
        const p = document.createElementNS(SVG_NS, 'path');
        p.setAttribute('d', `M${x1} ${y1} C${x1} ${(y1 + y2) / 2} ${x2} ${(y1 + y2) / 2} ${x2} ${y2}`);
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke', '#B4B2A9');
        p.setAttribute('stroke-width', '1.4');
        root.appendChild(p);
    };
    const placeRow = (items, y) => {
        const n = Math.max(items.length, 1);
        return items.map((c, i) => {
            const x = ((i + 1) * width) / (n + 1);
            drawNode(c, x, y, false);
            return { c, x };
        });
    };
    drawNode(card, width / 2, centerY, true);
    let prevRow = [{ c: card, x: width / 2 }];
    let prevY = centerY;
    for (let i = 0; i < rows.length; i++) {
        const y = centerY - (i + 1) * rowH;
        const placed = placeRow(rows[i].up, y);
        for (const p of placed) {
            for (const q of prevRow) {
                if (store.edges.some((e) => e.to === q.c.id && e.from === p.c.id))
                    line(p.x, y + 24, q.x, prevY - 24);
            }
        }
        prevRow = placed;
        prevY = y;
    }
    prevRow = [{ c: card, x: width / 2 }];
    prevY = centerY;
    for (let i = 0; i < rows.length; i++) {
        const y = centerY + (i + 1) * rowH;
        const placed = placeRow(rows[i].down, y);
        for (const p of placed) {
            for (const q of prevRow) {
                if (store.edges.some((e) => e.from === q.c.id && e.to === p.c.id))
                    line(q.x, prevY + 24, p.x, y - 24);
            }
        }
        prevRow = placed;
        prevY = y;
    }
    const vp = createViewport({
        world: { w: width, h: height },
        box, svg, root, lang, initial: 1,
    });
    const bar = zoomBar(lang, vp);
    vp.onScale = bar.setScale;
    bar.setScale(vp.scale());
    // 视口尺寸要等插入 DOM 后才量得准，所以把 fit 排到首次测量完成时
    vp.onceMeasured(() => { vp.fit(); bar.setScale(vp.scale()); });
    const wrap2 = el('div', { class: 'graph-zoom-wrap' });
    wrap2.appendChild(bar.el);
    wrap2.appendChild(box);
    const summary = el('div', { class: 'pedigree-summary' });
    summary.appendChild(el('span', {
        text: lang === 'zh'
            ? `祖先 ${anc.size} 条 · 后代 ${des.size} 条 · 依赖深度 ${store.rankOf(card.id)}`
            : `ancestors: ${anc.size}, descendants: ${des.size}, depth: ${store.rankOf(card.id)}`,
    }));
    wrap2.appendChild(summary);
    void maxDist;
    return wrap2;
}
function clip(s, n) {
    return s.length > n ? s.slice(0, Math.max(n - 1, 1)) + '…' : s;
}
export const _sysIds = SYSTEMS.map((s) => s.id);
//# sourceMappingURL=genealogy.js.map