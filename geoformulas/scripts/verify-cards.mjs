/**
 * 单卡片只读校验器 —— 供并行写作的子代理安全自检，不运行 gen-index、不写 assets。
 *
 * 用法：
 *   node scripts/verify-cards.mjs <文件或目录> ...
 * 例如：
 *   node scripts/verify-cards.mjs src/content/cards/newton-law-1.ts
 *   node scripts/verify-cards.mjs src/content/cards
 *
 * 与 selfcheck 的区别：
 *   - 在内存里用 TypeScript 转译单张卡片，临时文件写到 node_modules/.verify-tmp，
 *     不生成/覆盖 src/content/index.ts，不编译全站，可多进程并发运行。
 *   - links 仅做「告警」（并行批次里跨片引用的卡片可能尚未写好），最终以
 *     npm run check（selfcheck）为准；LaTeX / node / tags / viz 有限性为硬错误。
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import ts from 'typescript'
import katex from 'katex'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CARDS_DIR = path.join(ROOT, 'src', 'content', 'cards')
const TMP = fs.mkdtempSync(path.join(ROOT, 'node_modules', '.verify-tmp-'))
const TYPES_URL = pathToFileURL(path.join(ROOT, 'assets', 'js', 'core', 'types.js')).href
const TAXO_URL = pathToFileURL(path.join(ROOT, 'assets', 'js', 'taxonomy.js')).href

const TEX_OPTS = { throwOnError: false, strict: false, trust: true }
function checkTex(errors, id, kind, latex) {
  let html
  try {
    html = katex.renderToString(latex, TEX_OPTS)
  } catch (e) {
    errors.push(`[LaTeX] ${id} :: ${kind} :: 抛异常 :: ${String(e).slice(0, 120)}`)
    return
  }
  if (html.includes('katex-error')) errors.push(`[LaTeX] ${id} :: ${kind} :: ${latex.slice(0, 70)}`)
}

/** 收集入参里的全部卡片文件 */
function collect(args) {
  const out = []
  for (const a of args) {
    const p = path.resolve(ROOT, a)
    if (!fs.existsSync(p)) { console.warn('路径不存在，跳过: ' + p); continue }
    const st = fs.statSync(p)
    if (st.isDirectory()) {
      for (const f of fs.readdirSync(p).filter((x) => x.endsWith('.ts')).sort()) out.push(path.join(p, f))
    } else if (p.endsWith('.ts')) out.push(p)
  }
  return out
}

/** 转译并加载单张卡片，返回 default 模块对象 */
async function loadCard(file) {
  let src = fs.readFileSync(file, 'utf8')
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  })
  let js = out.outputText
  // 把对 types.js 的相对引用换成已编译产物的绝对 file URL（运行时只需要 t/pick）
  js = js.replace(/from\s+['"][^'"]*core\/types\.js['"]/g, `from '${TYPES_URL}'`)
  const tmpFile = path.join(TMP, path.basename(file).replace(/\.ts$/, '') + '-' + Math.random().toString(36).slice(2, 8) + '.mjs')
  fs.writeFileSync(tmpFile, js, 'utf8')
  const mod = await import(pathToFileURL(tmpFile).href)
  fs.rmSync(tmpFile, { force: true })
  return mod.default
}

/** 扫描 cards 目录里全部 id（含正在并行写作的新文件），用于 links 告警 */
function allKnownIds() {
  const set = new Set()
  for (const f of fs.readdirSync(CARDS_DIR).filter((x) => x.endsWith('.ts'))) {
    const m = fs.readFileSync(path.join(CARDS_DIR, f), 'utf8').match(/\bid:\s*'([^']+)'/)
    if (m) set.add(m[1])
  }
  return set
}

async function main() {
  const args = process.argv.slice(2)
  const files = collect(args)
  if (!files.length) { console.error('未找到任何 .ts 卡片文件'); process.exit(2) }

  const { TAXONOMY, SYSTEMS } = await import(TAXO_URL)
  const nodeIds = new Set(TAXONOMY.map((n) => n.id))
  const sysItemIds = new Map(SYSTEMS.map((s) => [s.id, new Set(s.items.map((i) => i.id))]))
  const known = allKnownIds()

  const errors = []
  const warnings = []
  let vizCount = 0
  let stepCount = 0

  for (const file of files) {
    let c
    try {
      c = await loadCard(file)
    } catch (e) {
      errors.push(`[加载] ${path.basename(file)} :: ${String(e).slice(0, 140)}`)
      continue
    }
    if (!c || !c.id) { errors.push(`[结构] ${path.basename(file)} 无 default 卡片或无 id`); continue }
    const expectId = path.basename(file, '.ts')
    if (c.id !== expectId) errors.push(`[id] ${c.id} 与文件名 ${expectId} 不一致`)

    if (!nodeIds.has(c.node)) errors.push(`[node] ${c.id} 学科节点未定义: ${c.node}`)
    for (const key of ['math', 'method', 'quantity']) {
      const allowed = sysItemIds.get(key)
      for (const v of c.tags?.[key] ?? []) if (!allowed.has(v)) errors.push(`[tag] ${c.id} ${key}=${v} 未定义`)
    }

    checkTex(errors, c.id, 'statement.main', c.statement?.main ?? '')
    for (const v of c.statement?.variants ?? []) checkTex(errors, c.id, 'variant', v.latex)
    for (const s of c.symbols ?? []) checkTex(errors, c.id, `symbol(${s.sym})`, s.sym)
    for (const st of c.derivation ?? []) {
      checkTex(errors, c.id, `step${st.n}`, st.latex)
      if (!st.title?.zh || !st.title?.en) warnings.push(`[缺失] ${c.id} 第 ${st.n} 步缺双语标题`)
    }
    stepCount += c.derivation?.length ?? 0
    for (const n of c.numerics ?? []) checkTex(errors, c.id, 'numeric', n.snippet)

    for (const g of [c.links?.upstream, c.links?.downstream, c.links?.seealso]) {
      for (const l of g ?? []) if (!known.has(l.id)) warnings.push(`[link?] ${c.id} → 当前目录尚不存在 ${l.id}（跨片引用请确认）`)
    }

    for (const v of c.viz ?? []) {
      vizCount++
      const p = {}
      for (const ct of v.controls ?? []) p[ct.id] = ct.value ?? ct.min
      let series
      try { series = v.compute(p) } catch (e) { errors.push(`[viz] ${c.id}/${v.id} compute 抛异常 :: ${String(e).slice(0, 120)}`); continue }
      if (!Array.isArray(series)) { errors.push(`[viz] ${c.id}/${v.id} 未返回数组`); continue }
      for (const s of series) for (const pt of s.points ?? []) for (const val of pt) {
        if (typeof val === 'number' && !Number.isFinite(val)) errors.push(`[viz] ${c.id}/${v.id} 出现非有限值`)
      }
    }
  }

  console.log(`校验卡片: ${files.length} 张 · 可视化 ${vizCount} 个 · 推导步 ${stepCount} 步`)
  if (warnings.length) { console.log(`告警 ${warnings.length} 条:`); for (const w of warnings) console.log('  ' + w) }
  if (errors.length) {
    console.error(`错误 ${errors.length} 条:`); for (const e of errors) console.error('  ' + e)
    process.exit(1)
  }
  console.log('单卡校验通过 ✓（最终仍需 npm run check）')
}

try { await main() } finally { fs.rmSync(TMP, { recursive: true, force: true }) }
void os
