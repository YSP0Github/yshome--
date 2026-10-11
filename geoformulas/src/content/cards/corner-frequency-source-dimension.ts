import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** corner-frequency-source-dimension */
const cornerFrequencySourceDimension: FormulaCard = {
  id: 'corner-frequency-source-dimension',
  name: t('拐角频率与震源尺度', 'Corner Frequency & Source Dimension'),
  aliases: { zh: ['Brune 震源尺度', '拐角频率'], en: ['corner frequency', 'Brune source dimension'] },
  node: 'S4.6',
  tags: {
    math: ['MATH.APPROX', 'MATH.ALGEBRA'],
    method: ['METH.TELE'],
    quantity: ['Q.FREQ', 'Q.SOURCE', 'Q.GEOM'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`a=\frac{2.34\,\beta}{2\pi f_c}\approx0.37\,\frac{\beta}{f_c}`,
    variants: [
      { name: t('反解出拐角频率', 'Solving for the corner frequency'), latex: String.raw`f_c\approx0.37\,\frac{\beta}{a}` },
      { name: t('Madariaga 圆盘裂纹模型的结果', 'Madariaga circular-crack result'), latex: String.raw`f_c\approx0.49\,\frac{\beta}{a}` },
      { name: t('破裂持续时间', 'Rupture duration'), latex: String.raw`\tau\approx\frac{2a}{v_r},\qquad v_r\approx0.8\,\beta` },
    ],
  },
  meaning: t(
    '震源谱从平台段转折到高频衰减段的那个频率叫拐角频率，它对应地震波里能分辨出的最短波长，也就是震源尺度。这是把「频谱形状」翻译成「断层有多大」的桥梁：测到 f_c 就能估算破裂半径，进而算应力降。注意不同模型的系数在 0.32–0.49 之间浮动，跨文献比较时务必统一模型。',
    'The corner frequency is where the source spectrum turns from its plateau into high-frequency decay; it corresponds to the shortest wavelength resolvable in the radiation, hence to source dimension. It is the bridge that translates spectral shape into fault size: measuring f_c gives the rupture radius and hence stress drop. Note the coefficient varies between 0.32 and 0.49 across models — always quote which model you used.',
  ),
  symbols: [
    { sym: 'f_c', name: t('拐角频率', 'corner frequency'), unit: 'Hz', typical: '0.05 – 30' },
    { sym: 'a', name: t('震源等效半径', 'equivalent source radius'), unit: 'm', typical: '50 – 50000' },
    { sym: '\\beta', name: t('震源区 S 波速度', 'S-wave velocity at the source'), unit: 'm/s', typical: '3000 – 4500' },
    { sym: '\\tau', name: t('破裂持续时间', 'rupture duration'), unit: 's' },
    { sym: 'v_r', name: t('破裂速度', 'rupture velocity'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('由震源谱的拐角频率估计震源尺度', 'Estimating source dimension from the corner frequency of the source spectrum')],
    assumes: [
      t('ω² 谱模型成立', 'The ω² spectral model holds'),
      t('已校正路径衰减 Q 与场地效应', 'Path attenuation Q and site effects have been corrected'),
    ],
    breaks: [t('非 ω² 谱（如复杂破裂、慢地震）不适用', 'Not applicable to non-ω² spectra such as complex ruptures or slow earthquakes')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('Brune 模型的震源谱', 'The Brune source spectrum'),
      latex: String.raw`\Omega(\omega)=\frac{\Omega_0}{1+\left(\omega/\omega_c\right)^{2}}` },
    { n: 2, op: 'setup', title: t('Brune 给出的 ω_c 与 a 的关系', 'Brune relation between ω_c and a'),
      latex: String.raw`\omega_c=2.34\,\frac{\beta}{a}` },
    { n: 3, op: 'identity', title: t('换成普通频率', 'Convert to ordinary frequency'),
      latex: String.raw`f_c=\frac{\omega_c}{2\pi}=\frac{2.34\,\beta}{2\pi a}` },
    { n: 4, op: 'algebra', title: t('算出数值系数', 'Evaluate the numerical coefficient'),
      latex: String.raw`\frac{2.34}{2\pi}=0.3725\;\Longrightarrow\; a\approx0.37\,\frac{\beta}{f_c}` },
    { n: 5, op: 'result', title: t('破裂持续时间', 'Rupture duration'),
      latex: String.raw`\tau\approx\frac{2a}{v_r}\approx\frac{2a}{0.8\beta}=2.5\,\frac{a}{\beta}` },
  ],
  viz: [
    {
      id: 'fc-vs-radius',
      level: 'V1',
      title: t('拐角频率与震源半径的对应关系', 'Corner frequency versus source radius'),
      xlabel: t('震源半径 a (m)', 'source radius a (m)'),
      ylabel: t('拐角频率 f_c (Hz)', 'corner frequency f_c (Hz)'),
      xScale: 'log',
      yScale: 'log',
      controls: [
        { id: 'beta', label: t('S 波速度 β', 'S-wave velocity β'), min: 2000, max: 4500, step: 50, value: 3500, unit: 'm/s' },
      ],
      compute: (p) => {
        const beta = p['beta']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const a = 10 * Math.pow(10, (i / 200) * 5)
          pts.push([a, (0.3725 * beta) / a])
        }
        return [{ label: t('Brune (0.37)', 'Brune (0.37)'), color: '#185FA5', points: pts }]
      },
      note: t('Mw 2 的地震半径约 100 m、f_c 约 13 Hz；Mw 8 的半径约 50 km、f_c 约 0.026 Hz。', 'An Mw 2 event has radius ≈100 m and f_c ≈13 Hz; an Mw 8 event has radius ≈50 km and f_c ≈0.026 Hz.'),
    },
  ],
  example: {
    title: t('一次 Mw 4 事件的震源尺度', 'Source dimension of an Mw 4 event'),
    input: t('f_c = 3 Hz，β = 3500 m/s', 'f_c = 3 Hz, β = 3500 m/s'),
    steps: [
      t('a = 0.37 × 3500 / 3 = 432 m', 'a = 0.37 × 3500 / 3 = 432 m'),
      t('τ ≈ 2 × 432 / (0.8 × 3500) = 0.31 s', 'τ ≈ 2 × 432 / (0.8 × 3500) = 0.31 s'),
    ],
    output: t('破裂半径约 430 m、持续约 0.3 s —— 与 Mw 4 的经验尺度一致', 'Rupture radius ≈430 m lasting ≈0.3 s, consistent with the empirical scaling of Mw 4'),
  },
  links: {
    upstream: [{ id: 'brune-source-spectrum', note: t('f_c 来自震源谱拟合', 'f_c comes from fitting the source spectrum') }],
    seealso: [{ id: 'static-stress-drop', note: t('有了 a 就能算应力降', 'With a known, stress drop follows') }],
  },
  refs: [{ text: 'Brune (1970), J. Geophys. Res., 75' }, { text: 'Madariaga (1976), Bull. Seismol. Soc. Am., 66' }],
}

export default cornerFrequencySourceDimension
