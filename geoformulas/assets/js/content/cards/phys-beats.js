import { t } from '../../core/types.js';
/** phys-beats */
const physBeats = {
    id: 'phys-beats',
    name: t('拍', 'Beats'),
    aliases: { zh: ['拍频', '拍现象'], en: ['beats', 'beat frequency'] },
    node: 'S18.5',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.TRANSFORM'],
        method: ['METH.PHYS'],
        quantity: ['Q.FREQ', 'Q.AMP'],
        keywords: t('拍 拍频 两个相近频率 调音 嗡嗡强弱', 'beats beat frequency two nearby frequencies tuning pulsing'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `f_{\text{beat}}=|f_1-f_2|`,
        variants: [
            { name: t('叠加后的振幅调制', 'amplitude modulation after superposition'), latex: String.raw `y=2A\cos\!\left(2\pi\dfrac{f_1-f_2}{2}t\right)\cos(2\pi\bar{f}t)` },
        ],
    },
    meaning: t('两个频率非常接近、响度相近的声波叠加时，听到的声音会周期性地「嗡—嗡—」强弱起伏，这就是拍。拍频等于两频率之差。钢琴师调音时反复弹两个音，直到拍消失（差为零），就说明音准了。', 'When two nearly equal, equally loud tones superpose, the combined sound swells and fades periodically — beats. The beat frequency equals the difference of the two. Piano tuners strike two notes and keep tightening until the beating disappears (difference zero), which means the pitch is set.'),
    symbols: [
        { sym: 'f_1,f_2', name: t('两列波频率', 'frequencies of the two waves'), unit: 'Hz' },
        { sym: 'f_{beat}', name: t('拍频', 'beat frequency'), unit: 'Hz' },
    ],
    conditions: {
        applies: [t('频率相近、同向传播的两列波', 'Two waves of close frequency travelling together')],
        assumes: [t('振幅相近', 'Comparable amplitudes')],
        breaks: [t('频率相差很大时听不出拍', 'No audible beats when frequencies differ greatly')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('叠加两个余弦', 'Superpose two cosines'), latex: String.raw `y=A\cos 2\pi f_1 t+A\cos 2\pi f_2 t` },
        { n: 2, op: 'identity', title: t('用和差化积', 'Use sum-to-product'), latex: String.raw `y=2A\cos\!\left(2\pi\dfrac{f_1-f_2}{2}t\right)\cos(2\pi\bar{f}t)` },
        { n: 3, op: 'result', title: t('包络频率即拍频', 'The envelope frequency is the beat'), latex: String.raw `f_{\text{beat}}=|f_1-f_2|` },
    ],
    links: { upstream: [{ id: 'phys-principle-superposition' }] },
};
export default physBeats;
//# sourceMappingURL=phys-beats.js.map