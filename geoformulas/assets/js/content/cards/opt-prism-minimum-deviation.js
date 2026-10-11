import { t } from '../../core/types.js';
/** opt-prism-minimum-deviation */
const optPrismMinimumDeviation = {
    id: 'opt-prism-minimum-deviation',
    name: t('棱镜偏向角与最小偏向角', 'Prism Deviation Angle and Minimum Deviation'),
    aliases: { zh: ['棱镜折射', '最小偏向角测折射率'], en: ['prism refraction', 'minimum deviation method'] },
    node: 'S20.1',
    tags: {
        math: ['MATH.GEOM', 'MATH.ALGEBRA'],
        method: ['METH.PHYS', 'METH.INSTR'],
        quantity: ['Q.OPT', 'Q.GEOM'],
        keywords: t('棱镜 偏向角 最小偏向角 色散 分光镜 折射率测量', 'prism deviation angle minimum deviation dispersion spectroscope index measurement'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\delta_{\min}=2\theta_i-A,\qquad n=\frac{\sin\frac{\delta_{\min}+A}{2}}{\sin\frac{A}{2}}`,
        variants: [
            { name: t('偏向角与顶角的一般关系', 'General relation between deviation and apex angle'), latex: String.raw `\delta=\theta_1+\theta_4-A,\qquad A=\theta_2+\theta_3` },
        ],
    },
    meaning: t('光线穿过棱镜时两次折射，出射方向相对入射方向偏折了 δ。当入射角调到"光路对称"（光在棱镜内平行于底边）时，偏向角取最小值 δ_min。测准 δ_min 和棱镜顶角 A，就能用 n = sin((δ_min+A)/2)/sin(A/2) 反算材料折射率——这是实验室精确测折射率、棱镜分光计的标准方法。', 'A ray crossing a prism refracts twice and emerges deviated by δ. When the incidence angle is adjusted so the path through the prism is symmetric (the internal ray runs parallel to the base), the deviation reaches a minimum δ_min. Measuring δ_min and the prism apex angle A gives the material index from n = sin((δ_min+A)/2)/sin(A/2) — the standard lab method for precise index measurement and the basis of prism spectrometers.'),
    symbols: [
        { sym: '\\delta_{\\min}', name: t('最小偏向角', 'minimum deviation angle'), unit: 'rad' },
        { sym: 'A', name: t('棱镜顶角', 'prism apex angle'), unit: 'rad' },
        { sym: '\\theta_i', name: t('入射角', 'incidence angle'), unit: 'rad' },
        { sym: 'n', name: t('棱镜材料折射率', 'refractive index of the prism material'), unit: '1' },
    ],
    conditions: {
        applies: [t('三棱镜、单色光、近轴小角度', 'Triangular prism, monochromatic light, small paraxial angles')],
        assumes: [t('棱镜置于空气中', 'The prism is in air')],
        breaks: [t('入射角过小时发生全反射', 'At too small an incidence angle total internal reflection occurs')],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('顶角等于两个折射角之和', 'The apex angle equals the sum of the two internal refraction angles'), latex: String.raw `A=\theta_2+\theta_3` },
        { n: 2, op: 'physics', title: t('两次 Snell 折射', 'Two Snell refractions'), latex: String.raw `\sin\theta_1=n\sin\theta_2,\qquad n\sin\theta_3=\sin\theta_4` },
        { n: 3, op: 'algebra', title: t('偏向角', 'Deviation angle'), latex: String.raw `\delta=(\theta_1-\theta_2)+(\theta_4-\theta_3)=\theta_1+\theta_4-A` },
        { n: 4, op: 'result', title: t('对称光路时取极值', 'At the symmetric path δ is extremal'), latex: String.raw `\theta_2=\theta_3=A/2,\quad \theta_1=(\delta_{\min}+A)/2\;\Rightarrow\;n=\frac{\sin\frac{\delta_{\min}+A}{2}}{\sin\frac{A}{2}}` },
    ],
    links: {
        upstream: [{ id: 'opt-snell-law' }],
        downstream: [{ id: 'opt-diffraction-grating', note: t('同为分光元件', 'Both are dispersive elements') }],
    },
    refs: [{ text: 'Hecht, Optics, 5th ed., §5.5' }],
};
export default optPrismMinimumDeviation;
//# sourceMappingURL=opt-prism-minimum-deviation.js.map