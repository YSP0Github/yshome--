import { el, clear } from '../core/dom.js'
import { tex, texLinked } from '../core/katex.js'
import { createPlot } from '../core/plot.js'
import { getLang, ui } from '../core/i18n.js'
import { store } from '../core/store.js'
import { AUDIENCE_META, COMPLETE_META, SYSTEMS, TAXONOMY } from '../taxonomy.js'
import type { BText, CardTags, FormulaCard, Lang, StepOp, SymbolDef, VizSpec } from '../core/types.js'

const OP_COLOR: Record<StepOp, { bg: string; fg: string; zh: string; en: string }> = {
  setup:      { bg: '#EEEDFE', fg: '#3C3489', zh: '设定',     en: 'setup' },
  geometry:   { bg: '#E1F5EE', fg: '#085041', zh: '几何关系', en: 'geometry' },
  physics:    { bg: '#FAECE7', fg: '#712B13', zh: '物理定律', en: 'physics' },
  identity:   { bg: '#E6F1FB', fg: '#0C447C', zh: '恒等式',   en: 'identity' },
  substitute: { bg: '#FAEEDA', fg: '#633806', zh: '代入',     en: 'substitute' },
  algebra:    { bg: '#F1EFE8', fg: '#444441', zh: '代数化简', en: 'algebra' },
  taylor:     { bg: '#FBEAF0', fg: '#72243E', zh: '展开近似', en: 'expand' },
  transform:  { bg: '#EAF3DE', fg: '#27500A', zh: '积分变换', en: 'transform' },
  result:     { bg: '#EAF3DE', fg: '#173404', zh: '结论',     en: 'result' },
}

