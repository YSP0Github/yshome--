import { t } from '../../core/types.js';
/** nuc-nuclear-constituents */
const nucNuclearConstituents = {
    id: 'nuc-nuclear-constituents',
    name: t('原子核的组成', 'Composition of the Nucleus'),
    aliases: { zh: ['核子 质子 中子 核素', 'A=Z+N'], en: ['nucleons protons neutrons nuclide', 'A = Z + N'] },
    node: 'S20.5',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.GEOM'],
        keywords: t('原子核组成 质子 中子 核子 原子序数 Z 质量数 A 同位素', 'nucleus constituents protons neutrons nucleons atomic number Z mass number A isotope'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `^{\,A}_{Z}\mathrm{X},\qquad A=Z+N`,
        variants: [
            { name: t('同位素与同中子异荷素', 'Isotopes and isotones'), latex: String.raw `^{A}_{Z}\mathrm{X}:\ \text{同 }Z\text{ 不同 }A\text{ 为同位素}` },
        ],
    },
    meaning: t('原子核由 Z 个质子（带正电）和 N 个中子（不带电）组成，统称核子，总质量数 A=Z+N。核素记作 ᴬ_Z X。Z 决定元素种类，A 决定该元素的哪一种同位素（如 ¹²C、¹⁴C）。核子被强相互作用束缚在 10⁻¹⁵ m 量级的极小空间内。', 'The nucleus consists of Z protons (positively charged) and N neutrons (neutral), collectively nucleons, with total mass number A = Z + N. A nuclide is written ᴬ_Z X. Z fixes the element; A fixes which isotope of that element (e.g. ¹²C, ¹⁴C). Nucleons are bound by the strong interaction within a tiny region of order 10⁻¹⁵ m.'),
    symbols: [
        { sym: 'Z', name: t('质子数（原子序数）', 'proton number (atomic number)'), unit: '1' },
        { sym: 'N', name: t('中子数', 'neutron number'), unit: '1' },
        { sym: 'A', name: t('质量数（核子总数）', 'mass number (total nucleons)'), unit: '1' },
    ],
    conditions: {
        applies: [t('所有稳定与放射性核素', 'All stable and radioactive nuclides')],
        assumes: [t('原子核由质子、中子构成', 'The nucleus is built from protons and neutrons')],
        breaks: [t('极短寿命核需考虑夸克层次', 'Very short-lived nuclei require the quark level')],
    },
    links: {
        downstream: [{ id: 'nuc-nuclear-radius' }, { id: 'nuc-mass-defect-binding-energy' }],
    },
    refs: [{ text: 'Krane, Introductory Nuclear Physics, §1' }],
};
export default nucNuclearConstituents;
//# sourceMappingURL=nuc-nuclear-constituents.js.map