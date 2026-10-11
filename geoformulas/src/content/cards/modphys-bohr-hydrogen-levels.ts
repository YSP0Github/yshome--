import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** modphys-bohr-hydrogen-levels */
const modphysBohrHydrogenLevels: FormulaCard = {
  id: 'modphys-bohr-hydrogen-levels',
  name: t('Bohr 氢原子模型与能级', 'Bohr Model and Energy Levels of Hydrogen'),
  aliases: { zh: ['玻尔模型', 'En=−13.6/n² eV', '频率条件'], en: ['Bohr model', 'En = -13.6/n^2 eV', 'frequency condition'] },
  node: 'S20.3',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.OPT', 'Q.ENERGY'],
    keywords: t('玻尔模型 氢原子能级 13.6eV 频率条件 量子化轨道 里德伯', 'Bohr model hydrogen energy levels 13.6 eV frequency condition quantized orbit Rydberg'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`E_n=-\frac{13.6\ \mathrm{eV}}{n^2},\qquad h\nu=E_i-E_f`,
    variants: [
      { name: t('Bohr 半径轨道', 'Bohr orbit radii'), latex: String.raw`r_n=n^2 a_0,\qquad a_0=0.529\ Å` },
      { name: t('Rydberg 波数公式', 'Rydberg wavenumber formula'), latex: String.raw`\frac{1}{\lambda}=R_H\left(\frac{1}{n_f^2}-\frac{1}{n_i^2}\right)` },
    ],
  },
  meaning: t(
    'Bohr 假设电子只在特定"量子化"轨道上运动，轨道角动量 L = nℏ，相应能量 E_n = −13.6/n² eV（n=1,2,…）。电子从高能级 E_i 跳到低能级 E_f 时发射一个光子，频率由频率条件 hν = E_i − E_f 决定。这定量解释了氢原子光谱（Balmer、Lyman 线系），是从经典向量子过渡的里程碑。',
    'Bohr assumed the electron moves only on special "quantized" orbits with angular momentum L = nℏ and energy E_n = −13.6/n² eV (n = 1, 2, …). Jumping from a higher level E_i to a lower level E_f emits a photon whose frequency is fixed by hν = E_i − E_f. This quantitatively explained the hydrogen spectrum (Balmer, Lyman series) and was the bridge from classical to quantum physics.',
  ),
  symbols: [
    { sym: 'E_n', name: t('第 n 能级能量', 'energy of the n-th level'), unit: 'eV' },
    { sym: 'n', name: t('主量子数（1,2,3,…）', 'principal quantum number (1, 2, 3, …)'), unit: '1' },
    { sym: 'a_0', name: t('Bohr 半径', 'Bohr radius'), unit: 'm' },
    { sym: 'R_H', name: t('Rydberg 常数', 'Rydberg constant'), unit: 'm⁻¹' },
  ],
  conditions: {
    applies: [t('氢原子及类氢离子（He⁺、Li²⁺）', 'Hydrogen-like atoms (He+, Li2+)')],
    assumes: [t('非相对论、核不动', 'Non-relativistic, fixed nucleus')],
    breaks: [t('多电子原子不适用；精细结构需量子力学', 'Fails for multi-electron atoms; fine structure needs full quantum mechanics')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('库仑力提供向心力', 'Coulomb force supplies centripetal force'), latex: String.raw`\frac{1}{4\pi\varepsilon_0}\frac{e^2}{r^2}=\frac{mv^2}{r}` },
    { n: 2, op: 'physics', title: t('角动量量子化 L=nℏ', 'Quantize angular momentum L = nℏ'), latex: String.raw`mvr=n\hbar` },
    { n: 3, op: 'algebra', title: t('联立求能级', 'Solve for the energy levels'), latex: String.raw`E_n=\frac{mv^2}{2}-\frac{e^2}{4\pi\varepsilon_0r}=-\frac{me^4}{8\varepsilon_0^2h^2}\frac{1}{n^2}=-\frac{13.6\ \mathrm{eV}}{n^2}` },
  ],
  viz: [
    {
      id: 'energy-levels',
      level: 'V1',
      title: t('氢原子能级图（随 1/n² 收敛到电离限）', 'Hydrogen energy levels (converging to the ionization limit as 1/n^2)'),
      xlabel: t('主量子数 n', 'principal quantum number n'),
      ylabel: t('能级 E_n (eV)', 'energy level E_n (eV)'),
      controls: [
        { id: 'dummy', label: t('曲线无额外参数（占位控件）', 'no free parameter, placeholder control'), min: 0, max: 1, step: 1, value: 0, unit: '1' },
      ],
      xRange: [1, 10],
      yRange: [-14, 1],
      note: t('n=1 基态 −13.6 eV；能级随 n 升高越来越密，n→∞ 时 E→0（电离）。Balmer 线系是 n_i>2→n_f=2 的跃迁（落在可见光），Lyman 线系是到 n_f=1（紫外）。',
        'The n = 1 ground state is −13.6 eV; levels crowd closer as n grows and approach E → 0 (ionization) as n → ∞. The Balmer series is n_i > 2 → n_f = 2 (visible); the Lyman series ends at n_f = 1 (ultraviolet).'),
      compute: () => {
        const pts: Array<[number, number]> = []
        for (let n = 1; n <= 10; n++) pts.push([n, -13.6 / (n * n)])
        return [{ label: t('E_n', 'E_n'), color: '#185FA5', points: pts, dash: true }]
      },
    },
  ],
  links: {
    upstream: [{ id: 'modphys-planck-energy-quantum' }],
    downstream: [{ id: 'modphys-schrodinger-equation' }, { id: 'modphys-de-broglie-wavelength' }],
  },
  refs: [{ text: 'Brehme & Beiser, Modern Physics, §6' }],
}

export default modphysBohrHydrogenLevels
