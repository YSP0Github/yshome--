import { t } from '../../core/types.js';
/** mag-coulomb-law */
const magCoulombLaw = {
    id: 'mag-coulomb-law',
    name: t('磁 Coulomb 定律（磁荷模型）', "Magnetic Coulomb's Law (Magnetic-pole Model)"),
    aliases: { zh: ['磁库仑定律', '磁荷'], en: ["magnetic Coulomb's law", 'magnetic pole'] },
    node: 'S15.1',
    tags: {
        math: ['MATH.VECTOR'],
        method: ['METH.MAG'],
        quantity: ['Q.MAG'],
        keywords: t('磁库仑定律 磁荷 磁极 强度', "magnetic Coulomb's law pole strength"),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `F=\frac{\mu_0}{4\pi}\,\frac{p_1 p_2}{r^{2}}`,
        variants: [
            { name: t('点磁荷产生的磁场强度', 'field of a point magnetic pole'), latex: String.raw `H=\frac{1}{4\pi}\,\frac{p}{r^{2}}` },
        ],
    },
    meaning: t('在磁法勘探的"磁荷"近似里，可把磁极看成正负磁荷 p，它们之间的作用力与距离平方成反比，形式上与静电 Coulomb 定律平行（乘以 μ₀）。这个模型虽然物理上磁单极不存在，但在计算磁异常正演时非常方便：磁化体两端的"磁荷"就是磁场源。', 'In the magnetic-pole approximation used in exploration, magnetic poles behave as positive/negative magnetic charges p, with force following an inverse-square law formally parallel to electrostatic Coulomb (times μ₀). Though magnetic monopoles do not exist physically, this model is extremely convenient for forward modelling magnetic anomalies: the "poles" on a magnetized body are the field sources.'),
    symbols: [
        { sym: 'F', name: t('磁极间作用力', 'force between poles'), unit: 'N' },
        { sym: '\\mu_0', name: t('真空磁导率', 'vacuum permeability'), unit: 'H/m', typical: '4π×10⁻⁷' },
        { sym: 'p_1,p_2', name: t('磁荷（磁极强度）', 'magnetic pole strengths'), unit: 'A·m' },
        { sym: 'r', name: t('磁极间距', 'separation of poles'), unit: 'm' },
        { sym: 'H', name: t('磁场强度', 'magnetic field strength'), unit: 'A/m' },
    ],
    conditions: {
        applies: [t('磁法正演的等效磁荷模型', 'Equivalent pole model in magnetic forward modelling')],
        assumes: [t('介质均匀、非铁磁', 'Uniform non-ferromagnetic medium')],
        breaks: [t('铁磁体非线性需用磁化率', 'Ferromagnets need non-linear susceptibility')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('类比静电 Coulomb 定律', 'Analogy to electrostatic Coulomb law'),
            latex: String.raw `F_e=\frac{1}{4\pi\varepsilon_0}\frac{q_1 q_2}{r^{2}}` },
        { n: 2, op: 'identity', title: t('把 ε₀ 换成 1/μ₀，q 换成 p', 'Replace ε₀ by 1/μ₀, q by p'),
            latex: String.raw `F_m=\frac{\mu_0}{4\pi}\frac{p_1 p_2}{r^{2}}` },
        { n: 3, op: 'substitute', title: t('点磁荷的磁场', 'Field of a point pole'),
            latex: String.raw `H=\frac{F}{p}=\frac{1}{4\pi}\frac{p}{r^{2}}` },
        { n: 4, op: 'result', title: t('B=μ₀H', 'B=μ₀H'),
            latex: String.raw `B=\mu_0 H=\frac{\mu_0}{4\pi}\frac{p}{r^{2}}` },
    ],
    links: {
        downstream: [{ id: 'mag-dipole-potential', note: t('两个相反磁荷构成偶极', 'Two opposite poles form a dipole') }],
    },
    refs: [{ text: 'Telford et al., Applied Geophysics, §4.2' }],
};
export default magCoulombLaw;
//# sourceMappingURL=mag-coulomb-law.js.map