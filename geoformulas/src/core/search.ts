import type { FormulaCard, Lang } from './types.js'
import { pick } from './types.js'

/** 检索字段权重：标题 > 符号 > 别名 > 正文 */
const W_NAME = 8
const W_ALIAS = 6
const W_SYMBOL = 5
const W_NODE = 3
const W_MEANING = 3
const W_BODY = 1

type Field = { weight: number; text: string; lang: Lang }

export interface SearchDoc {
  id: string
  card: FormulaCard
  /** 用于展示的标题 */
  name: { zh: string; en: string }
  nodePath: string[]
}

export interface SearchHit {
  id: string
  card: FormulaCard
  score: number
}

export interface Filters {
  node?: string
  audience?: string
  complete?: string
}

const CJK = /[\u3400-\u9FFF\uF900-\uFAFF]/

/** 分词：拉丁词 + CJK 单字 + CJK 二元组。同时保留去下划线变体，便于搜 "vp" 命中 "v_p" */
export function tokenize(text: string): string[] {
  const out: string[] = []
  const lower = text.toLowerCase()
  const chunks = lower.split(/[^\p{L}\p{N}_\\]+/u)
  for (const raw of chunks) {
    if (!raw) continue
    if (CJK.test(raw)) {
      for (let i = 0; i < raw.length; i++) {
        out.push(raw[i])
        if (i + 1 < raw.length) out.push(raw.slice(i, i + 2))
      }
      continue
    }
    const clean = raw.replace(/\\/g, '')
    if (!clean) continue
    out.push(clean)
    if (clean.includes('_')) out.push(clean.replace(/_/g, ''))
  }
  return out
}

export class SearchIndex {
  private docs: SearchDoc[]
  /** term -> Map<docIdx, weight> */
  private postings = new Map<string, Map<number, number>>()

  constructor(docs: SearchDoc[]) {
    this.docs = docs
    this.build()
  }

  private build(): void {
    this.docs.forEach((doc, di) => {
      const fields: Field[] = []
      const push = (weight: number, zh: string | undefined, en?: string | undefined) => {
        if (zh) fields.push({ weight, text: zh, lang: 'zh' })
        if (en) fields.push({ weight, text: en, lang: 'en' })
      }

      push(W_NAME, doc.name.zh, doc.name.en)
      for (const a of doc.card.aliases?.zh ?? []) push(W_ALIAS, a)
      for (const a of doc.card.aliases?.en ?? []) push(W_ALIAS, a)
      push(W_NODE, doc.nodePath.join(' '))

      for (const s of doc.card.symbols) {
        push(W_SYMBOL, s.sym, s.sym)
        push(W_SYMBOL, s.name.zh, s.name.en)
        if (s.unit) push(W_SYMBOL, s.unit, s.unit)
      }
      push(W_MEANING, doc.card.meaning?.zh, doc.card.meaning?.en)
      for (const v of doc.card.statement.variants ?? []) push(W_BODY, v.name.zh, v.name.en)
      for (const st of doc.card.derivation ?? []) {
        push(W_BODY, st.title.zh, st.title.en)
        push(W_BODY, st.note?.zh, st.note?.en)
      }
      for (const c of doc.card.conditions?.applies ?? []) push(W_BODY, c.zh, c.en)

      let sum = 0
      for (const f of fields) {
        // LaTeX 命令名里去斜杠，便于用 "\fourier" 或 "fourier" 都能搜到
        const terms = tokenize(f.text.replace(/\\([A-Za-z]+)/g, '$1'))
        const w = f.weight
        for (const t of terms) {
          if (t.length > 40) continue
          let m = this.postings.get(t)
          if (!m) { m = new Map(); this.postings.set(t, m) }
          const prev = m.get(di) ?? 0
          m.set(di, prev + w)
          sum += w
        }
      }
      void sum
    })
  }

  /** 返回符合 facet 条件的文档下标集合 */
  private candidates(f: Filters, nodeOf: (id: string) => string[]): Set<number> {
    const set = new Set<number>()
    this.docs.forEach((d, i) => {
      if (f.audience && d.card.audience !== f.audience) return
      if (f.complete && d.card.complete !== f.complete) return
      const wanted = f.node
      if (wanted) {
        const tree = nodeOf(d.id)
        if (!tree.some((n) => n === wanted || n.startsWith(wanted))) return
      }
      set.add(i)
    })
    return set
  }

  search(query: string, f: Filters, nodeOf: (id: string) => string[]): SearchHit[] {
    const cands = this.candidates(f, nodeOf)
    const q = query.trim()
    if (!q) {
      return [...cands].map((i) => ({ id: this.docs[i].id, card: this.docs[i].card, score: 0 }))
    }
    const qTerms = dedupe(tokenize(q))
    const N = this.docs.length
    const scores = new Map<number, number>()

    for (const term of qTerms) {
      const post = this.postings.get(term)
      if (!post) continue
      const df = post.size
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5))
      for (const [di, tf] of post) {
        if (!cands.has(di)) continue
        const norm = tf / (tf + 1.6)
        const prev = scores.get(di) ?? 0
        scores.set(di, prev + idf * (0.6 + 1.4 * norm))
      }
    }
    // 短语完全匹配加权：标题里出现的直接顶上去
    const ql = q.toLowerCase()
    let maxScore = 0
    for (const v of scores.values()) maxScore = Math.max(maxScore, v)
    for (const i of cands) {
      const d = this.docs[i]
      const titleHit =
        d.name.zh.toLowerCase().includes(ql) || d.name.en.toLowerCase().includes(ql) ||
        (d.card.symbols.some((s) => s.sym.toLowerCase() === ql))
      if (titleHit) scores.set(i, (scores.get(i) ?? 0) + Math.max(maxScore, 1) * 1.2)
    }

    const hits: SearchHit[] = []
    for (const [i, score] of scores) {
      if (score <= 0) continue
      hits.push({ id: this.docs[i].id, card: this.docs[i].card, score })
    }
    hits.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    return hits
  }

  get size(): number {
    return this.docs.length
  }
}

function dedupe(a: string[]): string[] {
  const s = new Set<string>()
  for (const x of a) if (x.length > 0) s.add(x)
  return [...s]
}

export function pickText(v: { zh: string; en: string } | undefined, lang: Lang): string {
  return v ? pick(v, lang) : ''
}
