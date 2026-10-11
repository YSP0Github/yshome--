import { ALL_CARDS } from '../content/index.js'
import type { FormulaCard, Lang, BText } from './types.js'
import { pick } from './types.js'
import { TAXONOMY, SYSTEMS } from '../taxonomy.js'

export interface Edge {
  from: string
  to: string
}

/** 一条公式所属学科路径，例如 S1.2 → ['S1', 'S1.2'] */
export function nodePath(card: FormulaCard): string[] {
  const out: string[] = []
  let cur: Taxo | undefined = TAXO_BY_ID.get(card.node)
  while (cur) {
    out.unshift(cur.id)
    cur = cur.parent ? TAXO_BY_ID.get(cur.parent) : undefined
  }
  return out
}

type Taxo = (typeof TAXONOMY)[number]
const TAXO_BY_ID = new Map<string, Taxo>(TAXONOMY.map((n) => [n.id, n]))

class Store {
  readonly cards: FormulaCard[] = ALL_CARDS
  readonly byId = new Map<string, FormulaCard>()
  /** 学科节点 → 直接归属的卡片 */
  readonly directByNode = new Map<string, FormulaCard[]>()
  readonly edges: Edge[] = []
  /** 每个维度体系的类目 → 卡片列表 */
  readonly byFacet = new Map<string, Map<string, FormulaCard[]>>()
  /** 数据完整性问题，开发期用于自检 */
  readonly issues: string[] = []

  constructor() {
    for (const c of this.cards) {
      if (this.byId.has(c.id)) this.issues.push(`重复 id: ${c.id}`)
      this.byId.set(c.id, c)
      const list = this.directByNode.get(c.node) ?? []
      list.push(c)
      this.directByNode.set(c.node, list)
    }
    this.validateLinks()
    this.buildFacets()
  }

  private validateLinks(): void {
    const seen = new Set<string>()
    const add = (from: string, to: string) => {
      const key = `${from}->${to}`
      if (seen.has(key)) return
      seen.add(key)
      this.edges.push({ from, to })
    }
    for (const c of this.cards) {
      const groups = [c.links?.upstream, c.links?.downstream, c.links?.seealso]
      for (const g of groups) {
        for (const l of g ?? []) {
          if (!this.byId.has(l.id)) {
            this.issues.push(`${c.id} 引用了不存在的公式: ${l.id}`)
            continue
          }
        }
      }
      for (const u of c.links?.upstream ?? []) if (this.byId.has(u.id)) add(u.id, c.id)
      for (const d of c.links?.downstream ?? []) if (this.byId.has(d.id)) add(c.id, d.id)
    }
  }

  private buildFacets(): void {
    for (const sys of SYSTEMS) {
      const map = new Map<string, FormulaCard[]>()
      if (sys.id === 'subject') {
        // 学科树有层级：一个类目下应统计「它自身 + 全部后代节点」的卡片
        for (const node of sys.items) {
          const ids = descendantNodes(node.id)
          map.set(node.id, this.cards.filter((c) => ids.includes(c.node)))
        }
      } else {
        for (const item of sys.items) map.set(item.id, [])
        for (const c of this.cards) {
          const vals = (c.tags as Record<string, string[] | undefined>)[sys.id] ?? []
          for (const v of vals) {
            if (!map.has(v)) {
              this.issues.push(`${c.id} 使用了未定义的类目 ${sys.id}=${v}`)
              continue
            }
            map.get(v)?.push(c)
          }
        }
      }
      this.byFacet.set(sys.id, map)
    }
  }

  /** 递归收集某学科节点及其全部后代节点下的卡片 */
  cardsUnder(nodeId: string): FormulaCard[] {
    const ids = descendantNodes(nodeId)
    return this.cards.filter((c) => ids.includes(c.node))
  }

  /** 依赖深度：最长上游路径长度（惰性计算，必须在 links 校验之后） */
  rankOf(id: string): number {
    return this.rankCache().get(id) ?? 0
  }

  private rankMemo: Map<string, number> | null = null
  private rankCache(): Map<string, number> {
    if (!this.rankMemo) this.rankMemo = computeRanks(this.cards, this.edges)
    return this.rankMemo
  }

  /** 每个 ID 的邻居 */
  neighbours(id: string): { up: FormulaCard[]; down: FormulaCard[] } {
    const c = this.byId.get(id)
    const up = (c?.links?.upstream ?? []).map((l) => this.byId.get(l.id)).filter(isCard)
    const down = (c?.links?.downstream ?? []).map((l) => this.byId.get(l.id)).filter(isCard)
    return { up, down }
  }

  /** 递归回溯全部祖先（用于系谱图的「溯祖」视图） */
  ancestors(id: string, maxDepth = 6): Map<string, number> {
    const out = new Map<string, number>()
    const walk = (cur: string, depth: number) => {
      if (depth > maxDepth) return
      for (const e of this.edges) {
        if (e.to !== cur) continue
        const prev = out.get(e.from)
        if (prev === undefined || prev < depth) {
          out.set(e.from, depth)
          walk(e.from, depth + 1)
        }
      }
    }
    walk(id, 0)
    return out
  }

  descendants(id: string, maxDepth = 6): Map<string, number> {
    const out = new Map<string, number>()
    const walk = (cur: string, depth: number) => {
      if (depth > maxDepth) return
      for (const e of this.edges) {
        if (e.from !== cur) continue
        const prev = out.get(e.to)
        if (prev === undefined || prev < depth) {
          out.set(e.to, depth)
          walk(e.to, depth + 1)
        }
      }
    }
    walk(id, 0)
    return out
  }

  /** 「被依赖次数」——用于气泡图的半径、以及「核心公式」排序 */
  centrality(id: string): number {
    let n = 0
    for (const e of this.edges) {
      if (e.to === id) n++
      if (e.from === id) n++
    }
    return n
  }

  searchableDocs() {
    return this.cards.map((c) => ({
      id: c.id,
      card: c,
      name: c.name,
      nodePath: nodePath(c),
    }))
  }
}

function computeRanks(cards: FormulaCard[], edges: Edge[]): Map<string, number> {
  const indeg = new Map<string, string[]>()
  for (const c of cards) indeg.set(c.id, [])
  for (const e of edges) indeg.get(e.to)?.push(e.from)
  const memo = new Map<string, number>()
  const visiting = new Set<string>()
  const rank = (id: string): number => {
    const cached = memo.get(id)
    if (cached !== undefined) return cached
    if (visiting.has(id)) return 0 // 环路保护
    visiting.add(id)
    const ups = indeg.get(id) ?? []
    let r = 0
    for (const u of ups) r = Math.max(r, rank(u) + 1)
    visiting.delete(id)
    memo.set(id, r)
    return r
  }
  for (const c of cards) rank(c.id)
  return memo
}

/** 某学科节点的全部后代节点（含自身） */
function descendantNodes(nodeId: string): string[] {
  const out: string[] = [nodeId]
  let i = 0
  while (i < out.length) {
    for (const n of TAXONOMY) if (n.parent === out[i] && !out.includes(n.id)) out.push(n.id)
    i++
  }
  return out
}

function isCard(c: FormulaCard | undefined): c is FormulaCard {
  return !!c
}

export const store = new Store()

/** 双语取值的便捷函数 */
export function T(v: BText, lang: Lang): string {
  return pick(v, lang)
}
