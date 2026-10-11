import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-ideal-gas-law */
const physIdealGasLaw: FormulaCard = {
  id: 'phys-ideal-gas-law',
  name: t('理想气体状态方程', 'Ideal Gas Law'),
  aliases: { zh: ['pV=nRT', '理想气体方程'], en: ['ideal gas law', 'pV = nRT'] },
  node: 'S18.6',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('理想气体 状态方程 pV=nRT 玻意耳 查理 阿伏伽德罗', 'ideal gas law Boyle Charles Avogadro state equation'),
  },
  audience: 'highschool',
  complete: 'L4',
  statement: {
    main: String.raw`pV=nRT=N k_B T`,
    variants: [
      { name: t('密度形式', 'density form'), latex: String.raw`p=\rho\dfrac{R}{M}T` },
      { name: t('一定质量两态关系', 'fixed mass between two states'), latex: String.raw`\dfrac{p_1 V_1}{T_1}=\dfrac{p_2 V_2}{T_2}` },
    ],
  },
  meaning: t(
    '理想气体状态方程把四个宏观量——压强 p、体积 V、物质的量 n、温度 T——用一条简单关系连起来：pV=nRT。它是 Boyle（pV=const）、Charles（V/T=const）、Avogadro 等经验定律的统一。温度必须用开尔文。pV=nRT 也是后面分子动理论和热力学循环的出发点。',
    'The ideal gas law ties the four macroscopic quantities — pressure p, volume V, amount n, temperature T — into one simple relation pV = nRT. It unifies Boyle (pV = const), Charles (V/T = const) and Avogadro’s observations. Temperature must be in Kelvin. pV = nRT is also the starting point of kinetic theory and thermodynamic cycles.',
  ),
  symbols: [
    { sym: 'p', name: t('压强', 'pressure'), unit: 'Pa' },
    { sym: 'V', name: t('体积', 'volume'), unit: 'm³' },
    { sym: 'n', name: t('物质的量', 'amount of substance'), unit: 'mol' },
    { sym: 'R', name: t('气体常数', 'gas constant'), unit: 'J/(mol·K)', typical: '8.314' },
    { sym: 'T', name: t('热力学温度', 'temperature'), unit: 'K' },
    { sym: 'k_B', name: t('Boltzmann 常数', 'Boltzmann constant'), unit: 'J/K', typical: '1.38×10⁻²³' },
  ],
  conditions: {
    applies: [t('稀薄气体、分子本身体积可忽略', 'Dilute gas with negligible molecular volume')],
    assumes: [t('分子间无相互作用力（除碰撞瞬间）', 'No intermolecular forces except during collisions')],
    breaks: [t('高压低温时须用 van der Waals 方程', 'High pressure / low T need the van der Waals equation')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('Boyle：恒温 pV=const', 'Boyle: at constant T, pV = const'), latex: String.raw`pV\propto T` },
    { n: 2, op: 'physics', title: t('Avogadro：与物质的量成正比', 'Avogadro: proportional to amount n'), latex: String.raw`pV\propto nT` },
    { n: 3, op: 'result', title: t('引入气体常数 R', 'Introduce the gas constant R'), latex: String.raw`pV=nRT` },
  ],
  viz: [
    {
      id: 'pv-isotherm',
      level: 'V1',
      title: t('p-V 图上的等温线', 'Isotherms on a p–V diagram'),
      xlabel: t('体积 V (m³)', 'volume V (m³)'),
      ylabel: t('压强 p (Pa)', 'pressure p (Pa)'),
      controls: [
        { id: 'T', label: t('温度 T', 'temperature T'), min: 100, max: 1000, step: 10, value: 300, unit: 'K' },
        { id: 'n', label: t('物质的量 n', 'amount n'), min: 0.1, max: 2, step: 0.1, value: 1, unit: 'mol' },
      ],
      xRange: [0.01, 0.5],
      note: t('每条等温线是 pV=nRT 常数的双曲线；温度越高曲线越靠外。', 'Each isotherm is the hyperbola pV = nRT = const; higher T pushes the curve outward.'),
      compute: (p) => {
        const T = p['T']
        const n = p['n']
        const R = 8.314
        const pts: Array<[number, number]> = []
        for (let i = 1; i <= 200; i++) {
          const v = 0.01 + (i / 200) * 0.49
          pts.push([v, (n * R * T) / v])
        }
        return [{ label: t('p(V)', 'p(V)'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('汽车轮胎打气', 'Car tyre'),
    input: t('n=1 mol，V=0.024 m³，T=300 K，求 p', 'n = 1 mol, V = 0.024 m³, T = 300 K, find p'),
    steps: [t('p = nRT/V = 1×8.314×300 / 0.024 ≈ 1.04×10⁵ Pa', 'p = nRT/V = 1×8.314×300 / 0.024 ≈ 1.04×10⁵ Pa')],
    output: t('约 1 个大气压，合理', 'About one atmosphere, as expected'),
  },
  links: {
    upstream: [{ id: 'phys-temperature-scales' }],
    downstream: [
      { id: 'phys-kinetic-theory-pressure' },
      { id: 'phys-first-law-thermo' },
    ],
  },
}

export default physIdealGasLaw
