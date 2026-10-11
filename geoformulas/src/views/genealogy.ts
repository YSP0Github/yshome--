import { el, clear } from '../core/dom.js'
import { getLang } from '../core/i18n.js'
import { store } from '../core/store.js'
import { SYSTEMS, AUDIENCE_META } from '../taxonomy.js'
import type { FormulaCard } from '../core/types.js'
import { sectionTitle } from './common.js'
import { createViewport, zoomBar } from '../core/viewport.js'

type Mode = 'graph' | 'pedigree'

const NODE_W = 168
const NODE_H = 46

function sysColor(card: FormulaCard): string {
  const top = card.node.split('.')[0]
  const idx = Math.max(0, Number(top.replace(/\D/g, '')) || 0)
  const palette = ['#185FA5', '#A32D2D', '#0F6E56', '#BA7517', '#7F77DD', '#D4537E', '#639922', '#378ADD', '#993C1D', '#534AB7', '#0F6E56']
  return palette[idx % palette.length]
}

export function renderGenealogy(host: HTMLElement, mode: Mode, focusId?: string): void {
  const lang = getLang()
  clear(host)
  const wrap = el('div', { class: 'viz-page' })

  const bar = el('div', { class: 'filter-bar' })
  bar.appendChild(el('a', {
    class: `pill${mode === 'graph' ? ' active' : ''}`,
    href: '#/tree',
    text: lang === 'zh' ? '全局依赖图' : 'Global dependency graph',
  }))
  if (focusId) {
    const fc = store.byId.get(focusId)
    if (fc) {
      bar.appendChild(el('span', { class: 'f-label', text: '›' }))
      bar.appendChild(el('a', {
        class: `pill${mode === 'pedigree' ? ' active' : ''}`,
        href: `#/tree/${focusId}`,
        text: fc.name[lang],
      }))
    }
  }
  wrap.appendChild(bar)

  if (mode === 'graph') {
    wrap.appendChild(sectionTitle(
      lang === 'zh' ? '全局依赖图（按依赖深度分层）' : 'Global dependency graph (layered by depth)',
      lang === 'zh' ? '越靠右越依赖先前结论；颜色区分一级学科' : 'Rightward means more derived; colours separate the top-level subjects',
    ))
    wrap.appendChild(el('p', { class: 'muted', text: store.issues.length
      ? (lang === 'zh' ? '注意数据自检提示：' : 'Data check warnings: ') + store.issues.join('；')
      : (lang === 'zh' ? '数据自检通过：所有依赖引用均有效' : 'Data check passed: all references resolve') }))
    wrap.appendChild(buildGlobalGraph())
  } else if (focusId) {
    const fc = store.byId.get(focusId)
    if (fc) {
      wrap.appendChild(sectionTitle(
        lang === 'zh' ? '系谱图：祖先与后代' : 'Pedigree: ancestors and descendants',
        fc.name[lang],
      ))
      wrap.appendChild(buildPedigree(fc))
    } else {
      wrap.appendChild(el('p', { class: 'muted', text: lang === 'zh' ? '未找到该公式' : 'Formula not found' }))
    }
  }
  host.appendChild(wrap)
}

