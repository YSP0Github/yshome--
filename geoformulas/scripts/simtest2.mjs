// 验证「鼠标斥力场」有效性与静止行为。常数与 src/views/bubble.ts 保持一致。
import { ALL_CARDS } from '../assets/js/content/index.js'

const REP=6200, CUT=460, LINK_K=0.035, LINK_REST=74, GROUP_K=0.0042, CENTER_K=0.0020,
      DAMP=0.72, JITTER=1.15, ALPHA_DECAY=0.009, ALPHA_MIN=0.0005,
      MOUSE_R=190, MOUSE_F=30, HOVER_PULL=0.026, COLLIDE_K=0.35, MAX_V=26

const groups = new Map()
for (const c of ALL_CARDS) {
  const g = c.node.split('.')[0]
  if (!groups.has(g)) groups.set(g, [])
  groups.get(g).push(c)
}
const keys = [...groups.keys()]
const cols = Math.ceil(Math.sqrt(keys.length)), rows = Math.ceil(keys.length / cols)
const anchors = []
keys.forEach((_, gi) => {
  const row = Math.floor(gi / cols), col = gi % cols
  const inRow = Math.min(cols, keys.length - row * cols)
  anchors.push([inRow === 1 ? 0 : -875 + (col / (inRow - 1)) * 1750, -625 + (row / Math.max(1, rows - 1)) * 1250])
})
const nodes = []
keys.forEach((_, gi) => { for (const _c of groups.get(keys[gi])) nodes.push({ x: anchors[gi][0], y: anchors[gi][1], vx: 0, vy: 0, r: 15 + 46 * 0.6, g: gi }) })
const springs = []
for (let i = 1; i < nodes.length; i += 3) springs.push([i - 1, i])

const mouse = { x: 0, y: 0, on: false }
let hovered = -1

function tick(alpha) {
  const cut2 = CUT * CUT
  // 1) 斥力
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
      p.vx -= dx / d * f; p.vy -= dy / d * f
      q.vx += dx / d * f; q.vy += dy / d * f
    }
  }
  // 2) 弹簧
  for (const [a, b] of springs) {
    const p = nodes[a], q = nodes[b]
    const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1
    const f = (d - LINK_REST) * LINK_K * alpha
    p.vx += dx / d * f; p.vy += dy / d * f
    q.vx -= dx / d * f; q.vy -= dy / d * f
  }
  // 3) 碰撞（作为速度力，随温度衰减）
  for (let i = 0; i < nodes.length; i++) {
    const p = nodes[i]
    for (let j = i + 1; j < nodes.length; j++) {
      const q = nodes[j]
      const dx = q.x - p.x, dy = q.y - p.y
      const min = p.r + q.r + 5
      const d2 = dx * dx + dy * dy
      if (d2 >= min * min || d2 < 1e-9) continue
      const d = Math.sqrt(d2)
      const f = (min - d) * COLLIDE_K * alpha
      p.vx -= dx / d * f; p.vy -= dy / d * f
      q.vx += dx / d * f; q.vy += dy / d * f
    }
  }
  // 4) 簇心 / 向心 / 热噪声
  for (const p of nodes) {
    const [ax, ay] = anchors[p.g]
    p.vx += (ax - p.x) * GROUP_K * alpha; p.vy += (ay - p.y) * GROUP_K * alpha
    p.vx -= p.x * CENTER_K * alpha; p.vy -= p.y * CENTER_K * alpha
    if (alpha > 0.02) { p.vx += (Math.random() - 0.5) * JITTER * alpha; p.vy += (Math.random() - 0.5) * JITTER * alpha }
  }
  // 5) 鼠标场
  if (mouse.on) {
    for (const p of nodes) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy)
      if (d < MOUSE_R && d > 0.5) { const g = (1 - d / MOUSE_R) ** 2 * MOUSE_F * (0.6 + p.r / 70); p.vx += dx / d * g; p.vy += dy / d * g }
    }
    if (hovered >= 0) { const h = nodes[hovered]; h.vx += (mouse.x - h.x) * HOVER_PULL; h.vy += (mouse.y - h.y) * HOVER_PULL }
  }
  // 6) 积分 + 阻尼
  for (const p of nodes) {
    p.vx *= DAMP; p.vy *= DAMP
    const sp = Math.hypot(p.vx, p.vy)
    if (sp > MAX_V) { p.vx = p.vx / sp * MAX_V; p.vy = p.vy / sp * MAX_V }
    p.x += p.vx; p.y += p.vy
  }
}
const run = (a, n) => { for (let i = 0; i < n; i++) tick(a) }

// [1] 自然收敛
let alpha = 1, step = 0
while (alpha > ALPHA_MIN && step < 3000) { tick(alpha); alpha -= ALPHA_DECAY * alpha + ALPHA_DECAY * 0.22; if (alpha < ALPHA_MIN) alpha = ALPHA_MIN; step++ }
console.log(`[1] 自然收敛 ${step} 步 ≈ ${(step / 60).toFixed(1)} 秒 (rAF 60fps)`)

// [2] 静止漂移
let pos = nodes.map(n => ({ x: n.x, y: n.y }))
run(ALPHA_MIN, 60)
let drift = 0
for (let i = 0; i < nodes.length; i++) drift = Math.max(drift, Math.hypot(nodes[i].x - pos[i].x, nodes[i].y - pos[i].y))
const perFrame = drift / 60
console.log(`[2] 静止后 60 步累计漂移 ${drift.toFixed(4)} px → ${perFrame.toFixed(5)} px/帧  ${perFrame < 0.05 ? '✓ 亚像素，肉眼不可见' : '✗ 肉眼可见'}`)

// [3] 鼠标斥力
pos = nodes.map(n => ({ x: n.x, y: n.y }))
mouse.x = 0; mouse.y = 0; mouse.on = true; hovered = -1
run(0.25, 90)
let moved = 0, near = 0
for (let i = 0; i < nodes.length; i++) {
  const d = Math.hypot(nodes[i].x - pos[i].x, nodes[i].y - pos[i].y)
  if (d > 1) moved++
  const d0 = Math.hypot(pos[i].x, pos[i].y)
  if (d0 < MOUSE_R) { near++; if (d > 8) moved += 0 }
}
console.log(`[3] 鼠标置于原点：全场 ${moved}/${nodes.length} 个位移>1；圈内 ${near} 个，最小间距 ${Math.min(...nodes.map(n => Math.hypot(n.x, n.y))).toFixed(0)}`)

// [4] 复活动
pos = nodes.map(n => ({ x: n.x, y: n.y }))
mouse.on = false
run(0.25, 40)
let react = 0
for (let i = 0; i < nodes.length; i++) react = Math.max(react, Math.hypot(nodes[i].x - pos[i].x, nodes[i].y - pos[i].y))
console.log(`[4] 重新升温后 40 步最大位移 ${react.toFixed(2)} 像素  ${react > 1 ? '✓' : '✗ 不动'}`)

console.log(`[5] 非有限坐标 ${nodes.filter(n => !Number.isFinite(n.x) || !Number.isFinite(n.y)).length} 个`)
