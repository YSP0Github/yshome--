import { t } from '../../core/types.js';
/** uem-maxwell-equations */
const uemMaxwellEquations = {
    id: 'uem-maxwell-equations',
    name: t('Maxwell 方程组', "Maxwell's Equations"),
    aliases: { zh: ['麦克斯韦方程组', '电磁统一'], en: ["Maxwell's equations", 'unified EM'] },
    node: 'S19.5',
    tags: {
        math: ['MATH.VECTOR', 'MATH.DIFF'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC', 'Q.MAG'],
        keywords: t('麦克斯韦方程组 高斯 法拉第 安培 位移电流 电磁波', "Maxwell equations Gauss Faraday Ampere displacement current EM wave"),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\oint\mathbf{E}\cdot d\mathbf{A}=\frac{Q}{\varepsilon_{0}},\quad \oint\mathbf{B}\cdot d\mathbf{A}=0,\quad \oint\mathbf{E}\cdot d\mathbf{l}=-\frac{d\Phi_{B}}{dt},\quad \oint\mathbf{B}\cdot d\mathbf{l}=\mu_{0}\!\left(I+\varepsilon_{0}\frac{d\Phi_{E}}{dt}\right)`,
        variants: [
            { name: t('微分形式', 'Differential form'), latex: String.raw `\nabla\cdot\mathbf{E}=\dfrac{\rho_{q}}{\varepsilon_{0}},\ \nabla\cdot\mathbf{B}=0,\ \nabla\times\mathbf{E}=-\dfrac{\partial\mathbf{B}}{\partial t},\ \nabla\times\mathbf{B}=\mu_{0}\mathbf{J}+\mu_{0}\varepsilon_{0}\dfrac{\partial\mathbf{E}}{\partial t}` },
        ],
    },
    meaning: t('Maxwell 方程组把电与磁统一为同一电磁场：Gauss 定律（电荷生电场）、无磁单极（B 场无散）、Faraday 定律（变化磁场生电场）、含位移电流的 Ampere 定律（电流与变化电场生磁场）。它预言了电磁波并给出光速。', 'Maxwell\'s equations unify electricity and magnetism into one electromagnetic field: Gauss (charges make E), no magnetic monopoles (∇·B=0), Faraday (changing B makes E), and Ampere with displacement current (currents and changing E make B). They predict electromagnetic waves and give the speed of light.'),
    symbols: [
        { sym: '\\mathbf{E}', name: t('电场', 'electric field'), unit: 'V/m' },
        { sym: '\\mathbf{B}', name: t('磁场', 'magnetic field'), unit: 'T' },
        { sym: '\\rho_{q}', name: t('电荷密度', 'charge density'), unit: 'C/m³' },
        { sym: '\\mathbf{J}', name: t('电流密度', 'current density'), unit: 'A/m²' },
    ],
    conditions: {
        applies: [t('经典宏观电磁现象（真空或线性介质）', 'Classical macroscopic EM (vacuum or linear medium)')],
        breaks: [t('强场量子效应需 QED', 'Quantum effects need QED')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('两定律描述场源', 'Two divergence laws as sources'),
            latex: String.raw `\nabla\cdot\mathbf{E}=\dfrac{\rho_{q}}{\varepsilon_{0}},\qquad \nabla\cdot\mathbf{B}=0` },
        { n: 2, op: 'physics', title: t('两个旋度定律描述感应', 'Two curl laws as induction'),
            latex: String.raw `\nabla\times\mathbf{E}=-\dfrac{\partial\mathbf{B}}{\partial t}` },
        { n: 3, op: 'physics', title: t('补入位移电流', 'Add displacement current'),
            latex: String.raw `\nabla\times\mathbf{B}=\mu_{0}\mathbf{J}+\mu_{0}\varepsilon_{0}\dfrac{\partial\mathbf{E}}{\partial t}` },
    ],
    links: {
        upstream: [{ id: 'uem-gauss-law' }, { id: 'uem-faraday-law-emf' }, { id: 'uem-displacement-current' }],
        downstream: [{ id: 'uem-em-wave-speed' }],
        seealso: [{ id: 'em-maxwell-equations', note: t('勘探电磁视角版本', 'exploration-geophysics version') }],
    },
    refs: [{ text: 'Griffiths, Introduction to Electrodynamics, 4e, Ch. 7–8' }],
};
export default uemMaxwellEquations;
//# sourceMappingURL=uem-maxwell-equations.js.map