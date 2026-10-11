/**
 * 一键启动脚本（跨平台）
 *
 *   node scripts/start.mjs            构建 → 起服务 → 自动打开浏览器
 *   node scripts/start.mjs 8080       指定端口
 *   node scripts/start.mjs --no-open  不自动打开浏览器
 *   node scripts/start.mjs --no-build 跳过编译（直接用上次的产物）
 *   node scripts/start.mjs --check    启动前跑一遍内容自检
 *
 * Windows 用户直接双击 start.bat 即可。
 */
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')
process.chdir(root)

const argv = process.argv.slice(2)
const portArg = argv.find((a) => /^\d{2,5}$/.test(a))
const preferred = Number(portArg || process.env.PORT || 5173)
const noOpen = argv.includes('--no-open')
const noBuild = argv.includes('--no-build')
const doCheck = argv.includes('--check')
const isWin = process.platform === 'win32'

const C = {
  reset: '[0m',
  dim: '[2m',
  bold: '[1m',
  green: '[32m',
  yellow: '[33m',
  red: '[31m',
  cyan: '[36m',
}
const ok = (s) => console.log(`${C.green}✓${C.reset} ${s}`)
const info = (s) => console.log(`${C.cyan}›${C.reset} ${s}`)
const warn = (s) => console.log(`${C.yellow}!${C.reset} ${s}`)
const bad = (s) => console.log(`${C.red}✗${C.reset} ${s}`)

/** 同步跑一个子进程，返回退出码 */
function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: isWin,
    cwd: root,
    ...opts,
  })
  if (r.error) throw r.error
  return r.status ?? 1
}

/** 用 node 直接跑，避免依赖 npx / shell 解析 */
function runNode(script, args = []) {
  return run(process.execPath, [path.join(root, script), ...args])
}

function ensureDeps() {
  if (fs.existsSync(path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'))) return
  info('首次运行，安装依赖 (typescript + katex) ...')
  const code = run(isWin ? 'npm.cmd' : 'npm', ['install', '--no-audit', '--no-fund'])
  if (code !== 0) {
    bad('依赖安装失败，请手动执行：npm install')
    process.exit(1)
  }
  ok('依赖安装完成')
}

function build() {
  info('编译 TypeScript → 原生 ES 模块 ...')
  let code = runNode('node_modules/typescript/bin/tsc')
  if (code !== 0) {
    bad('编译失败，请修正类型错误后再启动')
    process.exit(1)
  }
  code = runNode('scripts/copy-assets.mjs')
  if (code !== 0) {
    bad('静态资源同步失败')
    process.exit(1)
  }
  ok(`编译完成 ${C.dim}(assets/js + assets/vendor/katex)${C.reset}`)
}

function openBrowser(target) {
  if (noOpen) return
  try {
    const cmd = isWin ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open'
    const args = isWin ? ['/c', 'start', '', target] : [target]
    spawn(cmd, args, { stdio: 'ignore', detached: true }).unref()
    ok('已在默认浏览器中打开')
  } catch {
    warn('无法自动打开浏览器，请手动访问下面的地址')
  }
}

// ---------- 主流程 ----------
console.log(`\n${C.bold}地球物理公式大全${C.reset} ${C.dim}— 推导与可视化${C.reset}\n`)

ensureDeps()

if (doCheck) {
  info('内容自检 ...')
  const code = runNode('scripts/selfcheck.mjs')
  if (code !== 0) bad('自检未通过（不阻止启动）')
}

if (noBuild) {
  if (!fs.existsSync(path.join(root, 'assets', 'js', 'main.js'))) {
    warn('未找到编译产物，改为执行完整构建')
    build()
  } else {
    ok(`跳过编译 ${C.dim}(使用现有 assets/)${C.reset}`)
  }
} else {
  build()
}

const { startServer } = await import('./serve.mjs')
let served
try {
  served = await startServer(preferred)
} catch (e) {
  bad('启动服务器失败：' + String(e))
  process.exit(1)
}

if (served.port !== preferred) warn(`端口 ${preferred} 被占用，已改用 ${served.port}`)

console.log('')
console.log(`  ${C.bold}本地地址${C.reset}  ${C.cyan}${served.url}${C.reset}`)
console.log(`  ${C.dim}站点目录  ${root}${C.reset}`)
console.log(`  ${C.dim}按 Ctrl+C 停止${C.reset}`)
console.log('')

openBrowser(served.url)

process.on('SIGINT', () => {
  console.log(`\n${C.dim}已停止${C.reset}`)
  served.server.close(() => process.exit(0))
  setTimeout(() => process.exit(0), 300)
})
