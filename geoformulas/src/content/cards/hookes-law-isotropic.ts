import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** hookes-law-isotropic */
const hookesLawIsotropic: FormulaCard = {
  id: 'hookes-law-isotropic',
  name: t('各向同性介质的广义 Hooke 定律', "Generalized Hooke's Law for an Isotropic Medium"),
  aliases: { zh: ['胡克定律', '本构关系'], en: ["Hooke's law", 'constitutive relation'] },
  node: 'S1.3',
  tags: {
    math: ['MATH.VECTOR', 'MATH.LINALG'],
    method: [],
    quantity: ['Q.MAT', 'Q.TENSOR'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\sigma_{ij}=\lambda\,\theta\,\delta_{ij}+2\mu\,\varepsilon_{ij}`,
    variants: [
      { name: t('反解出应变', 'Inverted for strain'), latex: String.raw`\varepsilon_{ij}=\frac{1}{2\mu}\sigma_{ij}-\frac{\lambda}{2\mu(3\lambda+2\mu)}\sigma_{kk}\,\delta_{ij}` },
      { name: t('单轴拉伸形式（高中生熟悉的版本）', 'Uniaxial form familiar from school'), latex: String.raw`\sigma=E\,\varepsilon,\qquad \nu=\frac{\lambda}{2(\lambda+\mu)}` },
    ],
  },
  meaning: t(
    '应力 = 抵抗体积变化的项（λ）+ 抵抗形状变化的项（μ）。这两个 Lamé 常数就是地震学描述岩石的全部家当——波速、泊松比、AVO 全部由它们决定。',
    'Stress = a term resisting volume change (λ) plus a term resisting shape change (μ). These two Lamé constants are seismology’s entire toolkit for describing rock: wave speeds, Poisson ratio and AVO all follow from them.',
  ),
  symbols: [
    { sym: '\\sigma_{ij}', name: t('应力张量分量', 'stress tensor components'), unit: 'Pa', typical: '10⁶ – 10¹¹ Pa' },
    { sym: '\\lambda', name: t('Lamé 第一常数', 'first Lamé constant'), unit: 'Pa', typical: '10¹⁰ Pa' },
    { sym: '\\mu', name: t('剪切模量（Lamé 第二常数，也记作 G）', 'shear modulus (second Lamé constant, also G)'), unit: 'Pa', typical: '10¹⁰ Pa' },
    { sym: '\\theta', name: t('体应变', 'volumetric strain'), unit: '', dimension: '无量纲' },
    { sym: '\\delta_{ij}', name: t('Kronecker δ', 'Kronecker delta'), unit: '', dimension: '无量纲' },
    { sym: '\\nu', name: t('泊松比', "Poisson's ratio"), unit: '', dimension: '无量纲', typical: '0.25（泊松固体）' },
    { sym: 'E', name: t('杨氏模量', "Young's modulus"), unit: 'Pa' },
  ],
  conditions: {
    applies: [t('线弹性、小应变、均匀且各向同性的介质', 'Linear elastic, small-strain, homogeneous, isotropic media')],
    assumes: [
      t('各向同性：只需要两个独立弹性常数 λ 和 μ', 'Isotropy means only two independent constants survive'),
      t('静态或准静态本构关系，不考虑频率依赖', 'Frequency-independent constitutive law'),
    ],
    breaks: [
      t('各向异性介质（需要最多 21 个独立常数）', 'Anisotropic media require up to 21 independent constants'),
      t('含流体孔隙介质需要 Biot 理论', 'Fluid-saturated porous media need Biot theory'),
      t('接近破裂的非线性区', 'Non-linear behaviour approaching failure'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('最一般的线性关系', 'The most general linear relation'),
      latex: String.raw`\sigma_{ij}=c_{ijkl}\,\varepsilon_{kl}`,
      note: t('四阶弹性张量 c_ijkl 一开始有 3⁴ = 81 个分量。', 'The fourth-rank elastic tensor starts out with 3⁴ = 81 components.') },
    { n: 2, op: 'identity', title: t('利用 σ 与 ε 的对称性', 'Exploit the symmetry of σ and ε'),
      latex: String.raw`c_{ijkl}=c_{jikl}=c_{ijlk}\;\Rightarrow\; 81 \to 36`,
      note: t('应力和应变各自对称，把独立分量从 81 压到 36。', 'Symmetry of both stress and strain cuts 81 down to 36.') },
    { n: 3, op: 'identity', title: t('再由应变能存在得到主对称性', 'Major symmetry from existence of strain energy'),
      latex: String.raw`c_{ijkl}=c_{klij}\;\Rightarrow\; 36 \to 21` },
    { n: 4, op: 'identity', title: t('各向同性：旋转下不变', 'Isotropy: invariance under rotation'),
      latex: String.raw`c_{ijkl}=\lambda\,\delta_{ij}\delta_{kl}+\mu\left(\delta_{ik}\delta_{jl}+\delta_{il}\delta_{jk}\right)`,
      note: t('各向同性四阶张量只能由 δ 的乘积构成，最终只剩两个常数。', 'An isotropic fourth-rank tensor can only be built from products of δ, leaving just two constants.') },
    { n: 5, op: 'substitute', title: t('代入得到常用形式', 'Substitute back'),
      latex: String.raw`\sigma_{ij}=\lambda\,\delta_{ij}\varepsilon_{kk}+\mu\left(\varepsilon_{ij}+\varepsilon_{ji}\right)=\lambda\theta\delta_{ij}+2\mu\varepsilon_{ij}` },
    { n: 6, op: 'identity', title: t('与工程常数的换算', 'Conversion to engineering constants'),
      latex: String.raw`\nu=\frac{\lambda}{2(\lambda+\mu)},\qquad E=\frac{\mu(3\lambda+2\mu)}{\lambda+\mu},\qquad K=\lambda+\frac{2}{3}\mu` },
  ],
  viz: [
    {
      id: 'poisson-stress',
      level: 'V1',
      title: t('单轴应变下泊松比对侧向应力的影响', 'Effect of Poisson ratio on lateral stress under uniaxial strain'),
      xlabel: t('泊松比 ν', "Poisson's ratio ν"),
      ylabel: t('σ_yy / σ_xx', 'σ_yy / σ_xx'),
      controls: [],
      xRange: [0, 0.49],
      note: t('用地震学的说法：ν = 0.5 意味着材料不可压缩，侧向压力会一路顶到和主应力相等。真实岩石约 0.25。', 'In seismology terms ν = 0.5 means incompressible material, so lateral pressure rises all the way to match the principal stress. Real rocks sit near 0.25.'),
      compute: () => {
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const nu = (i / 200) * 0.49
          pts.push([nu, nu / (1 - nu)])
        }
        return [{ label: t('σ_yy / σ_xx = ν/(1−ν)', 'σ_yy / σ_xx = ν/(1−ν)'), color: '#185FA5', points: pts }]
      },
    },
  ],
  links: {
    upstream: [{ id: 'strain-tensor' }],
    downstream: [
      { id: 'navier-equation' },
      { id: 'ps-wave-velocities', note: t('λ 和 μ 直接给出 α 与 β', 'λ and μ directly give α and β') },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §2.2' },
  ],

}

export default hookesLawIsotropic
