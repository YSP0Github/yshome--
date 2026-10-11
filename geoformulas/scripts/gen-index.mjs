/**
 * 扫描 src/content/cards/*.ts，自动生成 src/content/index.ts。
 *
 * 目的：让「新增一条公式」只需新建一个文件 —— 不必再手工维护注册表，
 * 从而支持数百条公式的批量增删重排。
 *
 * 约定：
 *   - 文件名即模块名，必须 kebab-case，且与卡片 id 一致（不一致时以文件内的 id 为准）
 *   - 每个文件必须 `export default <卡片>`
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'

const rootDir = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const cardsDir = path.join(rootDir, 'src', 'content', 'cards')
const outFile = path.join(rootDir, 'src', 'content', 'index.ts')

const toCamel = (s) =>
  s.replace(/[-_.]+(\w)/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/[^A-Za-z0-9]/g, '')

const files = (await readdir(cardsDir)).filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'))
files.sort()

const entries = []
for (const f of files) {
  const src = await readFile(path.join(cardsDir, f), 'utf8')
  const mod = f.replace(/\.ts$/, '')
  // 卡片 id：文件内顶层 `  id: 'xxx'`（viz 的 id 缩进更深，不会误匹配）
  const m = src.match(/^ {2}id:\s*'([^']+)'/m)
  const id = m ? m[1] : mod
  const dm = src.match(/export default\s+([A-Za-z0-9_$]+)/)
  const local = dm ? dm[1] : toCamel(mod)
  if (!dm) {
    console.warn(`[gen-index] 警告：${f} 缺少 export default，已按 ${local} 推断`)
  }
  entries.push({ mod, id, local })
}

const seen = new Map()
for (const e of entries) {
  if (seen.has(e.id)) console.error(`[gen-index] 错误：id 重复 → ${e.id}（${seen.get(e.id)} 与 ${e.mod}）`)
  seen.set(e.id, e.mod)
  if (e.id !== e.mod) console.warn(`[gen-index] 警告：文件名 ${e.mod} 与 id ${e.id} 不一致`)
}

const banner = `/**
 * 本文件由 scripts/gen-index.mjs 自动生成，请勿手工编辑。
 * 新增一条公式：在 src/content/cards/ 下新建 <id>.ts 并 export default，
 * 然后运行 npm run build（或 npm run gen-index）即可。
 *
 * 当前共 ${entries.length} 条。
 */
`

const imports = entries.map((e) => `import ${e.local} from './cards/${e.mod}.js'`).join('\n')
const array = entries.map((e) => `  ${e.local},`).join('\n')
const map = entries.map((e) => `  '${e.id}': ${e.local},`).join('\n')

const out = `${banner}
import type { FormulaCard } from '../core/types.js'

${imports}

/** 全站公式注册表（自动生成）。 */
export const ALL_CARDS: FormulaCard[] = [
${array}
]

/** id → 卡片 的索引（自动生成）。 */
export const CARD_MODULES: Record<string, FormulaCard> = {
${map}
}
`

await writeFile(outFile, out, 'utf8')
console.log(`[gen-index] 已生成 src/content/index.ts —— ${entries.length} 条公式`)
