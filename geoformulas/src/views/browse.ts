import { el, clear } from '../core/dom.js'
import { getLang, ui } from '../core/i18n.js'
import { store } from '../core/store.js'
import { SearchIndex } from '../core/search.js'
import { AUDIENCE_META, COMPLETE_META, SYSTEMS, TAXONOMY } from '../taxonomy.js'
import type { FormulaCard } from '../core/types.js'
import { cardRow, sectionTitle } from './common.js'

let indexCache: SearchIndex | null = null
function index(): SearchIndex {
  if (!indexCache) indexCache = new SearchIndex(store.searchableDocs())
  return indexCache
}

type SortKey = 'subject' | 'rank' | 'name' | 'audience' | 'centrality'

export interface BrowseState {
  sys: string
  id?: string
  q?: string
  aud?: string
  cmp?: string
  sort: SortKey
}

const AUDIENCE_ORDER = ['highschool', 'bachelor', 'master', 'phd']

export function renderBrowse(st: BrowseState, host: HTMLElement): void {
  const lang = getLang()
  clear(host)
  const sys = SYSTEMS.find((s) => s.id === st.sys) ?? SYSTEMS[0]

  const wrap = el('div', { class: 'browse' })
  wrap.appendChild(sectionTitle(
    lang === 'zh' ? '分类浏览与检索' : 'Browse & retrieve',
    lang === 'zh' ? '同一批数据，可以按任意体系重新组织' : 'One dataset, reorganisable along any axis',
  ))

  // ── 体系切换页签 ─────────────────────────────────────
  const tabs = el('div', { class: 'sys-tabs' })
  for (const s of SYSTEMS) {
    const n = s.id === 'subject'
      ? store.cards.length
      : [...s.items].reduce((acc, i) => acc + (store.byFacet.get(s.id)?.get(i.id)?.length ?? 0), 0)
    const b = el('a', {
      class: `sys-tab${s.id === sys.id ? ' active' : ''}`,
      href: `#/browse?sys=${s.id}`,
      style: s.id === sys.id ? `border-color:${s.color};color:${s.color}` : '',
    })
    b.appendChild(el('span', { text: s.name[lang] }))
    b.appendChild(el('span', { class: 'tab-desc', text: s.desc[lang] }))
    b.appendChild(el('span', { class: 'tab-count', text: String(n) }))
    tabs.appendChild(b)
  }
  wrap.appendChild(tabs)

  // ── 筛选条 ──────────────────────────────────────────
  const bar = el('div', { class: 'filter-bar' })

  const mkSelect = (label: string, opts: Array<{ v: string; t: string }>, cur: string | undefined, key: string) => {
    const wrap3 = el('label', { class: 'f-select' })
    wrap3.appendChild(el('span', { class: 'f-label', text: label }))
    const sel = el('select', { class: 'f-input' })
    sel.appendChild(el('option', { value: '', text: ui('filterAll') }))
    for (const o of opts) sel.appendChild(el('option', { value: o.v, text: o.t, selected: o.v === cur }))
    sel.addEventListener('change', () => {
      const next = { ...st, [key]: sel.value || undefined }
      location.hash = `#/browse?${qsOf(next)}`
    })
    wrap3.appendChild(sel)
    return wrap3
  }

  bar.appendChild(mkSelect(lang === 'zh' ? '所属类目' : 'Category',
    sys.items.map((i) => ({ v: i.id, t: `${i.name[lang]}` })), st.id, 'id'))
  bar.appendChild(mkSelect(ui('filterAudience'),
    (Object.keys(AUDIENCE_META) as Array<keyof typeof AUDIENCE_META>).map((k) => ({ v: k, t: AUDIENCE_META[k][lang] })),
    st.aud, 'aud'))
  bar.appendChild(mkSelect(ui('filterComplete'),
    Object.keys(COMPLETE_META).map((k) => ({ v: k, t: `${k} · ${COMPLETE_META[k].desc[lang]}` })),
    st.cmp, 'cmp'))
  bar.appendChild(mkSelect(lang === 'zh' ? '排序' : 'Sort by', [
    { v: 'subject', t: lang === 'zh' ? '学科顺序' : 'Subject order' },
    { v: 'rank', t: lang === 'zh' ? '依赖深度' : 'Dependency depth' },
    { v: 'name', t: lang === 'zh' ? '名称' : 'Name' },
    { v: 'audience', t: lang === 'zh' ? '读者层级' : 'Audience' },
    { v: 'centrality', t: lang === 'zh' ? '核心度' : 'Centrality' },
  ], st.sort, 'sort'))

  if (st.q) {
    const qChip = el('span', { class: 'chip chip-active', text: `${lang === 'zh' ? '关键词' : 'query'}: ${st.q} ✕` })
    qChip.addEventListener('click', () => { location.hash = `#/browse?${qsOf({ ...st, q: undefined })}` })
    bar.appendChild(qChip)
  }
  wrap.appendChild(bar)

  // ── 结果 ────────────────────────────────────────────
  let results: FormulaCard[] = []
  if (st.q) {
    results = index().search(st.q, { audience: st.aud, complete: st.cmp }, idFilter(st.id, sys.id))
      .map((h) => h.card)
  } else {
    results = store.cards.filter((c) => passSys(c, sys.id, st.id) && passAud(c, st.aud) && passCmp(c, st.cmp))
  }
  results = sortCards(results, st.sort)

  const countLine = el('div', { class: 'result-count' })
  countLine.appendChild(el('span', {
    text: `${lang === 'zh' ? ui('found') : ui('found')} ${results.length} ${ui('resultCount')}`,
  }))
  wrap.appendChild(countLine)

  if (!results.length) {
    const empty = el('div', { class: 'empty' })
    empty.appendChild(el('p', { text: ui('noResult') }))
    empty.appendChild(el('p', { class: 'muted', text: ui('noResultHint') }))
    wrap.appendChild(empty)
  } else {
    const list = el('div', { class: 'results' })
    for (const c of results) list.appendChild(cardRow(c, wrap))
    wrap.appendChild(list)
  }

  host.appendChild(wrap)
}

