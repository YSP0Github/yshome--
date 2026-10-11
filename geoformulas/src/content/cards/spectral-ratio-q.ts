import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** spectral-ratio-q */
const spectralRatioQ: FormulaCard = {
  id: 'spectral-ratio-q',
  name: t('谱比法测 Q', 'Measuring Q by the Spectral-ratio Method'),
  aliases: { zh: ['谱比法'], en: ['spectral ratio method', 'two-station method'] },
  node: 'S6.4',
  tags: {
    math: ['MATH.FOURIER', 'MATH.STAT', 'MATH.ALGEBRA'],
    method: ['METH.ATTEN'],
    quantity: ['Q.AMP', 'Q.FREQ'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`\ln\frac{A_1(f)}{A_2(f)}=\ln\frac{G_1}{G_2}-\pi f\left(t_1^{*}-t_2^{*}\right)`,
    variants: [
      { name: t('两台站同路径（Δt* 法）', 'Two stations on the same path (Δt* method)'), latex: String.raw`\Delta t^{*}=\int_{s_1}^{s_2}\frac{\mathrm{d}s}{Q\,v}\;\Longrightarrow\; Q=\frac{\Delta t}{\Delta t^{*}\cdot v}` },
      { name: t('单台站（需已知几何扩散与源谱）', 'Single station (needs known spreading and source spectrum)'), latex: String.raw`\ln A(f)=\ln S(f)-\ln G-\pi f t^{*}` },
    ],
  },
  meaning: t(
    '谱比法是 Q 测量里最稳健的一招：把同一条射线上两个台站的谱相除，震源项、场地项和大部分路径项都约掉了，只剩下两台之间的那段路径贡献的 Δt*。代价是必须有共路径的双台观测，而且两个台的场地响应要足够干净。',
    'The spectral-ratio method is the most robust way to measure Q: dividing the spectra of two stations on the same ray cancels the source term, the site terms and most of the path, leaving only the Δt* contributed by the segment between them. The price is that you need two stations sharing a path, and both must have clean site responses.',
  ),
  symbols: [
    { sym: 'A_1,A_2', name: t('两台站的振幅谱', 'amplitude spectra at the two stations'), unit: '与位移同' },
    { sym: 'G_1,G_2', name: t('几何扩散因子', 'geometrical spreading factors'), unit: '无量纲' },
    { sym: '\\Delta t^{*}', name: t('两台之间的累积衰减差', 'difference in cumulative attenuation'), unit: 's' },
    { sym: 'Q', name: t('两台之间介质的品质因子', 'quality factor of the medium between the stations'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('两台站位于同一条射线路径上（震源—台站方位一致）', 'Two stations lie on the same ray path (aligned source–station azimuths)')],
    assumes: [
      t('震源辐射方向性对两台相同', 'Source radiation pattern is identical for both stations'),
      t('场地响应已知或可忽略', 'Site responses are known or negligible'),
      t('Q 在两台之间近似常数', 'Q is approximately constant between the stations'),
    ],
    breaks: [t('两台方位差别较大时，方向性与路径差异会污染结果', 'If the two azimuths differ appreciably, directivity and path differences contaminate the result')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('写出两台的谱', 'Write the spectra at both stations'),
      latex: String.raw`A_i(f)=S(f)\,G_i^{-1}\,R_i\,e^{-\pi f t_i^{*}},\quad i=1,2` },
    { n: 2, op: 'algebra', title: t('取比值', 'Take the ratio'),
      latex: String.raw`\frac{A_1}{A_2}=\frac{G_2}{G_1}\frac{R_1}{R_2}\,e^{-\pi f\left(t_1^{*}-t_2^{*}\right)}` },
    { n: 3, op: 'identity', title: t('取对数得到直线', 'Take logs to obtain a straight line'),
      latex: String.raw`\ln\frac{A_1}{A_2}=\ln\frac{G_2 R_1}{G_1 R_2}-\pi f\,\Delta t^{*}` },
    { n: 4, op: 'result', title: t('由斜率反推 Q', 'Invert the slope for Q'),
      latex: String.raw`\text{slope}=-\pi\Delta t^{*}\;\Longrightarrow\; Q=\frac{\Delta t}{\Delta t^{*}\,v}` },
  ],
  viz: [
    {
      id: 'spectral-ratio-plot',
      level: 'V1',
      title: t('谱比对数与频率的直线关系', 'Log spectral ratio versus frequency'),
      xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
      ylabel: t('ln(A₁/A₂)', 'ln(A₁/A₂)'),
      controls: [
        { id: 'dt', label: t('Δt*', 'Δt*'), min: 0.01, max: 1.0, step: 0.01, value: 0.2, unit: 's' },
      ],
      compute: (p) => {
        const dt = p['dt']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const f = 0.2 + (i / 200) * 19.8
          pts.push([f, 0.5 - Math.PI * dt * f])
        }
        return [{ label: t('ln(A₁/A₂)', 'ln(A₁/A₂)'), color: '#185FA5', points: pts }]
      },
      note: t('斜率除以 −π 就是 Δt*。实测中通常只在信噪比足够高的频段做线性拟合。', 'Dividing the slope by −π gives Δt*. In practice the linear fit is restricted to the band with adequate signal-to-noise ratio.'),
    },
  ],
  links: {
    upstream: [{ id: 'tstar-operator', note: t('Δt* 的定义', 'Definition of Δt*') }],
    seealso: [{ id: 'coda-q-method', note: t('另一种不依赖路径的 Q 测量', 'A path-independent alternative') }],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.5' }],
}

export default spectralRatioQ
