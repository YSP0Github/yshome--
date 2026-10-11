import { el, clear } from '../core/dom.js'
import { getLang } from '../core/i18n.js'
import { store } from '../core/store.js'
import { SYSTEMS } from '../taxonomy.js'
import type { FormulaCard } from '../core/types.js'
import { sectionTitle } from './common.js'

type SizeMetric = 'centrality' | 'steps' | 'audience'

interface Bubble {
  card: FormulaCard
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
  cluster: string
  clusterLabel: string
  /** 簇编号，用于向簇心轻微聚拢 */
  group: number
  /** 被用户钉住 */
  pinned: boolean
  /** 每帧插值出的屏幕坐标，避免重绘抖动 */
  sx: number
  sy: number
}

interface Spring { a: number; b: number; s: number }

interface View { k: number; x: number; y: number }

const REP = 6200        // 斥力强度
const CUT = 460         // 斥力截断距离（世界单位）
const LINK_K = 0.035    // 弹簧强度
const LINK_REST = 74    // 弹簧自然长度
const GROUP_K = 0.0042  // 向簇心聚拢
const CENTER_K = 0.0020 // 全局向心，防止整体漂散
const DAMP = 0.72       // 速度保留系数（越小停得越快）
const JITTER = 1.15     // 热运动幅度
const ALPHA_DECAY = 0.009
const ALPHA_MIN = 0.0005 // 温度下限：低于此值彻底静止（实测残余漂移 < 0.2 px / 60 帧）
const COLLIDE_K = 0.35    // 碰撞作为速度力（不是硬性位置投影），才能随温度一起衰减到静止
const MOUSE_ALPHA = 0.25   // 鼠标在场时维持的最低温度，保证斥力场一直有效
const MIN_FIT_K = 0.5     // 自适应缩放下限：310 个气泡若硬塞进画布会小到看不清
const MOUSE_R = 120     // 鼠标影响半径（世界单位）：温和让位，不再弹飞
const MOUSE_F = 9       // 鼠标斥力：大幅削弱，只是轻轻拨开周围气泡
const MAX_V = 26        // 单帧最大位移，防止数值爆炸

/**
 * 被指向节点的跟随：不是简单的比例项，而是一个临界阻尼弹簧。
 *
 * 早先用 `vx += (mx - x) * 0.026`，实测完全失效——它与鼠标斥力相差约三个数量级，
 * 气泡只要偏离圆心 8px 以上，40 帧内就被推到 124px 外（命中半径才20~53px），
 * 于是「鼠标移上去就抓不住」，点不中。用弹簧后可在~0.3s 内贴到光标下且不过冲。
 */
const HOVER_W = 0.44  // 弹簧角频率（越大越跟手、越快贴住光标）；略降以免粘住、妨碍抓取周围气泡
const HOVER_Z = 1.0     // 阻尼比：1 = 临界阻尼，无振荡
const MIN_HIT_R = 13    // 命中半径下限（屏幕像素）：缩到很小时仍要能点准
const HOVER_PAD = 9     // sticky hover 捕获区额外缓冲（屏幕像素）：光标在该范围内不切换 hover
const PRESS_SLACK = 26   // 抬起的容差环：按下在空白、抬起落在气泡边缘时的容差
const CLICK_SLOP = 8     // 屏幕像素：按下→抬起位移不超过它仍算「点击」而非拖动
const CLICK_MS = 500     // 毫秒：按下→抬起时长不超过它仍算「点击」