function buildGlobalGraph(): HTMLElement {
  const lang = getLang()
  const cards = store.cards
  const byRank = new Map<number, FormulaCard[]>()
  for (const c of cards) {
    const r = store.rankOf(c.id)
    const arr = byRank.get(r) ?? []
    arr.push(c)
    byRank.set(r, arr)
  }
  const ranks = [...byRank.keys()].sort((a, b) => a - b)
  const pos = new Map<string, { x: number; y: number }>()
  const colGap = NODE_W + 78
  let maxY = 0
  for (const r of ranks) {
    const arr = byRank.get(r)!
    arr.forEach((c, i) => {
      const x = 70 + r * colGap
      const y = 70 + i * (NODE_H + 34)
      pos.set(c.id, { x, y })
      maxY = Math.max(maxY, y)
    })
  }
  const width = 70 + ranks.length * colGap + 60
  const height = maxY + 120

  const box = el('div', { class: 'graph-viewport-box' })
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('class', 'graph-svg graph-viewport')
  box.appendChild(svg)
  // 内容全部放进 root <g>，缩放平移只作用在它身上
  const root = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  svg.appendChild(root)

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
  marker.setAttribute('id', 'g-arrow')
  marker.setAttribute('viewBox', '0 0 10 10')
  marker.setAttribute('refX', '9')
  marker.setAttribute('refY', '5')
  marker.setAttribute('markerWidth', '6')
  marker.setAttribute('markerHeight', '6')
  marker.setAttribute('orient', 'auto-start-reverse')
  const mp = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  mp.setAttribute('d', 'M2 1L8 5L2 9')
  mp.setAttribute('fill', 'none')
  mp.setAttribute('stroke', '#888780')
  mp.setAttribute('stroke-width', '1.4')
  mp.setAttribute('stroke-linecap', 'round')
  marker.appendChild(mp)
  defs.appendChild(marker)
  root.appendChild(defs)

  // 列标题
  for (const r of ranks) {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    t.setAttribute('x', String(70 + r * colGap + NODE_W / 2))
    t.setAttribute('y', '34')
    t.setAttribute('text-anchor', 'middle')
    t.setAttribute('class', 'g-colhead')
    t.textContent = lang === 'zh' ? `第 ${r} 层` : `depth ${r}`
    root.appendChild(t)
  }

  // 边
  for (const e of store.edges) {
    const a = pos.get(e.from)
    const b = pos.get(e.to)
    if (!a || !b) continue
    const x1 = a.x + NODE_W
    const y1 = a.y + NODE_H / 2
    const x2 = b.x
    const y2 = b.y + NODE_H / 2
    const mx = (x1 + x2) / 2
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    p.setAttribute('d', `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`)
    p.setAttribute('fill', 'none')
    p.setAttribute('stroke', '#B4B2A9')
    p.setAttribute('stroke-width', '1.4')
    p.setAttribute('marker-end', 'url(#g-arrow)')
    root.appendChild(p)
  }

  // 节点
  for (const c of cards) {
    const p = pos.get(c.id)
    if (!p) continue
    const a = document.createElementNS('http://www.w3.org/2000/svg', 'a')
    a.setAttribute('href', `#/card/${c.id}`)
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', String(p.x))
    rect.setAttribute('y', String(p.y))
    rect.setAttribute('width', String(NODE_W))
    rect.setAttribute('height', String(NODE_H))
    rect.setAttribute('rx', '9')
    rect.setAttribute('fill', '#FFFFFF')
    rect.setAttribute('stroke', sysColor(c))
    rect.setAttribute('stroke-width', '1.6')
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    t.setAttribute('x', String(p.x + 12))
    t.setAttribute('y', String(p.y + 20))
    t.setAttribute('class', 'g-name')
    t.textContent = clip(c.name[lang], 15)
    const sub = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    sub.setAttribute('x', String(p.x + 12))
    sub.setAttribute('y', String(p.y + 35))
    sub.setAttribute('class', 'g-sub')
    sub.textContent = `${c.node} · ${c.complete} · ${AUDIENCE_META[c.audience]?.[lang] ?? ''}`
    g.appendChild(rect)
    g.appendChild(t)
    g.appendChild(sub)
    a.appendChild(g)
    root.appendChild(a)
  }

  const wrap2 = el('div', { class: 'graph-zoom-wrap' })
  const vp = createViewport({
    world: { w: width, h: height },
    box, svg, root, lang, initial: 1,
  })
  const bar = zoomBar(lang, vp)
  vp.onScale = bar.setScale
  bar.setScale(vp.scale())
  wrap2.appendChild(bar.el)
  wrap2.appendChild(box)
  return wrap2
}

