import { el } from '../core/dom.js';
import { tex } from '../core/katex.js';
import { getLang } from '../core/i18n.js';
import { AUDIENCE_META, TAXONOMY } from '../taxonomy.js';
/** 列表中的一行公式摘要（预览其中文/英文名、主公式、归属、徽标） */
export function cardRow(c, host) {
    const lang = getLang();
    const row = el('a', { class: 'result', href: `#/card/${c.id}` });
    const top = el('div', { class: 'result-top' });
    top.appendChild(el('h3', { class: 'result-title', text: c.name[lang] }));
    const aud = AUDIENCE_META[c.audience];
    if (aud)
        top.appendChild(el('span', { class: 'chip sm', style: `color:${aud.color};border-color:${aud.color}44;background:${aud.color}12`, text: aud[lang] }));
    top.appendChild(el('span', { class: 'chip sm', text: c.complete }));
    row.appendChild(top);
    row.appendChild(el('div', { class: 'result-tex', html: tex(c.statement.main, false) }));
    const meta = el('div', { class: 'result-meta' });
    const trail = labelTrail(c);
    if (trail)
        meta.appendChild(el('span', { class: 'result-node', text: trail }));
    if (c.derivation?.length) {
        meta.appendChild(el('span', { class: 'result-step', text: lang === 'zh' ? `${c.derivation.length} 步推导` : `${c.derivation.length} steps` }));
    }
    if (c.viz?.length) {
        meta.appendChild(el('span', { class: 'result-step', text: lang === 'zh' ? `${c.viz.length} 个可视化` : `${c.viz.length} viz` }));
    }
    row.appendChild(meta);
    void host;
    return row;
}
export function labelTrail(c) {
    const lang = getLang();
    const parts = [];
    let cur = TAXONOMY.find((n) => n.id === c.node);
    const stack = [];
    while (cur) {
        stack.unshift(cur.name[lang]);
        const p = cur.parent;
        cur = p ? TAXONOMY.find((n) => n.id === p) : undefined;
    }
    parts.push(...stack);
    return parts.join(' › ');
}
export function sectionTitle(text, hint) {
    const wrap = el('div', { class: 'section-head' });
    wrap.appendChild(el('h2', { class: 'section-title', text }));
    if (hint)
        wrap.appendChild(el('span', { class: 'section-hint', text: hint }));
    return wrap;
}
//# sourceMappingURL=common.js.map