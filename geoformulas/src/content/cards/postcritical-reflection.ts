import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** postcritical-reflection */
const postcriticalReflection: FormulaCard = {
  id: 'postcritical-reflection',
  name: t('超临界角反射', 'Post-critical Reflection'),
  aliases: { zh: ['临界角', '全反射', '广角反射'], en: ['critical angle', 'post-critical reflection', 'wide-angle reflection'] },
  node: 'S3.2',
  tags: {
    math: ['MATH.COMPLEX', 'MATH.GEOM'],
    method: ['METH.EXPL'],
    quantity: ['Q.AMP', 'Q.VEL'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`\sin i_{c} = \frac{\alpha_{1}}{\alpha_{2}},\qquad |R| = 1\ \ (i_{1} > i_{c})`,
    variants: [
      { name: t('声学界面的反射系数', 'Reflection coefficient for an acoustic interface'), latex: String.raw`R = \frac{Z_{2}\cos i_{1} - Z_{1}\cos i_{2}}{Z_{2}\cos i_{1} + Z_{1}\cos i_{2}},\qquad \cos i_{2} = \sqrt{1 - \left(\frac{\alpha_{2}}{\alpha_{1}}\sin i_{1}\right)^{2}}` },
      { name: t('超临界时的相位', 'Phase beyond critical'), latex: String.raw`\arg R = -2\arctan\frac{Z_{1}\sqrt{\sin^{2}i_{2}-1}}{Z_{2}\cos i_{1}}` },
      { name: t('透射波变为倏逝波', 'The transmitted wave becomes evanescent'), latex: String.raw`e^{-\omega\sqrt{\sin^{2}i_{2}-1}\,z/\alpha_{2}}` },
    ],
  },
  meaning: t(
    '当下层比上层快时，超过临界角之后不存在实的折射角 —— 透射波退化成沿界面滑行、法向指数衰减的倏逝波。此时能量全部返回上层，反射系数的模等于 1，但不再是实数：它带上了一个随角度增长的相位旋转，波形因此发生畸变。广角地震勘探正是利用这一段。',
    'When the lower layer is faster, beyond the critical angle no real refraction angle exists — the transmitted wave degenerates into an evanescent wave sliding along the interface and decaying exponentially with depth. All the energy returns to the upper layer: |R| = 1, but R is no longer real. It acquires an angle-dependent phase rotation, distorting the waveform. Wide-angle surveys exploit exactly this regime.',
  ),
  symbols: [
    { sym: 'i_{c}', name: t('临界角', 'critical angle'), unit: '°', typical: '20 – 50' },
    { sym: '\\alpha_{1}, \\alpha_{2}', name: t('上、下层 P 波速度', 'P velocity of the upper and lower layer'), unit: 'km/s' },
    { sym: 'Z_{1}, Z_{2}', name: t('上、下层波阻抗', 'impedances of the two layers'), unit: 'kg/(m²·s)' },
    { sym: 'R', name: t('反射系数（超临界时为复数）', 'reflection coefficient (complex post-critical)'), unit: '无量纲' },
    { sym: '\\arg R', name: t('反射系数的相位', 'phase of the reflection coefficient'), unit: 'rad' },
  ],
  conditions: {
    applies: [t('下层速度高于上层的界面，入射角超过临界角', 'Interfaces where the lower layer is faster and incidence exceeds critical')],
    assumes: [
      t('声学（流体）界面，无 S 波转换', 'Acoustic (fluid) interface, no S-wave conversion'),
      t('平面波、水平界面', 'Plane waves, horizontal interface'),
    ],
    breaks: [
      t('弹性界面上超临界时会有转换波与泄漏 Rayleigh 波', 'At elastic interfaces there are converted phases and leaking Rayleigh waves'),
      t('|R| = 1 的结论对有限带宽子波只是近似', '|R| = 1 holds only approximately for finite-bandwidth wavelets'),
    ],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('Snell 定律', "Snell's law"),
      latex: String.raw`\frac{\sin i_{1}}{\alpha_{1}} = \frac{\sin i_{2}}{\alpha_{2}}\ \Longrightarrow\ \sin i_{2} = \frac{\alpha_{2}}{\alpha_{1}}\sin i_{1}` },
    { n: 2, op: 'geometry', title: t('sin i₂ = 1 定义临界角', 'sin i₂ = 1 defines the critical angle'),
      latex: String.raw`\sin i_{c} = \frac{\alpha_{1}}{\alpha_{2}}` },
    { n: 3, op: 'substitute', title: t('超过临界角后 cos i₂ 变虚数', 'Beyond critical, cos i₂ becomes imaginary'),
      latex: String.raw`\cos i_{2} = \sqrt{1-\sin^{2}i_{2}} = -i\sqrt{\sin^{2}i_{2}-1}` },
    { n: 4, op: 'algebra', title: t('代入反射系数', 'Insert into the reflection coefficient'),
      latex: String.raw`R = \frac{A - iC}{A + iC},\quad A = Z_2\cos i_1,\quad C = Z_1\sqrt{\sin^{2}i_2-1}` },
    { n: 5, op: 'result', title: t('模为 1，相位旋转', 'Unit modulus with a phase rotation'),
      latex: String.raw`|R| = 1,\qquad \arg R = -2\arctan\frac{C}{A}` },
  ],
  viz: [
    {
      id: 'postcritical-r',
      level: 'V2',
      title: t('反射系数的模与相位随入射角变化', 'Modulus and phase of R versus incidence angle'),
      xlabel: t('入射角 i₁ (°)', 'incidence angle i₁ (°)'),
      ylabel: t('|R| 与相位 (rad)', '|R| and phase (rad)'),
      controls: [
        { id: 'a1', label: t('上层速度 α₁ (km/s)', 'upper velocity α₁ (km/s)'), min: 1.5, max: 5, step: 0.05, value: 2.0 },
        { id: 'a2', label: t('下层速度 α₂ (km/s)', 'lower velocity α₂ (km/s)'), min: 2, max: 7, step: 0.05, value: 4.0 },
        { id: 'z1', label: t('上层阻抗 Z₁', 'upper impedance Z₁'), min: 1, max: 8, step: 0.1, value: 4.0 },
        { id: 'z2', label: t('下层阻抗 Z₂', 'lower impedance Z₂'), min: 1, max: 12, step: 0.1, value: 8.0 },
      ],
      note: t('在临界角处 |R| 突然变成 1，同时相位开始快速变化 —— 这就是广角记录上波形「变形」的原因。', 'At the critical angle |R| jumps to 1 and the phase starts changing rapidly — that is why wide-angle records look distorted.'),
      compute: (p) => {
        const a1 = p['a1'], a2 = p['a2'], z1 = p['z1'], z2 = p['z2']
        const mod: Array<[number, number]> = []
        const pha: Array<[number, number]> = []
        for (let i = 0; i <= 340; i++) {
          const deg = (i / 340) * 85
          const rad = (deg * Math.PI) / 180
          const c1 = Math.cos(rad)
          const s2 = (a2 / a1) * Math.sin(rad)
          const A = z2 * c1
          let mr: number, mi: number
          if (s2 <= 1) {
            const c2 = Math.sqrt(1 - s2 * s2)
            mr = (A - z1 * c2) / (A + z1 * c2)
            mi = 0
          } else {
            const C = z1 * Math.sqrt(s2 * s2 - 1)
            const numr = A, numi = -C
            const denr = A, deni = C
            const d = denr * denr + deni * deni
            mr = (numr * denr + numi * deni) / d
            mi = (numi * denr - numr * deni) / d
          }
          mod.push([deg, Math.sqrt(mr * mr + mi * mi)])
          pha.push([deg, Math.atan2(mi, mr)])
        }
        return [
          { label: t('|R|', '|R|'), color: '#185FA5', points: mod },
          { label: t('相位 arg R', 'phase arg R'), color: '#993C1D', points: pha, dash: true },
        ]
      },
    },
  ],
  example: {
    title: t('海底界面的临界角', 'Critical angle at the seafloor'),
    input: t('α₁ = 1.5 km/s（水），α₂ = 2.0 km/s（沉积层）', 'α₁ = 1.5 km/s (water), α₂ = 2.0 km/s (sediment)'),
    steps: [
      t('sin i_c = 1.5/2.0 = 0.75 → i_c = 48.6°', 'sin i_c = 1.5/2.0 = 0.75 → i_c = 48.6°'),
      t('超过 48.6° 后 |R| = 1，全部能量返回水中', 'Beyond 48.6°, |R| = 1 and all energy returns to the water layer'),
    ],
    output: t('这是海洋地震中折射波（首波）出现的角度条件', 'This is the angular condition for head waves in marine seismics'),
  },
  links: {
    upstream: [
      { id: 'critical-angle-total-reflection', note: t('临界角的几何定义', 'Geometric definition of the critical angle') },
      { id: 'acoustic-reflection-coefficient', note: t('垂直入射的特例', 'The normal-incidence special case') },
    ],
    seealso: [{ id: 'head-wave-critical-angle', note: t('首波与临界角的关系', 'Head waves and the critical angle') }],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.2' }],
}

export default postcriticalReflection
