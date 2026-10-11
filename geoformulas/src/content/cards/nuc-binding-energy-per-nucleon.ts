import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** nuc-binding-energy-per-nucleon */
const nucBindingEnergyPerNucleon: FormulaCard = {
  id: 'nuc-binding-energy-per-nucleon',
  name: t('比结合能曲线', 'Binding Energy per Nucleon Curve'),
  aliases: { zh: ['平均结合能', 'E_b/A 曲线'], en: ['binding energy per nucleon', 'Eb/A curve'] },
  node: 'S20.5',
  tags: {
    math: ['MATH.GEOM', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('比结合能 平均结合能 Eb/A 铁峰 裂变 聚变 能量来源', 'binding energy per nucleon Eb/A iron peak fission fusion energy source'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\bar E_b=\frac{E_b}{A}`,
    variants: [
      { name: t('铁峰附近最稳定（≈8.8 MeV）', 'Most stable near the iron peak (≈ 8.8 MeV)'), latex: String.raw`^{56}\mathrm{Fe}:\ \bar E_b\approx8.8\ \mathrm{MeV}` },
    ],
  },
  meaning: t(
    '比结合能 E_b/A 是每个核子平均分摊的结合能，它衡量原子核的稳定程度。曲线在 A≈56（铁）处达到峰值约 8.8 MeV：轻核聚变到中核会放出能量（氢弹、太阳），重核裂变成两个中核也放出能量（核电站、原子弹）。铁是"核能的尽头"——聚变到铁为止，裂变从铀到铁为止。',
    'The binding energy per nucleon E_b/A is the average binding energy carried by each nucleon, measuring how stable a nucleus is. The curve peaks near A ≈ 56 (iron) at about 8.8 MeV: fusing light nuclei into mid-weight nuclei releases energy (H-bomb, the Sun), and splitting heavy nuclei into two mid-weight ones also releases energy (nuclear plant, A-bomb). Iron is "the end of nuclear energy" — fusion stops at iron, and fission runs from uranium down toward iron.',
  ),
  symbols: [
    { sym: '\\bar E_b', name: t('比结合能', 'binding energy per nucleon'), unit: 'MeV' },
    { sym: 'E_b', name: t('总结合能', 'total binding energy'), unit: 'MeV' },
    { sym: 'A', name: t('质量数', 'mass number'), unit: '1' },
  ],
  conditions: {
    applies: [t('所有核素的平均稳定性比较', 'Comparing average stability of all nuclides')],
    assumes: [t('以自由核子为零点', 'Free nucleons as the zero reference')],
    breaks: [t('轻核有奇偶涨落（偶偶核更稳定）', 'Light nuclei show odd-even fluctuations (even-even nuclei are more stable)')],
  },
  viz: [
    {
      id: 'be-per-nucleon',
      level: 'V1',
      title: t('比结合能曲线（铁峰最高）', 'Binding energy per nucleon curve (iron peak highest)'),
      xlabel: t('质量数 A', 'mass number A'),
      ylabel: t('比结合能 E_b/A (MeV)', 'binding energy per nucleon Eb/A (MeV)'),
      controls: [
        { id: 'dummy', label: t('（曲线为示意图谱，无额外控件）', '(schematic curve, no control)'), min: 0, max: 1, step: 1, value: 0, unit: '1' },
      ],
      xRange: [1, 240],
      yRange: [0, 10],
      note: t('轻核陡升到铁峰（≈8.8 MeV），重核缓慢下降到铀（≈7.6 MeV）。聚变沿上升段放能，裂变沿下降段放能。',
        'Light nuclei rise steeply to the iron peak (≈ 8.8 MeV) and heavy ones decline slowly to uranium (≈ 7.6 MeV). Fusion releases energy on the rising part; fission on the falling part.'),
      compute: () => {
        const pts: Array<[number, number]> = []
        for (let A = 2; A <= 240; A++) {
          // Schematic Weizsäcker-like shape: rise to peak near 56, slow decline
          const peak = 8.8
          const rise = 1 - Math.exp(-A / 18)
          const decline = 1 - 0.0011 * (A - 56)
          let be = peak * rise * decline
          if (A < 2) be = 0
          pts.push([A, be])
        }
        return [{ label: t('E_b/A', 'Eb/A'), color: '#993C1D', points: pts }]
      },
    },
  ],
  links: {
    upstream: [{ id: 'nuc-mass-defect-binding-energy' }],
    downstream: [{ id: 'nuc-radioactive-decay-law' }],
  },
  refs: [{ text: 'Krane, Introductory Nuclear Physics, §3' }],
}

export default nucBindingEnergyPerNucleon
