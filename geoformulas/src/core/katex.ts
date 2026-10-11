import type { Lang, SymbolDef } from './types.js'

const KATEX_BASE = {
  throwOnError: false,
  errorColor: '#cc0000',
  strict: false,
  /** \htmlClass 需要显式 trust */
  trust: true,
  macros: {
    '\\dd': '\\mathrm{d}',
    '\\vb': '\\mathbf{#1}',
    '\\pd': '\\frac{\\partial #1}{\\partial #2}',
    '\\pdd': '\\frac{\\partial^2 #1}{\\partial #2^2}',
  },
}

/** 渲染 LaTeX 为 HTML 字符串。display=true 为行间公式 */
export function tex(src: string, display = false): string {
  try {
    const html = katex.renderToString(src, { ...KATEX_BASE, displayMode: display })
    return `<span class="katex-wrap${display ? ' katex-display' : ''}">${html}</span>`
  } catch {
    return `<code class="tex-fallback">${escapeHtml(src)}</code>`
  }
}

/**
 * 把文中的符号包成带 class 的 KaTeX 节点，用于「公式 ↔ 符号表 ↔ 图形」三向联动。
 * 策略：渲染带 \htmlClass 的版本；若 KaTeX 报错（输出含 katex-error）则回退到原文渲染，
 * 保证即使正则误伤也永远不会出现坏页面。
 */
export function texLinked(src: string, symbols: SymbolDef[], display: boolean): string {
  const plain = () => tex(src, display)
  if (symbols.length === 0) return plain()

  // 长符号优先，避免 v 抢在 v_p 之前被替换
  const sorted = symbols
    .map((s, i) => ({ sym: s.sym.trim(), i }))
    .filter((x) => x.sym.length > 0)
    .sort((a, b) => b.sym.length - a.sym.length)

  let linked = src
  for (const { sym, i } of sorted) {
    const escaped = escapeRegExp(sym)
    // 前面不能是字母、数字、反斜杠或 @（避免命中 \alpha 这类命令名）
    const re = new RegExp(`(?<![A-Za-z0-9\\\\@_^])${escaped}(?![A-Za-z0-9])`, 'g')
    linked = linked.replace(re, `\\htmlClass{gsym gsym-${i}}{${sym}}`)
  }
  if (linked === src) return plain()

  let html: string
  try {
    html = katex.renderToString(linked, { ...KATEX_BASE, displayMode: display })
  } catch {
    return plain()
  }
  if (html.includes('katex-error')) return plain()
  return `<span class="katex-wrap${display ? ' katex-display' : ''}">${html}</span>`
}

/** 全站统一的 LaTeX 兼容性自检，返回渲染失败的表述 */
export function validateLatex(items: Array<{ id: string; kind: string; latex: string }>): string[] {
  const bad: string[] = []
  for (const it of items) {
    let html = ''
    try {
      html = katex.renderToString(it.latex, { ...KATEX_BASE, displayMode: false })
    } catch {
      bad.push(`${it.id} :: ${it.kind} :: ${it.latex.slice(0, 60)}`)
      continue
    }
    if (html.includes('katex-error')) bad.push(`${it.id} :: ${it.kind} :: ${it.latex.slice(0, 60)}`)
  }
  return bad
}

export function stripTex(src: string): string {
  return src
    .replace(/\\[A-Za-z]+/g, ' ')
    .replace(/[{}^_&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const _langNote = undefined as unknown as Lang

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&': return '&amp;'
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '"': return '&quot;'
      default: return '&#39;'
    }
  })
}