export function renderBubble(host: HTMLElement, opts: { group: string; size: SizeMetric }): void {
  const lang = getLang()
  clear(host)
  const wrap = el('div', { class: 'viz-page' })
  wrap.appendChild(sectionTitle(
    lang === 'zh' ? '力导向气泡图' : 'Force-directed bubbles',
    lang === 'zh'
      ? '气泡间互相排斥、沿依赖连线互相牵引，在温度缓慢下降中逐渐静止；移动鼠标会在局部推开或牵引它们。'
      : 'Bubbles repel each other and are pulled along dependency links, gradually settling as the temperature drops. Moving the mouse pushes or attracts them locally.',
  ))

  /* ── 控制条：分组 / 半径编码 ───────────────────────── */
  const bar = el('div', { class: 'filter-bar' })
  bar.appendChild(el('span', { class: 'f-label', text: lang === 'zh' ? '分组（颜色）' : 'Group (colour)' }))
  for (const s of SYSTEMS) {
    const a = el('a', {
      class: `pill${s.id === opts.group ? ' active' : ''}`,
      href: `#/bubble?group=${s.id}&size=${opts.size}`,
      text: s.name[lang],
    })
    if (s.id === opts.group) a.setAttribute('style', `border-color:${s.color};color:${s.color}`)
    bar.appendChild(a)
  }
  wrap.appendChild(bar)

  const bar2 = el('div', { class: 'filter-bar' })
  bar2.appendChild(el('span', { class: 'f-label', text: lang === 'zh' ? '半径编码' : 'Radius encodes' }))
  const metrics: Array<[SizeMetric, string]> = [
    ['centrality', lang === 'zh' ? '网络核心度' : 'network centrality'],
    ['steps', lang === 'zh' ? '推导步数' : 'derivation steps'],
    ['audience', lang === 'zh' ? '读者层级' : 'audience level'],
  ]
  for (const [m, label] of metrics) {
    bar2.appendChild(el('a', {
      class: `pill${m === opts.size ? ' active' : ''}`,
      href: `#/bubble?group=${opts.group}&size=${m}`,
      text: label,
    }))
  }
  wrap.appendChild(bar2)

  /* ── 画布 ─────────────────────────────────────────── */
  const canvas = el('canvas', { class: 'bubble-canvas' }) as HTMLCanvasElement
  canvas.style.width = '100%'
  canvas.style.height = '660px'
  wrap.appendChild(canvas)

  const legend = el('div', { class: 'plot-legend wrap-legend' })
  wrap.appendChild(legend)

  const tip = el('div', { class: 'bubble-tip' })
  tip.style.display = 'none'
  wrap.appendChild(tip)

  /* ── 构建节点与连线 ───────────────────────────────── */
  const sys = SYSTEMS.find((s) => s.id === opts.group) ?? SYSTEMS[0]
  const built = layout(store.cards, sys.id, opts.size)
  const bubbles = built.nodes
  const springs = built.links
  const anchors = built.anchors
  const indexOf = new Map<string, number>()
  bubbles.forEach((b, i) => { if (!indexOf.has(b.card.id)) indexOf.set(b.card.id, i) })
  renderLegend(legend, sys.id, opts.size, lang, bubbles)

  /* ── 状态 ─────────────────────────────────────────── */
  let W = 900
  let H = 660
  const view: View = { k: 1, x: 0, y: 0 }
  let alpha = 1
  let running = false
  let showLinks = true
  let showLabels = true
  let hovered = -1
  /** 按下时锁定的节点：在 pointerdown → pointerup 之间完全冻结，保证 click 不落空 */
  let locked = -1
  /** 按下瞬间命中的节点；抬起时用它判定点击，避免依赖「此刻光标下是否还有东西」 */
  let pressTarget = -1
  let dragging = -1
  let dragMoved = false
  let lastX = 0
  let lastY = 0
  let panning = false
  /** pointerdown 瞬间的屏幕坐标与时间，pointerup 据此判定「点击」（屏幕像素阈值，与缩放无关） */
  let downSX = 0
  let downSY = 0
  let downTime = 0
  const mouse = { x: -1e5, y: -1e5, on: false }
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  /* ── 开关条 ───────────────────────────────────────── */
  const bar3 = el('div', { class: 'filter-bar viz-tools' })
  const state = el('span', { class: 'legend-note', text: '' })
  const mkToggle = (get: () => boolean, set: (v: boolean) => void, zh: string, en: string) => {
    const b = el('button', { class: 'toggle', type: 'button', text: (lang === 'zh' ? zh : en) })
    const sync = () => {
      const on = get()
      b.classList.toggle('on', on)
      b.setAttribute('aria-pressed', String(on))
    }
    b.addEventListener('click', () => { set(!get()); sync(); reheat(0.55); redraw() })
    sync()
    bar3.appendChild(b)
  }
  mkToggle(() => showLinks, (v) => { showLinks = v }, '连线', 'Links')
  mkToggle(() => showLabels, (v) => { showLabels = v }, '标签', 'Labels')
  {
    const b = el('button', { class: 'toggle', type: 'button', text: lang === 'zh' ? '重新加热' : 'Reheat' })
    b.addEventListener('click', () => { reheat(0.9); kick() })
    bar3.appendChild(b)
    const r = el('button', { class: 'toggle', type: 'button', text: lang === 'zh' ? '重置布局' : 'Reset layout' })
    r.addEventListener('click', () => {
      seed()
      fit()
      reheat(1)
      kick()
    })
    bar3.appendChild(r)
    const f = el('button', { class: 'toggle', type: 'button', text: lang === 'zh' ? '适应窗口' : 'Fit' })
    f.addEventListener('click', () => { fit(0.05); redraw() })
    bar3.appendChild(f)
  }
  bar3.appendChild(el('span', { class: 'f-label', text: lang === 'zh' ? '提示：拖动气泡可钉住，双击空白复位，滚轮缩放' : 'Tip: drag a bubble to pin it, double-click empty space to reset, wheel to zoom' }))
  bar3.appendChild(state)
  wrap.appendChild(bar3)

  /* ── 尺寸 ─────────────────────────────────────────── */
  function resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = canvas.clientWidth || 900
    H = 660
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const toWorld = (sx: number, sy: number): [number, number] => [(sx - view.x) / view.k, (sy - view.y) / view.k]

  function fit(floor = MIN_FIT_K): void {
    if (!bubbles.length) return
    let a = Infinity; let b = Infinity; let c = -Infinity; let d = -Infinity
    for (const n of bubbles) {
      a = Math.min(a, n.x - n.r); c = Math.max(c, n.x + n.r)
      b = Math.min(b, n.y - n.r); d = Math.max(d, n.y + n.r)
    }
    const pad = 40
    const k = Math.min((W - pad * 2) / Math.max(c - a, 1), (H - pad * 2) / Math.max(d - b, 1))
    view.k = Math.max(floor, Math.min(k, 2.2))
    view.x = (W - (c - a) * view.k) / 2 - a * view.k
    view.y = (H - (d - b) * view.k) / 2 - b * view.k
  }

  /** 把节点撒回初始位置（按簇心螺旋散布） */
  function seed(): void {
    const counts = new Map<number, number>()
    for (const n of bubbles) {
      const i = counts.get(n.group) ?? 0
      counts.set(n.group, i + 1)
      const [ax, ay] = anchors[n.group] ?? [0, 0]
      const ang = i * 2.399963 + n.group * 0.7
      const rad = 26 * Math.sqrt(i + 1)
      n.x = ax + Math.cos(ang) * rad
      n.y = ay + Math.sin(ang) * rad
      n.vx = 0
      n.vy = 0
      n.pinned = false
    }
  }

  function reheat(a: number): void {
    alpha = Math.max(alpha, a)
    syncState()
  }

  /* ── 物理 ─────────────────────────────────────────── */
  function tick(): void {
    const n = bubbles.length
    if (!n) return
    const a = alpha

    // 1) 斥力（成对，带截断）
    const cut2 = CUT * CUT
    for (let i = 0; i < n; i++) {
      const p = bubbles[i]
      for (let j = i + 1; j < n; j++) {
        const q = bubbles[j]
        let dx = q.x - p.x
        let dy = q.y - p.y
        let d2 = dx * dx + dy * dy
        if (d2 > cut2) continue
        if (d2 < 4) { dx = (i - j) * 0.7 || 0.7; dy = 0.7; d2 = 1 }
        const d = Math.sqrt(d2)
        const f = (REP * a * (p.r + q.r)) / 120 / d2
        const ux = dx / d
        const uy = dy / d
        p.vx -= ux * f; p.vy -= uy * f
        q.vx += ux * f; q.vy += uy * f
      }
    }

    // 2) 依赖边的弹簧
    for (const s of springs) {
      const p = bubbles[s.a]
      const q = bubbles[s.b]
      const dx = q.x - p.x
      const dy = q.y - p.y
      const d = Math.hypot(dx, dy) || 1
      const f = (d - LINK_REST) * LINK_K * s.s * a
      const ux = dx / d
      const uy = dy / d
      p.vx += ux * f; p.vy += uy * f
      q.vx -= ux * f; q.vy -= uy * f
    }

    // 3) 向簇心聚拢 + 全局向心 + 热运动
    for (const p of bubbles) {
      const [ax, ay] = anchors[p.group] ?? [0, 0]
      p.vx += (ax - p.x) * GROUP_K * a
      p.vy += (ay - p.y) * GROUP_K * a
      p.vx -= p.x * CENTER_K * a
      p.vy -= p.y * CENTER_K * a
      if (a > 0.02) {
        p.vx += (Math.random() - 0.5) * JITTER * a
        p.vy += (Math.random() - 0.5) * JITTER * a
      }
    }

    // 4) 鼠标场：局部排斥，但**被指向的节点豁免**——否则气泡永远躲开鼠标、点不中。
    if (mouse.on) {
      const [mxw, myw] = toWorld(mouse.x, mouse.y)
      for (let i = 0; i < n; i++) {
        //被指向或按下的节点不吃斥力，否则与第5 节的弹簧互相打架
        if (i === hovered || i === locked) continue
        const p = bubbles[i]
        const dx = p.x - mxw
        const dy = p.y - myw
        const d = Math.hypot(dx, dy)
        if (d < MOUSE_R && d > 0.5) {
          const g = (1 - d / MOUSE_R) ** 2 * MOUSE_F * (0.6 + p.r / 70)
          p.vx += (dx / d) * g
          p.vy += (dy / d) * g
        }
      }
      // 被指向的节点：临界阻尼弹簧拉向光标，跟得住且不过冲
      const h = hovered >= 0 ? bubbles[hovered] : null
      if (h && dragging < 0) {
        h.vx += (HOVER_W * HOVER_W * (mxw - h.x) - 2 * HOVER_Z * HOVER_W * h.vx) * a
        h.vy += (HOVER_W * HOVER_W * (myw - h.y) - 2 * HOVER_Z * HOVER_W * h.vy) * a
      }
    }

    // 5) 碰撞：作为速度力施加，随温度衰减 —— 这样温度归零时系统才能真正静止。
    //    （早先用「硬性位置投影」会导致静止后仍在缓慢分离，实测 60 帧漂移 96 px）
    for (let i = 0; i < n; i++) {
      const p = bubbles[i]
      for (let j = i + 1; j < n; j++) {
        const q = bubbles[j]
        const dx = q.x - p.x
        const dy = q.y - p.y
        const min = p.r + q.r + 5
        const d2 = dx * dx + dy * dy
        if (d2 >= min * min || d2 < 1e-9) continue
        const d = Math.sqrt(d2)
        const f = (min - d) * COLLIDE_K * a
        p.vx -= (dx / d) * f
        p.vy -= (dy / d) * f
        q.vx += (dx / d) * f
        q.vy += (dy / d) * f
      }
    }

    // 6) 积分 + 阻尼
    for (let i = 0; i < n; i++) {
      const p = bubbles[i]
      // pinned：用户手动钉住；locked：刚按下、尚未拖动 —— 两者都必须完全静止，
      // 否则气泡会在「按下」与「抬起」之间挪走，导致 click 落空
      if (p.pinned || i === locked) { p.vx = 0; p.vy = 0; continue }
      p.vx *= DAMP
      p.vy *= DAMP
      const sp = Math.hypot(p.vx, p.vy)
      if (sp > MAX_V) { p.vx = (p.vx / sp) * MAX_V; p.vy = (p.vy / sp) * MAX_V }
      p.x += p.vx
      p.y += p.vy
    }

    alpha -= ALPHA_DECAY * a + ALPHA_DECAY * 0.22
    if (alpha < ALPHA_MIN) alpha = ALPHA_MIN
  }

  /* ── 渲染 ─────────────────────────────────────────── */
  /** 屏幕坐标是布局的派生量：任何绘制或命中前都必须先刷新 */
  function syncScreen(): void {
    for (const b of bubbles) {
      b.sx = b.x * view.k + view.x
      b.sy = b.y * view.k + view.y
    }
  }

  function redraw(): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, W, H)
    syncScreen()

    // hover 的邻居集合
    const near = new Set<number>()
    if (hovered >= 0) {
      near.add(hovered)
      for (const s of springs) {
        if (s.a === hovered) near.add(s.b)
        else if (s.b === hovered) near.add(s.a)
      }
    }

    // 连线
    if (showLinks) {
      ctx.lineCap = 'round'
      for (const s of springs) {
        const p = bubbles[s.a]
        const q = bubbles[s.b]
        const hot = hovered >= 0 && (s.a === hovered || s.b === hovered)
        ctx.beginPath()
        ctx.moveTo(p.sx, p.sy)
        ctx.lineTo(q.sx, q.sy)
        if (hot) {
          ctx.strokeStyle = p.color + 'CC'
          ctx.lineWidth = 1.8
        } else if (hovered >= 0) {
          ctx.strokeStyle = 'rgba(31,30,28,0.045)'
          ctx.lineWidth = 1
        } else {
          ctx.strokeStyle = 'rgba(31,30,28,0.10)'
          ctx.lineWidth = 1
        }
        ctx.stroke()
      }
    }

    // 节点
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i]
      const sx = b.sx
      const sy = b.sy
      const r = Math.max(b.r * view.k, 3.5)
      const dim = hovered >= 0 && !near.has(i)
      ctx.globalAlpha = dim ? 0.28 : 1

      ctx.beginPath()
      ctx.arc(sx, sy, r, 0, Math.PI * 2)
      ctx.fillStyle = b.color + (hovered === i ? '55' : '2E')
      ctx.fill()
      ctx.lineWidth = hovered === i ? 2.6 : 1.4
      if (b.pinned) ctx.setLineDash([3, 3])
      ctx.strokeStyle = b.color
      ctx.stroke()
      ctx.setLineDash([])

      if (showLabels && (hovered === i || r > 24) && !dim) {
        ctx.fillStyle = '#2C2C2A'
        ctx.font = `${hovered === i ? 13 : 12}px var(--font-sans, sans-serif)`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(clip(b.card.name[lang], hovered === i ? 40 : Math.floor(r / 3.4)), sx, sy)
      }
      ctx.globalAlpha = 1
    }
  }

  function syncState(): void {
    const moving = alpha > ALPHA_MIN + 1e-6
    state.textContent = moving
      ? (lang === 'zh' ? `温度 α = ${alpha.toFixed(3)}` : `temperature α = ${alpha.toFixed(3)}`)
      : (lang === 'zh' ? '已静止' : 'at rest')
  }

  function frame(): void {
    tick()
    redraw()
    syncState()
    if (alpha <= ALPHA_MIN + 1e-9 && dragging < 0) {
      running = false
      return
    }
    requestAnimationFrame(frame)
  }
  function kick(): void {
    if (reduceMotion || running) return
    running = true
    requestAnimationFrame(frame)
  }

  /* ── 命中检测 ─────────────────────────────────────── */
  /**
   * 命中检测。
   *
   * 半径取「实际渲染半径」与「最小可点半径」的较大者：缩小时圆可能只有4px，
   * 那是像素级精度，人点不准，所以给一个 13px 的舒适区。
   *
   * 命中选择：在所有满足半径的候选里选「数组下标最大」者。redraw 按数组顺序绘制、
   * 下标靠后即在视觉上层，这样命中结果永远是光标下最上层那个可见气泡，
   * 与 hover 高亮、与实际看到的圆保持一致，不会误命中被盖住、看不见的气泡。
   */
  function hit(sx: number, sy: number, slack = 0): number {
    syncScreen()
    let best = -1
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i]
      const dx = b.sx - sx
      const dy = b.sy - sy
      const d = Math.hypot(dx, dy)
      const rr = Math.max(b.r * view.k, MIN_HIT_R) + slack
      if (d <= rr) best = i // 后写覆盖前值 → 最上层者胜出
    }
    return best
  }

  /**
   * hover 命中（带滞回）。
   *
   * 密集重叠区里，每帧裸 hit() 会让「光标下最上层气泡」频繁切换，目标一帧没被选中
   * 就从「豁免斥力+被弹簧拉」掉回「吃斥力」，于是被 ~20–39 的加速度弹飞、再也抓不回。
   * 这里加滞回：一旦 hovered=i，只要光标仍在该气泡的「扩大捕获区」
   * （max(渲染半径, MIN_HIT_R) + HOVER_PAD 屏幕像素）内，就保持 i 不被抢占；
   * 只有光标明确离开该捕获区后才重新 hit()。这样目标稳定豁免斥力、持续被吸向光标。
   */
  function hoverHit(sx: number, sy: number): number {
    if (hovered >= 0) {
      const b = bubbles[hovered]
      const cap = Math.max(b.r * view.k, MIN_HIT_R) + HOVER_PAD
      if (Math.hypot(b.sx - sx, b.sy - sy) <= cap) return hovered
    }
    return hit(sx, sy)
  }

  function setHover(i: number, ev?: MouseEvent): void {
    if (hovered === i) {
      if (i >= 0 && ev) moveTip(ev)
      return
    }
    hovered = i
    if (i < 0) { tip.style.display = 'none'; return }
    const b = bubbles[i]
    const deg = springs.filter((s) => s.a === i || s.b === i).length
    tip.innerHTML = `<strong>${b.card.name[lang]}</strong><br><span class="muted">${b.clusterLabel} · ${deg} ${lang === 'zh' ? '条依赖' : 'links'}</span>`
    tip.style.display = 'block'
    if (ev) moveTip(ev)
    reheat(0.12)
  }

  function moveTip(ev: MouseEvent): void {
    const rect = canvas.getBoundingClientRect()
    tip.style.left = `${Math.min(ev.clientX - rect.left + 14, rect.width - 190)}px`
    tip.style.top = `${Math.min(ev.clientY - rect.top + 14, rect.height - 50)}px`
  }

  /* ── 事件 ─────────────────────────────────────────── */
  canvas.addEventListener('pointermove', (ev) => {
    const rect = canvas.getBoundingClientRect()
    const sx = ev.clientX - rect.left
    const sy = ev.clientY - rect.top
    mouse.x = sx
    mouse.y = sy
    mouse.on = true

    if (dragging >= 0) {
      // 用「屏幕像素」而非世界单位判定拖动：缩放后 view.k 可低到 0.3，
      // 世界单位 3px 阈值在屏幕上只有 5~10px，会把普通点击的轻微抖动误判成拖动，
      // 进而吞掉 click、把气泡钉死。屏幕像素阈值与缩放无关，稳定可点。
      if (!dragMoved && Math.hypot(sx - downSX, sy - downSY) > CLICK_SLOP) {
        dragMoved = true
        locked = -1 // 真正开始拖动才解冻，让它跟随光标
      }
      if (dragMoved) {
        const [wx, wy] = toWorld(sx, sy)
        const b = bubbles[dragging]
        b.x = wx
        b.y = wy
        reheat(0.5)
        kick()
      }
      return
    }
    if (panning) {
      view.x += sx - lastX
      view.y += sy - lastY
      lastX = sx
      lastY = sy
      redraw()
      return
    }
    setHover(hoverHit(sx, sy), ev)
    // 鼠标一动就重新升温：这是斥力场能被感知到的前提
    reheat(MOUSE_ALPHA)
    kick()
  })

  canvas.addEventListener('pointerleave', () => {
    mouse.on = false
    setHover(-1)
  })

  canvas.addEventListener('pointerdown', (ev) => {
    if (ev.button !== 0) return
    const rect = canvas.getBoundingClientRect()
    const sx = ev.clientX - rect.left
    const sy = ev.clientY - rect.top
    lastX = sx
    lastY = sy
    downSX = sx
    downSY = sy
    downTime = performance.now()
    dragMoved = false
    const i = hit(sx, sy)
    dragging = i
    pressTarget = i
    locked = i
    if (i < 0) panning = true
    else canvas.setPointerCapture(ev.pointerId)
    // 注意：这里**不**升温。升温会让气泡立刻散开，夹在按下与抬起之间的
    // 那几十毫秒里目标可能已被邻居挤走，导致点击落空。
    kick()
  })

  window.addEventListener('pointerup', (ev) => {
    const tapped = dragging >= 0 && !dragMoved
    // 只有真正拖动过才把气泡钉住；单击则保持自由
    if (dragging >= 0 && dragMoved) bubbles[dragging].pinned = true

    // 点击导航统一放在 pointerup：setPointerCapture 后原生 click 可能被抑制，
    // 直接用「按下→抬起位移 < 屏幕阈值 且 时长 < 阈值」判定一次点击。
    if (tapped) {
      const rect = canvas.getBoundingClientRect()
      const sx = ev.clientX - rect.left
      const sy = ev.clientY - rect.top
      const dt = performance.now() - downTime
      if (Math.hypot(sx - downSX, sy - downSY) <= CLICK_SLOP && dt <= CLICK_MS) {
        // 优先用按下瞬间锁定的目标；只有「按下时什么都没点中」才按抬起位置重命中（带容差）。
        let i = pressTarget
        if (i < 0) i = hit(sx, sy, PRESS_SLACK)
        if (i >= 0) location.hash = `#/card/${bubbles[i].card.id}`
      }
    }

    dragging = -1
    locked = -1
    panning = false
    pressTarget = -1
    dragMoved = false
    syncState()
  })

  canvas.addEventListener('dblclick', (ev) => {
    const rect = canvas.getBoundingClientRect()
    const i = hit(ev.clientX - rect.left, ev.clientY - rect.top)
    if (i >= 0) { bubbles[i].pinned = false; reheat(0.4); kick() }
  })

  canvas.addEventListener('wheel', (ev) => {
    ev.preventDefault()
    const rect = canvas.getBoundingClientRect()
    const sx = ev.clientX - rect.left
    const sy = ev.clientY - rect.top
    const f = Math.exp(-ev.deltaY * 0.0016)
    const k2 = Math.max(0.12, Math.min(6, view.k * f))
    const [wx, wy] = toWorld(sx, sy)
    view.k = k2
    view.x = sx - wx * k2
    view.y = sy - wy * k2
    redraw()
  }, { passive: false })

  /* ── 启动 ─────────────────────────────────────────── */
  seed()
  resize()
  fit()
  // 预跑几十步，让初始画面已有结构，随后继续用动画收敛
  if (reduceMotion) {
    for (let i = 0; i < 420; i++) { alpha = 1; tick() }
    alpha = ALPHA_MIN
    redraw()
    syncState()
  } else {
    for (let i = 0; i < 26; i++) tick()
    alpha = Math.max(alpha, 0.7)
    syncState()
    kick()
  }
  new ResizeObserver(() => { resize(); redraw() }).observe(canvas)

  host.appendChild(wrap)
}

