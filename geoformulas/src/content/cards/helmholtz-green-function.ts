import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** helmholtz-green-function */
const helmholtzGreenFunction: FormulaCard = {
  id: 'helmholtz-green-function',
  name: t('无界空间 Helmholtz 方程的 Green 函数', 'The Green Function of the Helmholtz Equation in Unbounded Space'),
  aliases: { zh: ['亥姆霍兹方程格林函数', '自由空间格林函数', '外向波解'], en: ['Helmholtz Green function', 'free-space Green function', 'outgoing wave solution'] },
  node: 'S0.7',
  tags: {
    math: ['MATH.DIFF', 'MATH.FOURIER'],
    method: ['METH.EXPL'],
    quantity: ['Q.AMP', 'Q.FREQ'],
    keywords: t('亥姆霍兹 格林函数 外向波 Sommerfeld 辐射条件 散射 Born 近似 推迟势', 'Helmholtz Green function outgoing wave Sommerfeld radiation condition scattering Born approximation retarded potential'),
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`G(\mathbf r,\mathbf r')=\frac{e^{ik\left|\mathbf r-\mathbf r'\right|}}{4\pi\left|\mathbf r-\mathbf r'\right|}`,
    variants: [
      { name: t('所满足的方程', 'The equation it satisfies'), latex: String.raw`\left(\nabla^{2}+k^{2}\right)G(\mathbf r,\mathbf r')=-\delta(\mathbf r-\mathbf r')` },
      { name: t('内向波（取共轭）', 'Incoming wave (the conjugate)'), latex: String.raw`G_{\text{in}}=\frac{e^{-ikr}}{4\pi r}` },
      { name: t('Sommerfeld 辐射条件', 'Sommerfeld radiation condition'), latex: String.raw`\lim_{r\to\infty}r\left(\frac{\partial G}{\partial r}-ikG\right)=0` },
      { name: t('时域形式（推迟势）', 'Time-domain form (retarded potential)'), latex: String.raw`\left(\nabla^{2}-\frac{1}{c^{2}}\frac{\partial^{2}}{\partial t^{2}}\right)g=-\delta(\mathbf r)\delta(t)\;\Longrightarrow\; g(\mathbf r,t)=\frac{\delta\!\left(t-\frac{r}{c}\right)}{4\pi r}` },
      { name: t('二维对应物', 'Two-dimensional counterpart'), latex: String.raw`G_{2\mathrm{D}}=\frac{i}{4}H_{0}^{(1)}(kr)\simeq\frac{i}{4}\sqrt{\frac{2}{\pi kr}}\,e^{i\left(kr-\frac{\pi}{4}\right)}` },
      { name: t('远场近似（散射问题常用）', 'Far-field approximation (common in scattering)'), latex: String.raw`\left|\mathbf r-\mathbf r'\right|\approx r-\hat{\mathbf r}\cdot\mathbf r'\;\Longrightarrow\; G\approx\frac{e^{ikr}}{4\pi r}e^{-ik\hat{\mathbf r}\cdot\mathbf r'}` },
    ],
  },
  meaning: t(
    '这是弹性波散射、衍射层析、Born 反演与全波形反演的原子：无界均匀介质中一个单频点源产生的场，就是一个向外扩张的球面，振幅 1/r、相位 kr。它的时间形式是 δ(t − r/c)/(4πr)——一个以速度 c 向外传播、幅度按 1/r 衰减的理想脉冲。任何复杂的散射场都可以看成介质中每个点被入射波激发后，各自发出这样一个球面波的叠加。',
    'This is the atom of elastic-wave scattering, diffraction tomography, Born inversion and full-waveform inversion: the field of a monochromatic point source in an unbounded homogeneous medium is an expanding sphere with amplitude 1/r and phase kr. In the time domain it is δ(t − r/c)/(4πr), an ideal pulse travelling outward at speed c with amplitude decaying as 1/r. Any complicated scattered field can be regarded as the superposition of such spherical waves reradiated by every point of the medium as it is excited by the incident wave.',
  ),
  symbols: [
    { sym: 'G', name: t('频域 Green 函数（单频点源响应）', 'frequency-domain Green function (monochromatic point-source response)'), unit: 'm⁻¹' },
    { sym: 'k', name: t('波数 k = ω/c', 'wavenumber k = ω/c'), unit: 'rad/m' },
    { sym: 'r', name: t('源到观测点的距离', 'distance from source to receiver'), unit: 'm' },
    { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
    { sym: 'c', name: t('波速', 'wave speed'), unit: 'm/s' },
    { sym: 'H_0^{(1)}', name: t('第一类零阶 Hankel 函数', 'Hankel function of the first kind, order zero'), unit: '1' },
    { sym: '\\hat{\\mathbf r}', name: t('观测方向的单位矢量', 'unit vector along the observation direction'), unit: '1' },
  ],
  conditions: {
    applies: [
      t('三维无界、均匀、无衰减介质中的单频（谐和）场', 'Monochromatic fields in unbounded, homogeneous, non-attenuating 3D media'),
      t('远场散射、Born 近似、Kirchhoff 偏移的理论基础', 'The theoretical basis of far-field scattering, the Born approximation and Kirchhoff migration'),
    ],
    assumes: [
      t('采用 e^{−iωt} 的时间约定；外向波对应 e^{+ikr}', 'Time convention e^{−iωt}; the outgoing wave corresponds to e^{+ikr}'),
      t('满足 Sommerfeld 辐射条件，从而在无穷远处排除内向波', 'The Sommerfeld radiation condition holds, excluding incoming waves at infinity'),
    ],
    breaks: [
      t('有吸收时 k 取复数：k = ω/c − iα，需另加 e^{−αr}', 'With absorption k is complex, k = ω/c − iα, and an extra factor e^{−αr} appears'),
      t('存在界面时必须叠加反射/透射项，自由空间的单一球面波不再足够', 'With interfaces, reflection and transmission terms must be added; a single free-space spherical wave is not enough'),
      t('二维问题不能套用三维公式，须改用 Hankel 函数（见变体）', 'The 3D formula must not be used in 2D; switch to Hankel functions (see variants)'),
      t('r → 0 时发散，数值实现需做奇点处理', 'The function diverges as r → 0, so numerical implementations need special treatment of the singularity'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('对 δ 源求 Fourier 变换，得到 Helmholtz 方程', 'Fourier transform the delta source to get the Helmholtz equation'),
      latex: String.raw`\left(\nabla^{2}-\frac{1}{c^{2}}\frac{\partial^{2}}{\partial t^{2}}\right)g=-\delta(\mathbf r)\delta(t)\;\xrightarrow{\;e^{-i\omega t}\;}\;\left(\nabla^{2}+k^{2}\right)G=-\delta(\mathbf r)` },
    { n: 2, op: 'geometry', title: t('点源具有球对称性，G 只依赖 r', 'A point source is spherically symmetric, so G depends only on r'),
      latex: String.raw`\nabla^{2}G=\frac{1}{r}\frac{\mathrm{d}^{2}}{\mathrm{d}r^{2}}\left(rG\right)` },
    { n: 3, op: 'transform', title: t('令 w = rG，方程化为一维', 'Set w = rG to reduce to one dimension'),
      latex: String.raw`\frac{\mathrm{d}^{2}w}{\mathrm{d}r^{2}}+k^{2}w=0\quad (r>0)\;\Longrightarrow\; w=Ae^{ikr}+Be^{-ikr}` },
    { n: 4, op: 'physics', title: t('Sommerfeld 辐射条件排除内向波', 'The Sommerfeld radiation condition excludes the incoming wave'),
      latex: String.raw`B=0\;\Longrightarrow\; G=\frac{A\,e^{ikr}}{r}`,
      note: t('物理要求能量向外流走，所以只保留 e^{+ikr} 项（配合 e^{−iωt} 约定）。', 'Physics requires energy to flow outward, so only the e^{+ikr} term survives (with the e^{−iωt} convention).') },
    { n: 5, op: 'identity', title: t('用小球的通量积分定出归一化常数', 'Fix the normalisation by a flux integral over a small sphere'),
      latex: String.raw`\oint_{r=\varepsilon}\frac{\partial G}{\partial r}\,\mathrm{d}S=\left(-\frac{A}{\varepsilon^{2}}\right)4\pi\varepsilon^{2}=-4\pi A=-1\;\Longrightarrow\; A=\frac{1}{4\pi}` },
    { n: 6, op: 'result', title: t('得到自由空间 Green 函数', 'Obtain the free-space Green function'),
      latex: String.raw`G(\mathbf r,\mathbf r')=\frac{e^{ik\left|\mathbf r-\mathbf r'\right|}}{4\pi\left|\mathbf r-\mathbf r'\right|}` },
    { n: 7, op: 'transform', title: t('反变换回时域：推迟势', 'Transform back to the time domain: the retarded potential'),
      latex: String.raw`g(\mathbf r,t)=\frac{1}{2\pi}\int \frac{e^{ikr}}{4\pi r}e^{-i\omega t}\,\mathrm{d}\omega=\frac{\delta\!\left(t-\frac{r}{c}\right)}{4\pi r}`,
      note: t('δ(t − r/c) 说明扰动严格以速度 c 传播，没有任何「提前」或「滞后」——这就是因果性的数学表达。', 'The factor δ(t − r/c) says the disturbance travels strictly at speed c with no advance or delay. That is the mathematical expression of causality.') },
  ],
  viz: [
    {
      id: 'helmholtz-real-part',
      level: 'V1',
      title: t('单频球面波：振荡乘以 1/r', 'A monochromatic spherical wave: oscillation times 1/r'),
      xlabel: t('距离 r (km)', 'distance r (km)'),
      ylabel: t('Re{G}（相对单位）', 'Re{G} (relative units)'),
      controls: [
        { id: 'ff', label: t('频率 f', 'frequency f'), min: 0.1, max: 5, step: 0.05, value: 1, unit: 'Hz' },
        { id: 'cv', label: t('波速 c', 'wave speed c'), min: 1, max: 8, step: 0.1, value: 4, unit: 'km/s' },
        { id: 'tp', label: t('时刻 t', 'time t'), min: 0, max: 2, step: 0.02, value: 0, unit: 's' },
      ],
      xRange: [0.5, 40],
      note: t('波长 λ = c/f：把 f 调高，波纹变密；无论怎么调，包络始终是 1/(4πr)。虚线就是这个包络，它与频率完全无关 —— 几何扩散与频率无关，这是它与 Q 衰减的根本区别。', 'The wavelength is λ = c/f: raising f makes the ripples finer, but the envelope always stays 1/(4πr). The dashed envelope is completely independent of frequency. Geometrical spreading does not depend on frequency, which is the fundamental difference between it and Q attenuation.'),
      compute: (p) => {
        const f = p['ff'], c = p['cv'], tp = p['tp']
        const k = (2 * Math.PI * f) / c
        const w = 2 * Math.PI * f
        const pts: Array<[number, number]> = []
        const up: Array<[number, number]> = []
        const dn: Array<[number, number]> = []
        for (let i = 0; i <= 800; i++) {
          const r = 0.5 + (i / 800) * 39.5
          const env = 1 / (4 * Math.PI * r)
          pts.push([r, env * Math.cos(k * r - w * tp)])
          up.push([r, env])
          dn.push([r, -env])
        }
        return [
          { label: t('Re{G(r) e^{−iωt}}', 'Re{G(r) e^{−iωt}}'), color: '#185FA5', points: pts },
          { label: t('包络 +1/(4πr)', 'envelope +1/(4πr)'), color: '#B4B2A9', dash: true, points: up },
          { label: t('包络 −1/(4πr)', 'envelope −1/(4πr)'), color: '#B4B2A9', dash: true, points: dn },
        ]
      },
    },
    {
      id: 'helmholtz-decay-compare',
      level: 'V1',
      title: t('同样的距离，几何扩散与 Q 衰减的差别', 'Over the same distance: geometrical spreading versus Q attenuation'),
      xlabel: t('距离 r (km)', 'distance r (km)'),
      ylabel: t('相对振幅', 'relative amplitude'),
      controls: [
        { id: 'QQ', label: t('品质因子 Q', 'quality factor Q'), min: 20, max: 1000, step: 10, value: 200, unit: '1' },
        { id: 'f2', label: t('频率 f', 'frequency f'), min: 0.1, max: 10, step: 0.1, value: 2, unit: 'Hz' },
        { id: 'c2', label: t('波速 c', 'wave speed c'), min: 1, max: 8, step: 0.1, value: 4, unit: 'km/s' },
      ],
      xRange: [0, 300],
      yScale: 'log',
      note: t('几何扩散（灰）与频率无关；Q 衰减（蓝）与频率成正比地变陡。高频远震体波看不见，正是这两条曲线相乘的结果。', 'Geometrical spreading (grey) is frequency independent, while Q attenuation (blue) steepens in proportion to frequency. The invisibility of high-frequency teleseismic body waves is exactly the product of these two curves.'),
      compute: (p) => {
        const Q = Math.max(1, p['QQ']), f = p['f2'], c = p['c2']
        const alpha = (Math.PI * f) / (Q * c)
        const geo: Array<[number, number]> = []
        const att: Array<[number, number]> = []
        const tot: Array<[number, number]> = []
        for (let i = 0; i <= 600; i++) {
          const r = 1 + (i / 600) * 299
          const g = 1 / r
          const a = Math.exp(-alpha * r)
          geo.push([r, g])
          att.push([r, a])
          tot.push([r, g * a])
        }
        return [
          { label: t('几何扩散 1/r', 'geometrical spreading 1/r'), color: '#B4B2A9', dash: true, points: geo },
          { label: t('Q 衰减 exp(−πfr/Qc)', 'Q attenuation exp(−πfr/Qc)'), color: '#185FA5', dash: true, points: att },
          { label: t('二者的乘积', 'the product'), color: '#993C1D', points: tot },
        ]
      },
    },
  ],
  example: {
    title: t('一个散射点的远场', 'Far field of a single scattering point'),
    input: t('频率 2 Hz，速度 4 km/s，散射体距台站 50 km', 'Frequency 2 Hz, speed 4 km/s, scatterer 50 km from the station'),
    steps: [
      t('k = 2πf/c = 2π × 2/4 = 3.14 rad/km', 'k = 2πf/c = 2π × 2/4 = 3.14 rad/km'),
      t('|G| = 1/(4π × 50) = 1.59 × 10⁻³ km⁻¹', '|G| = 1/(4π × 50) = 1.59 × 10⁻³ km⁻¹'),
      t('相位 kr = 3.14 × 50 = 157 rad ≈ 25 个周期', 'Phase kr = 3.14 × 50 = 157 rad, about 25 cycles'),
    ],
    output: t('幅度由 1/r 定死，相位由 kr 定死。散射反演中的 Born 近似，就是把每个像点都当成这样一个点源再叠加。', 'The amplitude is fixed by 1/r and the phase by kr. The Born approximation in scattering inversion treats every image point as just such a point source and superposes them.'),
  },
  links: {
    upstream: [
      { id: 'green-function-definition', note: t('它是该定义在 Helmholtz 算子下的实例', 'it is that definition instantiated for the Helmholtz operator') },
    ],
    seealso: [
      { id: 'bessel-cylindrical-wave', note: t('二维对应物用 Hankel 函数', 'the 2D counterpart uses Hankel functions') },
      { id: 'spherical-wave-solution', note: t('时域就是推迟球面波', 'in the time domain it is the retarded spherical wave') },
      { id: 'fourier-transform', note: t('与时域解通过 Fourier 变换相连', 'linked to the time-domain solution by the Fourier transform') },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §4.1' },
    { text: 'Morse & Feshbach, Methods of Theoretical Physics, Ch. 7' },
  ],
}

export default helmholtzGreenFunction
