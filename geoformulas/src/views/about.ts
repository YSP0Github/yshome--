import { el, clear } from '../core/dom.js'
import { getLang, ui } from '../core/i18n.js'
import { store } from '../core/store.js'
import { sectionTitle } from './common.js'

export function renderAbout(host: HTMLElement): void {
  const lang = getLang()
  clear(host)
  const wrap = el('div', { class: 'prose about' })
  wrap.appendChild(sectionTitle(ui('navAbout'), lang === 'zh' ? '数据结构与协作方式' : 'Data structure and contribution'))

  wrap.appendChild(el('p', { text: ui('aboutBody') }))
  wrap.appendChild(el('p', { text: ui('aboutMethod') }))

  wrap.appendChild(el('h3', { text: lang === 'zh' ? '一条公式 = 一个文件' : 'One formula = one file' }))
  wrap.appendChild(el('pre', {
    class: 'code',
    text: `src/content/cards/<formula-id>.ts

  export default card: FormulaCard = {
    id, name: {zh, en}, aliases, node, tags: {math[], method[], quantity[]},
    audience,         // highschool | bachelor | master | phd
    complete,         // L1 | L2 | L3 | L4
    statement: { main: LaTeX, variants: [{name, latex}] },
    meaning:   {zh, en},
    symbols:   [{ sym, name:{zh,en}, unit, typical }],
    conditions:{ applies[], assumes[], breaks[] },
    derivation:[{ n, op, title, latex, note }],   // op = 该步做了什么类型的变换
    viz:       [{ level, compute(params) -> series, controls[], xlabel, ylabel }],
    example, numerics, links:{upstream[], downstream[], seealso[]}, refs
  }`,
  }))

  wrap.appendChild(el('h3', { text: lang === 'zh' ? '新增一条公式只需两步' : 'Adding a formula takes two steps' }))
  const ol = el('ol')
  ol.appendChild(el('li', { text: lang === 'zh'
    ? '在 src/content/cards/ 下新建一个 <id>.ts，照抄任意现有文件作为模板'
    : 'Create <id>.ts under src/content/cards/, copying any existing file as a template' }))
  ol.appendChild(el('li', { text: lang === 'zh'
    ? '在 src/content/index.ts 中 import 它并加入 ALL_CARDS 数组'
    : 'Import it in src/content/index.ts and append it to the ALL_CARDS array' }))
  wrap.appendChild(ol)
  wrap.appendChild(el('p', { class: 'muted', text: lang === 'zh'
    ? '其余全部自动生成：学科树归属、跨体系统计、气泡图、系谱图、搜索索引、完整性自检。'
    : 'Everything else is derived automatically: subject placement, cross-system counts, bubbles, pedigree, search index and integrity checks.' }))

  wrap.appendChild(el('h3', { text: lang === 'zh' ? '为什么能这样玩' : 'Why this is possible' }))
  const ul = el('ul')
  ul.appendChild(el('li', { text: lang === 'zh'
    ? '公式本体与页面表现完全解耦：页面层从不硬编码任何一条公式'
    : 'Content is fully decoupled from presentation: nothing renders a formula by hard-coding it' }))
  ul.appendChild(el('li', { text: lang === 'zh'
    ? '每条公式携带多套互不隶属的标签（学科 / 数学工具 / 方法 / 物理量），因此可按任意轴排序聚合'
    : 'Each entry carries independent tag axes (subject / maths / method / quantity), enabling arbitrary regrouping' }))
  ul.appendChild(el('li', { text: lang === 'zh'
    ? '依赖通过 id 引用，由 store 统一解析成边，所以图谱和「上下游」永远同步'
    : 'Dependencies reference by id and are resolved into edges centrally, so graphs never drift' }))
  wrap.appendChild(ul)

  wrap.appendChild(el('h3', { text: lang === 'zh' ? '当前状态' : 'Current state' }))
  const dl = el('div', { class: 'stats small' })
  const pairs: Array<[string, string]> = [
    [ui('statCards'), String(store.cards.length)],
    [ui('statLinks'), String(store.edges.length)],
    [lang === 'zh' ? '数据自检' : 'Integrity', store.issues.length === 0
      ? (lang === 'zh' ? '通过' : 'pass')
      : store.issues.join('；')],
  ]
  for (const [k, v] of pairs) {
    const s = el('div', { class: 'stat' })
    s.appendChild(el('div', { class: 'stat-n', text: v }))
    s.appendChild(el('div', { class: 'stat-l', text: k }))
    dl.appendChild(s)
  }
  wrap.appendChild(dl)

  wrap.appendChild(el('p', { class: 'muted', text: ui('aboutContrib') }))
  host.appendChild(wrap)
}
