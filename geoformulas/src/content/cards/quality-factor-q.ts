import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** quality-factor-q */
const qualityFactor: FormulaCard = {
  id: 'quality-factor-q',
  name: t('品质因子 Q 与振幅衰减', 'The Quality Factor Q and Amplitude Decay'),
  aliases: { zh: ['Q 值', '衰减', '非完全弹性'], en: ['quality factor', 'attenuation', 'anelasticity'] },
  node: 'S6.1',
  tags: {
    math: ['MATH.FOURIER', 'MATH.APPROX'],
    method: ['METH.ATTEN'],
    quantity: ['Q.AMP', 'Q.FREQ'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\frac{1}{Q}=-\frac{\Delta E}{2\pi E}`,
    variants: [
      { name: t('振幅随距离的衰减', 'Amplitude decay with distance'), latex: String.raw`A(x)=A_{0}\,\exp\!\left(-\frac{\omega x}{2Qc}\right)=A_{0}e^{-\pi f t^{*}}` },
      { name: t('空间衰减系数', 'Spatial attenuation coefficient'), latex: String.raw`\alpha(f)=\frac{\pi f}{Q c}=\frac{\omega}{2Qc}` },
      { name: t('t* 算子', 'The t* operator'), latex: String.raw`t^{*}=\int_{\text{ray}}\frac{\dd s}{Q\,c}` },
    ],
  },
  meaning: t(
    'Q 描述岩石有多「不完美」：Q 越大越接近理想弹性体。地震学可以用 Q 反演温度和含流体状态 —— 热的、部分熔融的区域 Q 低（衰减强），这是给地幔做 CT 的主要手段之一。',
    'Q measures how imperfect a rock is: larger Q means closer to ideal elasticity. Seismology uses Q to image temperature and fluids — hot or partially molten regions have low Q, making it one of the main ways to "CT scan" the mantle.',
  ),
  symbols: [
    { sym: 'Q', name: t('品质因子', 'quality factor'), unit: '', dimension: '无量纲', typical: '地壳 100–600；地幔 100–2000' },
    { sym: '\\Delta E', name: t('单周期损失的能量', 'energy lost per cycle'), unit: 'J' },
    { sym: 'E', name: t('系统中储存的最大弹性能', 'peak stored elastic energy'), unit: 'J' },
    { sym: '\\alpha', name: t('空间振幅衰减系数', 'spatial amplitude decay coefficient'), unit: 'm⁻¹' },
    { sym: 'c', name: t('波速', 'wave speed'), unit: 'm/s' },
    { sym: 't^{*}', name: t('沿射线的累积衰减量', 'cumulative attenuation along the ray'), unit: 's', dimension: '时间' },
  ],
  conditions: {
    applies: [t('小振幅线性衰减，且 Q 在所研究的频带内近似为常数', 'Small-amplitude linear attenuation with Q roughly constant over the band of interest')],
    assumes: [
      t('衰减由吸收（非弹性）引起，不含纯几何扩散或散射', 'Attenuation is absorptive rather than scattering or pure geometrical spreading'),
      t('Q 远大于 1', 'Q ≫ 1'),
    ],
    breaks: [
      t('实际观测到的 Q 常随频率变化，严格来说应考虑 Q(ω)', 'Observed Q often varies with frequency, so strictly Q(ω) should be used'),
      t('散射衰减与固有衰减需要分离', 'Scattering attenuation must be separated from intrinsic attenuation'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('定义：每个振动循环损失的能量比例', 'Definition: fractional energy loss per cycle'),
      latex: String.raw`\frac{-\Delta E}{E}\equiv\frac{2\pi}{Q}` },
    { n: 2, op: 'physics', title: t('能量正比于振幅平方', 'Energy is proportional to amplitude squared'),
      latex: String.raw`\frac{|\Delta E|}{E}=\frac{A^{2}-(A-\Delta A)^{2}}{A^{2}}\simeq\frac{2\Delta A}{A}` },
    { n: 3, op: 'algebra', title: t('得到单周期的振幅损失率', 'Fractional amplitude loss per cycle'),
      latex: String.raw`\frac{\Delta A}{A}=\frac{\pi}{Q}\quad\text{（每周期）}` },
    { n: 4, op: 'setup', title: t('换算到每单位距离', 'Convert to per-unit-distance'),
      latex: String.raw`\text{单位距离内含 } \frac{f}{c}\ \text{个周期}\;\Rightarrow\;\frac{1}{A}\frac{\dd A}{\dd x}=-\frac{\pi f}{Qc}=-\frac{\omega}{2Qc}` },
    { n: 5, op: 'identity', title: t('积分得到指数衰减', 'Integrate to exponential decay'),
      latex: String.raw`A(x)=A_{0}\,\exp\!\left(-\frac{\omega x}{2Qc}\right)` },
    { n: 6, op: 'result', title: t('定义 t*：把路径积分打包成一个数', 'Define t*: package the path integral into one number'),
      latex: String.raw`\frac{\omega}{2}\int\frac{\dd s}{Qc}=\frac{\omega}{2}t^{*}\;\Rightarrow\; A=A_0e^{-\pi f t^{*}}`,
      note: t('这个形式非常实用：谱的高频端按 e^{−πft*} 衰减，取对数后是一条直线，斜率直接给出 t* —— 这是测 Q 的标准做法。', 'This form is extremely practical: the spectrum dies off as e^{−πft*}, so on a log plot it is a straight line whose slope directly yields t*. That is the standard way to measure Q.') },
  ],
  viz: [
    {
      id: 'q-decay',
      level: 'V1',
      title: t('不同 Q 值下振幅随距离衰减', 'Amplitude decay with distance for different Q'),
      xlabel: t('传播距离 (km)', 'propagation distance (km)'),
      ylabel: t('相对振幅 A/A₀', 'relative amplitude A/A₀'),
      controls: [
        { id: 'Qv', label: t('品质因子 Q', 'quality factor Q'), min: 20, max: 1000, step: 10, value: 200 },
        { id: 'fq', label: t('频率 f', 'frequency f'), min: 0.1, max: 20, step: 0.1, value: 1, unit: 'Hz' },
        { id: 'cq', label: t('波速 c', 'velocity c'), min: 2000, max: 11000, step: 100, value: 8000, unit: 'm/s' },
      ],
      xRange: [0, 1000],
      note: t('把频率从 1 Hz 抬到 10 Hz，衰减立刻变得剧烈 —— 高频「被地球吃掉」得快得多，这就是远震记录听起来沉闷的原因。', 'Raise the frequency from 1 to 10 Hz and the decay becomes dramatic — the Earth eats high frequencies much faster, which is why teleseismic records sound muffled.'),
      compute: (p) => {
        const Qv = p['Qv'], f = p['fq'], c = p['cq']
        const palette = ['#1D9E75', '#378ADD', '#BA7517', '#E24B4A']
        const rows = [Qv, Qv * 2, Qv * 5, Qv * 10]
        return rows.map((Q, i) => {
          const pts: Array<[number, number]> = []
          for (let k = 0; k <= 200; k++) {
            const xkm = (k / 200) * 1000
            const x = xkm * 1000
            pts.push([xkm, Math.exp((-(2 * Math.PI * f) * x) / (2 * Q * c))])
          }
          return {
            label: t(`Q = ${Math.round(Q)}`, `Q = ${Math.round(Q)}`),
            color: palette[i],
            points: pts,
          }
        })
      },
    },
    {
      id: 'q-spectrum',
      level: 'V1',
      title: t('t* 造成的频谱畸变（半对数）', 'Spectral distortion produced by t* (semi-log)'),
      xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
      ylabel: t('ln(A/A₀)', 'ln(A/A₀)'),
      yScale: 'log',
      controls: [
        { id: 'tstar', label: t('t* 值', 't* value'), min: 0.05, max: 4, step: 0.05, value: 0.5, unit: 's' },
      ],
      xRange: [0.01, 20],
      note: t('半对数坐标下是一条直线：斜率 = −πt*。反过来说，从实测谱的低频到高频斜率就能直接读出 t*。', 'On semi-log axes this is a straight line with slope −πt*. Inverting the argument, the slope of a measured spectrum yields t* directly.'),
      compute: (p) => {
        const ts = p['tstar']
        const pts: Array<[number, number]> = []
        for (let k = 0; k <= 300; k++) {
          const f = Math.pow(10, -2 + (k / 300) * Math.log10(2000))
          pts.push([f, Math.exp(-Math.PI * f * ts)])
        }
        return [{ label: t('e^{−πft*}', 'e^{−πft*}'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('上地幔 S 波', 'Upper-mantle S waves'),
    input: t('f = 1 Hz，Q = 150，c = 4500 m/s，路径长 500 km', 'f = 1 Hz, Q = 150, c = 4500 m/s, path length 500 km'),
    steps: [
      t('α = πf/(Qc) = 3.14/(150×4500) = 4.7×10⁻⁶ m⁻¹', 'α = πf/(Qc) = 3.14/(150×4500) = 4.7×10⁻⁶ m⁻¹'),
      t('αx = 4.7×10⁻⁶ × 5×10⁵ = 2.33', 'αx = 4.7×10⁻⁶ × 5×10⁵ = 2.33'),
      t('A/A₀ = e^{−2.33} = 0.097', 'A/A₀ = e^{−2.33} = 0.097'),
    ],
    output: t('振幅只剩 10% —— 这就是为什么必须做衰减校正才能比较振幅', 'Only 10% of the amplitude survives, which is why attenuation correction is mandatory before comparing amplitudes'),
  },
  links: {
    upstream: [{ id: 'harmonic-plane-wave', note: t('把这里的衰减加进 A(x)', 'adds distance decay into A(x)') }],
  },
  refs: [
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §6.6' },
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.4' },
  ],

}

export default qualityFactor
