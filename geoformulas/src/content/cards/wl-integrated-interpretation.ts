import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** wl-integrated-interpretation */
const wlIntegratedInterpretation: FormulaCard = {
  id: 'wl-integrated-interpretation',
  name: t('测井曲线综合解释流程', 'Integrated Log-interpretation Workflow'),
  aliases: { zh: ['测井解释流程', '油水层综合判别'], en: ['log interpretation workflow', 'pay evaluation flow'] },
  node: 'S17.2',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.LOG'],
    quantity: ['Q.POR', 'Q.ELEC'],
    keywords: t('测井综合解释 流程 岩性 孔隙度 饱和度 油水层 交会图', 'integrated log interpretation workflow lithology porosity saturation crossplot'),
  },
  audience: 'bachelor',
  complete: 'L1',
  statement: {
    main: String.raw`\text{岩性}\to V_{sh}\to\phi_{e}\to R_{w}\to R_{t}\to S_{w}\to\text{油水层}`,
    variants: [
      { name: t('常用交会图', 'Common crossplots'), latex: String.raw`\text{中子—密度}\;,\quad\text{SP—GR}\;,\quad\varphi\,\text{—Rt}` },
    ],
  },
  meaning: t(
    '单条曲线只能给一个物理量，综合解释是把它们串起来的流程：①用 GR/SP 划岩性、算 Vsh；②用中子—密度—声波交会求有效孔隙度 φe；③用 SP 求 Rw；④用深电阻率得 Rt；⑤代入 Archie 算 Sw；⑥按 Sw 下限判别油水层。任何一步出错都会污染最终结论，所以每一步都要互相校验。',
    'A single log gives one physical quantity; integrated interpretation chains them: ① GR/SP pick lithology and Vsh; ② neutron–density–sonic crossplots yield effective porosity φe; ③ SP gives Rw; ④ deep resistivity gives Rt; ⑤ Archie yields Sw; ⑥ a Sw cut-off discriminates oil/water. Each step pollutes the next, so every result must be cross-checked.',
  ),
  symbols: [
    { sym: 'V_{sh}', name: t('泥质含量', 'shale volume'), unit: 'v/v' },
    { sym: '\\phi_{e}', name: t('有效孔隙度', 'effective porosity'), unit: 'v/v' },
    { sym: 'S_{w}', name: t('含水饱和度', 'water saturation'), unit: 'v/v' },
  ],
  conditions: {
    applies: [t('一组常规测井（GR、SP、电阻率、声波、密度、中子）齐全', 'A full conventional log suite (GR, SP, resistivity, sonic, density, neutron)')],
  },
  links: {
    upstream: [{ id: 'wl-archie-water-saturation' }, { id: 'wl-shale-volume-larionov' }, { id: 'wl-formation-water-resistivity' }],
    seealso: [{ id: 'wl-neutron-density-crossplot' }],
  },
  refs: [{ text: 'Ellis & Singer, Well Logging, 2nd ed., §12' }],
}

export default wlIntegratedInterpretation