export function renderCard(card: FormulaCard, host: HTMLElement): void {
  const lang = getLang()
  clear(host)
  const wrap = el('article', { class: 'card-page' })

  // ── 面包屑 ────────────────────────────────────────────────
  const path = nodePathLabels(card)
  wrap.appendChild(el('nav', { class: 'crumbs' }, [
    el('a', { href: '#/browse', text: lang === 'zh' ? '浏览' : 'Browse' }),
    ...path.map((p) => el('a', { href: `#/browse?sys=subject&id=${p.id}`, text: p.label })),
  ]))

  // ── 标题区 ───────────────────────────────────────────────
  const head = el('header', { class: 'card-head' })
  head.appendChild(el('h1', { class: 'card-title', text: card.name[lang] }))
  const badges = el('div', { class: 'badges' })
  const aud = AUDIENCE_META[card.audience]
  if (aud) badges.appendChild(chip(aud[lang], aud.color))
  const cmp = COMPLETE_META[card.complete]
  badges.appendChild(chip(`${card.complete} · ${cmp.desc[lang]}`, '#5F5E5A'))
  badges.appendChild(chipNode(card))
  head.appendChild(badges)
  if (card.aliases?.zh?.length || card.aliases?.en?.length) {
    const al = lang === 'zh' ? (card.aliases?.zh ?? []) : (card.aliases?.en ?? [])
    if (al.length) head.appendChild(el('p', { class: 'aliases', text: al.join(' · ') }))
  }
  wrap.appendChild(head)

  // ── 主公式 + 等价形式 ────────────────────────────────────
  const stmt = el('section', { class: 'block statement' })
  stmt.appendChild(el('div', { class: 'main-formula', html: texLinked(card.statement.main, card.symbols, true) }))
  if (card.statement.variants?.length) {
    const vs = el('div', { class: 'variants' })
    vs.appendChild(el('div', { class: 'sub-label', text: ui('variants') }))
    for (const v of card.statement.variants) {
      const row = el('div', { class: 'variant' })
      row.appendChild(el('span', { class: 'variant-name', text: v.name[lang] }))
      row.appendChild(el('div', { class: 'variant-latex', html: tex(v.latex, true) }))
      vs.appendChild(row)
    }
    stmt.appendChild(vs)
  }
  wrap.appendChild(stmt)

  if (card.meaning) {
    wrap.appendChild(sectionLang(ui('secMeaning'), card.meaning, 'meaning-text'))
  }

  // ── 符号表（与公式双向联动） ──────────────────────────────
  if (card.symbols.length) {
    const sec = el('section', { class: 'block' })
    sec.appendChild(el('h2', { class: 'block-title', text: ui('secSymbols') }))
    sec.appendChild(buildSymbolTable(card.symbols, lang))
    wrap.appendChild(sec)
  }

  // ── 适用条件 ────────────────────────────────────────────
  const cond = card.conditions
  if (cond?.applies || cond?.assumes || cond?.breaks) {
    const sec = el('section', { class: 'block' })
    sec.appendChild(el('h2', { class: 'block-title', text: ui('secConditions') }))
    const grid = el('div', { class: 'cond-grid' })
    if (cond.applies) grid.appendChild(condCol(ui('applies'), cond.applies, lang, 'ok'))
    if (cond.assumes) grid.appendChild(condCol(ui('assumes'), cond.assumes, lang, 'warn'))
    if (cond.breaks) grid.appendChild(condCol(ui('breaks'), cond.breaks, lang, 'bad'))
    sec.appendChild(grid)
    wrap.appendChild(sec)
  }

  // ── 分面标签（点击跳转检索） ──────────────────────────────
  const tagSec = el('section', { class: 'block' })
  tagSec.appendChild(el('h2', { class: 'block-title', text: lang === 'zh' ? '多维标签' : 'Multi-axis tags' }))
  tagSec.appendChild(buildTagChipRow(card.tags, lang))
  wrap.appendChild(tagSec)

  // ── 分步推导 ────────────────────────────────────────────
  if (card.derivation?.length) {
    const sec = el('section', { class: 'block' })
    const bar = el('div', { class: 'block-bar' })
    bar.appendChild(el('h2', { class: 'block-title inline', text: `${ui('secDerivation')}（${card.derivation.length} ${lang === 'zh' ? '步' : 'steps'}）` }))
    const toggle = el('button', { class: 'mini-btn', text: ui('collapseAll') })
    let collapsed = false
    toggle.addEventListener('click', () => {
      collapsed = !collapsed
      for (const b of sec.querySelectorAll<HTMLElement>('.step-body')) b.hidden = collapsed
      toggle.textContent = collapsed ? ui('expandAll') : ui('collapseAll')
    })
    bar.appendChild(toggle)
    sec.appendChild(bar)

    const list = el('ol', { class: 'steps' })
    for (const st of card.derivation) {
      const meta = OP_COLOR[st.op]
      const li = el('li', { class: 'step' })
      const headRow = el('div', { class: 'step-head' })
      headRow.appendChild(el('span', { class: 'step-n', text: String(st.n) }))
      headRow.appendChild(el('span', { class: 'op-tag', style: `background:${meta.bg};color:${meta.fg}`, text: lang === 'zh' ? meta.zh : meta.en }))
      headRow.appendChild(el('span', { class: 'step-title', text: st.title[lang] }))
      headRow.addEventListener('click', () => {
        const body = li.querySelector<HTMLElement>('.step-body')
        if (body) body.hidden = !body.hidden
      })
      li.appendChild(headRow)
      const body = el('div', { class: 'step-body' })
      body.appendChild(el('div', { class: 'step-latex', html: tex(st.latex, true) }))
      if (st.note) body.appendChild(el('p', { class: 'step-note', text: st.note[lang] }))
      li.appendChild(body)
      list.appendChild(li)
    }
    sec.appendChild(list)
    wrap.appendChild(sec)
  }

  // ── 可视化 ──────────────────────────────────────────────
  if (card.viz?.length) {
    const sec = el('section', { class: 'block' })
    sec.appendChild(el('h2', { class: 'block-title', text: ui('secViz') }))
    for (const v of card.viz) sec.appendChild(buildViz(v, lang))
    wrap.appendChild(sec)
  }

  if (card.example) {
    const sec = el('section', { class: 'block' })
    sec.appendChild(el('h2', { class: 'block-title', text: ui('secExample') }))
    const box = el('div', { class: 'example-box' })
    if (card.example.title) box.appendChild(el('div', { class: 'ex-title', text: card.example.title[lang] }))
    box.appendChild(el('div', { class: 'ex-row' }, [
      el('span', { class: 'ex-key', text: lang === 'zh' ? '输入' : 'Input' }),
      el('span', { text: card.example.input[lang] }),
    ]))
    for (const s of card.example.steps ?? []) {
      box.appendChild(el('div', { class: 'ex-step', html: tex(s[lang], false) }))
    }
    box.appendChild(el('div', { class: 'ex-row out' }, [
      el('span', { class: 'ex-key', text: lang === 'zh' ? '结论' : 'Output' }),
      el('span', { text: card.example.output[lang] }),
    ]))
    sec.appendChild(box)
    wrap.appendChild(sec)
  }

  if (card.numerics?.length) {
    const sec = el('section', { class: 'block' })
    sec.appendChild(el('h2', { class: 'block-title', text: ui('secNumerics') }))
    for (const n of card.numerics) {
      const row = el('div', { class: 'numeric-row' })
      row.appendChild(el('p', { text: n.note[lang] }))
      row.appendChild(el('div', { class: 'numeric-snip', html: tex(n.snippet, false) }))
      sec.appendChild(row)
    }
    wrap.appendChild(sec)
  }

  // ── 依赖网络 ────────────────────────────────────────────
  const { up, down } = store.neighbours(card.id)
  if (up.length || down.length || card.links?.seealso?.length) {
    const sec = el('section', { class: 'block' })
    sec.appendChild(el('h2', { class: 'block-title', text: ui('secLinks') }))
    if (up.length) sec.appendChild(linkCol(ui('upstream'), up))
    if (down.length) sec.appendChild(linkCol(ui('downstream'), down))
    if (card.links?.seealso?.length) {
      const others = card.links.seealso.map((l) => store.byId.get(l.id)).filter((c): c is FormulaCard => !!c)
      sec.appendChild(linkCol(ui('secSeeAlso'), others))
    }
    const tools = el('div', { class: 'link-tools' })
    tools.appendChild(el('a', { class: 'mini-btn', href: `#/tree/${card.id}`, text: lang === 'zh' ? '查看系谱图' : 'Open pedigree' }))
    sec.appendChild(tools)
    wrap.appendChild(sec)
  }

  if (card.refs?.length) {
    const sec = el('section', { class: 'block' })
    sec.appendChild(el('h2', { class: 'block-title', text: ui('secRefs') }))
    const ul = el('ul', { class: 'refs' })
    for (const r of card.refs) {
      const li = el('li')
      if (r.url) {
        const a = el('a', { href: r.url, target: '_blank', rel: 'noopener', text: r.text })
        li.appendChild(a)
      } else li.appendChild(document.createTextNode(r.text))
      ul.appendChild(li)
    }
    sec.appendChild(ul)
    wrap.appendChild(sec)
  }

  host.appendChild(wrap)
  host.dataset.scoped = card.id
}

