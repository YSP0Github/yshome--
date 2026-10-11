import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** em-skin-depth */
const emSkinDepth: FormulaCard = {
  id: 'em-skin-depth',
  name: t('趋肤深度', 'Skin Depth'),
  aliases: { zh: ['趋肤深度 δ'], en: ['skin depth', 'penetration depth'] },
  node: 'S16.2',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.EM'],
    quantity: ['Q.ELEC', 'Q.GEOM', 'Q.FREQ'],
    keywords: t('趋肤深度 穿透深度 503 根号ρ比f 低频深探', 'skin depth penetration 503 sqrt rho over f low freq deep'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\delta=\sqrt{\frac{2}{\mu\sigma\omega}}=\sqrt{\frac{2\rho_{e}}{\mu\omega}}\approx 503\sqrt{\frac{\rho_{e}}{f}}\ \mathrm{m}`,
    variants: [
      { name: t('场强衰减', 'Field amplitude'), latex: String.raw`E(\delta)=E_{0}/e\approx 37\%\,E_{0}` },
    ],
  },
  meaning: t(
    '趋肤深度 δ 是电磁场振幅衰减到地表 1/e（约 37%）的深度，也是电磁法"能看多深"的经验尺度。它正比于 √(ρ/f)：频率越低、介质电阻越大，穿透越深。这就是为什么 MT 用 10⁻³–10³ Hz 探测几十公里地壳，而TEM/航空电磁用高频只看浅部。',
    'The skin depth δ is where the EM field falls to 1/e (~37%) of its surface value — the practical scale of how deep EM can see. It scales as √(ρ/f): lower frequency and more resistive rock penetrate deeper. This is why MT uses 10⁻³–10³ Hz to probe tens of km of crust, while TEM and airborne EM at high frequency only image near surface.',
  ),
  symbols: [
    { sym: '\\delta', name: t('趋肤深度', 'skin depth'), unit: 'm' },
    { sym: '\\rho_{e}', name: t('大地电阻率', 'earth resistivity'), unit: 'Ω·m' },
    { sym: '\\mu', name: t('磁导率', 'permeability'), unit: 'H/m' },
    { sym: '\\omega', name: t('角频率 2πf', 'angular frequency'), unit: 'rad/s' },
    { sym: 'f', name: t('频率', 'frequency'), unit: 'Hz' },
  ],
  conditions: {
    applies: [t('均匀半空间、平面波、非磁性', 'Uniform half-space, plane wave, non-magnetic')],
    assumes: [t('μ=μ0 时系数 503', 'With μ=μ0 the constant is 503')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('平面波 k 的实部', 'Real part of plane-wave k'),
      latex: String.raw`\mathrm{Re}(k)=\sqrt{\dfrac{\mu\sigma\omega}{2}}=\dfrac{1}{\delta}` },
    { n: 2, op: 'algebra', title: t('解出 δ', 'Solve for δ'),
      latex: String.raw`\delta=\sqrt{\dfrac{2}{\mu\sigma\omega}}=\sqrt{\dfrac{2\rho_{e}}{\mu\omega}}` },
    { n: 3, op: 'algebra', title: t('代入 μ0=4π×10⁻⁷, ω=2πf', 'Substitute μ0 and ω=2πf'),
      latex: String.raw`\delta=\sqrt{\dfrac{2\rho_{e}}{4\pi\times10^{-7}\cdot 2\pi f}}\approx 503\sqrt{\rho_{e}/f}\ \mathrm{m}` },
  ],
  viz: [
    {
      id: 'skin-depth-f',
      level: 'V1',
      title: t('趋肤深度随频率和电阻率', 'Skin depth vs frequency and resistivity'),
      xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
      ylabel: t('趋肤深度 δ (m)', 'skin depth δ (m)'),
      xScale: 'log',
      yScale: 'log',
      controls: [
        { id: 'rhoe', label: t('电阻率 ρe (Ω·m)', 'resistivity ρe'), min: 1, max: 10000, step: 1, value: 100 },
      ],
      compute: (p) => {
        const rhoe = p['rhoe']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const f = Math.pow(10, -3 + (i / 200) * 7) // 0.001 .. 1e4 Hz
          pts.push([f, 503 * Math.sqrt(rhoe / f)])
        }
        return [{ label: t('δ=503√(ρe/f)', 'δ=503√(ρe/f)'), color: '#0F6E56', points: pts }]
      },
      note: t('频率每降 10 倍，穿透深度约增加 √10≈3.2 倍；ρe 越大穿得越深。', 'Dropping frequency by 10× increases penetration by √10≈3.2×; higher ρe also deepens penetration.'),
    },
  ],
  links: {
    upstream: [{ id: 'em-plane-wave-in-conductor' }],
    downstream: [{ id: 'em-mt-depth-penetration' }],
    seealso: [{ id: 'em-cagniard-apparent-resistivity' }],
  },
  refs: [{ text: 'Telford et al., Applied Geophysics, 2nd ed., §5.2' }],
}

export default emSkinDepth
