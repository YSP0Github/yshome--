import { t } from '../../core/types.js';
/** dc-anisotropy-coefficient */
const dcAnisotropyCoefficient = {
    id: 'dc-anisotropy-coefficient',
    name: t('岩石电阻率各向异性系数', 'Resistivity Anisotropy Coefficient'),
    aliases: { zh: ['层状岩石电阻率各向异性', '纵向/横向电阻率'], en: ['rock resistivity anisotropy', 'longitudinal/transverse resistivity'] },
    node: 'S16.1',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.EM', 'METH.ROCK'],
        quantity: ['Q.ELEC'],
        keywords: t('电阻率各向异性 纵向电阻率 横向电阻率 λ系数 层理', 'resistivity anisotropy transverse longitudinal coefficient bedding'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `\lambda=\sqrt{\frac{\rho_{t}}{\rho_{l}}}\;\approx 1.0\,-\,1.2`,
        variants: [
            { name: t('层状组合', 'Layered sequence'), latex: String.raw `\rho_{t}=\sum h_{i}\rho_{e,i}\Big/\sum h_{i}\;,\quad \rho_{l}=\sum h_{i}\Big/\sum\!\dfrac{h_{i}}{\rho_{e,i}}` },
        ],
    },
    meaning: t('层理发育的岩石中，电流平行层理流动（纵向 ρ_l）比垂直层理（横向 ρ_t）容易，因此 ρ_t > ρ_l。各向异性系数 λ=√(ρ_t/ρ_l) 通常在 1.0–1.2。测井沿井轴测量与地表沿层理测量得到不同的 ρ_e，解释时必须注意方向。', 'In bedded rocks, current flows more easily parallel to bedding (longitudinal ρ_l) than across it (transverse ρ_t), so ρ_t > ρ_l. The anisotropy coefficient λ=√(ρ_t/ρ_l) is typically 1.0–1.2. Well-logging along the borehole and surface profiling along bedding measure different ρ_e; the direction must be stated when interpreting.'),
    symbols: [
        { sym: '\\lambda', name: t('电阻率各向异性系数', 'resistivity anisotropy coefficient'), unit: '无量纲' },
        { sym: '\\rho_{t}', name: t('横向电阻率（垂直层理）', 'transverse resistivity (⊥ bedding)'), unit: 'Ω·m' },
        { sym: '\\rho_{l}', name: t('纵向电阻率（平行层理）', 'longitudinal resistivity (∥ bedding)'), unit: 'Ω·m' },
    ],
    conditions: {
        applies: [t('层理发育的沉积岩（砂泥岩互层）', 'Bedded sedimentary rocks (interbedded sand–shale)')],
    },
    links: {
        seealso: [{ id: 'dc-ohm-law-resistivity' }],
    },
    refs: [{ text: 'Telford et al., Applied Geophysics, 2nd ed., §4.2' }],
};
export default dcAnisotropyCoefficient;
//# sourceMappingURL=dc-anisotropy-coefficient.js.map