import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** geometrical-spreading */
const geometricalSpreading: FormulaCard = {
  id: 'geometrical-spreading',
  name: t('几何扩散', 'Geometrical Spreading'),
  aliases: { zh: ['球面扩散', '几何发散'], en: ['geometrical spreading', 'spherical divergence'] },
  node: 'S6.1',
  tags: {
    math: ['MATH.GEOM', 'MATH.ALGEBRA'],
    method: ['METH.TELE', 'METH.ATTEN'],
    quantity: ['Q.AMP', 'Q.GEOM'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`A(r)\propto\frac{1}{r}\quad(\text{体波球面扩散}),\qquad A(r)\propto\frac{1}{\sqrt{r}}\quad(\text{面波柱面扩散})`,
    variants: [
      { name: t('能量角度的推导', 'Derivation from energy conservation'), latex: String.raw`E=\text{常数}=A^{2}\cdot 4\pi r^{2}\;\Longrightarrow\; A\propto\frac{1}{r}` },
      { name: t('含吸收的完整形式', 'Complete form including absorption'), latex: String.raw`A(r)=A_0\,\frac{1}{r}\,e^{-\frac{\pi f r}{Qc}}` },
      { name: t('层状介质中的分段扩散', 'Piecewise spreading in layered media'), latex: String.raw`G(r)=\frac{1}{r}\ \text{直达波},\qquad G(r)=\frac{1}{\sqrt{r}\cdot r}\ \text{某些导波段}` },
    ],
  },
  meaning: t(
    '地震波变弱有两个完全不同的原因：一是能量摊到越来越大的波前上（几何扩散，与介质无损无关），二是被介质吸收变成热（内禀衰减 Q）。做衰减研究时必须先把前者除掉，否则会把几何扩散误当成吸收 —— 这是 Q 测量里最经典的陷阱。',
    'Seismic waves weaken for two entirely different reasons: energy spread over an ever-larger wavefront (geometrical spreading, independent of any loss) and absorption into heat (intrinsic attenuation Q). Any attenuation study must first remove the former, otherwise geometrical spreading is mistaken for absorption — the classic pitfall of Q measurement.',
  ),
  symbols: [
    { sym: 'A(r)', name: t('距离 r 处的振幅', 'amplitude at distance r'), unit: '与位移同' },
    { sym: 'r', name: t('震源距', 'hypocentral distance'), unit: 'm' },
    { sym: 'G(r)', name: t('几何扩散因子', 'geometrical spreading factor'), unit: '1/m' },
    { sym: 'Q', name: t('品质因子', 'quality factor'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('均匀介质中的体波与面波振幅校正', 'Amplitude correction for body and surface waves in uniform media')],
    assumes: [t('介质均匀、无波导、无聚焦', 'The medium is uniform, without waveguides or focusing')],
    breaks: [t('焦散区、波导内、俯冲板片中扩散规律完全不同', 'In caustics, waveguides and slabs the spreading law is entirely different')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('无损耗时穿过球面的总能流不变', 'With no loss, the total energy flux through a sphere is constant'),
      latex: String.raw`E=A^{2}\cdot4\pi r^{2}=\text{常数}` },
    { n: 2, op: 'algebra', title: t('解出振幅', 'Solve for the amplitude'),
      latex: String.raw`A\propto\frac{1}{r}` },
    { n: 3, op: 'geometry', title: t('面波能量摊在圆柱面上', 'Surface-wave energy spreads over a cylinder'),
      latex: String.raw`E=A^{2}\cdot2\pi r\cdot H=\text{常数}\;\Longrightarrow\; A\propto\frac{1}{\sqrt{r}}` },
    { n: 4, op: 'result', title: t('叠加内禀衰减', 'Add intrinsic attenuation'),
      latex: String.raw`A(r)=A_0\,G(r)\,e^{-\frac{\pi f r}{Qc}}` },
  ],
  viz: [
    {
      id: 'spreading-compare',
      level: 'V1',
      title: t('体波与面波振幅随距离的衰减对比', 'Body-wave versus surface-wave amplitude decay'),
      xlabel: t('距离 r (km)', 'distance r (km)'),
      ylabel: t('相对振幅', 'relative amplitude'),
      xScale: 'log',
      yScale: 'log',
      controls: [
        { id: 'Q', label: t('品质因子 Q', 'quality factor Q'), min: 50, max: 1000, step: 10, value: 300 },
        { id: 'f', label: t('频率 f', 'frequency f'), min: 0.1, max: 20, step: 0.1, value: 1, unit: 'Hz' },
      ],
      compute: (p) => {
        const Q = p['Q'], f = p['f'], c = 5000
        const body: Array<[number, number]> = []
        const surf: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const rkm = 10 * Math.pow(10, (i / 200) * 3)
          const r = rkm * 1000
          body.push([rkm, (1 / rkm) * Math.exp((-Math.PI * f * r) / (Q * c))])
          surf.push([rkm, (1 / Math.sqrt(rkm)) * Math.exp((-Math.PI * f * r) / (Q * c))])
        }
        return [
          { label: t('体波 1/r', 'body wave 1/r'), color: '#185FA5', points: body },
          { label: t('面波 1/√r', 'surface wave 1/√r'), color: '#0F6E56', points: surf },
        ]
      },
      note: t('这就是为什么远震面波常常比体波强得多 —— 它衰减得慢。', 'This is why teleseismic surface waves are usually far stronger than body waves: they decay more slowly.'),
    },
  ],
  links: {
    upstream: [{ id: 'quality-factor-q', note: t('另一半衰减机制', 'The other half of attenuation') }],
    seealso: [{ id: 'tstar-operator', note: t('把两部分分离后的累积量', 'The cumulative quantity after separating the two') }],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.5' }],
}

export default geometricalSpreading
