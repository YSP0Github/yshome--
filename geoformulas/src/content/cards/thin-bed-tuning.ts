import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** thin-bed-tuning */
const thinBedTuning: FormulaCard = {
  id: 'thin-bed-tuning',
  name: t('薄层调谐', 'Thin-bed Tuning'),
  aliases: { zh: ['调谐效应', '调谐厚度'], en: ['thin-bed tuning', 'tuning thickness', 'Widess model'] },
  node: 'S3.6',
  tags: {
    math: ['MATH.FOURIER', 'MATH.APPROX'],
    method: ['METH.EXPL'],
    quantity: ['Q.AMP', 'Q.GEOM'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`\Delta z_{\text{调谐}}=\frac{\lambda}{4},\qquad A_{\max}=\frac{4\pi\,R\,\Delta z}{\lambda}\cdot A_{\text{单界面}}`,
    variants: [
      { name: t('薄层极限：振幅正比于厚度', 'Thin-bed limit: amplitude proportional to thickness'), latex: String.raw`\Delta z\ll\lambda:\quad A\propto R\,\Delta z` },
      { name: t('楔形模型的振幅—厚度关系', 'Amplitude–thickness relation for a wedge model'), latex: String.raw`A(\Delta z)=2A_0R\left|\sin\!\left(\frac{2\pi f\Delta z}{v}\right)\right|` },
      { name: t('调谐时间厚度', 'Tuning time thickness'), latex: String.raw`\Delta t_{\text{调谐}}\approx\frac{1}{2f_{\text{dom}}}` },
    ],
  },
  meaning: t(
    '当层厚小于四分之一波长时，顶界与底界的反射叠加在一起，合成振幅先随厚度增大而增大（相长干涉），在 λ/4 处达到极大，再随厚度继续增大而减小 —— 这就是调谐。它意味着薄层的反射振幅不再单调反映厚度，必须用「调谐校正」或反演才能定量解释。厚层（> λ/2）则顶底反射完全分开，振幅回到界面反射系数。',
    'When a bed is thinner than a quarter wavelength the top and base reflections merge: the composite amplitude first grows with thickness (constructive interference), peaks at λ/4, then decreases. This is tuning. It means the reflection amplitude of a thin bed no longer varies monotonically with thickness, so quantitative interpretation requires tuning correction or inversion. For thick beds (> λ/2) the two reflections separate and the amplitude returns to the interface reflection coefficient.',
  ),
  symbols: [
    { sym: '\\Delta z_{\\text{调谐}}', name: t('调谐厚度 λ/4', 'tuning thickness λ/4'), unit: 'm' },
    { sym: 'A', name: t('合成反射振幅', 'composite reflection amplitude'), unit: '与子波同' },
    { sym: 'R', name: t('界面反射系数', 'interface reflection coefficient'), unit: '无量纲' },
    { sym: '\\lambda', name: t('波长 v/f', 'wavelength v/f'), unit: 'm' },
  ],
  conditions: {
    applies: [t('层厚小于 λ/2 的楔形或薄层模型', 'Wedge or thin-bed models with thickness below λ/2')],
    assumes: [t('零相位子波、顶底反射系数大小相等符号相反', 'Zero-phase wavelet; top and base coefficients are equal in size and opposite in sign')],
    breaks: [t('子波非零相位或顶底反射系数不对称时，调谐曲线形状改变', 'For non-zero-phase wavelets or asymmetric coefficients the tuning curve changes shape')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('顶底两个反射相差 Δt', 'Top and base reflections differ by Δt'),
      latex: String.raw`\Delta t=\frac{2\Delta z}{v}` },
    { n: 2, op: 'identity', title: t('相差为 π 时完全相长', 'A phase difference of π gives fully constructive interference'),
      latex: String.raw`\omega\,\Delta t=\pi\;\Longrightarrow\; 2\pi f\cdot\frac{2\Delta z}{v}=\pi` },
    { n: 3, op: 'algebra', title: t('解出调谐厚度', 'Solve for the tuning thickness'),
      latex: String.raw`\Delta z=\frac{v}{4f}=\frac{\lambda}{4}` },
    { n: 4, op: 'result', title: t('薄层极限的线性关系', 'Linear relation in the thin-bed limit'),
      latex: String.raw`\Delta z\ll\lambda:\quad A\approx2A_0R\sin\!\left(\frac{2\pi f\Delta z}{v}\right)\approx\frac{4\pi A_0 R f}{v}\Delta z` },
  ],
  viz: [
    {
      id: 'tuning-curve',
      level: 'V1',
      title: t('楔形模型的调谐曲线', 'Tuning curve of a wedge model'),
      xlabel: t('层厚 Δz (m)', 'bed thickness Δz (m)'),
      ylabel: t('相对振幅', 'relative amplitude'),
      controls: [
        { id: 'v', label: t('层速度 v', 'interval velocity v'), min: 1500, max: 5000, step: 100, value: 3000, unit: 'm/s' },
        { id: 'f', label: t('子波主频 f', 'wavelet dominant frequency f'), min: 10, max: 80, step: 1, value: 30, unit: 'Hz' },
      ],
      compute: (p) => {
        const v = p['v'], f = p['f']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 400; i++) {
          const dz = (i / 400) * 120
          const val = Math.abs(Math.sin((2 * Math.PI * f * dz) / v))
          pts.push([dz, 2 * val])
        }
        return [{ label: t('|A|', '|A|'), color: '#185FA5', points: pts }]
      },
      note: t('峰值出现在 λ/4 处（本例 λ = 100 m，故峰值在 25 m）；厚度再大振幅反而下降，直到 λ/2 后顶底分开。', 'The peak occurs at λ/4 (here λ = 100 m, so the peak is at 25 m); beyond that the amplitude falls again until top and base separate at λ/2.'),
    },
  ],
  example: {
    title: t('河道砂体的调谐', 'Tuning of a channel sand'),
    input: t('v = 3000 m/s，f = 30 Hz，砂体厚 12 m', 'v = 3000 m/s, f = 30 Hz, sand thickness 12 m'),
    steps: [
      t('λ = 100 m，调谐厚度 = 25 m', 'λ = 100 m, tuning thickness = 25 m'),
      t('12 m < 25 m，处于调谐区（振幅随厚度增大）', '12 m < 25 m, so it lies in the tuning zone with amplitude increasing with thickness'),
    ],
    output: t('同样的 12 m 砂体，厚度增加 2 m 会让振幅增加约 17% —— 这正是"亮点"容易误判的原因', 'For the same 12 m sand, adding 2 m of thickness raises the amplitude by about 17% — a classic source of bright-spot misinterpretation'),
  },
  links: {
    upstream: [{ id: 'vertical-resolution', note: t('λ/4 也是分辨率极限', 'λ/4 is also the resolution limit') }],
    seealso: [{ id: 'acoustic-reflection-coefficient', note: t('厚层时的极限值', 'The limit for thick beds') }],
  },
  refs: [{ text: 'Widess (1973), Geophysics, 38' }, { text: 'Chung & Lawton (1995), Geophysics, 60' }],
}

export default thinBedTuning
