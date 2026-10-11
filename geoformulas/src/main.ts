import { el, clear } from './core/dom.js'
import { getLang, toggleLang, ui, langLabel, onLangChange } from './core/i18n.js'
import { store } from './core/store.js'
import { TAXONOMY } from './taxonomy.js'
import { renderHome } from './views/home.js'
import { renderBrowse, type BrowseState } from './views/browse.js'
import { renderCard } from './views/card.js'
import { renderBubble } from './views/bubble.js'
import { renderGenealogy } from './views/genealogy.js'
import { renderAbout } from './views/about.js'

const app = document.getElementById('app') as HTMLElement
let viewHost: HTMLElement
let sideHost: HTMLElement
let searchInput: HTMLInputElement

function buildShell(): void {
  clear(app)

  const header = el('header', { class: 'topbar' })
  const brand = el('a', { class: 'brand', href: '#/' })
  brand.appendChild(el('span', { class: 'brand-main', text: ui('siteTitle') }))
  brand.appendChild(el('span', { class: 'brand-sub', text: ui('siteSubtitle') }))
  header.appendChild(brand)

  const nav = el('nav', { class: 'topnav' })
  for (const [href, label] of [
    ['#/', ui('navHome')],
    ['#/browse', ui('navTree')],
    ['#/bubble?group=subject&size=centrality', langLabelBubble()],
    ['#/tree', ui('navGraph')],
    ['#/about', ui('navAbout')],
  ] as Array<[string, string]>) {
    nav.appendChild(el('a', { href, text: label }))
  }
  header.appendChild(nav)

  const right = el('div', { class: 'topbar-right' })
  searchInput = el('input', {
    class: 'search-input',
    type: 'search',
    placeholder: ui('searchPlaceholder'),
  }) as HTMLInputElement
  searchInput.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter') return
    const q = searchInput.value.trim()
    location.hash = q ? `#/browse?q=${encodeURIComponent(q)}` : '#/browse'
  })
  right.appendChild(searchInput)
  const langBtn = el('button', { class: 'lang-btn', text: langLabel() })
  langBtn.addEventListener('click', () => { toggleLang() })
  right.appendChild(langBtn)
  header.appendChild(right)
  app.appendChild(header)

  const shell = el('div', { class: 'shell' })
  sideHost = el('aside', { class: 'sidebar' })
  shell.appendChild(sideHost)
  viewHost = el('main', { class: 'view' })
  shell.appendChild(viewHost)
  app.appendChild(shell)

  const foot = el('footer', { class: 'footbar' })
  foot.appendChild(el('span', { class: 'muted', text: 'KaTeX · Canvas · zero-build static site' }))
  app.appendChild(foot)
}

function langLabelBubble(): string {
  return getLang() === 'zh' ? '气泡图' : 'Bubbles'
}

function renderSidebar(activeCardId?: string): void {
  clear(sideHost)
  const lang = getLang()
  const tree = el('nav', { class: 'tree' })
  tree.appendChild(el('div', { class: 'tree-title', text: lang === 'zh' ? '学科树' : 'Subject tree' }))
  const activeNode = activeCardId ? store.byId.get(activeCardId)?.node : undefined
  const activePath = new Set<string>()
  if (activeNode) {
    let cur = TAXONOMY.find((n) => n.id === activeNode)
    while (cur) { activePath.add(cur.id); cur = cur.parent ? TAXONOMY.find((n) => n.id === cur!.parent) : undefined }
  }
  for (const node of TAXONOMY.filter((n) => !n.parent)) {
    const count = store.cardsUnder(node.id).length
    const block = el('div', { class: 'tree-block' })
    const a = el('a', {
      class: `tree-l1${activePath.has(node.id) ? ' active' : ''}`,
      href: `#/browse?sys=subject&id=${node.id}`,
    })
    a.appendChild(el('span', { text: node.name[lang] }))
    a.appendChild(el('span', { class: 'tree-c', text: String(count) }))
    block.appendChild(a)
    for (const ch of TAXONOMY.filter((n) => n.parent === node.id)) {
      const cn = store.cardsUnder(ch.id).length
      const ca = el('a', {
        class: `tree-l2${activePath.has(ch.id) ? ' active' : ''}`,
        href: `#/browse?sys=subject&id=${ch.id}`,
      })
      ca.appendChild(el('span', { text: ch.name[lang] }))
      ca.appendChild(el('span', { class: 'tree-c', text: String(cn) }))
      block.appendChild(ca)
    }
    tree.appendChild(block)
  }
  sideHost.appendChild(tree)
}

