import { t } from '../../core/types.js';
/** ip-time-domain-chargeability */
const ipTimeDomainChargeability = {
    id: 'ip-time-domain-chargeability',
    name: t('时间域充电率 m', 'Time-domain Chargeability M'),
    aliases: { zh: ['充电率', '面积充电率 M'], en: ['chargeability M', 'integral chargeability'] },
    node: 'S16.3',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.EM'],
        quantity: ['Q.ELEC', 'Q.TIME'],
        keywords: t('时间域 充电率 M 积分 衰减曲线 mV/V', 'time domain chargeability integral decay mV/V'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `M=\frac{1}{\Delta U_{1}}\int_{t_{1}}^{t_{2}}U_{2}(t)\,dt\quad [\mathrm{mV/V}]`,
        variants: [
            { name: t('单一延迟点近似', 'Single-delay approximation'), latex: String.raw `M\approx\eta(t_{1},t_{2})=\dfrac{U_{2}(t_{1})}{\Delta U_{1}}\times 100\%` },
        ],
    },
    meaning: t('充电率 M 是断电后二次电位衰减曲线 ΔU2(t) 在某一时间窗 [t1,t2] 内对时间的积分，再除以一次电位 ΔU1，单位 mV/V（或 ms）。它比单点 η 更稳健，因为取了一段时间窗、压制了随机噪声，是时间域 IP 解释的标准量。', 'The chargeability M is the integral of the post-switch-off secondary decay U2(t) over a gate [t1,t2], divided by the primary potential ΔU1, in mV/V (or ms). Averaging over a time gate makes M more robust than a single-point η and suppresses noise; it is the standard time-domain IP quantity.'),
    symbols: [
        { sym: 'M', name: t('充电率', 'chargeability'), unit: 'mV/V 或 ms' },
        { sym: 'U_{2}(t)', name: t('断电后二次电位衰减曲线', 'post-switch-off secondary decay'), unit: 'mV' },
        { sym: '\\Delta U_{1}', name: t('一次电位', 'primary potential'), unit: 'mV' },
        { sym: 't_{1},t_{2}', name: t('采样窗起止时间', 'integration gate'), unit: 's' },
    ],
    conditions: {
        applies: [t('时间域 IP、二极或四极装置', 'Time-domain IP, dipole/four-pole array')],
        assumes: [t('断电后无电极极化干扰', 'No electrode-polarisation artefact in the gate')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('记录断电后衰减曲线', 'Record the decay U2(t)'),
            latex: String.raw `U_{2}(t),\quad t>0` },
        { n: 2, op: 'geometry', title: t('在窗 [t1,t2] 内求面积', 'Integrate over the gate'),
            latex: String.raw `A=\displaystyle\int_{t_{1}}^{t_{2}}U_{2}(t)\,dt` },
        { n: 3, op: 'algebra', title: t('归一到一次电位', 'Normalize by primary potential'),
            latex: String.raw `M=A/\Delta U_{1}` },
    ],
    links: {
        upstream: [{ id: 'ip-polarizability-definition' }],
        downstream: [{ id: 'ip-cole-cole-model' }],
        seealso: [{ id: 'ip-frequency-domain-pfe' }],
    },
    refs: [{ text: 'Seigel (1959), Geophysics; Telford et al., §6.3' }],
};
export default ipTimeDomainChargeability;
//# sourceMappingURL=ip-time-domain-chargeability.js.map