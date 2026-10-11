import { t } from '../../core/types.js';
/** mag-depositional-remanence */
const magDepositionalRemanence = {
    id: 'mag-depositional-remanence',
    name: t('沉积剩磁（DRM）', 'Depositional Remanent Magnetization (DRM)'),
    aliases: { zh: ['沉积剩磁 DRM', '碎屑剩磁'], en: ['depositional remanence', 'DRM'] },
    node: 'S15.3',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.MAG', 'METH.ROCK'],
        quantity: ['Q.MAG'],
        keywords: t('沉积剩磁 DRM 沉积物 古纬度', 'depositional remanence DRM sediments palaeolatitude'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `\mathbf{M}_{\text{DRM}}\parallel \mathbf{H}_{\text{古}}\quad(\text{沉积时记录})`,
    },
    meaning: t('磁性颗粒在水中沉降时，受地磁场定向排列，被沉积物掩埋后保留其方向——这是沉积剩磁。它的可靠性低于火成岩 TRM，因为沉积后压实、生物扰动会使颗粒倾斜偏浅（倾角浅化），但它能记录数百万年连续的磁场变化，是古地磁柱和极性年表的主要来源。', 'Magnetic grains settling through water align with the geomagnetic field and are locked in by burial — depositional remanence. It is less reliable than igneous TRM because compaction and bioturbation shallow the inclination, yet it records continuous field changes over millions of years and is the main source of palaeomagnetic stratigraphy and the polarity timescale.'),
    symbols: [
        { sym: '\\mathbf{M}_{\\text{DRM}}', name: t('沉积剩磁方向', 'depositional remanence direction'), unit: 'A/m' },
        { sym: '\\mathbf{H}_{\\text{古}}', name: t('沉积时的古地磁场', 'ancient field at deposition'), unit: 'A/m' },
    ],
    conditions: {
        applies: [t('海相、湖相沉积岩', 'Marine and lacustrine sediments')],
        assumes: [t('沉积后无显著扰动', 'Post-depositional disturbance limited')],
        breaks: [t('倾角浅化、压实、胶结后改造', 'Inclination shallowing, compaction, diagenesis')],
    },
    links: {
        upstream: [{ id: 'mag-induced-vs-remanent' }],
        downstream: [{ id: 'mag-marine-anomaly-stripe' }],
    },
    refs: [{ text: 'Tauxe, Palaeomagnetic Principles and Practice, ch. 4' }],
};
export default magDepositionalRemanence;
//# sourceMappingURL=mag-depositional-remanence.js.map