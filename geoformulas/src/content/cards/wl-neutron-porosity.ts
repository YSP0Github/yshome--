import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** wl-neutron-porosity */
const wlNeutronPorosity: FormulaCard = {
  id: 'wl-neutron-porosity',
  name: t('中子孔隙度测井 φN', 'Neutron Porosity Log φN'),
  aliases: { zh: ['中子测井', '中子孔隙度'], en: ['neutron log', 'neutron porosity φN'] },
  node: 'S17.1',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.LOG'],
    quantity: ['Q.POR'],
    keywords: t('中子测井 中子孔隙度 φN 氢指数 含气 挖掘效应', 'neutron log neutron porosity hydrogen index gas excavation effect'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\phi_{N}\propto \text{地层含氢指数 HI}`,    variants: [
      { name: t('纯水饱和参考', 'Water-saturated reference'), latex: String.raw`\phi_{N}=\phi\ (\text{纯水层},\ HI=1)` },
      { name: t('含气响应', 'Gas response'), latex: String.raw`HI_{gas}\ll 1\Rightarrow\phi_{N}\downarrow` },
    ],
  },
  meaning: t(
    '中子源向地层发射快中子，被氢原子核慢化后在探测器计数——计数率正比于地层"含氢量"，即含氢指数 HI。纯水的 HI=1，所以纯水层中子测井读数 φN≈真实孔隙度。天然气 HI 远小于水，因此气层 φN 明显偏低——这就是中子—密度交会识别气层的依据。',
    'A neutron source emits fast neutrons that slow down mainly on hydrogen nuclei; the detector count rate is proportional to the formation hydrogen index HI. Pure water has HI=1, so in a water zone the neutron reading φN≈true porosity. Natural gas has HI≪1, so gas beds read low on φN — the basis of the neutron–density gas crossplot.',
  ),
  symbols: [
    { sym: '\\phi_{N}', name: t('中子孔隙度（石灰岩标度）', 'neutron porosity (limestone scale)'), unit: 'v/v', typical: '0 – 0.4' },
    { sym: 'HI', name: t('含氢指数', 'hydrogen index'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('盐水饱和纯地层', 'Brine-saturated clean formation')],
    assumes: [t('氢主要来自孔隙流体', 'Hydrogen mainly from pore fluid')],
    breaks: [t('含气使 φN 偏低；粘土结合水使 φN 偏高', 'Gas biases φN low; clay bound water biases it high')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('慢化能力正比于含氢量', 'Moderation ∝ hydrogen content'),
      latex: String.raw`\text{counts}\propto HI` },
    { n: 2, op: 'identity', title: t('纯水 HI=1', 'Water HI=1'),
      latex: String.raw`HI_{water}=1\;\Rightarrow\;\phi_{N}=\phi` },
    { n: 3, op: 'result', title: t('气 HI 小', 'Gas has small HI'),
      latex: String.raw`HI_{gas}\ll 1\Rightarrow\phi_{N}<\phi` },
  ],
  links: {
    downstream: [{ id: 'wl-neutron-density-crossplot' }],
    seealso: [{ id: 'wl-density-log' }],
  },
  refs: [{ text: 'Ellis & Singer, Well Logging, 2nd ed., §10' }],
}

export default wlNeutronPorosity
