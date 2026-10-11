import { t } from '../../core/types.js';
/** opt-michelson-interferometer */
const optMichelsonInterferometer = {
    id: 'opt-michelson-interferometer',
    name: t('Michelson 干涉仪', 'Michelson Interferometer'),
    aliases: { zh: ['迈克耳孙干涉仪', '等倾干涉', '条纹移动 ΔN=2d/λ'], en: ['Michelson interferometer', 'fringe shift ΔN = 2d/λ'] },
    node: 'S20.2',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS', 'METH.INSTR'],
        quantity: ['Q.OPT', 'Q.TIME'],
        keywords: t('Michelson 干涉仪 等倾干涉 分光板 动镜 条纹移动 精密测长', 'Michelson interferometer equal inclination beamsplitter moving mirror fringe shift precision length measurement'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `\Delta N=\frac{2\Delta d}{\lambda}`,
        variants: [
            { name: t('两臂光程差', 'Optical path difference between arms'), latex: String.raw `\delta=2d\cos\theta` },
        ],
    },
    meaning: t('Michelson 干涉仪用分光板把一束光分成两路，分别经两面反射镜反射后再会合产生干涉。移动其中一面反射镜 Δd，光程差改变 2Δd，就有 ΔN = 2Δd/λ 个条纹扫过视场。数条纹移动数目即可把长度测准到波长量级（纳米），它也是 Michelson–Morley 实验与 LIGO 引力波探测仪的核心光路。', 'The Michelson interferometer splits a beam with a beamsplitter, reflects the two halves off two mirrors, and recombines them to interfere. Moving one mirror by Δd changes the path difference by 2Δd and sweeps ΔN = 2Δd/λ fringes across the field. Counting fringes measures length to a wavelength (nanometre) precision; the same optical layout underpins the Michelson–Morley experiment and the LIGO gravitational-wave detectors.'),
    symbols: [
        { sym: '\\Delta N', name: t('扫过视场的条纹数', 'number of fringes crossing the field'), unit: '1' },
        { sym: '\\Delta d', name: t('反射镜移动距离', 'distance the mirror moves'), unit: 'm' },
        { sym: '\\lambda', name: t('波长（此处为波长）', 'wavelength — note: wavelength here'), unit: 'm' },
        { sym: '\\theta', name: t('出射光相对法线的倾角', 'emergence angle from the normal'), unit: 'rad' },
    ],
    conditions: {
        applies: [t('两臂光程差远小于光源相干长度', 'Arm path difference well within the source coherence length')],
        assumes: [t('分光板补偿板无色差、两镜垂直', 'Beamsplitter/compensator achromatic, mirrors perpendicular')],
        breaks: [t('光程差超过相干长度时条纹消失', 'Fringes vanish once the path difference exceeds the coherence length')],
    },
    links: {
        upstream: [{ id: 'opt-path-difference-phase' }],
        downstream: [{ id: 'opt-rayleigh-criterion' }],
    },
    refs: [{ text: 'Hecht, Optics, 5th ed., §9.6' }],
};
export default optMichelsonInterferometer;
//# sourceMappingURL=opt-michelson-interferometer.js.map