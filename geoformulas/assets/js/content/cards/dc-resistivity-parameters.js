import { t } from '../../core/types.js';
/** dc-resistivity-parameters */
const dcResistivityParameters = {
    id: 'dc-resistivity-parameters',
    name: t('岩石电阻率—物性关系（Keller）', 'Rock Resistivity–Property Relations (Keller)'),
    aliases: { zh: ['影响岩石电阻率的因素', 'Keller 表'], en: ['factors affecting resistivity', 'Keller table'] },
    node: 'S16.1',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.EM', 'METH.ROCK'],
        quantity: ['Q.ELEC', 'Q.POR'],
        keywords: t('电阻率 孔隙水 矿化度 温度 矿物组分', 'resistivity porewater salinity temperature mineralogy'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `\rho_{e}\sim 10^{-8}\ \text{(金属)} \;-\; 10^{16}\ \text{(干结晶岩)}\ \Omega\cdot\mathrm{m}`,
        variants: [
            { name: t('主要控制因素', 'Main controls'), latex: String.raw `\rho_{e}=f(\underbrace{\phi}_{\text{孔隙}},\underbrace{S_{w}}_{\text{含水饱和度}},\underbrace{R_{w}}_{\text{地层水电阻率}},\underbrace{T}_{\text{温度}},\underbrace{\text{矿物组分}}_{\text{骨架导电性}})` },
            { name: t('温度效应', 'Temperature effect'), latex: String.raw `R_{w}(T_{2})\approx R_{w}(T_{1})\Big/\big[1+\alpha(T_{2}-T_{1})\big],\ \alpha\approx 0.022/^\circ\mathrm{C}` },
        ],
    },
    meaning: t('常见岩石电阻率跨度达十几个数量级。对多孔沉积岩，导电路径主要是孔隙中的含盐地层水，因此 ρ_e 主要由孔隙度、含水饱和度和地层水矿化度决定——这正是 Archie 定律的实验基础。金属矿物、石墨等电子导电矿物会使 ρ_e 异常偏低；温度升高使水的 ρ_e 指数下降。', 'Common rocks span more than ten orders of magnitude in resistivity. For porous sedimentary rocks conduction is dominated by salty formation water in the pores, so ρ_e is mainly set by porosity, water saturation and formation-water salinity — the experimental basis of Archie\'s law. Electron-conductive minerals such as graphite and sulphides drive ρ_e anomalously low, and higher temperature lowers water resistivity strongly.'),
    symbols: [
        { sym: '\\rho_{e}', name: t('岩石电阻率', 'rock resistivity'), unit: 'Ω·m' },
        { sym: '\\phi', name: t('孔隙度', 'porosity'), unit: '无量纲' },
        { sym: 'S_{w}', name: t('含水饱和度', 'water saturation'), unit: '无量纲' },
        { sym: 'R_{w}', name: t('地层水电阻率', 'formation-water resistivity'), unit: 'Ω·m' },
        { sym: 'T', name: t('温度', 'temperature'), unit: '°C' },
    ],
    conditions: {
        applies: [t('多孔沉积岩，离子导电为主', 'Porous sedimentary rocks dominated by electrolytic conduction')],
        breaks: [t('含金属矿/石墨时电子导电占主导，规律失效', 'Electrolytic law breaks when electronic conduction (ores, graphite) dominates')],
    },
    links: {
        downstream: [{ id: 'dc-archie-formation-factor', note: t('把这些因素量化成公式', 'Quantifying these factors') }],
        seealso: [{ id: 'dc-ohm-law-resistivity' }],
    },
    refs: [{ text: 'Keller & Frischknecht (1966), Electrical Methods in Geophysical Prospecting' }],
};
export default dcResistivityParameters;
//# sourceMappingURL=dc-resistivity-parameters.js.map