/* ───────────────────────────────────────────────────────
   布局：归组 → 求半径 → 生成初始散布与依赖弹簧
   ─────────────────────────────────────────────────────── */
interface Built { nodes: Bubble[]; links: Spring[]; anchors: Array<[number, number]> }

function layout(cards: FormulaCard[], groupSys: string, sizeMetric: SizeMetric): Built {
  const lang = getLang()
  const sys = SYSTEMS.find((s) => s.id === groupSys) ?? SYSTEMS[0]
  const groups = new Map<string, { label: string; color: string; items: FormulaCard[] }>()
  const palette = ['#185FA5', '#A32D2D', '#0F6E56', '#BA7517', '#7F77DD', '#D4537E', '#639922', '#378ADD']

  const groupOf = (c: FormulaCard): string[] => {
    if (groupSys === 'subject') return [topNodeOf(c)]
    return (c.tags as Record<string, string[] | undefined>)[groupSys] ?? []
  }
  for (const c of cards) {
    const gs = groupOf(c)
    if (!gs.length) {
      if (!groups.has('__none')) groups.set('__none', { label: lang === 'zh' ? '未分类' : 'unassigned', color: '#888780', items: [] })
      groups.get('__none')!.items.push(c)
      continue
    }
    for (const g of gs) {
      const item = sys.items.find((i) => i.id === g)
      if (!groups.has(g)) {
        const idx = groups.size
        groups.set(g, { label: item ? item.name[lang] : g, color: item ? sys.color : palette[idx % palette.length], items: [] })
      }
      groups.get(g)!.items.push(c)
    }
  }

  const raw = (c: FormulaCard): number => {
    switch (sizeMetric) {
      case 'centrality': return Math.max(store.centrality(c.id), 1)
      case 'steps': return Math.max(c.derivation?.length ?? 1, 1)
      case 'audience': return ['highschool', 'bachelor', 'master', 'phd'].indexOf(c.audience) + 1.4
      default: return 1
    }
  }

  const nodes: Bubble[] = []
  const anchors: Array<[number, number]> = []
  const keys = [...groups.keys()]
  // 簇心沿椭圆排布，给彼此留出让位空间
  const cols = Math.max(1, Math.ceil(Math.sqrt(keys.length)))
  keys.forEach((key, gi) => {
    const g = groups.get(key)!
    const row = Math.floor(gi / cols)
    const col = gi % cols
    const inRow = Math.min(cols, keys.length - row * cols)
    const spanX = 1750
    const spanY = 1250
    const ax = inRow === 1 ? 0 : (-spanX / 2) + (col / (inRow - 1)) * spanX
    const ay = (-spanY / 2) + (row / Math.max(1, Math.ceil(keys.length / cols) - 1)) * spanY
    anchors.push([ax, ay])
    const maxRaw = Math.max(...g.items.map(raw), 1)
    for (const c of g.items) {
      const m = raw(c)
      const r = 15 + 46 * Math.sqrt(m / maxRaw)
      nodes.push({
        card: c, x: ax, y: ay, vx: 0, vy: 0, r,
        color: g.color, cluster: key, clusterLabel: g.label,
        group: anchors.length - 1, pinned: false, sx: 0, sy: 0,
      })
    }
  })

  // 依赖边 → 弹簧
  const firstIdx = new Map<string, number>()
  nodes.forEach((n, i) => { if (!firstIdx.has(n.card.id)) firstIdx.set(n.card.id, i) })
  const links: Spring[] = []
  const seen = new Set<string>()
  for (const e of store.edges) {
    const a = firstIdx.get(e.from)
    const b = firstIdx.get(e.to)
    if (a === undefined || b === undefined || a === b) continue
    const key = a < b ? `${a}|${b}` : `${b}|${a}`
    if (seen.has(key)) continue
    seen.add(key)
    links.push({ a, b, s: 1 })
  }

  return { nodes, links, anchors }
}

function renderLegend(host: HTMLElement, groupSys: string, size: SizeMetric, lang: 'zh' | 'en', bubbles: Bubble[]): void {
  clear(host)
  const seen = new Set<string>()
  for (const b of bubbles) {
    if (seen.has(b.cluster)) continue
    seen.add(b.cluster)
    const chip = el('span', { class: 'legend-item' })
    const dot = el('i') as HTMLElement
    dot.style.background = b.color
    chip.appendChild(dot)
    chip.appendChild(document.createTextNode(b.clusterLabel))
    host.appendChild(chip)
  }
  const note = el('span', { class: 'legend-note', text: size === 'centrality'
    ? (lang === 'zh' ? '半径 = 依赖网络中的关联数' : 'radius = number of dependency links')
    : size === 'steps'
      ? (lang === 'zh' ? '半径 = 推导步数' : 'radius = derivation steps')
      : (lang === 'zh' ? '半径 = 读者层级' : 'radius = audience level') })
  host.appendChild(note)
  void groupSys
}

function topNodeOf(c: FormulaCard): string {
  return c.node.split('.')[0]
}

function clip(s: string, n: number): string {
  return s.length > n ? s.slice(0, Math.max(n - 1, 1)) + '…' : s
}
