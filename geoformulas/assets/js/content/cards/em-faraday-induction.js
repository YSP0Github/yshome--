import { t } from '../../core/types.js';
/** em-faraday-induction */
const emFaradayInduction = {
    id: 'em-faraday-induction',
    name: t('Faraday 电磁感应定律', "Faraday's Law of Induction"),
    aliases: { zh: ['法拉第定律', '感应电动势'], en: ['Faraday law', 'induced EMF'] },
    node: 'S16.2',
    tags: {
        math: ['MATH.VECTOR', 'MATH.DIFF'],
        method: ['METH.EM'],
        quantity: ['Q.ELEC'],
        keywords: t('Faraday 电磁感应 磁通量 感应电动势 变化磁场', 'Faraday induction magnetic flux EMF changing field'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\mathcal{E}=-\frac{d\Phi_{B}}{dt}\;,\qquad \oint_{C}\mathbf{E}\cdot d\mathbf{l}=-\frac{\partial}{\partial t}\iint_{S}\mathbf{B}\cdot d\mathbf{S}`,
        variants: [
            { name: t('微分形式', 'Differential form'), latex: String.raw `\nabla\times\mathbf{E}=-\dfrac{\partial\mathbf{B}}{\partial t}` },
        ],
    },
    meaning: t('变化的磁场会在周围激发涡旋电场。电磁法（MT、TEM、大地电磁）不靠人工供电，而是利用天然或人工交变磁场在地下感应出次生电场——Faraday 定律就是它的物理源头：测到的 E 与 B 的比值（阻抗）携带了地下电阻率信息。', 'A changing magnetic field induces a swirling electric field. EM methods (MT, TEM) do not drive current directly; a natural or man-made alternating B induces a secondary E in the earth — Faraday\'s law is its physical origin. The ratio E/B (impedance) carries the subsurface resistivity information.'),
    symbols: [
        { sym: '\\mathcal{E}', name: t('感应电动势', 'induced EMF'), unit: 'V' },
        { sym: '\\Phi_{B}', name: t('磁通量', 'magnetic flux'), unit: 'Wb' },
        { sym: '\\mathbf{E}', name: t('感应电场', 'induced electric field'), unit: 'V/m' },
        { sym: '\\mathbf{B}', name: t('磁感应强度', 'magnetic flux density'), unit: 'T' },
    ],
    conditions: {
        applies: [t('任意随时间变化的磁场', 'Any time-varying magnetic field')],
        assumes: [t('介质线性、非磁性（μ≈μ0）', 'Linear, non-magnetic medium (μ≈μ0)')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('磁通量定义', 'Define magnetic flux'),
            latex: String.raw `\Phi_{B}=\iint_{S}\mathbf{B}\cdot d\mathbf{S}` },
        { n: 2, op: 'physics', title: t('感应电动势 = 磁通量变化率', 'EMF = rate of flux change'),
            latex: String.raw `\mathcal{E}=-\dfrac{d\Phi_{B}}{dt}=-\dfrac{\partial}{\partial t}\iint_{S}\mathbf{B}\cdot d\mathbf{S}` },
        { n: 3, op: 'transform', title: t('电动势即 E 的环路积分', 'EMF as loop integral of E'),
            latex: String.raw `\mathcal{E}=\oint_{C}\mathbf{E}\cdot d\mathbf{l}\;\xrightarrow{\text{Stokes}}\;\nabla\times\mathbf{E}=-\dfrac{\partial\mathbf{B}}{\partial t}` },
    ],
    links: {
        downstream: [{ id: 'em-maxwell-equations', note: t('它是 Maxwell 方程组之一', 'One of Maxwell equations') }],
        seealso: [{ id: 'em-skin-depth' }],
    },
    refs: [{ text: 'Griffiths, Introduction to Electrodynamics, Ch. 7' }],
};
export default emFaradayInduction;
//# sourceMappingURL=em-faraday-induction.js.map