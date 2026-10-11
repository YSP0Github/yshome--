import { t } from '../../core/types.js';
/** uem-lenz-law */
const uemLenzLaw = {
    id: 'uem-lenz-law',
    name: t('Lenz 定律', "Lenz's Law"),
    aliases: { zh: ['楞次定律', '感应电流方向'], en: ["Lenz's law", 'direction of induced current'] },
    node: 'S19.4',
    tags: {
        math: ['MATH.VECTOR'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('楞次定律 感应电流方向 阻碍磁通量变化 能量守恒', "Lenz's law induced current opposes flux change energy conservation"),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `\mathcal{E}_{\text{ind}}\ \text{的方向总是阻碍引起它的磁通量变化}`,
        variants: [
            { name: t('数学表达', 'Mathematical statement'), latex: String.raw `\mathcal{E}=-N\dfrac{d\Phi_{B}}{dt}\ \text{中的负号}` },
        ],
    },
    meaning: t('感应电流的方向总是使其自身产生的磁场去"阻碍"引起它的那个磁通量变化。它是能量守恒的必然结果：若感应电流助长变化，就会无中生有地获得能量。', 'The induced current always flows so that its own magnetic field opposes the flux change that produced it. It is a consequence of energy conservation: if the current reinforced the change, energy would appear from nowhere.'),
    symbols: [
        { sym: '\\mathcal{E}_{\\text{ind}}', name: t('感应电动势方向', 'direction of induced EMF'), unit: 'V' },
        { sym: '\\Phi_{B}', name: t('被阻碍的磁通量变化', 'opposed flux change'), unit: 'Wb' },
    ],
    conditions: {
        applies: [t('一切电磁感应现象中判断方向', 'Used to find the direction in any induction phenomenon')],
    },
    links: {
        upstream: [{ id: 'uem-faraday-law-emf' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §30' }],
};
export default uemLenzLaw;
//# sourceMappingURL=uem-lenz-law.js.map