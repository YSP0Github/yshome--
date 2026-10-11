import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** velocity-ratio-poisson */
const velocityRatioPoisson: FormulaCard = {
  id: 'velocity-ratio-poisson',
  name: t('速度比 α/β 与泊松比', 'The Velocity Ratio α/β and Poisson’s Ratio'),
  aliases: {
    zh: ['纵横波速度比', 'α/β 与 ν', 'Vp/Vs'],
    en: ['Vp/Vs ratio', 'velocity ratio and Poisson ratio', 'alpha over beta'],
  },
  node: 'S1.5',
  tags: {
    math: ['MATH.LINALG'],
    method: ['METH.ROCK', 'METH.EXPL'],
    quantity: ['Q.VEL', 'Q.MAT'],
    keywords: t('速度比 Vp/Vs 泊松比 α/β 泊松固体 含气砂岩 岩性识别 流体因子 发散', 'Vp/Vs ratio Poisson ratio Poisson solid gas sand lithology fluid factor divergence'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\frac{\alpha}{\beta}=\sqrt{\frac{2-2\nu}{1-2\nu}}`,
    variants: [
      { name: t('用 Lamé 常数（更本质）', 'In Lamé constants, more fundamental'), latex: String.raw`\frac{\alpha^{2}}{\beta^{2}}=\frac{\lambda+2\mu}{\mu}=\frac{\lambda}{\mu}+2` },
      { name: t('用体积模量与剪切模量', 'In bulk and shear modulus'), latex: String.raw`\frac{\alpha^{2}}{\beta^{2}}=\frac{K}{\mu}+\frac{4}{3}` },
      { name: t('几个标志性取值', 'A few landmark values'), latex: String.raw`\nu=0\Rightarrow\sqrt{2}\approx1.414;\;\; \nu=\frac14\Rightarrow\sqrt{3}\approx1.732;\;\; \nu\to\frac12\Rightarrow\infty` },
      { name: t('反解泊松比', 'Inverted for Poisson’s ratio'), latex: String.raw`\nu=\frac{\alpha^{2}-2\beta^{2}}{2\left(\alpha^{2}-\beta^{2}\right)}` },
    ],
  },
  meaning: t(
    '速度比 α/β 只取决于泊松比，与密度、与模量的绝对大小统统无关——这一点使它成为跨尺度、跨方法对比岩石性质的"通用货币"：实验室、测井、地震反演给出的 Vp/Vs 可以直接放在一起比较。泊松固体 ν = 0.25 对应 α/β = √3；含气砂岩 ν 可低到 0.1，α/β 随之降到 1.55 左右，这就是 AVO 与烃类检测的岩石物理基石。',
    'The ratio α/β depends only on Poisson’s ratio — not on density, not on the absolute size of the moduli — which makes it the common currency for comparing rock properties across scales and methods: Vp/Vs from the lab, from logs and from seismic inversion can be placed side by side. A Poisson solid (ν = 0.25) gives α/β = √3; gas sands can reach ν ≈ 0.1, dropping α/β to about 1.55, and that is the rock-physics bedrock of AVO and hydrocarbon detection.',
  ),
  symbols: [
    { sym: '\\alpha', name: t('P 波速度', 'P-wave velocity'), unit: 'm/s' },
    { sym: '\\beta', name: t('S 波速度', 'S-wave velocity'), unit: 'm/s' },
    { sym: '\\nu', name: t('泊松比', "Poisson's ratio"), unit: '', dimension: '无量纲', typical: '砂岩 0.15–0.30；灰岩 0.28；含气砂岩 0.10–0.20' },
    { sym: '\\lambda,\\mu', name: t('Lamé 常数', 'Lamé constants'), unit: 'Pa' },
    { sym: 'K', name: t('体积模量', 'bulk modulus'), unit: 'Pa' },
  ],
  conditions: {
    applies: [
      t('均匀各向同性线弹性介质；α 与 β 取自同一岩样、同一状态', 'Homogeneous isotropic linear elastic media, with α and β from the same sample and state'),
      t('α/β ≥ √2（ν ≥ 0），实际岩石多在 1.5–2.0 之间', 'α/β ≥ √2 (ν ≥ 0); real rocks mostly sit between 1.5 and 2.0'),
    ],
    assumes: [
      t('无频散：α、β 在同一频带测量（超声与地震频带不可混用）', 'Non-dispersive: α and β measured in the same frequency band (ultrasonic and seismic cannot be mixed)'),
      t('完全饱和或完全干燥的状态需分别标定', 'Fully saturated and dry states must be calibrated separately'),
    ],
    breaks: [
      t('流体：β = 0 ⇒ α/β 无定义', 'Fluids: β = 0, so α/β is undefined'),
      t('各向异性介质中 α/β 随传播方向变化', 'In anisotropic media α/β varies with propagation direction'),
      t('ν 接近 0.5 时比值对测量误差极其敏感', 'Near ν = 0.5 the ratio becomes hypersensitive to measurement error'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('写出两个速度', 'Write down the two velocities'),
      latex: String.raw`\alpha^{2}=\frac{\lambda+2\mu}{\rho},\qquad \beta^{2}=\frac{\mu}{\rho}` },
    { n: 2, op: 'algebra', title: t('取比值，ρ 直接约掉', 'Take the ratio; ρ cancels immediately'),
      latex: String.raw`\frac{\alpha^{2}}{\beta^{2}}=\frac{\lambda+2\mu}{\mu}=2+\frac{\lambda}{\mu}`,
      note: t('密度消失是关键：速度比不携带任何密度信息。', 'The disappearance of density is the key point: the velocity ratio carries no density information.') },
    { n: 3, op: 'substitute', title: t('用 ν 表达 λ', 'Express λ through ν'),
      latex: String.raw`\lambda=\frac{2\mu\nu}{1-2\nu}\;\Rightarrow\; \frac{\lambda}{\mu}=\frac{2\nu}{1-2\nu}` },
    { n: 4, op: 'algebra', title: t('合并成一个分式', 'Combine into a single fraction'),
      latex: String.raw`\frac{\alpha^{2}}{\beta^{2}}=2+\frac{2\nu}{1-2\nu}=\frac{2-4\nu+2\nu}{1-2\nu}=\frac{2-2\nu}{1-2\nu}` },
    { n: 5, op: 'result', title: t('开方即得速度比', 'Take the square root'),
      latex: String.raw`\frac{\alpha}{\beta}=\sqrt{\frac{2\left(1-\nu\right)}{1-2\nu}}` },
    { n: 6, op: 'identity', title: t('检查两个极限', 'Check the two limits'),
      latex: String.raw`\nu\to 0:\ \frac{\alpha}{\beta}\to\sqrt{2};\qquad \nu\to\frac12:\ \frac{\alpha}{\beta}\to\infty`,
      note: t('ν = 1/2 时体积模量无穷大，压缩波瞬时传播，而 S 波仍以有限速度前进。', 'At ν = 1/2 the bulk modulus is infinite, so compressional waves propagate instantaneously while S waves still travel at a finite speed.') },
  ],
  viz: [
    {
      id: 'ratio-vs-nu',
      level: 'V1',
      title: t('速度比 α/β 随泊松比急剧上升', 'The velocity ratio α/β climbs steeply with Poisson’s ratio'),
      xlabel: t('泊松比 ν', 'Poisson’s ratio ν'),
      ylabel: t('α / β', 'α / β'),
      controls: [],
      xRange: [0, 0.49],
      yRange: [1, 8],
      note: t('整条曲线单调递增，且在 ν > 0.4 之后陡峭上升：这意味着高 ν 区（泥岩、未固结沉积）用速度比反推泊松比时误差会被放大。灰线标出泊松固体 α/β = √3 ≈ 1.73，它是判断岩性是否"正常"的基准线。', 'The curve is monotonic and turns steep above ν > 0.4: in the high-ν range (shale, unconsolidated sediment) errors in back-solving ν from the velocity ratio are amplified. The grey line marks the Poisson solid α/β = √3 ≈ 1.73, the baseline for judging whether a lithology is normal.'),
      compute: () => {
        const ratioPts: Array<[number, number]> = []
        for (let i = 0; i <= 240; i++) {
          const nu = (i / 240) * 0.49
          ratioPts.push([nu, Math.sqrt((2 - 2 * nu) / (1 - 2 * nu))])
        }
        return [
          { label: t('α/β', 'α/β'), color: '#185FA5', points: ratioPts },
          { label: t('√3 ≈ 1.73（泊松固体）', '√3 ≈ 1.73 (Poisson solid)'), color: '#B4B2A9', dash: true, points: [[0, Math.sqrt(3)], [0.49, Math.sqrt(3)]] },
        ]
      },
    },
  ],
  links: {
    upstream: [
      { id: 'ps-wave-velocities' },
      { id: 'poissons-ratio-lame' },
      { id: 'p-wave-velocity-formula' },
      { id: 's-wave-velocity-formula' },
    ],
    downstream: [
      { id: 'poisson-from-velocities' },
      { id: 'shuey-approximation', note: t('AVO 截距与梯度由 α/β 的对比决定', 'the AVO intercept and gradient are set by α/β contrasts') },
      { id: 'acoustic-reflection-coefficient' },
    ],
    seealso: [
      { id: 'elastic-moduli-conversions' },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
    { text: 'Mavko, Mukerji & Dvorkin, The Rock Physics Handbook, 2nd ed., §1' },
  ],
}

export default velocityRatioPoisson
