import { t } from '../../core/types.js';
/** wl-formation-water-resistivity */
const wlFormationWaterResistivity = {
    id: 'wl-formation-water-resistivity',
    name: t('由 SP 确定地层水电阻率 Rw', 'Formation-water Resistivity Rw from SP'),
    aliases: { zh: ['Rw 确定', '静自然电位求 Rw'], en: ['Rw determination', 'Rw from SSP'] },
    node: 'S17.2',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.LOG'],
        quantity: ['Q.ELEC', 'Q.POR'],
        keywords: t('地层水电阻率 Rw SP 静自然电位 SSP 泥浆滤液 Rmf', 'formation water resistivity Rw SP static self-potential mud filtrate Rmf'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `R_{w}=R_{mfe}\,10^{-SSP/K}`, variants: [
            { name: t('Rmf 温度换算', 'Rmf temperature correction'), latex: String.raw `R_{mfe}=\text{由 Rmf 与地层温度查图版得到等效值}` },
        ],
    },
    meaning: t('Archie 公式必须知道 Rw，但 Rw 通常不能直接测。最经典的做法：在同一口井找一层厚的纯水层，读 SP 偏转幅度 SSP，反算 Rmf/Rw 比值。再把泥浆滤液电阻率 Rmf 按地层温度校正成 Rmfe，即可解出 Rw。Rw 是 Archie 算 Sw 的关键输入，误差直接传递到含油饱和度。', 'Archie needs Rw, but it is rarely measured directly. The classic way: in a thick water-saturated bed, read the SP deflection SSP and invert the Rmf/Rw ratio. Correct the mud-filtrate resistivity Rmf to formation temperature (Rmfe), then solve for Rw. Rw is the key Archie input and its error propagates straight into oil saturation.'),
    symbols: [
        { sym: 'R_{w}', name: t('地层水电阻率', 'formation-water resistivity'), unit: 'Ω·m' },
        { sym: 'R_{mfe}', name: t('等效泥浆滤液电阻率', 'equivalent mud-filtrate resistivity'), unit: 'Ω·m' },
        { sym: 'SSP', name: t('静自然电位', 'static self-potential'), unit: 'mV' },
        { sym: 'K', name: t('电化学系数', 'electrochemical coefficient'), unit: 'mV' },
    ],
    conditions: {
        applies: [t('厚层纯水层、淡水泥浆', 'Thick clean water bed, fresh mud')],
        breaks: [t('盐水泥浆、低渗透层 SP 失真', 'Salt mud or low permeability distorts SP')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('SP=K log(Rmfe/Rw)', 'SP=K log(Rmfe/Rw)'),
            latex: String.raw `SSP=K\log_{10}(R_{mfe}/R_{w})` },
        { n: 2, op: 'algebra', title: t('两边取指数', 'Exponentiate'),
            latex: String.raw `10^{SSP/K}=R_{mfe}/R_{w}` },
        { n: 3, op: 'result', title: t('解出 Rw', 'Solve for Rw'),
            latex: String.raw `R_{w}=R_{mfe}\,10^{-SSP/K}` },
    ],
    links: {
        upstream: [{ id: 'wl-spontaneous-potential' }],
        downstream: [{ id: 'wl-archie-water-saturation' }],
    },
    refs: [{ text: 'Ellis & Singer, Well Logging, 2nd ed., §4' }],
};
export default wlFormationWaterResistivity;
//# sourceMappingURL=wl-formation-water-resistivity.js.map