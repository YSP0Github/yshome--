import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** opt-malus-law */
const optMalusLaw: FormulaCard = {
  id: 'opt-malus-law',
  name: t('Malus 偏振定律', "Malus's Law of Polarization"),
  aliases: { zh: ['马吕斯定律', 'I = I₀ cos²θ'], en: ["Malus's law", 'I = I0 cos² theta'] },
  node: 'S20.2',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.GEOM'],
    method: ['METH.PHYS'],
    quantity: ['Q.OPT', 'Q.AMP'],
    keywords: t('马吕斯定律 偏振片 检偏器 起偏器 cos²θ 线偏振', "Malus's law polarizer analyzer linearly polarized light cos squared theta"),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`I=I_0\cos^2\theta`,
    variants: [
      { name: t('两块正交偏振片之间插入第三块时', 'With a third polarizer between two crossed ones'), latex: String.raw`I=I_0\cos^2\theta\,\sin^2\theta` },
    ],
  },
  meaning: t(
    '线偏振光穿过一块偏振片后，透射光强等于入射光强乘上偏振方向夹角 θ 的余弦平方：I = I₀cos²θ。θ=0 全部透过，θ=90° 全部消光。把两块偏振片正交（"十字"）就完全不透光——这是 3D 眼镜、液晶显示、太阳镜防眩光的基本原理。',
    'After linearly polarized light passes through a polarizer, the transmitted intensity is the incident intensity times the square of the cosine of the angle θ between the polarization and the polarizer axis: I = I₀cos²θ. All transmits at θ = 0; nothing at θ = 90°. Two crossed polarizers are fully opaque — the basis of 3D glasses, liquid-crystal displays and anti-glare sunglasses.',
  ),
  symbols: [
    { sym: 'I_0', name: t('入射偏振光强', 'incident polarized intensity'), unit: 'W/m²' },
    { sym: 'I', name: t('透射光强', 'transmitted intensity'), unit: 'W/m²' },
    { sym: '\\theta', name: t('入射偏振方向与偏振片透振方向夹角', 'angle between incident polarization and the polarizer axis'), unit: 'rad' },
  ],
  conditions: {
    applies: [t('入射光为线偏振光', 'Incident light is linearly polarized')],
    assumes: [t('偏振片理想（无吸收）', 'Ideal polarizer (no absorption)')],
    breaks: [t('入射为自然光时需先经起偏器，透射为 I₀/2', 'For unpolarized light first use a polarizer; transmission is then I₀/2')],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('把入射电场分解到透振方向', 'Project the incident E field onto the polarizer axis'), latex: String.raw`E_{\parallel}=E_0\cos\theta` },
    { n: 2, op: 'algebra', title: t('光强正比于电场平方', 'Intensity is proportional to E²'), latex: String.raw`I=E_{\parallel}^2=E_0^2\cos^2\theta=I_0\cos^2\theta` },
  ],
  links: {
    upstream: [{ id: 'opt-brewster-angle', note: t('自然光在界面反射后部分偏振', 'Reflected light at an interface is partially polarized') }],
    downstream: [{ id: 'opt-birefringence' }],
  },
  refs: [{ text: 'Hecht, Optics, 5th ed., §8.2' }],
}

export default optMalusLaw