function idFilter(id: string | undefined, sysId: string): (cardId: string) => string[] {
  return (cardId: string) => {
    const card = store.byId.get(cardId)
    if (!card) return []
    if (sysId === 'subject') return nodePathIds(card)
    const vals = (card.tags as Record<string, string[] | undefined>)[sysId] ?? []
    if (!id) return vals
    return vals.includes(id) ? vals : []
  }
}

function nodePathIds(card: FormulaCard): string[] {
  const out: string[] = [card.node]
  // 展开祖先：直接使用 store 提供的学科路径
  let cur = TAXONOMY.find((n) => n.id === card.node)
  while (cur?.parent) { out.push(cur.parent); const p = cur.parent; cur = TAXONOMY.find((n) => n.id === p) }
  return out
}

function passSys(c: FormulaCard, sysId: string, id?: string): boolean {
  if (sysId === 'subject') return !id || nodePathIds(c).includes(id)
  const vals = (c.tags as Record<string, string[] | undefined>)[sysId] ?? []
  if (!id) return vals.length > 0
  return vals.includes(id)
}
function passAud(c: FormulaCard, aud?: string): boolean {
  return !aud || c.audience === aud
}
function passCmp(c: FormulaCard, cmp?: string): boolean {
  return !cmp || c.complete === cmp
}

function sortCards(list: FormulaCard[], key: SortKey): FormulaCard[] {
  const arr = [...list]
  const order = new Map<string, number>()
  let i = 0
  for (const n of TAXONOMY) order.set(n.id, i++)
  const subjIdx = (c: FormulaCard) => order.get(c.node) ?? 999
  switch (key) {
    case 'subject': return arr.sort((a, b) => subjIdx(a) - subjIdx(b) || a.id.localeCompare(b.id))
    case 'rank': return arr.sort((a, b) => store.rankOf(a.id) - store.rankOf(b.id) || a.id.localeCompare(b.id))
    case 'name': return arr.sort((a, b) => a.name[getLang()].localeCompare(b.name[getLang()], getLang() === 'zh' ? 'zh-Hans-CN' : 'en'))
    case 'audience': return arr.sort((a, b) => AUDIENCE_ORDER.indexOf(a.audience) - AUDIENCE_ORDER.indexOf(b.audience) || a.id.localeCompare(b.id))
    case 'centrality': return arr.sort((a, b) => store.centrality(b.id) - store.centrality(a.id) || a.id.localeCompare(b.id))
    default: return arr
  }
}

export function qsOf(st: BrowseState): string {
  const p = new URLSearchParams()
  p.set('sys', st.sys)
  if (st.id) p.set('id', st.id)
  if (st.q) p.set('q', st.q)
  if (st.aud) p.set('aud', st.aud)
  if (st.cmp) p.set('cmp', st.cmp)
  p.set('sort', st.sort)
  return p.toString()
}