function parseHash(): void {
  const h = location.hash.replace(/^#\/?/, '')
  const [pathPart, queryPart] = h.split('?')
  const params = new URLSearchParams(queryPart ?? '')
  const seg = pathPart.split('/').filter(Boolean)
  renderSidebar(seg[0] === 'card' ? seg[1] : undefined)

  const q = params.get('q') ?? undefined
  if (seg[0] === 'card' && seg[1]) {
    const card = store.byId.get(seg[1])
    if (!card) { notFound(seg[1]); return }
    if (q) searchInput.value = q
    document.title = `${card.name[getLang()]} · ${ui('siteTitle')}`
    renderCard(card, viewHost)
    wireSymbols()
    return
  }
  if (seg[0] === 'browse') {
    if (q) searchInput.value = q
    const st: BrowseState = {
      sys: params.get('sys') ?? 'subject',
      id: params.get('id') ?? undefined,
      q,
      aud: params.get('aud') ?? undefined,
      cmp: params.get('cmp') ?? undefined,
      sort: (params.get('sort') as BrowseState['sort']) ?? 'subject',
    }
    document.title = `${ui('navTree')} · ${ui('siteTitle')}`
    renderBrowse(st, viewHost)
    return
  }
  if (seg[0] === 'bubble') {
    document.title = `${langLabelBubble()} · ${ui('siteTitle')}`
    renderBubble(viewHost, {
      group: params.get('group') ?? 'subject',
      size: (params.get('size') as 'centrality') ?? 'centrality',
    })
    return
  }
  if (seg[0] === 'tree') {
    document.title = `${ui('navGraph')} · ${ui('siteTitle')}`
    renderGenealogy(viewHost, seg[1] ? 'pedigree' : 'graph', seg[1])
    return
  }
  if (seg[0] === 'about') {
    document.title = `${ui('navAbout')} · ${ui('siteTitle')}`
    renderAbout(viewHost)
    return
  }
  document.title = `${ui('siteTitle')} · ${ui('siteSubtitle')}`
  renderHome(viewHost)
}

function notFound(id: string): void {
  clear(viewHost)
  const lang = getLang()
  viewHost.appendChild(el('div', { class: 'empty' }, [
    el('p', { text: lang === 'zh' ? `未找到公式：${id}` : `Formula not found: ${id}` }),
    el('a', { href: '#/browse', text: ui('back') }),
  ]))
}

/** 公式符号 ↔ 符号表 ↔ 图中标记 的三向高亮 */
function wireSymbols(): void {
  const rows = viewHost.querySelectorAll<HTMLElement>('.sym-row')
  const marks = viewHost.querySelectorAll<HTMLElement>('.gsym')
  const set = (n: HTMLElement, on: boolean) => n.classList.toggle('hl', on)
  rows.forEach((row) => {
    const idx = row.dataset.sym
    row.addEventListener('mouseenter', () => {
      set(row, true)
      marks.forEach((m) => { if (m.classList.contains(`gsym-${idx}`)) m.classList.add('hl') })
    })
    row.addEventListener('mouseleave', () => {
      set(row, false)
      marks.forEach((m) => m.classList.remove('hl'))
    })
  })
  marks.forEach((m) => {
    const cls = [...m.classList].find((c) => c.startsWith('gsym-'))
    if (!cls) return
    const idx = cls.slice(5)
    m.addEventListener('mouseenter', () => {
      m.classList.add('hl')
      rows.forEach((r) => { if (r.dataset.sym === idx) r.classList.add('hl') })
    })
    m.addEventListener('mouseleave', () => {
      m.classList.remove('hl')
      rows.forEach((r) => r.classList.remove('hl'))
    })
  })
}

function boot(): void {
  buildShell()
  parseHash()
  window.addEventListener('hashchange', () => {
    parseHash()
    window.scrollTo({ top: 0 })
  })
  onLangChange(() => {
    document.documentElement.lang = getLang() === 'zh' ? 'zh-CN' : 'en'
    buildShell()
    searchInput.value = ''
    parseHash()
  })
}

boot()
