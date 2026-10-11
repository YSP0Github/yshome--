import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gravity-eotvos-correction */
const gravityEotvosCorrection: FormulaCard = {
  id: 'gravity-eotvos-correction',
  name: t('Eötvös 运动校正', 'Eötvös Correction (Moving Gravimeter)'),
  aliases: { zh: ['厄缶校正', '船载校正'], en: ['Eötvös correction'] },
  node: 'S14.3',
  tags: {
    math: ['MATH.GEOM', 'MATH.APPROX'],
    method: ['METH.GRAV'],
    quantity: ['Q.GRAV'],
    keywords: t('Eotvos 船载 走航 运动 离心', 'Eotvos moving shipborne centrifugal correction'),
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\delta g_{\text{E}}\approx 7.5\,v\cos\varphi\sin\alpha+0.004\,v^{2}\ \ \mathrm{mGal}`,
    variants: [
      { name: t('物理形式', 'physical form'), latex: String.raw`\delta g_{\text{E}}=2\,\Omega\,v\cos\varphi\sin\alpha+\frac{v^{2}}{R}` },
    ],
  },
  meaning: t(
    '船载或机载重力仪在运动，其相对地面的速度会改变有效离心力：向东运动增大离心力（g 偏小），向西反之。Eötvös 校正补偿这个运动效应，是海洋/航空重力测量的关键。第一项来自科里奥利，第二项来自船速产生的向心加速度。',
    'A shipborne or airborne gravimeter moves, and its velocity relative to the ground changes the effective centrifugal force: eastward motion increases it (lowering g), westward motion the opposite. The Eötvös correction compensates this motion effect and is essential for marine/airborne gravity. The first term is Coriolis; the second is the centripetal acceleration from the vessel speed.',
  ),
  symbols: [
    { sym: '\\delta g_{\\text{E}}', name: t('Eötvös 校正', 'Eötvös correction'), unit: 'mGal' },
    { sym: 'v', name: t('测量平台速度', 'platform speed'), unit: 'km/h' },
    { sym: '\\varphi', name: t('纬度', 'latitude'), unit: '°' },
    { sym: '\\alpha', name: t('航向与北向夹角', 'heading angle from north'), unit: '°' },
    { sym: '\\Omega', name: t('地球自转角速度', 'Earth rotation rate'), unit: 'rad/s' },
  ],
  conditions: {
    applies: [t('船载、机载等运动平台', 'Shipborne, airborne moving platforms')],
    assumes: [t('平台速度已知、近地表', 'Known platform velocity, near surface')],
    breaks: [t('陆地固定台站无需此项', 'Unnecessary for fixed land stations')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('相对运动改变绕轴角速度', 'Motion changes angular rate about the axis'),
      latex: String.raw`\Omega_{\text{eff}}=\Omega+\frac{v\sin\alpha}{R\cos\varphi}` },
    { n: 2, op: 'algebra', title: t('离心力变化 =2Ω_eff v cosφ sinα', 'Centrifugal change =2Ω v cosφ sinα'),
      latex: String.raw`\delta g_{\text{E}}^{(\Omega)}=2\Omega v\cos\varphi\sin\alpha` },
    { n: 3, op: 'physics', title: t('平台曲线运动的向心加速度 v²/R', 'Centripetal from path curvature v²/R'),
      latex: String.raw`\delta g_{\text{E}}^{(v)}=\frac{v^{2}}{R}` },
    { n: 4, op: 'result', title: t('合并并代入常数（v 用 km/h）', 'Combine with constants (v in km/h)'),
      latex: String.raw`\delta g_{\text{E}}\approx7.5\,v\cos\varphi\sin\alpha+0.004\,v^{2}\ \mathrm{mGal}` },
  ],
  links: {
    upstream: [{ id: 'gravity-centrifugal-effect' }],
    seealso: [{ id: 'gravity-free-air-correction' }],
  },
  refs: [{ text: 'Telford et al., Applied Geophysics, §3.5' }],
}

export default gravityEotvosCorrection
