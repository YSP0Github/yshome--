import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** mag-thermal-remanence */
const magThermalRemanence: FormulaCard = {
  id: 'mag-thermal-remanence',
  name: t('热剩磁（TRM）', 'Thermal Remanent Magnetization (TRM)'),
  aliases: { zh: ['热剩磁 TRM', '热滞剩磁'], en: ['thermal remanence', 'TRM'] },
  node: 'S15.3',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.MAG', 'METH.ROCK'],
    quantity: ['Q.MAG'],
    keywords: t('热剩磁 TRM 火山岩 古地磁', 'thermal remanence TRM volcanic palaeomagnetism'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`M_{\text{TRM}}\propto H\quad(\text{弱场下}),\qquad M_{\text{TRM}}\approx c\,\chi(T_c)\,H`,
    variants: [
      { name: t('叠加定律（可加性）', 'additivity (Thellier law)'), latex: String.raw`M_{\text{TRM}}(T_1\to T_0)=\sum_{i}M_{\text{TRM}}(T_i\to T_{i+1})` },
    ],
  },
  meaning: t(
    '火山岩从居里温度以上缓慢冷却时，在穿过 Tc 的瞬间"冻结"了当时地磁场的方向和强度——这就是热剩磁。它是古地磁最可靠的记录器：熔岩流的 TRM 让我们重建了地质历史上的地磁场方向与强度。Thellier 通过逐步加热可把 TRM 强度换算成古地磁场强度。',
    'As a lava cools from above the Curie point, the instant it passes Tc it "freezes" the direction and intensity of the contemporary field — this is thermal remanence. It is palaeomagnetism’s most reliable recorder: lava TRM lets us reconstruct the direction and intensity of the geomagnetic field through geological time. Thellier heating experiments convert TRM magnitude into the ancient field intensity.',
  ),
  symbols: [
    { sym: 'M_{\\text{TRM}}', name: t('热剩磁强度', 'thermal remanence magnitude'), unit: 'A/m' },
    { sym: 'H', name: t('冷却时的古地磁场', 'ancient field during cooling'), unit: 'A/m' },
    { sym: 'T_c', name: t('居里温度', 'Curie temperature'), unit: 'K' },
  ],
  conditions: {
    applies: [t('火山岩、冷却的侵入岩', 'Volcanic rocks, cooled intrusions')],
    assumes: [t('弱场、缓慢冷却、单畴颗粒', 'Weak field, slow cooling, single-domain grains')],
    breaks: [t('后期加热超过 Tc 会重置 TRM', 'Later heating above Tc resets TRM')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('温度 T>Tc 矿物为顺磁', 'Above Tc the mineral is paramagnetic'),
      latex: String.raw`M\approx\frac{C}{T}H` },
    { n: 2, op: 'physics', title: t('冷却穿过 Tc 时磁矩被 H 定向', 'Moments align with H as T crosses Tc'),
      latex: String.raw`T\downarrow T_c` },
    { n: 3, op: 'setup', title: t('继续冷却到室温，方向被锁定', 'Cooling to room T locks the direction'),
      latex: String.raw`M_{\text{TRM}}=\text{const}` },
    { n: 4, op: 'result', title: t('弱场下 TRM ∝ H', 'In weak field TRM ∝ H'),
      latex: String.raw`M_{\text{TRM}}\approx c\,\chi(T_c)\,H` },
  ],
  links: {
    upstream: [{ id: 'mag-curie-temperature' }, { id: 'mag-induced-vs-remanent' }],
    downstream: [{ id: 'mag-geomagnetic-reversal', note: t('TRM 记录倒转', 'TRM records reversals') }],
  },
  refs: [{ text: 'Dunlop & Özdemir, Rock Magnetism, ch. 10; Thellier (1938)' }],
}

export default magThermalRemanence
