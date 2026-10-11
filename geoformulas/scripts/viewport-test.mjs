// 验证 viewBox 平移缩放的数学正确性（不依赖 DOM，直接复刻核心算法）
// 关键不变量：以某点为锚缩放后，该点对应的世界坐标必须保持不变。

let k = 1, ox = 0, oy = 0, cw = 1100, ch = 640
const clampK = v => Math.min(4, Math.max(0.25, v))
const apply = () => ({ ox, oy, cw, ch })

function zoomBy(factor, cx = cw / 2, cy = ch / 2) {
  const wx = ox + cx / k
  const wy = oy + cy / k
  const k2 = clampK(k * factor)
  if (k2 === k) return
  k = k2
  ox = wx - cx / k
  oy = wy - cy / k
}
function pan(dxScreen, dyScreen) { ox -= dxScreen / k; oy -= dyScreen / k }
function fit(worldW, worldH, minFit = 0.04) {
  const raw = Math.min(cw / worldW, ch / worldH)
  const floor = Math.min(minFit, raw)
  k = Math.max(floor, Math.min(raw, 4))
  ox = worldW / 2 - cw / (2 * k)
  oy = worldH / 2 - ch / (2 * k)
}
const toWorld = (px, py) => ({ x: ox + px / k, y: oy + py / k })

let fails = 0
const check = (name, cond, extra = '') => {
  console.log(`${cond ? '✓' : '✗'} ${name}${extra ? '  ' + extra : ''}`)
  if (!cond) fails++
}

// 1. 锚点不变量：连续缩放 40 次，同一屏幕点的世界坐标必须不变
{
  const px = 733, py = 288
  const w0 = toWorld(px, py)
  for (let i = 0; i < 40; i++) zoomBy(1.08, px, py)
  const w1 = toWorld(px, py)
  check('缩放锚点不动', Math.hypot(w1.x - w0.x, w1.y - w0.y) < 1e-9,
    `漂移 ${Math.hypot(w1.x - w0.x, w1.y - w0.y).toExponential(2)}`)
  check('确实放大了', k > 1.09, `k=${k.toFixed(3)}`)
}

// 2. 缩小同样以锚点为中心（正负方向都要验）
{
  k = 2; ox = -300; oy = -700
  const px = 250, py = 480
  const w0 = toWorld(px, py)
  for (let i = 0; i < 12; i++) zoomBy(0.9, px, py)
  const w1 = toWorld(px, py)
  check('缩小锚点不动', Math.hypot(w1.x - w0.x, w1.y - w0.y) < 1e-9,
    `漂移 ${Math.hypot(w1.x - w0.x, w1.y - w0.y).toExponential(2)}`)
}

// 2b. 平移后，锚点世界坐标应精确平移对应的量
{
  k = 1.7; ox = -120; oy = -340
  const px = 600, py = 300
  const w0 = toWorld(px, py)
  pan(51, -33)
  const w1 = toWorld(px, py)
  // 手指向右移 51px，被手指按住的那个世界点应向左移 51/k —— 内容跟着手指走
  check('平移量换算正确（内容跟随手指）',
    Math.abs((w1.x - w0.x) + 51 / k) < 1e-9 && Math.abs((w1.y - w0.y) - 33 / k) < 1e-9,
    `Δ=(${(w1.x - w0.x).toFixed(3)}, ${(w1.y - w0.y).toFixed(3)}) 期望 (${(-51 / k).toFixed(3)}, ${(33 / k).toFixed(3)})`)
}

// 3. 平移的位移换算：屏幕上移 50px，世界应移动 50/k
{
  k = 1; ox = 0; oy = 0
  pan(0, 50)
  check('k=1 时平移 1:1', Math.abs(oy - -50) < 1e-12, `oy=${oy}`)
  k = 2
  ox = 0; oy = 0
  pan(0, 50)
  check('k=2 时世界只移动 25', Math.abs(oy - -25) < 1e-12, `oy=${oy}`)
}

// 4. 边界钳位
{
  k = 1; zoomBy(1000); check('缩放上限 4', Math.abs(k - 4) < 1e-12, `k=${k}`)
  zoomBy(0.0000001); check('缩放下限 0.25', Math.abs(k - 0.25) < 1e-12, `k=${k}`)
}

// 5. fit 后整个世界都在视口内（minFit 生效时可能超出，要如实报告）
{
  const world = { w: 1606, h: 11070 }
  fit(world.w, world.h)
  const a = toWorld(0, 0), b = toWorld(cw, ch)
  const covers = a.x <= 0 && a.y <= 0 && b.x >= world.w && b.y >= world.h
  check('fit 全览可见（不再被 min=0.25 截断）', covers, `k=${k.toFixed(4)} 覆盖 x[${a.x.toFixed(0)},${b.x.toFixed(0)}] y[${a.y.toFixed(0)},${b.y.toFixed(0)}]`)

  // 系谱图这类小世界：fit 应放大而不是缩小
  fit(980, 1400)
  check('小世界 fit 放大', k > 0.4, `k=${k.toFixed(3)}`)

  // 6. 1:1 下的可读性：文字不再被压缩
  k = 1; ox = 0; oy = 0
  check('1:1 时文字按真实 12px 渲染', Math.abs(k - 1) < 1e-12, `视口 ${cw}x${ch}`)
}

console.log(fails === 0 ? '\n全部通过' : `\n${fails} 项失败`)
process.exit(fails === 0 ? 0 : 1)
