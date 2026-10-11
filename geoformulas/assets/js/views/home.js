import { el, clear } from '../core/dom.js';
import { getLang, ui } from '../core/i18n.js';
import { store } from '../core/store.js';
import { AUDIENCE_META, SYSTEMS } from '../taxonomy.js';
import { cardRow, sectionTitle } from './common.js';
export function renderHome(host) {
    const lang = getLang();
    clear(host);
    const wrap = el('div', { class: 'home' });
    wrap.appendChild(sectionTitle(lang === 'zh' ? '地球物理公式大全' : 'Geophysics Formula Compendium', lang === 'zh' ? '每条公式是一个自包含的数据模块：标签 + 说明 + 分步推导 + 可视化 + 依赖链接' : 'Every formula is a self-contained module: tags + statement + derivation + visualization + links'));
    // 概览统计
    const stats = el('div', { class: 'stats' });
    const derivCount = store.cards.filter((c) => (c.derivation?.length ?? 0) > 0).length;
    const vizCount = store.cards.filter((c) => (c.viz?.length ?? 0) > 0).length;
    const statItems = [
        [ui('statCards'), store.cards.length],
        [lang === 'zh' ? '含完整推导' : 'with derivation', derivCount],
        [lang === 'zh' ? '含交互可视化' : 'with visualization', vizCount],
        [ui('statNodes'), new Set(store.cards.map((c) => c.node)).size],
        [ui('statLinks'), store.edges.length],
    ];
    for (const [label, n] of statItems) {
        const s = el('div', { class: 'stat' });
        s.appendChild(el('div', { class: 'stat-n', text: String(n) }));
        s.appendChild(el('div', { class: 'stat-l', text: label }));
        stats.appendChild(s);
    }
    wrap.appendChild(stats);
    // 数据自检
    if (store.issues.length) {
        const warn = el('div', { class: 'notice warn' });
        warn.appendChild(el('strong', { text: lang === 'zh' ? '数据自检发现问题：' : 'Data check found issues: ' }));
        warn.appendChild(el('span', { text: store.issues.join('；') }));
        wrap.appendChild(warn);
    }
    // 体系入口
    wrap.appendChild(sectionTitle(lang === 'zh' ? '按不同体系进入' : 'Enter through different systems', lang === 'zh' ? '同一批数据，5 个可排序维度' : 'One dataset, five sortable dimensions'));
    const sysGrid = el('div', { class: 'sys-grid' });
    for (const s of SYSTEMS) {
        const card = el('a', { class: 'sys-card', href: `#/browse?sys=${s.id}`, style: `border-color:${s.color}44` });
        const headRow = el('div', { class: 'sys-card-head' });
        headRow.appendChild(el('h3', { text: s.name[lang], style: `color:${s.color}` }));
        headRow.appendChild(el('span', { class: 'pill-static', text: s.desc[lang] }));
        card.appendChild(headRow);
        const listWrap = el('div', { class: 'sys-card-items' });
        const map = store.byFacet.get(s.id);
        const top = [...(map?.entries() ?? [])]
            .filter(([k]) => k !== '__none')
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 6);
        for (const [k, cs] of top) {
            const item = s.items.find((i) => i.id === k);
            if (!item)
                continue;
            const row = el('a', { class: 'sys-item', href: `#/browse?sys=${s.id}&id=${k}` });
            row.appendChild(el('span', { text: item.name[lang] }));
            row.appendChild(el('span', { class: 'sys-count', text: String(cs.length) }));
            listWrap.appendChild(row);
        }
        card.appendChild(listWrap);
        sysGrid.appendChild(card);
    }
    wrap.appendChild(sysGrid);
    // 读者层级分布
    wrap.appendChild(sectionTitle(ui('targetAudience'), lang === 'zh' ? '从高中到博士，每条公式标定了它真正需要的先修程度' : 'High school through PhD — each entry declares its real prerequisite level'));
    const audRow = el('div', { class: 'aud-row' });
    for (const key of ['highschool', 'bachelor', 'master', 'phd']) {
        const items = store.cards.filter((c) => c.audience === key);
        const b = el('a', { class: 'aud-card', href: `#/browse?aud=${key}`, style: `border-color:${AUDIENCE_META[key].color}55` });
        b.appendChild(el('div', { class: 'aud-n', text: String(items.length), style: `color:${AUDIENCE_META[key].color}` }));
        b.appendChild(el('div', { class: 'aud-l', text: AUDIENCE_META[key][lang] }));
        audRow.appendChild(b);
    }
    wrap.appendChild(audRow);
    // 推荐起点
    wrap.appendChild(sectionTitle(ui('homeStartHere'), lang === 'zh' ? '不需要太多先修知识、且配有可视化的一组公式' : 'Entries needing little background and offering visualization'));
    const starters = store.cards.filter((c) => c.audience === 'highschool' || c.audience === 'bachelor');
    const list = el('div', { class: 'results' });
    for (const c of starters.slice(0, 6))
        list.appendChild(cardRow(c, wrap));
    wrap.appendChild(list);
    // 可视化视图入口
    wrap.appendChild(sectionTitle(lang === 'zh' ? '重组的视图' : 'Reorganised views', lang === 'zh' ? '数据层已脱离排版，因此可以随手换个画法' : 'Content is decoupled from layout, so views come cheap'));
    const viewsRow = el('div', { class: 'views-row' });
    const entries = [
        ['#/bubble?group=subject&size=centrality', lang === 'zh' ? '气泡图' : 'Bubble chart', lang === 'zh' ? '按任意体系聚类，半径与颜色各编码一个维度' : 'Cluster by any system; radius and colour encode separate axes'],
        ['#/tree', lang === 'zh' ? '依赖图谱' : 'Dependency graph', lang === 'zh' ? '全局分层有向图，看清谁依赖谁' : 'Global layered digraph showing what depends on what'],
        ['#/browse?sort=rank', lang === 'zh' ? '按依赖深度排序' : 'Sorted by depth', lang === 'zh' ? '从最基本的定义一路推到底' : 'From first principles all the way down'],
        ['#/about', ui('navAbout'), lang === 'zh' ? '数据结构、贡献方式与许可说明' : 'Data structure, contribution guide, license'],
    ];
    for (const [href, label, desc] of entries) {
        const a = el('a', { class: 'view-card', href });
        a.appendChild(el('h3', { text: label }));
        a.appendChild(el('p', { text: desc }));
        viewsRow.appendChild(a);
    }
    wrap.appendChild(viewsRow);
    host.appendChild(wrap);
    void FormDataGuard;
}
const FormDataGuard = null;
//# sourceMappingURL=home.js.map