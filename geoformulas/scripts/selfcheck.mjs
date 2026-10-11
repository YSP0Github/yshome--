/**
 * 内容自检：不依赖浏览器，直接在 Node 里校验全部公式模块。
 *   npm run check
 * 检查项：
 *   1. 全部 LaTeX 能否被 KaTeX 正常渲染（含主公式、变体、推导步、算例）
 *   2. 依赖引用（upstream/downstream/seealso）是否指向存在的公式
 *   3. 标签值是否在已定义的分类体系内
 *   4. 学科节点与读者层级是否合法
 *   5. 每条可视化的 compute() 在默认参数下是否返回有限数值
 */
import katex from 'katex'
import { ALL_CARDS } from '../assets/js/content/index.js'
import { TAXONOMY, SYSTEMS } from '../assets/js/taxonomy.js'

const errors = []
const warnings = []

const TEX_OPTS = { throwOnError: false, strict: false, trust: true }
function checkTex(id, kind, latex) {
  let html
  try {
    html = katex.renderToString(latex, TEX_OPTS)
  } catch (e) {
    errors.push(`[LaTeX] ${id} :: ${kind} :: 抛异常 :: ${String(e).slice(0, 120)}`)
    return
  }
  if (html.includes('katex-error')) errors.push(`[LaTeX] ${id} :: ${kind} :: ${latex.slice(0, 70)}`)
}

const ids = new Set()
const nodeIds = new Set(TAXONOMY.map((n) => n.id))
const sysItemIds = new Map(SYSTEMS.map((s) => [s.id, new Set(s.items.map((i) => i.id))]))
const audiences = new Set(['highschool', 'bachelor', 'master', 'phd'])
const completes = new Set(['L1', 'L2', 'L3', 'L4'])

for (const c of ALL_CARDS) {
  if (ids.has(c.id)) errors.push(`[id] 重复: ${c.id}`)
  ids.add(c.id)

  if (!nodeIds.has(c.node)) errors.push(`[node] ${c.id} 学科节点未定义: ${c.node}`)
  if (!audiences.has(c.audience)) errors.push(`[audience] ${c.id} 非法: ${c.audience}`)
  if (!completes.has(c.complete)) errors.push(`[complete] ${c.id} 非法: ${c.complete}`)

  for (const key of ['math', 'method', 'quantity']) {
    const vals = c.tags?.[key] ?? []
    const allowed = sysItemIds.get(key)
    for (const v of vals) if (!allowed.has(v)) errors.push(`[tag] ${c.id} ${key}=${v} 未定义`)
  }

  checkTex(c.id, 'statement.main', c.statement.main)
  for (const v of c.statement.variants ?? []) checkTex(c.id, 'variant', v.latex)
  for (const s of c.symbols) checkTex(c.id, `symbol(${s.sym})`, s.sym)
  for (const st of c.derivation ?? []) {
    checkTex(c.id, `step${st.n}`, st.latex)
    if (!st.title?.zh || !st.title?.en) warnings.push(`[缺失] ${c.id} 第 ${st.n} 步缺少标题`)
  }
  for (const n of c.numerics ?? []) checkTex(c.id, 'numeric', n.snippet)

  const groups = [c.links?.upstream, c.links?.downstream, c.links?.seealso]
  const allKnown = new Set(ALL_CARDS.map((x) => x.id))
  for (const g of groups) for (const l of g ?? []) if (!allKnown.has(l.id)) errors.push(`[link] ${c.id} → 不存在的公式 ${l.id}`)

  for (const v of c.viz ?? []) {
    const ctl = v.controls ?? []
    const p = {}
    for (const ct of ctl) p[ct.id] = ct.value ?? ct.min
    let series
    try {
      series = v.compute(p)
    } catch (e) {
      errors.push(`[viz] ${c.id}/${v.id} compute 抛异常 :: ${String(e).slice(0, 120)}`)
      continue
    }
    if (!Array.isArray(series)) { errors.push(`[viz] ${c.id}/${v.id} 未返回数组`); continue }
    let nums = 0
    for (const s of series) {
      for (const pt of s.points ?? []) {
        for (const val of pt) {
          if (typeof val === 'number') { nums++; if (!Number.isFinite(val)) errors.push(`[viz] ${c.id}/${v.id} 出现非有限值`) }
        }
      }
    }
    if (nums === 0) warnings.push(`[viz] ${c.id}/${v.id} 默认参数下无数据点`)
  }
}

console.log(`公式模块: ${ALL_CARDS.length} 条`)
console.log(`依赖边: ${ALL_CARDS.reduce((a, c) => a + (c.links?.upstream?.length ?? 0) + (c.links?.downstream?.length ?? 0), 0)} 条`)
console.log(`可视化: ${ALL_CARDS.reduce((a, c) => a + (c.viz?.length ?? 0), 0)} 个`)
console.log(`推导步: ${ALL_CARDS.reduce((a, c) => a + (c.derivation?.length ?? 0), 0)} 步`)
console.log(`---`)
if (warnings.length) {
  console.log(`警告 ${warnings.length} 条:`)
  for (const w of warnings.slice(0, 20)) console.log('  ' + w)
}
if (errors.length) {
  console.error(`错误 ${errors.length} 条:`)
  for (const e of errors.slice(0, 40)) console.error('  ' + e)
  process.exit(1)
}
console.log('自检通过 ✓')
