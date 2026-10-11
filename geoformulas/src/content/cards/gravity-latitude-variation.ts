import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gravity-latitude-variation */
const gravityLatitudeVariation: FormulaCard = {
  id: 'gravity-latitude-variation',
  name: t('正常重力随纬度的变化与纬度校正', 'Latitude Variation of Normal Gravity and the Latitude Correction'),
  aliases: { zh: ['纬度校正', '正常重力梯度'], en: ['latitude correction', 'latitudinal gravity gradient'] },
  node: 'S14.2',
  tags: {
    math: ['MATH.DIFF', 'MATH.APPROX'],
    method: ['METH.GRAV'],
    quantity: ['Q.GRAV'],
    keywords: t('纬度校正 正常重力 水平梯度', 'latitude correction normal gravity horizontal gradient'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\frac{dg}{d\varphi}\approx 8.14\sin 2\varphi\ \ \mathrm{mGal/rad}`,
    variants: [
      { name: t('每公里纬度差的校正（中纬度）', 'correction per km of latitude (mid-latitudes)'), latex: String.raw`\delta g_{\varphi}\approx 0.812\sin 2\varphi\ \ \mathrm{mGal/km}` },
    ],
  },
  meaning: t(
    '正常重力随纬度变化，测点若偏离基准纬度，必须把这部分趋势从观测中扣除。纬度校正近似正比于 sin2φ，在南北纬 45° 处达到最大（约 0.81 mGal/km）。它是重力校正序列中量级最大的一项之一，搞错符号会让整张图面目全非。',
    'Because normal gravity varies with latitude, measurements away from the reference latitude must have this trend removed. The latitude correction is proportional to sin2φ and peaks near 45° N/S (about 0.81 mGal/km). It is one of the largest corrections; a sign error ruins the whole map.',
  ),
  symbols: [
    { sym: 'dg/d\\varphi', name: t('正常重力对纬度导数', 'derivative of normal gravity with latitude'), unit: 'mGal/rad' },
    { sym: '\\varphi', name: t('地理纬度', 'geographic latitude'), unit: '°' },
    { sym: '\\delta g_{\\varphi}', name: t('纬度校正量', 'latitude correction'), unit: 'mGal' },
  ],
  conditions: {
    applies: [t('台网尺度小于数千公里', 'Survey extent less than a few thousand km')],
    assumes: [t('当地正常重力可用线性项近似', 'Local normal gravity linearised')],
    breaks: [t('跨纬度大时须用完整正常重力公式', 'Use the full normal formula at large latitude spans')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('从正常重力公式出发', 'Start from the normal gravity formula'),
      latex: String.raw`g(\varphi)=g_e(1+\beta\sin^{2}\varphi)` },
    { n: 2, op: 'algebra', title: t('对 φ 求导', 'Differentiate with respect to φ'),
      latex: String.raw`\frac{dg}{d\varphi}=g_e\beta\,\sin 2\varphi` },
    { n: 3, op: 'substitute', title: t('代入 g_eβ ≈ 0.0053×978 Gal', 'Substitute g_eβ ≈ 0.0053×978 Gal'),
      latex: String.raw`\frac{dg}{d\varphi}\approx 8.14\sin 2\varphi\ \mathrm{mGal/rad}` },
    { n: 4, op: 'result', title: t('换算为每公里（中纬度）', 'Convert to per km (mid-latitude)'),
      latex: String.raw`\delta g_{\varphi}\approx 0.812\sin 2\varphi\ \mathrm{mGal/km}` },
  ],
  links: {
    upstream: [{ id: 'gravity-normal-formula' }],
    downstream: [{ id: 'gravity-free-air-correction' }],
  },
  refs: [{ text: 'Telford et al., Applied Geophysics, §3.5' }],
}

export default gravityLatitudeVariation
