import { t } from '../../core/types.js';
/** phys-thermal-linear-expansion */
const physThermalLinearExpansion = {
    id: 'phys-thermal-linear-expansion',
    name: t('固体热膨胀', 'Thermal Expansion of Solids'),
    aliases: { zh: ['线膨胀系数', 'ΔL=αLΔT'], en: ['thermal expansion', 'linear expansion coefficient'] },
    node: 'S18.6',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.GEOM'],
        keywords: t('热膨胀 线膨胀系数 桥梁缝隙 双金属片', 'thermal expansion linear coefficient bridge gap bimetallic strip'),
    },
    audience: 'highschool',
    complete: 'L1',
    statement: {
        main: String.raw `\Delta L=\alpha L_0\,\Delta T`,
        variants: [
            { name: t('体积膨胀', 'volume expansion'), latex: String.raw `\Delta V=\beta V_0\,\Delta T,\qquad \beta\approx 3\alpha` },
        ],
    },
    meaning: t('温度升高时，固体原子间平均距离增大，整体尺寸按 ΔL=αL₀ΔT 伸长。线膨胀系数 α 虽小（约 10⁻⁵ /K），但桥梁、铁轨长达数百米，伸缩量就很可观——所以要留伸缩缝。双金属片把两种 α 不同的金属焊在一起，受热弯曲，就是温控开关、火警探头的核心。', 'On heating, the mean interatomic spacing grows and the solid expands by ΔL = αL₀ΔT. Though α is small (~10⁻⁵ /K), bridges and rails hundreds of metres long move noticeably — hence expansion joints. A bimetallic strip of two metals with different α bends on heating and is the heart of thermostats and fire alarms.'),
    symbols: [
        { sym: '\\Delta L', name: t('长度变化', 'change in length'), unit: 'm' },
        { sym: '\\alpha', name: t('线膨胀系数（此处为热膨胀系数）', 'linear expansion coefficient (here α means expansion, not P-wave speed)'), unit: 'K⁻¹', typical: '~10⁻⁵' },
        { sym: 'L_0', name: t('原长', 'original length'), unit: 'm' },
        { sym: '\\Delta T', name: t('温度变化', 'temperature change'), unit: 'K' },
    ],
    conditions: {
        applies: [t('各向同性固体、小温升', 'Isotropic solids, small temperature changes')],
        assumes: [t('α 视为常数', 'α treated constant')],
        breaks: [t('各向异性材料（晶体）方向不同', 'Anisotropic crystals expand differently by direction')],
    },
    links: { seealso: [{ id: 'phys-fourier-heat-conduction' }] },
};
export default physThermalLinearExpansion;
//# sourceMappingURL=phys-thermal-linear-expansion.js.map