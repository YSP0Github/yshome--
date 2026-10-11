import { t } from '../../core/types.js';
/** mag-geomagnetic-reversal */
const magGeomagneticReversal = {
    id: 'mag-geomagnetic-reversal',
    name: t('地磁倒转', 'Geomagnetic Reversals'),
    aliases: { zh: ['磁极倒转', '极性反转'], en: ['geomagnetic reversal', 'polarity reversal'] },
    node: 'S15.4',
    tags: {
        math: ['MATH.STAT'],
        method: ['METH.MAG', 'METH.STRUCT'],
        quantity: ['Q.MAG'],
        keywords: t('地磁倒转 极性年表 Brunhes Mat', 'geomagnetic reversal polarity timescale Brunhes Matuyama'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `\mathbf{B}_{\text{今}}\approx-\mathbf{B}_{\text{倒转}}\quad(\text{偶极方向相反})`,
        variants: [
            { name: t('最近一次倒转', 'most recent reversal'), latex: String.raw `\text{Brunhes--Matuyama}\ \approx78\ \mathrm{ka}` },
        ],
    },
    meaning: t('地磁场的北极与南极在地质历史上不定期互换位置，这就是地磁倒转。倒转期间场强可降到正常值的 1/10 以下，偶极减弱、非偶极增强。熔岩流和深海沉积记录了一连串正反向段，构成了全球对比用的极性年表（GPTS），也是海底扩张磁条带的物理基础。', 'The north and south poles of the geomagnetic field interchange at irregular intervals through geological time. During a reversal the field can drop below one tenth of its normal strength, the dipole weakens and the non-dipole part grows. Lavas and deep-sea sediments record a sequence of normal and reversed intervals — the Geomagnetic Polarity Time Scale (GPTS) used for global correlation — and the physical basis of seafloor magnetic stripes.'),
    symbols: [
        { sym: '\\mathbf{B}_{\\text{今}}', name: t('现今极性场', 'present-polarity field'), unit: 'T' },
        { sym: '\\mathbf{B}_{\\text{倒转}}', name: t('倒转极性场', 'reversed-polarity field'), unit: 'T' },
    ],
    conditions: {
        applies: [t('地磁场长期演化', 'Long-term evolution of the geomagnetic field')],
        assumes: [t('倒转以偶极反转为主', 'Reversal dominated by dipole sign flip')],
        breaks: [t('倒转过渡期非偶极显著', 'Non-dipole field dominant during transition')],
    },
    links: {
        upstream: [{ id: 'mag-thermal-remanence' }, { id: 'mag-earth-dipole-moment' }],
        downstream: [{ id: 'mag-marine-anomaly-stripe', note: t('倒转 + 扩张 = 磁条带', 'Reversal + spreading = magnetic stripes') }],
    },
    refs: [{ text: 'Cande & Kent (1995), JGR; GPTS chronology' }],
};
export default magGeomagneticReversal;
//# sourceMappingURL=mag-geomagnetic-reversal.js.map