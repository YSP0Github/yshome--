import { t } from '../../core/types.js';
/** uem-conductor-electrostatic-equilibrium */
const uemConductorElectrostaticEquilibrium = {
    id: 'uem-conductor-electrostatic-equilibrium',
    name: t('导体的静电平衡', 'Conductor in Electrostatic Equilibrium'),
    aliases: { zh: ['静电平衡导体', '导体表面场强'], en: ['electrostatic equilibrium', 'field at conductor surface'] },
    node: 'S19.1',
    tags: {
        math: ['MATH.VECTOR'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('导体 静电平衡 内部场强为零 表面场强 电荷分布 尖端放电', 'conductor electrostatic equilibrium interior zero field surface charge corona'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\mathbf{E}_{\mathrm{in}}=0,\qquad E_{\mathrm{surf}}=\frac{\sigma}{\varepsilon_{0}},\qquad V_{\mathrm{conductor}}=\text{const}`,
        variants: [
            { name: t('空腔导体（腔内无电荷）', 'Hollow conductor, no internal charge'), latex: String.raw `Q_{\text{inner surface}}=0,\ \ E_{\text{cavity}}=0` },
        ],
    },
    meaning: t('静电平衡时，导体内自由电荷不再移动，故内部电场处处为零、整个导体是等势体。净电荷只分布在外表面，表面外法向场强 E=σ/ε0。曲率大的尖端电荷密度大、场强高，导致尖端放电（避雷针）。', 'At electrostatic equilibrium free charges no longer move, so the internal field is zero and the whole conductor is an equipotential body. Net charge resides only on the outer surface, and the outward normal field just outside is E=σ/ε0. Sharp tips have high charge density and field, causing corona discharge (lightning rods).'),
    symbols: [
        { sym: '\\mathbf{E}_{\\mathrm{in}}', name: t('导体内部场强', 'field inside conductor'), unit: 'V/m' },
        { sym: '\\sigma', name: t('表面电荷密度', 'surface charge density'), unit: 'C/m²' },
        { sym: 'V', name: t('导体电势（处处相等）', 'conductor potential (uniform)'), unit: 'V' },
    ],
    conditions: {
        applies: [t('达到静电平衡的孤立或外接导体', 'A conductor at electrostatic equilibrium')],
        assumes: [t('导体内部有可自由移动的电荷', 'Free charges are mobile inside')],
        breaks: [t('电荷流动或外加交变场时（非静电）不成立', 'Fails when charges flow or under time-varying fields')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('若内部有场则电荷会移动', 'If E_in nonzero charges would move'),
            latex: String.raw `\mathbf{E}_{\mathrm{in}}\neq 0\ \Rightarrow\ q\mathbf{E}\neq 0\ \Rightarrow\ \text{电荷流动}` },
        { n: 2, op: 'result', title: t('平衡条件：内部场为零', 'Equilibrium: interior field vanishes'),
            latex: String.raw `\mathbf{E}_{\mathrm{in}}=0` },
        { n: 3, op: 'physics', title: t('取扁高斯柱跨表面', 'Flat Gaussian pillbox across surface'),
            latex: String.raw `\oint\mathbf{E}\cdot d\mathbf{A}=E_{\mathrm{surf}}\,A=\dfrac{\sigma A}{\varepsilon_{0}}` },
        { n: 4, op: 'algebra', title: t('解出表面场强', 'Solve for surface field'),
            latex: String.raw `E_{\mathrm{surf}}=\dfrac{\sigma}{\varepsilon_{0}}` },
    ],
    links: {
        upstream: [{ id: 'uem-gauss-law' }],
        seealso: [{ id: 'uem-equipotential-surface' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §25' }],
};
export default uemConductorElectrostaticEquilibrium;
//# sourceMappingURL=uem-conductor-electrostatic-equilibrium.js.map