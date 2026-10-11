import { t } from '../../core/types.js';
/** nuc-activity */
const nucActivity = {
    id: 'nuc-activity',
    name: t('放射性活度', 'Radioactive Activity'),
    aliases: { zh: ['A=λN', '贝可 Bq', '居里 Ci'], en: ['activity A = lambda N', 'becquerel Bq', 'curie Ci'] },
    node: 'S20.5',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY', 'Q.TIME'],
        keywords: t('放射性活度 A=λN 贝可 Bq 居里 衰变率 辐射剂量', 'radioactive activity A = lambda N becquerel curie decay rate radiation dose'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `A=\lambda N=\lambda N_0e^{-\lambda t}=A_0e^{-\lambda t}`,
        variants: [
            { name: t('单位换算', 'Unit conversion'), latex: String.raw `1\ \mathrm{Ci}=3.7\times10^{10}\ \mathrm{Bq}` },
        ],
    },
    meaning: t('活度 A 是单位时间内衰变的次数，A=λN。SI 单位是贝可（Bq），1 Bq = 1 次衰变/秒；旧单位居里（Ci）来自 1 克镭-226 的活度。活度随时间指数衰减，是医院放疗、核素成像、环境辐射监测里最直接测量的量。', 'The activity A is the number of decays per unit time, A = λN. The SI unit is the becquerel (Bq), 1 Bq = 1 decay per second; the older curie (Ci) came from the activity of 1 gram of radium-226. Activity decays exponentially with time and is the quantity directly measured in radiotherapy, nuclear imaging and environmental radiation monitoring.'),
    symbols: [
        { sym: 'A', name: t('活度（衰变率）', 'activity (decay rate)'), unit: 'Bq' },
        { sym: '\\lambda', name: t('衰变常数', 'decay constant'), unit: 's⁻¹' },
        { sym: 'N', name: t('现存核数', 'number of nuclei present'), unit: '1' },
    ],
    conditions: {
        applies: [t('单一放射性核素样品', 'A sample of a single radionuclide')],
        assumes: [t('忽略子体核素的贡献', 'Daughter nuclide contributions are ignored')],
        breaks: [t('混合样品需分别计各核素活度', 'Mixed samples need per-nuclide activity')],
    },
    links: {
        upstream: [{ id: 'nuc-radioactive-decay-law' }, { id: 'nuc-half-life-mean-life' }],
        downstream: [{ id: 'nuc-alpha-beta-gamma-decay' }],
    },
    refs: [{ text: 'Krane, Introductory Nuclear Physics, §6' }],
};
export default nucActivity;
//# sourceMappingURL=nuc-activity.js.map