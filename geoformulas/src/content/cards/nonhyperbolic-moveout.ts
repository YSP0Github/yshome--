import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** nonhyperbolic-moveout */
const nonhyperbolicMoveout: FormulaCard = {
  id: 'nonhyperbolic-moveout',
  name: t('非双曲时距（四阶动校正）', 'Non-hyperbolic Moveout (Fourth-order NMO)'),
  aliases: { zh: ['非双曲动校正', '四阶项'], en: ['non-hyperbolic moveout', 'quartic moveout', 'Alkhalifah-Tsvankin'] },
  node: 'S3.4',
  tags: {
    math: ['MATH.APPROX', 'MATH.ALGEBRA', 'MATH.GEOM'],
    method: ['METH.EXPL'],
    quantity: ['Q.TIME', 'Q.VEL'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`t^{2}(x)=t_0^{2}+\frac{x^{2}}{v_{\mathrm{nmo}}^{2}}+\frac{A_4\,x^{4}}{1+A_5\,x^{2}}`,
    variants: [
      { name: t('Alkhalifah–Tsvankin 形式（VTI）', 'The Alkhalifah–Tsvankin form for VTI'), latex: String.raw`t^{2}=t_0^{2}+\frac{x^{2}}{v_{\mathrm{nmo}}^{2}}-\frac{2\eta\,x^{4}}{v_{\mathrm{nmo}}^{2}\left[t_0^{2}v_{\mathrm{nmo}}^{2}+(1+2\eta)x^{2}\right]}` },
      { name: t('各向异性参数 η', 'The anisotropy parameter η'), latex: String.raw`\eta=\frac{\varepsilon-\delta}{1+2\delta}` },
      { name: t('小偏移距时退化为双曲线', 'Reduces to a hyperbola at small offsets'), latex: String.raw`x\to0:\quad t^{2}\to t_0^{2}+\frac{x^{2}}{v_{\mathrm{nmo}}^{2}}` },
    ],
  },
  meaning: t(
    '在长偏移距上，真实的时距曲线会偏离双曲线：层状介质的速度随深度增加会让它「上翘」，各向异性会让它「下沉」。用双曲线做动校正在长偏移距上会残留时差，导致叠加降频。四阶动校正加一项 x⁴ 修正 —— VTI 介质里这个修正量用一个参数 η 就能概括。',
    'At long offsets the true moveout departs from a hyperbola: increasing velocity with depth makes it curve upward, anisotropy makes it sag. Hyperbolic NMO leaves residual moveout at long offsets, lowering the stacked frequency. Fourth-order moveout adds an x⁴ term; in VTI media this correction is captured by a single parameter η.',
  ),
  symbols: [
    { sym: 't(x)', name: t('偏移距 x 处的双程走时', 'two-way travel time at offset x'), unit: 's' },
    { sym: 'v_{\\mathrm{nmo}}', name: t('NMO 速度（小偏移距极限）', 'NMO velocity (small-offset limit)'), unit: 'm/s' },
    { sym: '\\eta', name: t('各向异性参数（VTI）', 'anisotropy parameter (VTI)'), unit: '无量纲', typical: '0 – 0.3' },
    { sym: '\\varepsilon,\\delta', name: t('Thomsen 参数', 'Thomsen parameters'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('偏移距与深度可比（x/z > 1）的长排列资料', 'Long-spread data where offset is comparable to depth (x/z > 1)')],
    assumes: [t('VTI 或水平层状介质', 'VTI or horizontally layered media')],
    breaks: [t('陡倾角、强横向变速时需用倾角动校正或叠前深度偏移', 'Steep dip or strong lateral variation needs dip-moveout or pre-stack depth migration')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把时距展开成 x 的偶次幂', 'Expand the moveout in even powers of x'),
      latex: String.raw`t^{2}(x)=t_0^{2}+c_2x^{2}+c_4x^{4}+\cdots` },
    { n: 2, op: 'identity', title: t('识别小偏移距项', 'Identify the small-offset term'),
      latex: String.raw`c_2=\frac{1}{v_{\mathrm{nmo}}^{2}}` },
    { n: 3, op: 'substitute', title: t('VTI 介质中四阶项由 η 给出', 'In VTI media the fourth-order term is given by η'),
      latex: String.raw`c_4=-\frac{2\eta}{v_{\mathrm{nmo}}^{2}\left[t_0^{2}v_{\mathrm{nmo}}^{2}+(1+2\eta)x^{2}\right]}` },
    { n: 4, op: 'result', title: t('写成有理函数保证大偏移距不发散', 'Write as a rational function to avoid divergence at large offsets'),
      latex: String.raw`t^{2}=t_0^{2}+\frac{x^{2}}{v_{\mathrm{nmo}}^{2}}+\frac{A_4x^{4}}{1+A_5x^{2}}` },
  ],
  links: {
    upstream: [
      { id: 'reflection-hyperbola', note: t('它的小偏移距极限', 'Its small-offset limit') },
      { id: 'thomsen-parameters', note: t('η 由 Thomsen 参数构成', 'η is built from the Thomsen parameters') },
    ],
    seealso: [{ id: 'velocity-analysis', note: t('速度拾取必须考虑它', 'Velocity picking must account for it') }],
  },
  refs: [{ text: 'Alkhalifah & Tsvankin (1995), Geophysics, 60' }],
}

export default nonhyperbolicMoveout
