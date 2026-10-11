import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** vertical-resolution */
const verticalResolution: FormulaCard = {
  id: 'vertical-resolution',
  name: t('垂向分辨率（四分之一波长准则）', 'Vertical Resolution (Quarter-wavelength Criterion)'),
  aliases: { zh: ['分辨率', '1/4 波长'], en: ['vertical resolution', 'quarter wavelength', 'Rayleigh criterion'] },
  node: 'S3.6',
  tags: {
    math: ['MATH.APPROX', 'MATH.FOURIER'],
    method: ['METH.EXPL'],
    quantity: ['Q.FREQ', 'Q.GEOM'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\Delta z_{\min}\approx\frac{\lambda}{4}=\frac{v}{4f}`,
    variants: [
      { name: t('用主频与层速度表示', 'In terms of dominant frequency and interval velocity'), latex: String.raw`\Delta z_{\min}=\frac{v}{4\,f_{\text{dom}}}` },
      { name: t('时间域形式', 'Time-domain form'), latex: String.raw`\Delta t_{\min}\approx\frac{1}{2.5\,f_{\text{dom}}}` },
      { name: t('横向分辨率（菲涅尔带）', 'Lateral resolution (Fresnel zone)'), latex: String.raw`R_F\approx\sqrt{\frac{\lambda\,z}{2}}=\sqrt{\frac{v\,z}{2f}}` },
    ],
  },
  meaning: t(
    '地震波分辨不出比四分之一波长更薄的层。这条经验准则决定了整个反射勘探的能力边界：想看清 10 m 的储层，在 3000 m/s 的速度下需要主频约 75 Hz —— 而实际资料往往只有 25–40 Hz，因此「薄层」是常态而非例外。提高分辨率只能靠提高频率，而高频又被衰减吃掉，这就是地球物理的根本矛盾。',
    'Seismic waves cannot resolve beds thinner than a quarter wavelength. This rule of thumb defines the whole capability envelope of reflection surveying: imaging a 10 m reservoir at 3000 m/s needs about 75 Hz dominant frequency, while real data often carry only 25–40 Hz. Thin beds are therefore the norm rather than the exception. Resolution can only be raised by raising frequency, which attenuation destroys — the fundamental tension of geophysics.',
  ),
  symbols: [
    { sym: '\\Delta z_{\\min}', name: t('可分辨的最小层厚', 'minimum resolvable bed thickness'), unit: 'm' },
    { sym: '\\lambda', name: t('波长', 'wavelength'), unit: 'm' },
    { sym: 'v', name: t('层速度', 'interval velocity'), unit: 'm/s' },
    { sym: 'f_{\\text{dom}}', name: t('主频', 'dominant frequency'), unit: 'Hz', typical: '10 – 60' },
    { sym: 'R_F', name: t('第一菲涅尔带半径', 'radius of the first Fresnel zone'), unit: 'm' },
  ],
  conditions: {
    applies: [t('零相位子波、单层反射的分辨率估计', 'Estimating resolution for zero-phase wavelets and single reflections')],
    assumes: [t('子波主频明确、信噪比足够', 'The wavelet dominant frequency is well defined and the signal-to-noise ratio is adequate')],
    breaks: [t('高信噪比下借助反演可以分辨到 λ/8 甚至更薄，但那是反演而非分辨', 'At high signal-to-noise ratio, inversion can recover λ/8 or thinner, but that is inversion rather than resolution')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('薄层顶底两个反射叠加', 'Superpose the reflections from the top and base of a thin bed'),
      latex: String.raw`r(t)=R\,w(t)-R\,w(t-\Delta t),\qquad \Delta t=\frac{2\Delta z}{v}` },
    { n: 2, op: 'taylor', title: t('层很薄时做一阶展开', 'First-order expansion for a very thin bed'),
      latex: String.raw`r(t)\approx R\,\Delta t\,\frac{\mathrm{d}w}{\mathrm{d}t}` },
    { n: 3, op: 'identity', title: t('复合波形与单个子波可区分时', 'The composite is distinguishable from a single wavelet when'),
      latex: String.raw`\Delta t\gtrsim\frac{1}{2f}\;\text{(半个子波周期)}` },
    { n: 4, op: 'result', title: t('换算成厚度', 'Convert to thickness'),
      latex: String.raw`\Delta z=\frac{v\,\Delta t}{2}\gtrsim\frac{v}{4f}=\frac{\lambda}{4}` },
  ],
  viz: [
    {
      id: 'resolution-vs-freq',
      level: 'V1',
      title: t('可分辨厚度随主频与速度的变化', 'Minimum resolvable thickness versus frequency and velocity'),
      xlabel: t('主频 f (Hz)', 'dominant frequency f (Hz)'),
      ylabel: t('可分辨厚度 Δz (m)', 'resolvable thickness Δz (m)'),
      yScale: 'log',
      controls: [
        { id: 'v', label: t('层速度 v', 'interval velocity v'), min: 1500, max: 6000, step: 100, value: 3000, unit: 'm/s' },
      ],
      compute: (p) => {
        const v = p['v']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const f = 5 + (i / 200) * 95
          pts.push([f, v / (4 * f)])
        }
        return [{ label: t('Δz = v/(4f)', 'Δz = v/(4f)'), color: '#185FA5', points: pts }]
      },
      note: t('主频从 20 Hz 提到 60 Hz，可分辨厚度从约 38 m 降到约 12 m —— 这就是为什么高分辨率勘探拼命追求高频。', 'Raising the dominant frequency from 20 to 60 Hz reduces the resolvable thickness from about 38 m to about 12 m — why high-resolution surveys chase high frequencies so hard.'),
    },
  ],
  example: {
    title: t('常规陆上资料的分辨能力', 'Resolution of a conventional land survey'),
    input: t('v = 3000 m/s，f_dom = 30 Hz', 'v = 3000 m/s, f_dom = 30 Hz'),
    steps: [t('Δz = 3000/(4×30) = 25 m', 'Δz = 3000/(4×30) = 25 m')],
    output: t('25 m —— 大多数砂岩储层单层的实际厚度都在这个量级或更薄', '25 m — most individual sandstone reservoir beds are at this scale or thinner'),
  },
  links: {
    seealso: [{ id: 'thin-bed-tuning', note: t('比它更薄时会发生调谐', 'Tuning sets in below this thickness') }],
  },
  refs: [{ text: 'Widess (1973), Geophysics, 38' }, { text: 'Sheriff, Encyclopedic Dictionary of Exploration Geophysics' }],
}

export default verticalResolution
