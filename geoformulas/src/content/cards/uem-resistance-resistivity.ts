import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-resistance-resistivity */
const uemResistanceResistivity: FormulaCard = {
  id: 'uem-resistance-resistivity',
  name: t('电阻与电阻率', 'Resistance and Resistivity'),
  aliases: { zh: ['R=ρL/A', '电阻率ρe'], en: ['resistance', 'resistivity'] },
  node: 'S19.2',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ELEC', 'Q.GEOM'],
    keywords: t('电阻 R=ρL/A 电阻率 导线长度 横截面积 温度系数', 'resistance R=rho L over A resistivity wire length cross section temp coefficient'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`R=\rho_{e}\,\frac{L}{A}`,
    variants: [
      { name: t('温度关系', 'Temperature dependence'), latex: String.raw`\rho_{e}(T)=\rho_{e0}\,[1+\alpha(T-T_{0})]` },
    ],
  },
  meaning: t(
    '电阻由材料电阻率 ρ_e 与几何共同决定：导线越长电阻越大，越粗电阻越小。ρ_e 是材料属性（铜≈1.7×10⁻⁸ Ω·m），随温度升高而增大（金属正温度系数）。',
    'Resistance is set by the material resistivity ρ_e and the geometry: longer wire gives larger R, thicker wire smaller R. ρ_e is a material property (copper ≈1.7×10⁻⁸ Ω·m) that rises with temperature (positive coefficient for metals).',
  ),
  symbols: [
    { sym: 'R', name: t('电阻', 'resistance'), unit: 'Ω' },
    { sym: '\\rho_{e}', name: t('电阻率', 'resistivity'), unit: 'Ω·m', typical: '1.7×10⁻⁸ (铜)' },
    { sym: 'L', name: t('导体长度', 'length'), unit: 'm' },
    { sym: 'A', name: t('横截面积', 'cross section'), unit: 'm²' },
    { sym: '\\alpha', name: t('温度系数', 'temperature coefficient'), unit: 'K⁻¹' },
  ],
  conditions: {
    applies: [t('均匀截面、各向同性材料、常温', 'Uniform section, isotropic material, near room temperature')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('微观 J=E/ρe', 'Microscopic J=E/ρe'),
      latex: String.raw`J=\dfrac{E}{\rho_{e}}` },
    { n: 2, op: 'algebra', title: t('代入 I=JA, U=EL', 'Substitute I=JA, U=EL'),
      latex: String.raw`R=\dfrac{U}{I}=\dfrac{E\,L}{J\,A}=\rho_{e}\dfrac{L}{A}` },
  ],
  viz: [
    {
      id: 'r-vs-geometry',
      level: 'V1',
      title: t('导线电阻随长度与截面积', 'Wire resistance vs length and area'),
      xlabel: t('长度 L (m)', 'length L (m)'),
      ylabel: t('电阻 R (Ω)', 'resistance R (Ω)'),
      xRange: [0, 10],
      controls: [
        { id: 'awire', label: t('导线截面积 A (mm²)', 'wire area A'), min: 0.1, max: 10, step: 0.1, value: 1.5, unit: 'mm²' },
      ],
      compute: (p) => {
        const A = p['awire'] * 1e-6
        const rho = 1.7e-8 // copper
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const L = (i / 200) * 10
          pts.push([L, rho * L / A])
        }
        return [{ label: t('铜线 R=ρL/A', 'Cu wire R=ρL/A'), color: '#BA7517', points: pts }]
      },
      note: t('R 随 L 线性上升；加粗导线（增大 A）可压低整条曲线。', 'R rises linearly with L; a thicker wire (larger A) shifts the curve down.'),
    },
  ],
  links: {
    upstream: [{ id: 'uem-ohms-law' }],
    downstream: [{ id: 'uem-resistor-series-parallel' }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §26' }],
}

export default uemResistanceResistivity
