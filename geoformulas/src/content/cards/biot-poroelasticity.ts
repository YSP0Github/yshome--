import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** biot-poroelasticity */
const biotPoroelasticity: FormulaCard = {
  id: 'biot-poroelasticity',
  name: t('Biot 孔隙弹性理论', 'Biot Poroelasticity'),
  aliases: { zh: ['Biot 理论', '快纵波慢纵波'], en: ['Biot theory', 'fast and slow P waves', 'poroelasticity'] },
  node: 'S13.3',
  tags: {
    math: ['MATH.DIFF', 'MATH.VECTOR', 'MATH.ALGEBRA'],
    method: ['METH.ROCK'],
    quantity: ['Q.VEL', 'Q.MAT'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`\begin{aligned} \nabla\cdot\boldsymbol{\sigma}&=\rho\,\ddot{\boldsymbol{u}}+\rho_f\,\ddot{\boldsymbol{w}}\\ -\nabla p&=\rho_f\,\ddot{\boldsymbol{u}}+\frac{\eta}{k}\,\dot{\boldsymbol{w}}+m\,\ddot{\boldsymbol{w}} \end{aligned}`,
    variants: [
      { name: t('Biot 系数与模量', 'Biot coefficient and modulus'), latex: String.raw`\alpha=1-\frac{K_{\mathrm{dry}}}{K_0},\qquad M=\frac{K_0}{\alpha-\phi+\phi K_0/K_f}` },
      { name: t('本构关系', 'Constitutive relations'), latex: String.raw`\boldsymbol{\sigma}=\left(K_{\mathrm{dry}}-\tfrac{2}{3}\mu\right)\left(\nabla\cdot\boldsymbol{u}\right)\mathbf{I}+\mu\left(\nabla\boldsymbol{u}+\nabla\boldsymbol{u}^{\mathsf{T}}\right)-\alpha\,p\,\mathbf{I}` },
      { name: t('低频极限回到 Gassmann', 'The low-frequency limit returns to Gassmann'), latex: String.raw`\omega\to0:\quad K_{\mathrm{sat}}=K_{\mathrm{dry}}+\alpha^{2}M` },
    ],
  },
  meaning: t(
    'Gassmann 假设孔隙压力处处平衡，只在低频成立。Biot 理论把骨架位移与流体相对位移当作两个独立场，因此可以处理高频、并且预言了 Gassmann 没有的东西：第二支（慢）纵波。慢纵波在地震频带衰减极快，实验室超声频段才能观测到，它的存在是孔隙弹性最直接的实验证据。',
    'Gassmann assumes pore pressure equilibrates everywhere, valid only at low frequency. Biot theory treats frame displacement and relative fluid displacement as two independent fields, so it handles high frequencies and predicts something Gassmann does not: a second, slow P wave. The slow wave attenuates extremely fast in the seismic band and is observable only at ultrasonic laboratory frequencies; its existence is the most direct experimental evidence for poroelasticity.',
  ),
  symbols: [
    { sym: '\\boldsymbol{u}', name: t('骨架位移', 'frame displacement'), unit: 'm' },
    { sym: '\\boldsymbol{w}', name: t('流体相对骨架的位移', 'fluid displacement relative to the frame'), unit: 'm' },
    { sym: '\\alpha', name: t('Biot 有效应力系数', 'Biot effective-stress coefficient'), unit: '无量纲', typical: '0.5 – 1' },
    { sym: 'M', name: t('Biot 模量', 'Biot modulus'), unit: 'Pa' },
    { sym: '\\eta,k', name: t('流体黏度与渗透率', 'fluid viscosity and permeability'), unit: 'Pa·s, m²' },
    { sym: '\\rho_f', name: t('流体密度', 'fluid density'), unit: 'kg/m³' },
  ],
  conditions: {
    applies: [t('流体饱和孔隙介质中弹性波的传播', 'Elastic wave propagation in fluid-saturated porous media')],
    assumes: [
      t('孔隙连通、骨架为线弹性', 'Pores are connected and the frame is linearly elastic'),
      t('流体为黏性可压缩牛顿流体', 'The fluid is a viscous, compressible Newtonian fluid'),
    ],
    breaks: [t('部分饱和、裂隙主导或非牛顿流体时需改用其它模型', 'Partial saturation, fracture-dominated media or non-Newtonian fluids require other models')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('骨架的动量守恒', 'Momentum conservation of the frame'),
      latex: String.raw`\nabla\cdot\boldsymbol{\sigma}=\rho\,\ddot{\boldsymbol{u}}+\rho_f\,\ddot{\boldsymbol{w}}` },
    { n: 2, op: 'physics', title: t('流体的广义达西定律', 'Generalised Darcy law for the fluid'),
      latex: String.raw`-\nabla p=\rho_f\,\ddot{\boldsymbol{u}}+\frac{\eta}{k}\dot{\boldsymbol{w}}+m\,\ddot{\boldsymbol{w}}` },
    { n: 3, op: 'physics', title: t('本构关系含孔隙压力项', 'Constitutive relation with a pore-pressure term'),
      latex: String.raw`\boldsymbol{\sigma}=\boldsymbol{\sigma}_{\text{有效}}-\alpha p\,\mathbf{I}` },
    { n: 4, op: 'identity', title: t('消去 p 得到两个纵波解', 'Eliminate p to obtain two P-wave solutions'),
      latex: String.raw`\text{特征方程给出}\ v_{P,\text{快}}\ \text{与}\ v_{P,\text{慢}}` },
    { n: 5, op: 'result', title: t('低频极限回到 Gassmann', 'Low-frequency limit returns to Gassmann'),
      latex: String.raw`\omega\to0:\quad \frac{\eta}{k}\dot{\boldsymbol{w}}\ \text{项仍有限，但可积分出}\ K_{\mathrm{sat}}=K_{\mathrm{dry}}+\alpha^{2}M` },
  ],
  links: {
    upstream: [{ id: 'gassmann-equation', note: t('它的低频极限', 'Its low-frequency limit') }],
    seealso: [{ id: 'ps-wave-velocities', note: t('弹性波速的基本定义', 'Basic definitions of elastic wave speeds') }],
  },
  refs: [{ text: 'Biot (1956), J. Acoust. Soc. Am., 28' }, { text: 'Biot (1962), J. Appl. Phys., 33' }],
}

export default biotPoroelasticity
