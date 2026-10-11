import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** rayleigh-elliptical-polarization */
const rayleighEllipticalPolarization: FormulaCard = {
  id: 'rayleigh-elliptical-polarization',
  name: t('Rayleigh 波的椭圆极化与深度衰减', 'Rayleigh-wave Elliptical Polarization & Depth Decay'),
  aliases: { zh: ['椭圆极化', '椭圆率', 'Rayleigh 波极化'], en: ['elliptical polarization', 'ellipticity', 'Rayleigh polarization'] },
  node: 'S5.2',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.COMPLEX'],
    method: ['METH.SURF'],
    quantity: ['Q.VEL', 'Q.AMP'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`u_x = -iA\kappa\left(e^{-\kappa r_\alpha z} - \frac{2\kappa r_\beta}{k^{2}+r_\beta^{2}}\,e^{-\kappa r_\beta z}\right),\qquad
u_z = A r_\alpha\left(e^{-\kappa r_\alpha z} - \frac{2k^{2}}{k^{2}+r_\beta^{2}}\,e^{-\kappa r_\beta z}\right)`,
    variants: [
      { name: t('衰减因子定义', 'Decay-factor definitions'), latex: String.raw`r_\alpha = \sqrt{1-\frac{c^{2}}{\alpha^{2}}},\qquad r_\beta = \sqrt{1-\frac{c^{2}}{\beta^{2}}}` },
      { name: t('地表椭圆率', 'Ellipticity at the surface'), latex: String.raw`\frac{u_x(z=0)}{u_z(z=0)} = -i\,\frac{\kappa}{r_\alpha}\cdot\frac{1-\dfrac{2\kappa r_\beta}{k^{2}+r_\beta^{2}}}{1-\dfrac{2k^{2}}{k^{2}+r_\beta^{2}}}` },
      { name: t('质点运动为逆行椭圆', 'Particle motion is a retrograde ellipse'), latex: String.raw`\text{近地表：}\ \mathrm{Re}(u_x)\ \text{与}\ \mathrm{Re}(u_z)\ \text{相差}\ \frac{\pi}{2}\ \text{相位}` },
    ],
  },
  meaning: t(
    'Rayleigh 波不是单纯的上下或左右振动，而是 P 与 SV 两个指数衰减项按特定比例叠加出来的椭圆运动。在地表质点沿椭圆逆行转动（前进方向的顶部向后），随深度加深两个衰减项的相对权重改变，椭圆会「翻转」成顺行 —— 这个翻转深度是椭圆率曲线的零点，也是 H/V 法估计沉积层厚度的物理基础。',
    'A Rayleigh wave is not purely vertical or horizontal motion but an ellipse formed by superposing two exponentially decaying P and SV terms with a specific ratio. At the surface particles move on a retrograde ellipse; with depth the relative weight of the two decaying terms changes and the ellipse flips to prograde. That flip depth is the zero of the ellipticity curve and is the physical basis for estimating sediment thickness with the H/V method.',
  ),
  symbols: [
    { sym: 'u_x, u_z', name: t('水平与垂直位移分量', 'horizontal and vertical displacement components'), unit: 'm' },
    { sym: 'k', name: t('水平波数', 'horizontal wavenumber'), unit: 'rad/km' },
    { sym: '\\kappa', name: t('同 k 的量（记号区分）', 'same as k (notation distinction)'), unit: 'rad/km' },
    { sym: 'r_\\alpha, r_\\beta', name: t('P 与 S 的无量纲衰减因子', 'dimensionless P and S decay factors'), unit: '无量纲' },
    { sym: 'c', name: t('Rayleigh 波相速度', 'Rayleigh-wave phase velocity'), unit: 'km/s' },
  ],
  conditions: {
    applies: [t('H/V 谱比法、椭圆率反演、面波极化分析', 'H/V spectral ratio, ellipticity inversion, surface-wave polarization analysis')],
    assumes: [t('均匀半空间或分层半空间', 'Uniform or layered half-space'), t('P–SV 耦合、无 SH 成分', 'P–SV coupling, no SH component')],
    breaks: [t('强横向非均匀使极化平面旋转', 'Strong lateral heterogeneity rotates the polarization plane'), t('存在显著噪声时椭圆率不稳定', 'Ellipticity is unstable in the presence of significant noise')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('设两个指数衰减的势函数', 'Postulate two exponentially decaying potentials'), latex: String.raw`\phi = A e^{-\kappa r_\alpha z} e^{i(\omega t - kx)},\quad \psi = B e^{-\kappa r_\beta z} e^{i(\omega t - kx)}` },
    { n: 2, op: 'physics', title: t('自由表面应力为零给出 A、B 之比', 'Zero traction at the free surface fixes the A:B ratio'), latex: String.raw`\sigma_{zz}=0,\ \sigma_{xz}=0 \Longrightarrow \frac{B}{A} = -\frac{2i\,r_\alpha k}{k^{2}+r_\beta^{2}}` },
    { n: 3, op: 'substitute', title: t('代入位移—势关系 u = ∇φ + ∇×ψ', 'Insert the displacement–potential relations u = ∇φ + ∇×ψ'), latex: String.raw`u_x = \partial_x\phi - \partial_z\psi,\qquad u_z = \partial_z\phi + \partial_x\psi` },
    { n: 4, op: 'algebra', title: t('整理出两个分量', 'Collect the two components'), latex: String.raw`u_x = -iA\kappa\left(e^{-\kappa r_\alpha z} - \frac{2\kappa r_\beta}{k^{2}+r_\beta^{2}}e^{-\kappa r_\beta z}\right)` },
    { n: 5, op: 'result', title: t('90° 相差 ⇒ 椭圆；两分解速度不同 ⇒ 随深度翻转', 'A 90° phase difference gives an ellipse; unequal decay rates make it flip with depth'), latex: String.raw`u_x \propto i\,(\cdots),\ u_z \propto (\cdots)\ \Rightarrow\ \text{椭圆极化}` },
  ],
  viz: [
    {
      id: 'rayleigh-ellip',
      level: 'V2',
      title: t('Rayleigh 波在均匀半空间中的椭圆极化与深度衰减', 'Elliptical polarization and depth decay in a uniform half-space'),
      xlabel: t('水平位移 (归一化)', 'horizontal displacement (normalised)'),
      ylabel: t('垂直位移 (归一化)', 'vertical displacement (normalised)'),
      controls: [
        { id: 'nu', label: t("泊松比 ν", "Poisson's ratio ν"), min: 0.05, max: 0.48, step: 0.01, value: 0.25 },
        { id: 'zfac', label: t('深度 z / λ', 'depth z / λ'), min: 0, max: 1.5, step: 0.02, value: 0 },
      ],
      note: t('深度为 0 时椭圆逆行（顶部向左）；增大深度到某个临界值后椭圆压扁并反转为顺行。改变泊松比会明显改变椭圆的扁平程度。', 'At zero depth the ellipse is retrograde (top moves backwards); increasing depth past a critical value flattens the ellipse and reverses it to prograde. Changing Poisson\'s ratio strongly changes how flat the ellipse is.'),
      compute: (p) => {
        const nu = p['nu'], zf = p['zfac']
        // 由泊松比得到 α/β
        const r = (1 - nu) / (0.5 - nu) // (α/β)^2
        const aob = Math.sqrt(r)
        // Rayleigh 方程近似解 c/β
        const x = (0.862 + 1.14 * nu) / (1 + nu) // c/β 近似
        const cb = Math.min(x, 0.955)
        const ra = Math.sqrt(Math.max(1e-9, 1 - (cb * cb) / (aob * aob)))
        const rb = Math.sqrt(Math.max(1e-9, 1 - cb * cb))
        const k = 1 // 归一化波数，λ = 2π/k
        const z = (zf * 2 * Math.PI) / k
        const pts: Array<[number, number]> = []
        const A = 1
        const coef = (2 * k * rb) / (k * k + rb * rb)
        const coef2 = (2 * k * k) / (k * k + rb * rb)
        for (let i = 0; i <= 200; i++) {
          const ph = (i / 200) * 2 * Math.PI
          const ex = Math.exp(-k * ra * z)
          const eb = Math.exp(-k * rb * z)
          // u_x ∝ i(...)，取实部后为 -sin(ph) 因子
          const ux = -A * k * (ex - coef * eb) * Math.sin(ph)
          const uz = A * ra * (ex - coef2 * eb) * Math.cos(ph)
          pts.push([ux, uz])
        }
        return [{ label: t('质点运动轨迹', 'particle motion'), color: '#185FA5', points: pts }]
      },
    },
    {
      id: 'rayleigh-decay',
      level: 'V2',
      title: t('两个位移分量随深度的振幅衰减', 'Amplitude decay of the two components with depth'),
      xlabel: t('|u| (归一化)', '|u| (normalised)'),
      ylabel: t('深度 z / λ', 'depth z / λ'),
      controls: [
        { id: 'nu', label: t("泊松比 ν", "Poisson's ratio ν"), min: 0.05, max: 0.48, step: 0.01, value: 0.25 },
      ],
      note: t('垂直分量在某一深度归零（椭圆反转为顺行），然后反向增大，能量主要集中在约一个波长以内 —— 这正是面波「浅」的定量含义。', 'The vertical component vanishes at a certain depth (the ellipse flips to prograde) then grows with opposite sign; energy is concentrated within about one wavelength — the quantitative meaning of surface waves being "shallow".'),
      compute: (p) => {
        const nu = p['nu']
        const aob = Math.sqrt((1 - nu) / (0.5 - nu))
        const cb = Math.min((0.862 + 1.14 * nu) / (1 + nu), 0.955)
        const ra = Math.sqrt(Math.max(1e-9, 1 - (cb * cb) / (aob * aob)))
        const rb = Math.sqrt(Math.max(1e-9, 1 - cb * cb))
        const k = 1
        const coef = (2 * k * rb) / (k * k + rb * rb)
        const coef2 = (2 * k * k) / (k * k + rb * rb)
        const ux: Array<[number, number]> = []
        const uz: Array<[number, number]> = []
        for (let i = 0; i <= 120; i++) {
          const z = (i / 120) * 1.5 * ((2 * Math.PI) / k)
          const ex = Math.exp(-k * ra * z)
          const eb = Math.exp(-k * rb * z)
          const d = (2 * Math.PI) / k
          ux.push([Math.abs(k * (ex - coef * eb)), z / d])
          uz.push([Math.abs(ra * (ex - coef2 * eb)) * 3, z / d])
        }
        return [
          { label: t('水平分量 |u_x|', 'horizontal |u_x|'), color: '#185FA5', points: ux },
          { label: t('垂直分量 |u_z|（×3）', 'vertical |u_z| (×3)'), color: '#993C1D', points: uz },
        ]
      },
    },
  ],
  example: {
    title: t('ν = 0.25 时的椭圆形状', 'Ellipse shape for ν = 0.25'),
    input: t('ν = 0.25 ⇒ α/β = √3，c/β ≈ 0.919', 'ν = 0.25 gives α/β = √3 and c/β ≈ 0.919'),
    steps: [
      t('r_α = √(1 − 0.919²/3) = 0.856，r_β = √(1 − 0.919²) = 0.394', 'r_α = √(1 − 0.919²/3) = 0.856, r_β = √(1 − 0.919²) = 0.394'),
      t('地表处 u_x 与 u_z 振幅比约 0.68', 'At the surface the |u_x| / |u_z| amplitude ratio is about 0.68'),
    ],
    output: t('一个明显逆行的椭圆，垂直位移略大于水平位移', 'A clearly retrograde ellipse with vertical motion slightly larger than horizontal'),
  },
  links: {
    upstream: [{ id: 'rayleigh-wave-equation', note: t('先由特征方程求出 c', 'First obtain c from the characteristic equation') }],
    downstream: [{ id: 'site-amplification-hv', note: t('椭圆率是 H/V 谱比的物理来源', 'Ellipticity is the physical origin of the H/V ratio') }],
    seealso: [{ id: 'poissons-ratio-lame', note: t('泊松比决定椭圆扁平程度', "Poisson's ratio controls how flat the ellipse is") }],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §7.5' }],
}

export default rayleighEllipticalPolarization
