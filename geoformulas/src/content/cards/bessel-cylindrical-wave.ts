import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** bessel-cylindrical-wave */
const besselCylindricalWave: FormulaCard = {
  id: 'bessel-cylindrical-wave',
  name: t('Bessel 函数与柱面波', 'Bessel Functions and Cylindrical Waves'),
  aliases: { zh: ['柱面波', '贝塞尔函数', '汉克尔函数', '柱面扩散'], en: ['cylindrical wave', 'Bessel function', 'Hankel function', 'cylindrical spreading'] },
  node: 'S0.5',
  tags: {
    math: ['MATH.DIFF', 'MATH.APPROX'],
    method: ['METH.SURF'],
    quantity: ['Q.GEOM', 'Q.AMP'],
    keywords: t('贝塞尔函数 汉克尔函数 柱面波 频散 远场渐近 二维几何扩散 面波', 'Bessel function Hankel function cylindrical wave dispersion far-field asymptotic 2D geometrical spreading surface wave'),
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`u(r,t)\simeq\frac{A}{\sqrt{r}}\cos\!\left(kr-\omega t-\frac{\pi}{4}\right)\qquad (kr\gg 1)`,
    variants: [
      { name: t('Hankel 函数的远场渐近（柱面波的来源）', 'Far-field asymptotic of Hankel functions (the origin of the cylindrical wave)'), latex: String.raw`H_{n}^{(1)}(x)\simeq\sqrt{\frac{2}{\pi x}}\,\exp\!\left[i\left(x-\frac{n\pi}{2}-\frac{\pi}{4}\right)\right]` },
      { name: t('第一、二类 Hankel 函数（外向波与内向波）', 'Hankel functions of first and second kind (outgoing and incoming)'), latex: String.raw`H_{n}^{(1)}=J_{n}+iY_{n}\ \text{（外向）},\qquad H_{n}^{(2)}=J_{n}-iY_{n}\ \text{（内向）}` },
      { name: t('Bessel 微分方程', 'The Bessel differential equation'), latex: String.raw`r^{2}\frac{\mathrm{d}^{2}R}{\mathrm{d}r^{2}}+r\frac{\mathrm{d}R}{\mathrm{d}r}+\left(k^{2}r^{2}-n^{2}\right)R=0` },
      { name: t('整数阶 Bessel 函数的积分表示', 'Integral representation for integer order'), latex: String.raw`J_{n}(x)=\frac{1}{\pi}\int_{0}^{\pi}\cos\!\left(n\tau-x\sin\tau\right)\mathrm{d}\tau` },
      { name: t('二维 Helmholtz 方程的外向 Green 函数', 'Outgoing Green function of the 2D Helmholtz equation'), latex: String.raw`G(\mathbf r)=\frac{i}{4}H_{0}^{(1)}(kr),\qquad \left(\nabla^{2}+k^{2}\right)G=-\delta(\mathbf r)` },
    ],
  },
  meaning: t(
    '在柱坐标下分离变量，径向方程必然给出 Bessel 函数。第一类 J_n 在原点有限（驻波），第二类 Y_n 在原点发散（奇源），二者组合成 Hankel 函数 H^{(1)}、H^{(2)} 分别对应向外与向内传播的柱面波。它们的大自变量渐近式含 1/√r 因子：这就是二维几何扩散——柱面波的振幅按 1/√r 衰减，比三维球面波的 1/r 慢得多，也是面波能传播上千公里的原因。',
    'Separating variables in cylindrical coordinates inevitably yields Bessel functions for the radial equation. J_n is finite at the origin (standing waves), Y_n diverges there (singular source), and their combinations H^{(1)} and H^{(2)} describe outgoing and incoming cylindrical waves. Their large-argument asymptotic carries a 1/√r factor: that is two-dimensional geometrical spreading. A cylindrical wave decays as 1/√r, much more slowly than the 1/r of a spherical wave, which is why surface waves travel for thousands of kilometres.',
  ),
  symbols: [
    { sym: 'J_n(x)', name: t('第一类 Bessel 函数（原点有限）', 'Bessel function of the first kind (finite at the origin)'), unit: '1' },
    { sym: 'Y_n(x)', name: t('第二类 Bessel 函数（原点发散）', 'Bessel function of the second kind (singular at the origin)'), unit: '1' },
    { sym: 'H_n^{(1)},H_n^{(2)}', name: t('Hankel 函数，外向波与内向波', 'Hankel functions, outgoing and incoming waves'), unit: '1' },
    { sym: 'r', name: t('离轴线的径向距离', 'radial distance from the axis'), unit: 'm' },
    { sym: 'k', name: t('波数', 'wavenumber'), unit: 'rad/m' },
    { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
    { sym: 'n', name: t('方位角阶数（整数）', 'azimuthal order (integer)'), unit: '1' },
    { sym: 'A', name: t('源强常数', 'source strength constant'), unit: 'm·m^{1/2}' },
  ],
  conditions: {
    applies: [
      t('柱对称或可分离为 (r, θ) 的二维/三维柱面问题', 'Cylindrically symmetric problems, or problems separable in (r, θ)'),
      t('远场渐近式要求 kr ≫ 1（通常 kr > 5 已足够）', 'The far-field asymptotic requires kr ≫ 1 (usually kr > 5 suffices)'),
    ],
    assumes: [
      t('均匀、各向同性、无衰减介质', 'Homogeneous, isotropic, non-attenuating medium'),
      t('整数阶 n（方位角周期为 2π）', 'Integer order n (azimuthal period 2π)'),
    ],
    breaks: [
      t('kr ≲ 1 的近场，渐近式完全失效，须用 J_n 与 Y_n 本身', 'In the near field kr ≲ 1 the asymptotic fails entirely and J_n, Y_n must be used'),
      t('有吸收时 k 取复数，渐近式要额外乘上指数衰减', 'With absorption k becomes complex and the asymptotic acquires an extra exponential decay'),
      t('横向非均匀介质不能简单分离变量，需用数值解', 'Laterally heterogeneous media do not separate; numerical solutions are needed'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('二维 Helmholtz 方程', 'The 2D Helmholtz equation'),
      latex: String.raw`\left(\nabla^{2}+k^{2}\right)u=0,\qquad \nabla^{2}=\frac{\partial^{2}}{\partial r^{2}}+\frac{1}{r}\frac{\partial}{\partial r}+\frac{1}{r^{2}}\frac{\partial^{2}}{\partial\theta^{2}}` },
    { n: 2, op: 'transform', title: t('分离变量 u = R(r)Θ(θ)', 'Separate variables u = R(r)Θ(θ)'),
      latex: String.raw`\frac{r^{2}R''+rR'}{R}+k^{2}r^{2}=-\frac{\Theta''}{\Theta}=n^{2}`,
      note: t('两边依赖不同变量，只能同为常数 n²；方位角周期 2π 要求 n 为整数。', 'The two sides depend on different variables, so both equal a constant n²; the 2π azimuthal periodicity forces n to be an integer.') },
    { n: 3, op: 'algebra', title: t('径向方程化为标准 Bessel 方程', 'The radial equation becomes the standard Bessel equation'),
      latex: String.raw`x=kr:\qquad x^{2}\frac{\mathrm{d}^{2}R}{\mathrm{d}x^{2}}+x\frac{\mathrm{d}R}{\mathrm{d}x}+\left(x^{2}-n^{2}\right)R=0` },
    { n: 4, op: 'result', title: t('两个线性独立解：J_n 与 Y_n', 'Two linearly independent solutions: J_n and Y_n'),
      latex: String.raw`R=A\,J_{n}(kr)+B\,Y_{n}(kr)`,
      note: t('J_n 在原点正则（适合有限振幅问题），Y_n 在原点对数发散（代表位于轴上的源）。', 'J_n is regular at the origin (finite-amplitude problems), Y_n diverges logarithmically there (a source sitting on the axis).') },
    { n: 5, op: 'setup', title: t('组合成行波：Hankel 函数', 'Combine into travelling waves: Hankel functions'),
      latex: String.raw`H_{n}^{(1)}=J_{n}+iY_{n}\;\xrightarrow{\text{大 }x}\;\sqrt{\frac{2}{\pi x}}\,e^{i\left(x-\frac{n\pi}{2}-\frac{\pi}{4}\right)}`,
      note: t('配时间因子 e^{−iωt} 后，e^{+ikr} 即为向外传播；这是选择 H^{(1)} 的理由。', 'With the time factor e^{−iωt}, the factor e^{+ikr} propagates outward; that is why H^{(1)} is chosen for outgoing waves.') },
    { n: 6, op: 'result', title: t('取出实部，得到柱面波', 'Take the real part to get the cylindrical wave'),
      latex: String.raw`u(r,t)=\Re\!\left\{A\,H_{0}^{(1)}(kr)e^{-i\omega t}\right\}\simeq A\sqrt{\frac{2}{\pi kr}}\cos\!\left(kr-\omega t-\frac{\pi}{4}\right)`,
      note: t('振幅 ∝ 1/√r：能量分布在周长 2πr 上，能流密度 ∝ 1/r，故振幅 ∝ 1/√r。这就是二维几何扩散。', 'Amplitude goes as 1/√r: energy spreads over a circumference 2πr, so energy flux density falls as 1/r and amplitude as 1/√r. That is two-dimensional geometrical spreading.') },
    { n: 7, op: 'result', title: t('二维 Green 函数的归一化', 'Normalisation of the 2D Green function'),
      latex: String.raw`\left(\nabla^{2}+k^{2}\right)\frac{i}{4}H_{0}^{(1)}(kr)=-\delta(\mathbf r)` },
  ],
  viz: [
    {
      id: 'bessel-jn-curves',
      level: 'V1',
      title: t('前几阶 Bessel 函数 J₀、J₁、J₂', 'The first few Bessel functions J₀, J₁, J₂'),
      xlabel: t('自变量 x = kr', 'argument x = kr'),
      ylabel: t('J_n(x)', 'J_n(x)'),
      controls: [
        { id: 'xmax', label: t('横坐标上限', 'upper limit of the abscissa'), min: 5, max: 40, step: 1, value: 20, unit: '1' },
      ],
      yRange: [-0.6, 1.05],
      note: t('所有 J_n 都是衰减振荡，幅度按 1/√x 收缩，零点间隔趋于 π。n 越大，第一个零点越往右移 —— 这决定了高阶模态的截止频率。', 'All J_n oscillate with an amplitude shrinking like 1/√x and zero spacing tending to π. Larger n pushes the first zero to the right, which sets the cut-off frequency of higher modes.'),
      compute: (p) => {
        const xmax = p['xmax']
        const palette = ['#185FA5', '#BA7517', '#0F6E56']
        const out: Array<{ label: { zh: string; en: string }; color: string; points: Array<[number, number]> }> = []
        for (let n = 0; n < 3; n++) {
          const pts: Array<[number, number]> = []
          for (let i = 0; i <= 500; i++) {
            const x = (i / 500) * xmax
            pts.push([x, besselJ(n, x)])
          }
          out.push({ label: t(`J_${n}`, `J_${n}`), color: palette[n], points: pts })
        }
        return out
      },
    },
    {
      id: 'bessel-asymptotic',
      level: 'V1',
      title: t('远场渐近：柱面波的 1/√r 衰减', 'Far-field asymptotic: the 1/√r decay of a cylindrical wave'),
      xlabel: t('自变量 x = kr', 'argument x = kr'),
      ylabel: t('J₀(x) 与渐近式', 'J₀(x) and its asymptotic'),
      controls: [
        { id: 'xstart', label: t('起始点', 'starting point'), min: 0.5, max: 8, step: 0.1, value: 2, unit: '1' },
        { id: 'xmax2', label: t('横坐标上限', 'upper limit of the abscissa'), min: 10, max: 60, step: 1, value: 30, unit: '1' },
      ],
      note: t('把起始点往右推，渐近曲线与精确曲线迅速重合 —— kr > 5 之后误差已在百分级以内。虚线是包络 ±√(2/πx)，它就是柱面波的振幅衰减律。', 'Pushing the start point to the right makes the asymptotic curve merge with the exact one: beyond kr ≈ 5 the error is already at the percent level. The dashed envelope ±√(2/πx) is precisely the decay law of a cylindrical wave.'),
      compute: (p) => {
        const x0 = Math.max(0.2, p['xstart'])
        const x1 = Math.max(x0 + 2, p['xmax2'])
        const ex: Array<[number, number]> = []
        const as_: Array<[number, number]> = []
        const up: Array<[number, number]> = []
        const dn: Array<[number, number]> = []
        for (let i = 0; i <= 600; i++) {
          const x = x0 + (i / 600) * (x1 - x0)
          const env = Math.sqrt(2 / (Math.PI * x))
          ex.push([x, besselJ(0, x)])
          as_.push([x, env * Math.cos(x - Math.PI / 4)])
          up.push([x, env])
          dn.push([x, -env])
        }
        return [
          { label: t('J₀(x) 精确', 'J₀(x) exact'), color: '#185FA5', points: ex },
          { label: t('渐近式 √(2/πx)cos(x−π/4)', 'asymptotic √(2/πx)cos(x−π/4)'), color: '#BA7517', dash: true, points: as_ },
          { label: t('包络 +√(2/πx)', 'envelope +√(2/πx)'), color: '#B4B2A9', dash: true, points: up },
          { label: t('包络 −√(2/πx)', 'envelope −√(2/πx)'), color: '#B4B2A9', dash: true, points: dn },
        ]
      },
    },
  ],
  example: {
    title: t('面波振幅随距离的衰减', 'Surface-wave amplitude decay with distance'),
    input: t('100 km 处振幅 1 μm，问 1000 km 处（柱面扩散）与三维情形对比', 'Amplitude 1 μm at 100 km; find it at 1000 km for cylindrical spreading, and compare with 3D'),
    steps: [
      t('柱面扩散：A ∝ 1/√r，比值 = √(100/1000) = 0.316', 'Cylindrical spreading: A ∝ 1/√r, ratio = √(100/1000) = 0.316'),
      t('球面扩散：A ∝ 1/r，比值 = 100/1000 = 0.1', 'Spherical spreading: A ∝ 1/r, ratio = 100/1000 = 0.1'),
      t('故 1000 km 处面波约 0.32 μm，体波约 0.10 μm', 'So at 1000 km the surface wave is about 0.32 μm and the body wave about 0.10 μm'),
    ],
    output: t('同样的距离，面波比体波衰减慢 3 倍多 —— 远震记录上面波占据主导地位就是这个原因。', 'Over the same distance surface waves decay more than three times more slowly than body waves. That is why surface waves dominate teleseismic records.'),
  },
  links: {
    seealso: [
      { id: 'helmholtz-green-function', note: t('三维对应物是 e^{ikr}/(4πr)', 'the 3D counterpart is e^{ikr}/(4πr)') },
      { id: 'hankel-transform', note: t('柱对称函数的 Fourier 变换', 'the Fourier transform of cylindrically symmetric functions') },
      { id: 'love-wave-dispersion', note: t('层状介质中的导波也用同样的径向函数', 'guided waves in layered media use the same radial functions') },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §6.1' },
    { text: 'Abramowitz & Stegun, Handbook of Mathematical Functions, Ch. 9' },
  ],
}

function besselJ(n: number, x: number): number {
  const M = 400
  const h = Math.PI / M
  let s = 0
  for (let i = 0; i <= M; i++) {
    const tau = i * h
    const w = i === 0 || i === M ? 1 : i % 2 === 1 ? 4 : 2
    s += w * Math.cos(n * tau - x * Math.sin(tau))
  }
  return (s * h) / 3 / Math.PI
}

export default besselCylindricalWave
