import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** wavelet-bandwidth-resolution */
const waveletBandwidthResolution: FormulaCard = {
  id: 'wavelet-bandwidth-resolution',
  name: t('频带宽度与垂向分辨率', 'Bandwidth & Vertical Resolution'),
  aliases: { zh: ['垂向分辨率', '四分之一波长', '频带宽度'], en: ['vertical resolution', 'quarter wavelength', 'bandwidth'] },
  node: 'S3.6',
  tags: {
    math: ['MATH.FOURIER', 'MATH.APPROX'],
    method: ['METH.EXPL', 'METH.PROC'],
    quantity: ['Q.FREQ', 'Q.GEOM'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\Delta z \approx \frac{v}{4 f_{dom}} = \frac{\lambda}{4},\qquad \Delta t \approx \frac{1}{2\,\Delta f}`,
    variants: [
      { name: t('带宽形式', 'Bandwidth form'), latex: String.raw`\Delta f = f_{\max} - f_{\min},\qquad \Delta z \approx \frac{v}{4\,\Delta f}\cdot\frac{\Delta f}{f_{dom}}` },
      { name: t('Rayleigh 判据（时间域）', 'Rayleigh criterion (time domain)'), latex: String.raw`\Delta t_{\text{Rayleigh}} \approx \frac{1}{2\,\Delta f}` },
      { name: t('调谐厚度', 'Tuning thickness'), latex: String.raw`\Delta z_{\text{tune}} = \frac{v}{4f_{dom}}` },
    ],
  },
  meaning: t(
    '「能看清多薄的地层」最终由频带决定，而不是由主频。两个界面在记录上能否分成两个波峰，取决于子波在时间上够不够窄；子波越窄，需要的频带就越宽。所以提高分辨率的唯一途径是展宽频带 —— 既要有低频保真，也要有高频信噪比。',
    'How thin a bed you can resolve is set by bandwidth, not by the dominant frequency. Whether two interfaces appear as two separate peaks depends on how narrow the wavelet is in time; a narrower wavelet needs a wider band. The only route to better resolution is therefore widening the band — preserving low frequencies and winning high-frequency signal-to-noise.',
  ),
  symbols: [
    { sym: '\\Delta z', name: t('可分辨的地层厚度', 'resolvable bed thickness'), unit: 'm' },
    { sym: 'f_{dom}', name: t('主频', 'dominant frequency'), unit: 'Hz' },
    { sym: '\\Delta f', name: t('频带宽度', 'bandwidth'), unit: 'Hz' },
    { sym: '\\lambda', name: t('主波长', 'dominant wavelength'), unit: 'm' },
    { sym: 'v', name: t('层速度', 'interval velocity'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('地震资料分辨率评估与采集/处理目标设定', 'Resolution assessment and acquisition/processing target setting')],
    assumes: [
      t('零相位子波', 'Zero-phase wavelet'),
      t('信噪比足够高', 'Adequate signal-to-noise ratio'),
    ],
    breaks: [
      t('薄层进入调谐区后振幅不再与厚度成正比', 'Below tuning, amplitude no longer scales with thickness'),
      t('衰减使深部频带变窄，分辨率随深度下降', 'Attenuation narrows the band with depth, so resolution degrades downward'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('顶底两个反射的到时差', 'Time separation of top and base reflections'),
      latex: String.raw`\Delta t = \frac{2\,\Delta z}{v}` },
    { n: 2, op: 'identity', title: t('Rayleigh 判据：到时差大于半个视周期', 'Rayleigh criterion: separation above half an apparent period'),
      latex: String.raw`\Delta t \ge \frac{1}{2 f_{dom}}` },
    { n: 3, op: 'algebra', title: t('解出厚度', 'Solve for thickness'),
      latex: String.raw`\Delta z \ge \frac{v}{4 f_{dom}} = \frac{\lambda}{4}` },
    { n: 4, op: 'identity', title: t('更一般地用带宽表达', 'More generally, in terms of bandwidth'),
      latex: String.raw`\Delta t_{\min} \approx \frac{1}{2\Delta f}` },
    { n: 5, op: 'result', title: t('结论：分辨率 ∝ 带宽', 'Conclusion: resolution is proportional to bandwidth'),
      latex: String.raw`\text{带宽加倍} \Longrightarrow \text{可分辨厚度减半}` },
  ],
  viz: [
    {
      id: 'resolution-vs-freq',
      level: 'V1',
      title: t('可分辨厚度随主频的变化', 'Resolvable thickness versus dominant frequency'),
      xlabel: t('主频 f_dom (Hz)', 'dominant frequency f_dom (Hz)'),
      ylabel: t('可分辨厚度 Δz (m)', 'resolvable thickness Δz (m)'),
      yScale: 'log',
      controls: [
        { id: 'v', label: t('层速度 v (m/s)', 'interval velocity v (m/s)'), min: 1500, max: 6000, step: 50, value: 3000 },
      ],
      note: t('30 Hz→60 Hz 让可分辨厚度从 25 m 降到 12.5 m，代价是穿透深度和信噪比。', 'Going from 30 Hz to 60 Hz cuts the resolvable thickness from 25 m to 12.5 m, at the cost of penetration and signal-to-noise.'),
      compute: (p) => {
        const v = p['v']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const f = 5 + (i / 200) * 95
          pts.push([f, v / (4 * f)])
        }
        return [{ label: t('Δz(f_dom)', 'Δz(f_dom)'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('10–60 Hz 带宽的分辨率', 'Resolution of a 10–60 Hz band'),
    input: t('Δf = 50 Hz，v = 3000 m/s', 'Δf = 50 Hz, v = 3000 m/s'),
    steps: [
      t('Δt_min ≈ 1/(2×50) = 10 ms', 'Δt_min ≈ 1/(2×50) = 10 ms'),
      t('Δz = 3000 × 0.010 / 2 = 15 m', 'Δz = 3000 × 0.010 / 2 = 15 m'),
    ],
    output: t('约 15 m —— 与 λ/4（f_dom = 50 Hz 时）量级一致', 'About 15 m — consistent with λ/4 (for f_dom = 50 Hz)'),
  },
  links: {
    upstream: [{ id: 'ricker-wavelet', note: t('子波形状决定频带利用', 'Wavelet shape determines band usage') }],
    downstream: [{ id: 'tuning-wedge-model', note: t('薄于分辨率时的响应', 'Response below the resolution limit') }],
    seealso: [{ id: 'vertical-resolution', note: t('分辨率的其他判据', 'Other resolution criteria') }],
  },
  refs: [{ text: 'Kallweit, R. & Wood, L. (1982). The limits of resolution of zero-phase wavelets. Geophysics, 47, 1035–1046' }],
}

export default waveletBandwidthResolution