function sectionLang(title: string, body: { zh: string; en: string }, cls: string): HTMLElement {
  const lang = getLang()
  const sec = el('section', { class: `block ${cls}` })
  sec.appendChild(el('h2', { class: 'block-title', text: title }))
  sec.appendChild(el('p', { text: body[lang] }))
  return sec
}

function chip(text: string, color: string): HTMLElement {
  return el('span', { class: 'chip', style: `color:${color};border-color:${color}44;background:${color}12`, text })
}

function chipNode(card: FormulaCard): HTMLElement {
  const paths = nodePathLabels(card)
  const last = paths[paths.length - 1]
  return el('a', {
    class: 'chip chip-link',
    href: `#/browse?sys=subject&id=${last.id}`,
    text: last.label,
  })
}

function nodePathLabels(card: FormulaCard): Array<{ id: string; label: string }> {
  const lang = getLang()
  const stack: Array<{ id: string; label: string }> = []
  let cur = TAXONOMY.find((n) => n.id === card.node)
  while (cur) {
    stack.unshift({ id: cur.id, label: cur.name[lang] })
    const parentId = cur.parent
    cur = parentId ? TAXONOMY.find((n) => n.id === parentId) : undefined
  }
  return stack
}

function buildSymbolTable(symbols: SymbolDef[], lang: Lang): HTMLElement {
  const wrap2 = el('div', { class: 'symbol-table-wrap' })
  const table = el('table', { class: 'symbol-table' })
  const thead = el('thead')
  const tr = el('tr')
  for (const h of [ui('colSymbol'), ui('colName'), ui('colUnit'), ui('colTypical')]) {
    tr.appendChild(el('th', { text: h }))
  }
  thead.appendChild(tr)
  table.appendChild(thead)
  const tbody = el('tbody')
  symbols.forEach((s, i) => {
    const row = el('tr', { class: 'sym-row', 'data-sym': String(i) })
    row.appendChild(el('td', { class: 'sym-cell', html: tex(s.sym, false) }))
    row.appendChild(el('td', { text: s.name[lang] }))
    row.appendChild(el('td', { text: s.unit || ui('unitNone') }))
    row.appendChild(el('td', { class: 'typical', text: s.typical ?? '—' }))
    tbody.appendChild(row)
  })
  table.appendChild(tbody)
  wrap2.appendChild(table)
  return wrap2
}