function buildPedigree(card: FormulaCard): HTMLElement {
  const lang = getLang()
  const anc = store.ancestors(card.id)
  const des = store.descendants(card.id)
  const rows: Array<{ dist: number; up: FormulaCard[]; down: FormulaCard[] }> = []
  const maxDist = Math.max(...[...anc.values(), ...des.values(), 0])
  for (let d = maxDist; d >= 1; d--) {
    const up = [...anc.entries()].filter(([, v]) => v === d).map(([k]) => store.byId.get(k)!).filter(Boolean)
    const down = [...des.entries()].filter(([, v]) => v === d).map(([k]) => store.byId.get(k)!).filter(Boolean)
    rows.push({ dist: d, up, down })
  }

  const width = 980
  const rowH = 96
  const height = (rows.length * 2 + 1) * rowH + 60
  const box = el('div', { class: 'graph-viewport-box' })
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('class', 'graph-svg graph-viewport')
  box.appendChild(svg)
  const root = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  svg.appendChild(root)

  const centerY = rows.length * rowH + rowH / 2 + 20

  const drawNode = (c: FormulaCard, cx: number, cy: number, strong: boolean) => {
    const a = document.createElementNS('http://www.w3.org/2000/svg', 'a')
    a.setAttribute('href', `#/card/${c.id}`)
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const w = 190
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', String(cx - w / 2))
    rect.setAttribute('y', String(cy - 23))
    rect.setAttribute('width', String(w))
    rect.setAttribute('height', '46')
    rect.setAttribute('rx', '9')
    rect.setAttribute('fill', strong ? '#EEEDFE' : '#FFFFFF')
    rect.setAttribute('stroke', sysColor(c))
    rect.setAttribute('stroke-width', strong ? '2.4' : '1.4')
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    t.setAttribute('x', String(cx - w / 2 + 12))
    t.setAttribute('y', String(cy - 4))
    t.setAttribute('class', 'g-name')
    t.textContent = clip(c.name[lang], 16)
    const sub = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    sub.setAttribute('x', String(cx - w / 2 + 12))
    sub.setAttribute('y', String(cy + 13))
    sub.setAttribute('class', 'g-sub')
    sub.textContent = `${c.node} · ${c.complete}`
    g.appendChild(rect); g.appendChild(t); g.appendChild(sub)
    a.appendChild(g)
    root.appendChild(a)
  }

  const line = (x1: number, y1: number, x2: number, y2: number) => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    p.setAttribute('d', `M${x1} ${y1} C${x1} ${(y1 + y2) / 2} ${x2} ${(y1 + y2) / 2} ${x2} ${y2}`)
    p.setAttribute('fill', 'none')
    p.setAttribute('stroke', '#B4B2A9')
    p.setAttribute('stroke-width', '1.4')
    root.appendChild(p)
  }

  const placeRow = (items: FormulaCard[], y: number) => {
    const n = Math.max(items.length, 1)
    return items.map((c, i) => {
      const x = ((i + 1) * width) / (n + 1)
      drawNode(c, x, y, false)
      return { c, x }
    })
  }

  drawNode(card, width / 2, centerY, true)

  let prevRow: Array<{ c: FormulaCard; x: number }> = [{ c: card, x: width / 2 }]
  let prevY = centerY
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const y = centerY - (i + 1) * rowH - 20 + (rows.length - i) * 0
    const placed = placeRow(r.up, centerY - (i + 1) * rowH)
    for (const p of placed) {
      for (const q of prevRow) {
        if (store.edges.some((e) => e.to === q.c.id && e.from === p.c.id)) line(p.x, y + 24, q.x, prevY - 24)
      }
    }
    prevRow = placed
    prevY = y
  }

  prevRow = [{ c: card, x: width / 2 }]
  prevY = centerY
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const y = centerY + (i + 1) * rowH + 20 * (i === rows.length - 1 ? 0 : 0)
    const placed = placeRow(r.down, centerY + (i + 1) * rowH)
    for (const p of placed) {
      for (const q of prevRow) {
        if (store.edges.some((e) => e.from === q.c.id && e.to === p.c.id)) line(q.x, prevY + 24, p.x, y - 24)
      }
    }
    prevRow = placed
    prevY = y
  }

  const vp = createViewport({
    world: { w: width, h: height },
    box, svg, root, lang, initial: 1,
  })
  const bar = zoomBar(lang, vp)
  vp.onScale = bar.setScale
  bar.setScale(vp.scale())
  // 视口尺寸要等插入 DOM 后才量得准，所以把 fit 排到首次测量完成时
  vp.onceMeasured(() => { vp.fit(); bar.setScale(vp.scale()) })
  const wrap2 = el('div', { class: 'graph-zoom-wrap' })
  wrap2.appendChild(bar.el)
  wrap2.appendChild(box)

  const summary = el('div', { class: 'pedigree-summary' })
  summary.appendChild(el('span', {
    text: lang === 'zh'
      ? `祖先 ${anc.size} 条 · 后代 ${des.size} 条 · 依赖深度 ${store.rankOf(card.id)}`
      : `ancestors: ${anc.size}, descendants: ${des.size}, depth: ${store.rankOf(card.id)}`,
  }))
  wrap2.appendChild(summary)
  void maxDist
  return wrap2
}

function clip(s: string, n: number): string {
  return s.length > n ? s.slice(0, Math.max(n - 1, 1)) + '…' : s
}

export const _sysIds = SYSTEMS.map((s) => s.id)
