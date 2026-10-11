import { t } from '../../core/types.js';
/** mag-chemical-remanence */
const magChemicalRemanence = {
    id: 'mag-chemical-remanence',
    name: t('化学剩磁（CRM）', 'Chemical Remanent Magnetization (CRM)'),
    aliases: { zh: ['化学剩磁 CRM'], en: ['chemical remanence', 'CRM'] },
    node: 'S15.3',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.MAG', 'METH.ROCK'],
        quantity: ['Q.MAG'],
        keywords: t('化学剩磁 CRM 成岩 氧化 新生磁性矿物', 'chemical remanence CRM diagenesis oxidation new magnetic minerals'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `\mathbf{M}_{\text{CRM}}\parallel \mathbf{H}_{\text{成岩}}\quad(\text{新生磁性矿物在生长时定向})`,
    },
    meaning: t('磁性矿物（如赤铁矿、胶状磁铁矿）在成岩、氧化或蚀变过程中新生出来时，会按当时地磁场方向定向并被锁在岩石里——这是化学剩磁。它的年龄往往不等于沉积年龄，而等于矿物生长年龄，是解释红层古地磁和某些沉积矿床磁性时必须警惕的"年轻"剩磁。', 'When magnetic minerals (haematite, authigenic magnetite) grow during diagenesis, oxidation or alteration, they align with the contemporary field and are locked in — chemical remanence. Its age is often not the depositional age but the mineral-growth age; it is the "young" remanence to watch when interpreting red-bed palaeomagnetism and certain sedimentary ore deposits.'),
    symbols: [
        { sym: '\\mathbf{M}_{\\text{CRM}}', name: t('化学剩磁方向', 'chemical remanence direction'), unit: 'A/m' },
        { sym: '\\mathbf{H}_{\\text{成岩}}', name: t('矿物生长时的地磁场', 'field during mineral growth'), unit: 'A/m' },
    ],
    conditions: {
        applies: [t('红层、成岩环境、氧化带', 'Red beds, diagenetic settings, oxidation zones')],
        assumes: [t('新矿物在弱场中缓慢生长', 'New minerals grow slowly in a weak field')],
        breaks: [t('重结晶会完全重置 CRM', 'Recrystallization fully resets CRM')],
    },
    links: {
        upstream: [{ id: 'mag-induced-vs-remanent' }],
        seealso: [{ id: 'mag-depositional-remanence' }, { id: 'mag-thermal-remanence' }],
    },
    refs: [{ text: 'Dunlop & Özdemir, Rock Magnetism, ch. 13' }],
};
export default magChemicalRemanence;
//# sourceMappingURL=mag-chemical-remanence.js.map