/**
 * 零依赖静态服务器。
 *
 * 独立使用：  node scripts/serve.mjs [port]
 * 作为模块：  const { startServer } = await import('./serve.mjs')
 *
 * 端口被占用时自动向后顺延（最多 50 个）。
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import net from 'node:net'

const rootDir = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
}

export function createStaticServer() {
  return http.createServer((req, res) => {
    const reqPath = decodeURIComponent((req.url || '/').split('?')[0])
    let filePath = path.join(rootDir, reqPath === '/' ? 'index.html' : reqPath)

    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Forbidden')
      return
    }
    fs.stat(filePath, (err, st) => {
      if (!err && st.isDirectory()) filePath = path.join(filePath, 'index.html')
      fs.readFile(filePath, (err2, buf) => {
        if (err2) {
          res
            .writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
            .end('404 Not Found: ' + reqPath)
          return
        }
        const ext = path.extname(filePath).toLowerCase()
        res
          .writeHead(200, {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            'Cache-Control': 'no-cache',
          })
          .end(buf)
      })
    })
  })
}

/** 从 start 开始找第一个空闲端口 */
export async function findFreePort(start = 5173, tries = 50) {
  for (let p = start; p < start + tries; p++) {
    const ok = await new Promise((resolve) => {
      const s = net.createServer()
      s.once('error', () => resolve(false))
      s.once('listening', () => s.close(() => resolve(true)))
      s.listen(p, '127.0.0.1')
    })
    if (ok) return p
  }
  return start
}

/** 起服务，返回 { port, url, server }；端口占用会自动顺延 */
export async function startServer(preferred = 5173) {
  const port = await findFreePort(preferred)
  const server = createStaticServer()
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', resolve)
  })
  return { port, url: `http://localhost:${port}/`, server }
}

// 直接运行时自启
const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === url.fileURLToPath(import.meta.url)

if (invokedDirectly) {
  const preferred = Number(process.argv[2] || process.env.PORT || 5173)
  const { port, url } = await startServer(preferred)
  if (port !== preferred) console.log(`端口 ${preferred} 被占用，改用 ${port}`)
  console.log(`地球物理公式大全 dev server → ${url}`)
  console.log(`serving: ${rootDir}`)
}
