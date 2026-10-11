import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** seismometer-equation */
const seismometerEquation: FormulaCard = {
  id: 'seismometer-equation',
  name: t('地震计运动方程与频率响应', 'Seismometer Equation of Motion and Frequency Response'),
  aliases: { zh: ['地震仪', '阻尼振子', '传递函数'], en: ['seismometer', 'damped oscillator', 'transfer function'] },
  node: 'S8.1',
  tags: {
    math: ['MATH.DIFF', 'MATH.COMPLEX'],
    method: ['METH.INSTR'],
    quantity: ['Q.FREQ', 'Q.AMP'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`\ddot{x}+2h\omega_{0}\dot{x}+\omega_{0}^{2}x=-\ddot{u}_{g}(t)`,
    variants: [
      { name: t('Laplace 域传递函数', 'Laplace-domain transfer function'), latex: String.raw`X(s)=-\frac{1}{s^{2}+2h\omega_{0}s+\omega_{0}^{2}}\,\ddot{U}(s)` },
      { name: t('频率响应（设 s = iω）', 'Frequency response with s = iω'), latex: String.raw`T(\omega)=\frac{-1}{\left(\omega_{0}^{2}-\omega^{2}\right)+2ih\omega_{0}\omega}` },
      { name: t('位移/速度/加速度计的区别', 'Displacement / velocity / acceleration meters'), latex: String.raw`T_{v}=i\omega\,T_{d},\qquad T_{a}=(i\omega)^{2}T_{d}` },
    ],
  },
  meaning: t(
    '地震计本质上就是一个挂在弹簧上的重物。地面动，重物因为惯性留在原地，两者的相对位移就是记录到的东西。这条二阶常微分方程决定了台站能忠实地记录哪些频率 —— 低于固有频率的部分会被严重失真。',
    'A seismometer is at heart a mass on a spring. The ground moves while inertia keeps the mass behind, and the relative displacement is what gets recorded. This second-order ODE determines which frequencies a station records faithfully: anything below the natural frequency is badly distorted.',
  ),
  symbols: [
    { sym: 'x', name: t('质量块相对地面的位移', 'displacement of the mass relative to the ground'), unit: 'm' },
    { sym: 'u_g', name: t('地面位移', 'ground displacement'), unit: 'm' },
    { sym: 'h', name: t('阻尼常数（与临界阻尼之比）', 'damping constant (fraction of critical)'), unit: '', dimension: '无量纲', typical: '0.7（宽带台常取 0.707）' },
    { sym: '\\omega_0', name: t('固有角频率', 'natural angular frequency'), unit: 'rad/s' },
    { sym: 'T_0', name: t('固有周期', 'natural period'), unit: 's', typical: '短周期 1 s；宽带 120 s' },
    { sym: 'T(\\omega)', name: t('复频率响应', 'complex frequency response'), unit: '取决于输入' },
  ],
  conditions: {
    applies: [t('线性范围内的小幅振动', 'Small oscillations within the linear range')],
    assumes: [
      t('质量全部集中在一个质点上，弹簧无质量', 'All mass lumped in one point; the spring is massless'),
      t('阻尼与速度成正比', 'Damping proportional to velocity'),
      t('地面运动是平动（不含转动与倾斜耦合）', 'Ground motion is translational (no rotation or tilt coupling)'),
    ],
    breaks: [
      t('仪器倾斜或超出了悬挂系统的线性范围', 'Instrument tilt or motion beyond the suspension linear range'),
      t('需要包含标定线圈反馈的现代反馈式地震计需另建模型', 'Modern force-feedback sensors require a different model'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('设质量块绝对位移为 x + u_g', 'Let the absolute displacement of the mass be x + u_g'),
      latex: String.raw`m\left(\ddot{x}+\ddot{u}_{g}\right)=\text{作用于质量块的所有力}` },
    { n: 2, op: 'physics', title: t('列出三种力：弹簧、阻尼、惯性', 'Three forces act: spring, damping and inertia'),
      latex: String.raw`m\left(\ddot{x}+\ddot{u}_g\right)=-kx-\lambda\dot{x}` },
    { n: 3, op: 'algebra', title: t('移项并除以 m', 'Rearrange and divide by m'),
      latex: String.raw`\ddot{x}+\frac{\lambda}{m}\dot{x}+\frac{k}{m}x=-\ddot{u}_{g}` },
    { n: 4, op: 'setup', title: t('定义固有频率与阻尼比', 'Define natural frequency and damping ratio'),
      latex: String.raw`\omega_{0}^{2}=\frac{k}{m},\qquad 2h\omega_{0}=\frac{\lambda}{m}` },
    { n: 5, op: 'result', title: t('标准形式', 'Standard form'),
      latex: String.raw`\ddot{x}+2h\omega_{0}\dot{x}+\omega_{0}^{2}x=-\ddot{u}_{g}(t)` },
    { n: 6, op: 'transform', title: t('Laplace 变换求解（零初始条件）', 'Laplace transform with zero initial conditions'),
      latex: String.raw`\left(s^{2}+2h\omega_{0}s+\omega_{0}^{2}\right)X(s)=-\ddot{U}(s)\;\Longrightarrow\; X(s)=T(s)\,\ddot{U}(s)` },
    { n: 7, op: 'result', title: t('代入 s = iω 得到频率响应', 'Set s = iω for the frequency response'),
      latex: String.raw`T(\omega)=\frac{-1}{\left(\omega_{0}^{2}-\omega^{2}\right)+2ih\omega_{0}\omega},\qquad |T|=\frac{1}{\sqrt{\left(\omega_0^2-\omega^2\right)^{2}+4h^{2}\omega_0^{2}\omega^{2}}}` },
    { n: 8, op: 'result', title: t('三种输出类型的转换关系', 'Converting between output types'),
      latex: String.raw`X_v=i\omega X_d,\qquad X_a=(i\omega)^{2}X_d=-\omega^{2}X_d`,
      note: t('这就是为什么同一台仪器「同时」可以是位移计、速度计或加速度计 —— 只在频域里差一个多项式因子，也就是零极点表示里的那几个零点。', 'This is why one instrument can be a displacement, velocity or acceleration sensor at once: they differ in the frequency domain only by polynomial factors, i.e. the zeros in a pole–zero representation.') },
  ],
  viz: [
    {
      id: 'seismometer-response',
      level: 'V1',
      title: t('幅频响应：阻尼比的选取为什么重要', 'Amplitude response: why damping choice matters'),
      xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
      ylabel: t('归一化幅值', 'normalised amplitude'),
      xScale: 'log',
      controls: [
        { id: 'T0', label: t('固有周期 T₀', 'natural period T₀'), min: 0.2, max: 300, step: 0.5, value: 120, unit: 's' },
      ],
      xRange: [0.0001, 10],
      note: t('h = 0.707 是这条曲线的「黄金值」：它在固有频率附近既不平顶也不出峰，通带最平坦。h 过小会在 ω₀ 处鼓一个大包（谐振峰），h 过大则高频响应被过早压低。', 'h = 0.707 is the sweet spot: near the natural frequency it neither domes nor peaks, giving the flattest passband. Too little damping gives a resonant peak; too much rolls the high frequencies off early.'),
      compute: (p) => {
        const T0 = p['T0']
        const w0 = (2 * Math.PI) / T0
        const hs = [0.5, 0.6, 0.707, 1.0, 1.5]
        const palette = ['#378ADD', '#639922', '#185FA5', '#BA7517', '#E24B4A']
        return hs.map((h, i) => {
          const pts: Array<[number, number]> = []
          for (let k = 0; k <= 300; k++) {
            const f = Math.pow(10, -4 + (k / 300) * 5)
            const w = 2 * Math.PI * f
            const re = w0 * w0 - w * w
            const im = 2 * h * w0 * w
            pts.push([f, 1 / Math.sqrt(re * re + im * im)])
          }
          return { label: t(`h = ${h}`, `h = ${h}`), color: palette[i], points: pts }
        })
      },
    },
    {
      id: 'seismometer-phase',
      level: 'V1',
      title: t('相频响应', 'Phase response'),
      xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
      ylabel: t('相位 (度)', 'phase (deg)'),
      xScale: 'log',
      controls: [
        { id: 'T0p', label: t('固有周期 T₀', 'natural period T₀'), min: 0.2, max: 300, step: 0.5, value: 120, unit: 's' },
        { id: 'hp', label: t('阻尼 h', 'damping h'), min: 0.2, max: 3, step: 0.05, value: 0.707 },
      ],
      xRange: [0.0001, 10],
      note: t('这条曲线就是教科书里的波特相频图：低频接近 0°，固有频率处 −90°，高频趋于 −180°。', 'This is the textbook Bode phase plot: near 0° at low frequency, −90° at the natural frequency, tending to −180° at high frequency.'),
      compute: (p) => {
        const T0 = p['T0p'], h = p['hp']
        const w0 = (2 * Math.PI) / T0
        const pts: Array<[number, number]> = []
        for (let k = 0; k <= 300; k++) {
          const f = Math.pow(10, -4 + (k / 300) * 5)
          const w = 2 * Math.PI * f
          const re = w0 * w0 - w * w
          const im = 2 * h * w0 * w
          let ph = (Math.atan2(-im, re) * 180) / Math.PI
          if (ph > 0) ph -= 360
          pts.push([f, ph])
        }
        return [{ label: t('相位 (deg)', 'phase (deg)'), color: '#7F77DD', points: pts }]
      },
    },
  ],
  numerics: [
    { note: t('零极点形式的 poles（由分母给出）', 'Poles from the denominator'), snippet: String.raw`s_{1,2}=-h\omega_{0}\pm i\omega_{0}\sqrt{1-h^{2}}` },
  ],
  example: {
    title: t('宽带台 Streckeisen STS-2', 'The Streckeisen STS-2 broadband station'),
    input: t('T₀ = 120 s，h = 0.707', 'T₀ = 120 s, h = 0.707'),
    steps: [
      t('ω₀ = 2π/120 = 0.0524 rad/s', 'ω₀ = 2π/120 = 0.0524 rad/s'),
      t('在 f = 1/120 Hz 处幅值为 1/(2hω₀²)', 'At f = 1/120 Hz the amplitude is 1/(2hω₀²)'),
      t('平坦响应区间约 0.0083 Hz – 10 Hz，即 120 s – 0.1 s', 'The flat band spans roughly 0.0083–10 Hz, i.e. periods of 120 s down to 0.1 s'),
    ],
    output: t('所以它能同时记录地方震、远震体波与地球自由振荡', 'Hence one instrument records local quakes, teleseismic body waves and Earth free oscillations alike'),
  },
  links: {
    upstream: [{ id: 'harmonic-plane-wave' }],
    downstream: [{ id: 'brune-source-spectrum', note: t('去 deconvolve 仪器响应后才谈得上谱的形状', 'Response removal precedes any spectral interpretation') }],
  },
  refs: [
    { text: 'Scherbaum, Of Poles and Zeros, 2nd ed., Kluwer' },
    { text: 'Havskov & Alguacil, Instrumentation in Earthquake Seismology' },
  ],

}

export default seismometerEquation