function condCol(title: string, items: BText[], lang: Lang, kind: string): HTMLElement {
  const col = el('div', { class: `cond-col ${kind}` })
  col.appendChild(el('h3', { text: title }))
  const ul = el('ul')
  for (const it of items) ul.appendChild(el('li', { text: it[lang] }))
  col.appendChild(ul)
  return col
}

function linkCol(title: string, cards: FormulaCard[]): HTMLElement {
  const lang = getLang()
  const col = el('div', { class: 'link-col' })
  col.appendChild(el('h3', { text: title }))
  const ul = el('ul', { class: 'link-list' })
  for (const c of cards) {
    const li = el('li')
    li.appendChild(el('a', { href: `#/card/${c.id}`, text: c.name[lang] }))
    li.appendChild(el('span', { class: 'muted', text: ` · ${c.node}` }))
    ul.appendChild(li)
  }
  col.appendChild(ul)
  return col
}

function buildTagChipRow(tags: CardTags, lang: Lang): HTMLElement {
  const row = el('div', { class: 'tag-row' })
  for (const sys of SYSTEMS) {
    if (sys.id === 'subject') continue
    const vals = (tags as Record<string, string[] | undefined>)[sys.id] ?? []
    for (const v of vals) {
      const item = sys.items.find((i) => i.id === v)
      if (!item) continue
      row.appendChild(el('a', {
        class: 'chip chip-link',
        style: `color:${sys.color};border-color:${sys.color}44;background:${sys.color}12`,
        href: `#/browse?sys=${sys.id}&id=${v}`,
        text: item.name[lang],
      }))
    }
  }
  if (!row.childNodes.length) row.appendChild(el('span', { class: 'muted', text: '—' }))
  return row
}

function buildViz(v: VizSpec, lang: Lang): HTMLElement {
  const box = el('div', { class: 'viz' })
  const headRow = el('div', { class: 'viz-head' })
  headRow.appendChild(el('h3', { class: 'viz-title', text: v.title[lang] }))
  headRow.appendChild(el('span', { class: 'viz-level', text: v.level }))
  box.appendChild(headRow)

  const params: Record<string, number> = {}
  for (const c of v.controls) params[c.id] = c.value ?? c.min

  const seriesNow = v.compute(params)
  const plot = createPlot({
    xlabel: v.xlabel[lang],
    ylabel: v.ylabel[lang],
    series: seriesNow,
    xRange: v.xRange,
    xLog: v.xScale === 'log',
    yLog: v.yScale === 'log',
    lang,
    height: 320,
  })
  box.appendChild(plot.root)

  if (v.controls.length) {
    const grid = el('div', { class: 'viz-controls' })
    for (const c of v.controls) {
      const row = el('label', { class: 'ctrl' })
      const lab = el('span', { class: 'ctrl-label', text: c.label[lang] })
      const out = el('output', { class: 'ctrl-out', text: String(params[c.id]) + (c.unit ? ' ' + c.unit : '') })
      row.appendChild(lab)
      row.appendChild(out)
      const input = el('input', {
        type: 'range', min: String(c.min), max: String(c.max), step: String(c.step), value: String(params[c.id]),
        class: 'ctrl-range',
      })
      input.addEventListener('input', () => {
        params[c.id] = Number(input.value)
        out.textContent = String(input.value) + (c.unit ? ' ' + c.unit : '')
        plot.update(v.compute(params), v.xRange)
      })
      row.appendChild(input)
      grid.appendChild(row)
    }
    box.appendChild(grid)
  }

  if (v.note) box.appendChild(el('p', { class: 'viz-note', text: v.note[lang] }))
  return box
}

