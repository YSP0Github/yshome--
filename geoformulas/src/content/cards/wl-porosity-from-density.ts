import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** wl-porosity-from-density */
const wlPorosityFromDensity: FormulaCard = {
  id: 'wl-porosity-from-density',
  name: t('密度求孔隙度 φD', 'Porosity from Density Log φD'),
  aliases: { zh: ['密度孔隙度', '体积密度求孔隙度'], en: ['density porosity', 'bulk-density porosity'] },
  node: 'S17.2',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.LOG', 'METH.ROCK'],
    quantity: ['Q.POR'],
    keywords: t('密度孔隙度 φD 体积密度 骨架密度 流体密度 测井', 'density porosity bulk density matrix fluid density log'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\phi_{D}=\frac{\rho_{matrix}-\rho_{b}}{\rho_{matrix}-\rho_{f}}`,    variants: [
      { name: t('常见骨架密度', 'Common matrix densities'), latex: String.raw`\rho_{qz}=2.65,\ \rho_{lime}=2.71,\ \rho_{dol}=2.87\ \mathrm{g/cm^{3}}` },
    ],
  },
  meaning: t(
    '由体积密度 ρb 反推孔隙度 φD：φD=(ρmatrix−ρb)/(ρmatrix−ρf)。骨架密度随岩性变（石英 2.65、灰岩 2.71、白云岩 2.87），流体密度近似 1.0。密度求孔隙度对总孔隙度敏感，是最常用的孔隙度曲线；含气时 φD 偏大，需用中子校正。',
    'Inverting bulk density ρb gives porosity φD=(ρmatrix−ρb)/(ρmatrix−ρf). Matrix density varies with lithology (quartz 2.65, limestone 2.71, dolomite 2.87), fluid density ≈1.0. Density porosity is sensitive to total porosity and is the most-used porosity curve; gas biases it high and needs neutron correction.',
  ),
  symbols: [
    { sym: '\\phi_{D}', name: t('密度孔隙度', 'density porosity'), unit: 'v/v' },
    { sym: '\\rho_{b}', name: t('体积密度测井值', 'bulk density log'), unit: 'g/cm³' },
    { sym: '\\rho_{matrix}', name: t('骨架密度', 'matrix density'), unit: 'g/cm³' },
    { sym: '\\rho_{f}', name: t('流体密度', 'fluid density'), unit: 'g/cm³' },
  ],
  conditions: {
    applies: [t('干净地层、泥饼校正后', 'Clean beds, mud-cake corrected')],
    breaks: [t('含气使 ρb 偏低、φD 偏大', 'Gas lowers ρb and overestimates φD')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('体积密度加权', 'Bulk density mix'),
      latex: String.raw`\rho_{b}=(1-\phi)\rho_{matrix}+\phi\rho_{f}` },
    { n: 2, op: 'algebra', title: t('整理', 'Rearrange'),
      latex: String.raw`\rho_{b}=\rho_{matrix}-\phi(\rho_{matrix}-\rho_{f})` },
    { n: 3, op: 'result', title: t('解出 φD', 'Solve for φD'),
      latex: String.raw`\phi_{D}=(\rho_{matrix}-\rho_{b})/(\rho_{matrix}-\rho_{f})` },
  ],
  viz: [
    {
      id: 'phi-d-from-rhob',
      level: 'V1',
      title: t('φD 随体积密度 ρb', 'φD versus bulk density ρb'),
      xlabel: t('体积密度 ρb (g/cm³)', 'bulk density ρb (g/cm³)'),
      ylabel: t('密度孔隙度 φD', 'density porosity φD'),
      controls: [
        { id: 'rhom', label: t('骨架密度 ρmatrix', 'matrix density'), min: 2.6, max: 2.95, step: 0.01, value: 2.65, unit: 'g/cm³' },
        { id: 'rhof', label: t('流体密度 ρf', 'fluid density'), min: 0.8, max: 1.2, step: 0.01, value: 1.0, unit: 'g/cm³' },
      ],
      compute: (p) => {
        const rhom = p['rhom'], rhof = p['rhof']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 100; i++) {
          const rb = 1.8 + (i / 100) * 1.0 // 1.8 .. 2.8
          pts.push([rb, Math.max(0, (rhom - rb) / (rhom - rhof))])
        }
        return [{ label: t('φD', 'φD'), color: '#0F6E56', points: pts }]
      },
      note: t('ρb 越接近流体密度孔隙度越大；ρb 降到 2.0 以下通常指示气层或非常疏松地层。', 'Closer ρb is to fluid density, the larger φD; ρb below ~2.0 often flags gas or very unconsolidated rock.'),
    },
  ],
  links: {
    upstream: [{ id: 'wl-density-log' }],
    seealso: [{ id: 'wl-porosity-from-sonic' }, { id: 'wl-average-porosity-combination' }],
  },
  refs: [{ text: 'Ellis & Singer, Well Logging, 2nd ed., §9' }],
}

export default wlPorosityFromDensity
