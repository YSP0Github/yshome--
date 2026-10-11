/**
 * 把 node_modules/katex/dist 中浏览器需要的部分同步到 assets/vendor/katex。
 *
 * 设计原则：**只增不改不删** —— 目标文件已存在且大小一致就跳过。
 * 这样脚本可以反复执行、不会触发任何删除操作（也避免在受管控环境被安全策略拦截）。
 * 若升级了 katex 版本，请手动删除 assets/vendor/katex 目录后重跑本脚本。
 */
import { readdir, mkdir, stat, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const rootDir = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const src = path.join(rootDir, 'node_modules', 'katex', 'dist')
const dest = path.join(rootDir, 'assets', 'vendor', 'katex')

const wanted = ['katex.min.js', 'katex.min.css', 'fonts']

let created = 0
let skipped = 0

async function copyTree(from, to) {
  const st = await stat(from)
  if (st.isDirectory()) {
    await mkdir(to, { recursive: true })
    for (const name of await readdir(from)) {
      await copyTree(path.join(from, name), path.join(to, name))
    }
    return
  }
  if (existsSync(to)) {
    const dst = await stat(to).catch(() => null)
    if (dst && dst.size === st.size) {
      skipped++
      return
    }
    // 大小不一致：属于 katex 版本升级的情况，提示用户手动清理后重试
    throw new Error(
      `目标文件已存在但大小不一致：${path.relative(rootDir, to)}\n` +
        `请手动删除 ${path.relative(rootDir, dest)} 目录后重新运行 npm run build`,
    )
  }
  await mkdir(path.dirname(to), { recursive: true })
  await copyFile(from, to)
  created++
}

async function main() {
  if (!existsSync(src)) {
    console.error('[copy-assets] katex 未安装，请先运行 npm install')
    process.exit(1)
  }
  await mkdir(dest, { recursive: true })
  for (const name of wanted) {
    await copyTree(path.join(src, name), path.join(dest, name))
  }
  const total = (await countFiles(dest)) || 0
  console.log(
    `[copy-assets] KaTeX 已就绪 → assets/vendor/katex （${total} 个文件，新增 ${created}，跳过 ${skipped}）`,
  )
  console.log('[copy-assets] assets/ 与 index.html 一起即可部署。')
}

async function countFiles(dir) {
  let n = 0
  for (const name of await readdir(dir, { withFileTypes: true })) {
    if (name.isDirectory()) n += await countFiles(path.join(dir, name.name))
    else n++
  }
  return n
}

main().catch((e) => {
  console.error(e.message ?? e)
  process.exit(1)
})
