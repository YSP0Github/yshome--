// 用与 src/views/bubble.ts 完全相同的常数，对真实卡片数据做无头力模拟，
// 检查：数值稳定性、收敛步数、每步耗时、最终包围盒。
import { ALL_CARDS } from '../assets/js/content/index.js'

const REP = 6200, CUT = 460, LINK_K = 0.035, LINK_REST = 74
const GROUP_K = 0.0042, CENTER_K = 0.0020, DAMP = 0.72
const JITTER = 1.15, ALPHA_DECAY = 0.009, ALPHA_MIN = 0.004

// 分组（subject 顶层学科）
const groups = new Map()
for (const c of ALL_CARDS) {
  const g = c.node.split('.')[0]
  if (!groups.has(g)) groups.set(g, [])
  groups.get(g).push(c)
}
const keys = [...groups.keys()]
const cols = Math.ceil(Math.sqrt(keys.length))
const rows = Math.ceil(keys.length / cols)
const anchors = []
keys.forEach((k, gi) => {
  const row = Math.floor(gi / cols), col = gi % cols
  const inRow = Math.min(cols, keys.length - row * cols)
  const ax = inRow === 1 ? 0 : -875 + (col / (inRow - 1)) * 1750
  const ay = -625 + (row / Math.max(1, rows - 1)) * 1250
  anchors.push([ax, ay])
})
const nodes = []
keys.forEach((k, gi) => {
  for (const c of groups.get(k)) {
    nodes.push({ id: c.id, x: anchors[gi][0], y: anchors[gi][1], vx: 0, vy: 0, r: 15 + 46 * 0.6, g: gi })
  }
})
const idx = new Map()
nodes.forEach((n, i) => { if (!idx.has(n.id)) idx.set(n.id, i) })
const springs = []
const seen = new Set()
for (const c of ALL_CARDS) {
  for (const u of c.links?.upstream ?? []) {
    const a = idx.get(u.id), b = idx.get(c.id)
    if (a === undefined || b === undefined || a === b) continue
    const key = a < b ? a + '|' + b : b + '|' + a
    if (seen.has(key)) continue
    seen.add(key); springs.push([a, b])
  }
}
console.log('节点', nodes.length, '弹簧', springs.length, '簇', keys.length)

let alpha = 1
let worstMs = 0, totalMs = 0, step = 0
const t0 = Date.now()
while (alpha > ALPHA_MIN && step < 3000) {
  const s0 = performance.now()
  const cut2 = CUT * CUT
  for (let i = 0; i < nodes.length; i++) {
    const p = nodes[i]
    for (let j = i + 1; j < nodes.length; j++) {
      const q = nodes[j]
      let dx = q.x - p.x, dy = q.y - p.y
      let d2 = dx * dx + dy * dy
      if (d2 > cut2) continue
      if (d2 < 4) { dx = 0.7; dy = 0.7; d2 = 1 }
      const d = Math.sqrt(d2)
      const f = (REP * alpha * (p.r + q.r)) / 120 / d2
      const ux = dx / d, uy = dy / d
      p.vx -= ux * f; p.vy -= uy * f
      q.vx += ux * f; q.vy += uy * f
    }
  }
  for (const [a, b] of springs) {
    const p = nodes[a], q = nodes[b]
    const dx = q.x - p.x, dy = q.y - p.y
    const d = Math.hypot(dx, dy) || 1
    const f = (d - LINK_REST) * LINK_K * alpha
    p.vx += dx / d * f; p.vy += dy / d * f
    q.vx -= dx / d * f; q.vy -= dy / d * f
  }
  for (const p of nodes) {
    const [ax, ay] = anchors[p.g]
    p.vx += (ax - p.x) * GROUP_K * alpha
    p.vy += (ay - p.y) * GROUP_K * alpha
    p.vx -= p.x * CENTER_K * alpha
    p.vy -= p.y * CENTER_K * alpha
    if (alpha > 0.02) {
      p.vx += (Math.random() - 0.5) * JITTER * alpha
      p.vy += (Math.random() - 0.5) * JITTER * alpha
    }
    p.vx *= DAMP; p.vy *= DAMP
    const sp = Math.hypot(p.vx, p.vy)
    if (sp > 26) { p.vx = p.vx / sp * 26; p.vy = p.vy / sp * 26 }
    p.x += p.vx; p.y += p.vy
  }
  for (let i = 0; i < nodes.length; i++) {
    const p = nodes[i]
    for (let j = i + 1; j < nodes.length; j++) {
      const q = nodes[j]
      const dx = q.x - p.x, dy = q.y - p.y
      const min = p.r + q.r + 5
      const d2 = dx * dx + dy * dy
      if (d2 >= min * min || d2 < 1e-9) continue
      const d = Math.sqrt(d2)
      const push = (min - d) / 2 / d
      if (p.x !== p.x) throw new Error('NaN at ' + i)
      p.x -= dx * push; p.y -= dy * push
      q.x += dx * push; q.y += dy * push
    }
  }
  alpha -= ALPHA_DECAY * alpha + ALPHA_DECAY * 0.22
  if (alpha < ALPHA_MIN) alpha = ALPHA_MIN
  const ms = performance.now() - s0
  totalMs += ms
  if (step > 5 && ms > worstMs) worstMs = ms
  step++
}
let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity, bad = 0, vmax = 0
for (const n of nodes) {
  if (!Number.isFinite(n.x) || !Number.isFinite(n.y)) bad++
  a = Math.min(a, n.x); c = Math.max(c, n.x)
  b = Math.min(b, n.y); d = Math.max(d, n.y)
  vmax = Math.max(vmax, Math.hypot(n.vx, n.vy))
}
console.log('收敛步数', step, '| 总耗时', Date.now() - t0, 'ms')
console.log('平均每步', (totalMs / step).toFixed(2), 'ms | 最慢一步', worstMs.toFixed(2), 'ms')
console.log('包围盒', Math.round(c - a), 'x', Math.round(d - b), '| 非有限值', bad, '| 残余速度', vmax.toFixed(3))
