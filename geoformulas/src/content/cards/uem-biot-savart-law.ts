import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-biot-savart-law */
const uemBiotSavartLaw: FormulaCard = {
  id: 'uem-biot-savart-law',
  name: t('Biot–Savart 定律', "Biot–Savart Law"),
  aliases: { zh: ['毕奥-萨伐尔定律', '电流元磁场'], en: ['Biot-Savart', 'field of a current element'] },
  node: 'S19.3',
  tags: {
    math: ['MATH.VECTOR', 'MATH.DIFF'],
    method: ['METH.PHYS'],
    quantity: ['Q.MAG'],
    keywords: t('毕奥萨伐尔 电流元 Idl 直导线 圆环轴 μ0/4π', 'Biot Savart current element straight wire loop axis mu0 over 4pi'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`d\mathbf{B}=\frac{\mu_{0}}{4\pi}\,\frac{I\,d\mathbf{l}\times\hat{\mathbf{r}}}{r^{2}}`,
    variants: [
      { name: t('无限长直导线', 'Infinite straight wire'), latex: String.raw`B=\dfrac{\mu_{0}I}{2\pi r}` },
      { name: t('圆环中心', 'Center of a circular loop'), latex: String.raw`B=\dfrac{\mu_{0}I}{2R}` },
    ],
  },
  meaning: t(
    'Biot–Savart 定律给出任意电流分布产生的磁场：把导线切成电流元 Idl，每个电流元按 μ0/4π · Idl×r̂/r² 贡献一个磁场，再矢量叠加。它是磁学的"Coulomb 定律"，直导线与圆环场都由它推出。',
    'Biot–Savart gives the field of any current distribution: slice the wire into elements Idl, each contributes μ0/4π · Idl×r̂/r², and vector-sum. It is the "Coulomb law" of magnetostatics; the straight-wire and loop fields derive from it.',
  ),
  symbols: [
    { sym: 'd\\mathbf{B}', name: t('电流元产生的磁场', 'field of a current element'), unit: 'T' },
    { sym: 'I', name: t('电流', 'current'), unit: 'A' },
    { sym: 'd\\mathbf{l}', name: t('导线元（沿电流方向）', 'wire element along current'), unit: 'm' },
    { sym: 'r', name: t('电流元到场点距离', 'distance to field point'), unit: 'm' },
    { sym: '\\mu_{0}', name: t('真空磁导率', 'permeability of free space'), unit: 'H/m', typical: '4π×10⁻⁷' },
  ],
  conditions: {
    applies: [t('稳恒电流；真空或非磁性介质', 'Steady current; vacuum or non-magnetic medium')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('电流元磁场形式', 'Field of a current element'),
      latex: String.raw`d\mathbf{B}\propto\dfrac{I\,d\mathbf{l}\times\hat{\mathbf{r}}}{r^{2}}` },
    { n: 2, op: 'algebra', title: t('引入 μ0/4π', 'Introduce μ0/4π'),
      latex: String.raw`d\mathbf{B}=\dfrac{\mu_{0}}{4\pi}\dfrac{I\,d\mathbf{l}\times\hat{\mathbf{r}}}{r^{2}}` },
    { n: 3, op: 'transform', title: t('积分得直导线场', 'Integrate for straight wire'),
      latex: String.raw`B=\dfrac{\mu_{0}I}{4\pi r}\left(\sin\theta_{1}+\sin\theta_{2}\right)=\dfrac{\mu_{0}I}{2\pi r}` },
  ],
  viz: [
    {
      id: 'b-wire-vs-r',
      level: 'V1',
      title: t('长直导线磁场随距离', 'Field of a long straight wire vs distance'),
      xlabel: t('距离 r (cm)', 'distance r (cm)'),
      ylabel: t('磁场 B (μT)', 'field B (μT)'),
      xRange: [0, 20],
      controls: [
        { id: 'iwire', label: t('电流 I (A)', 'current I'), min: 1, max: 50, step: 1, value: 10, unit: 'A' },
      ],
      compute: (p) => {
        const I = p['iwire']
        const pts: Array<[number, number]> = []
        for (let i = 1; i <= 200; i++) {
          const rcm = (i / 200) * 20 + 0.2
          const r = rcm * 1e-2
          const B = (4 * Math.PI * 1e-7) * I / (2 * Math.PI * r)
          pts.push([rcm, B * 1e6])
        }
        return [{ label: t('B=μ0I/2πr', 'B=μ0I/2πr'), color: '#7F77DD', points: pts }]
      },
      note: t('B∝1/r，离导线越远衰减越快（与点电荷场 1/r² 不同）。', 'B∝1/r, decaying faster near the wire (unlike a point charge\'s 1/r²).'),
    },
  ],
  links: {
    upstream: [{ id: 'uem-magnetic-field-b' }],
    downstream: [{ id: 'uem-straight-wire-b' }, { id: 'uem-solenoid-b' }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §29' }],
}

export default uemBiotSavartLaw
