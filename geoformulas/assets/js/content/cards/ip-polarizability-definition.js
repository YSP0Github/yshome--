import { t } from '../../core/types.js';
/** ip-polarizability-definition */
const ipPolarizabilityDefinition = {
    id: 'ip-polarizability-definition',
    name: t('激发极化极化率 η', 'Induced Polarization: Chargeability η'),
    aliases: { zh: ['极化率 η', '二次电位相对值'], en: ['chargeability η', 'IP polarizability'] },
    node: 'S16.3',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.EM'],
        quantity: ['Q.ELEC', 'Q.AMP'],
        keywords: t('激发极化 极化率 η 二次电位 一次电位 充电率', 'induced polarization chargeability secondary primary potential'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\eta=\frac{\Delta U_{2}}{\Delta U_{1}}\times 100\%`,
        variants: [
            { name: t('含义', 'Meaning'), latex: String.raw `\eta=\dfrac{\text{断电后二次电位}}{\text{供电一次电位}}` },
        ],
    },
    meaning: t('向地下供直流电流时，不只是测电位差（这是电阻率法），还要在断电瞬间测量"剩余"的二次电位 ΔU2。它是岩石—电解液界面（双电层、薄膜、电子矿物）在充电后缓慢放电的结果。极化率 η 越大，岩石的激发极化效应越强，对金属矿、石墨、粘土地层敏感。', 'When DC current is injected, measure not only the potential drop (resistivity) but also the residual secondary potential ΔU2 right after current is switched off. It comes from slow discharge of electrical double layers and membrane/electronic polarisation at the rock–electrolyte interface. Larger η means stronger IP — sensitive to metallic ore, graphite and clay.'),
    symbols: [
        { sym: '\\eta', name: t('极化率（百分率）', 'chargeability (fraction/%)'), unit: '%', typical: '0.1 – 10%' },
        { sym: '\\Delta U_{1}', name: t('供电时一次电位', 'primary potential during current'), unit: 'mV' },
        { sym: '\\Delta U_{2}', name: t('断电后二次电位', 'secondary potential after switch-off'), unit: 'mV' },
    ],
    conditions: {
        applies: [t('时间域 IP，二极或四极装置', 'Time-domain IP, dipole/four-pole array')],
        assumes: [t('断电瞬间读数、仪器与一次场分离', 'Read at switch-off, instrument separates primary field')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('供电时总电位 ΔU1', 'Primary potential ΔU1 while current flows'),
            latex: String.raw `\Delta U_{1}=U_{\text{primary}}` },
        { n: 2, op: 'physics', title: t('断电后二次衰减电位 ΔU2', 'Secondary decay ΔU2 after switch-off'),
            latex: String.raw `\Delta U_{2}=U_{\text{secondary}}(t\to 0^{+})` },
        { n: 3, op: 'result', title: t('相对比值即极化率', 'Ratio defines η'),
            latex: String.raw `\eta=\Delta U_{2}/\Delta U_{1}` },
    ],
    links: {
        downstream: [{ id: 'ip-time-domain-chargeability' }, { id: 'ip-frequency-domain-pfe' }],
        seealso: [{ id: 'dc-apparent-resistivity' }],
    },
    refs: [{ text: 'Telford et al., Applied Geophysics, 2nd ed., §6' }],
};
export default ipPolarizabilityDefinition;
//# sourceMappingURL=ip-polarizability-definition.js.map