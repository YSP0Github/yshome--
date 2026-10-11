import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** modphys-schrodinger-equation */
const modphysSchrodingerEquation: FormulaCard = {
  id: 'modphys-schrodinger-equation',
  name: t('Schrödinger 方程', 'Schrödinger Equation'),
  aliases: { zh: ['薛定谔方程', '定态方程', '波动力学基本方程'], en: ['Schrödinger equation', 'time-independent form', 'wave mechanics'] },
  node: 'S20.3',
  tags: {
    math: ['MATH.DIFF', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.OPT', 'Q.ENERGY'],
    keywords: t('薛定谔方程 波函数 定态方程 哈密顿算符 一维势阱', 'Schrödinger equation wavefunction time-independent Hamiltonian particle in a box'),
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`-\frac{\hbar^2}{2m}\frac{d^2\psi(x)}{dx^2}+U(x)\,\psi(x)=E\,\psi(x)`,
    variants: [
      { name: t('含时方程', 'Time-dependent form'), latex: String.raw`i\hbar\frac{\partial\Psi}{\partial t}=\hat{H}\,\Psi` },
      { name: t('一维无限深势阱能级', 'Energy levels of the infinite square well'), latex: String.raw`E_n=\frac{n^2\pi^2\hbar^2}{2mL^2},\qquad n=1,2,3,\dots` },
    ],
  },
  meaning: t(
    'Schrödinger 方程是量子力学的基本动力学方程：给定势能 U(x)，求解波函数 ψ 及其能量本征值 E。它在形式上与 Newton 第二定律地位相当——经典世界用 F=ma，量子世界用它。一维无限深势阱的解给出离散能级 E_n∝n²，解释了"被束缚的粒子能量必须量子化"，也直接导出氢原子能级。',
    "The Schrödinger equation is the fundamental dynamical law of quantum mechanics: given a potential U(x), solve for the wavefunction ψ and its energy eigenvalues E. It holds the same place as Newton's second law — where the classical world uses F = ma, the quantum world uses this. The infinite-square-well solution yields discrete levels E_n ∝ n², explaining why a bound particle must have quantized energy and directly leading to the hydrogen levels.",
  ),
  symbols: [
    { sym: '\\psi(x)', name: t('定态波函数', 'stationary wavefunction'), unit: 'm^(-1/2)' },
    { sym: 'U(x)', name: t('势能', 'potential energy'), unit: 'J' },
    { sym: 'E', name: t('能量本征值', 'energy eigenvalue'), unit: 'J' },
    { sym: 'm', name: t('粒子质量', 'particle mass'), unit: 'kg' },
    { sym: '\\hbar', name: t('约化 Planck 常数', 'reduced Planck constant'), unit: 'J·s' },
  ],
  conditions: {
    applies: [t('非相对论、无自旋粒子', 'Non-relativistic, spinless particles')],
    assumes: [t('势能与时间无关（定态）', 'Potential independent of time (stationary state)')],
    breaks: [t('高速粒子需 Dirac 方程；强引力需量子引力', 'Fast particles need the Dirac equation; strong gravity needs quantum gravity')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('自由粒子波 ψ=exp[i(px−Et)/ℏ]', 'Free-particle wave ψ = exp[i(px−Et)/ℏ]'), latex: String.raw`\psi=e^{i(px-Et)/\hbar}` },
    { n: 2, op: 'identity', title: t('对 x 二阶导给出 p²', 'Two x-derivatives give p²'), latex: String.raw`-\frac{\hbar^2}{2m}\frac{d^2\psi}{dx^2}=\frac{p^2}{2m}\psi=K\psi` },
    { n: 3, op: 'physics', title: t('加上势能项 U(x)ψ', 'Add the potential term U(x)ψ'), latex: String.raw`-\frac{\hbar^2}{2m}\frac{d^2\psi}{dx^2}+U(x)\psi=E\psi` },
  ],
  links: {
    upstream: [{ id: 'modphys-de-broglie-wavelength' }, { id: 'modphys-bohr-hydrogen-levels' }],
    downstream: [{ id: 'modphys-wavefunction-probability' }],
  },
  refs: [{ text: 'Brehme & Beiser, Modern Physics, §8' }],
}

export default modphysSchrodingerEquation
