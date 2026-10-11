import { t } from '../../core/types.js';
/** phys-wave-speed-relation */
const physWaveSpeedRelation = {
    id: 'phys-wave-speed-relation',
    name: t('波速、波长与频率关系', 'Wave Speed, Wavelength and Frequency'),
    aliases: { zh: ['v=λf', '波速公式'], en: ['wave speed relation', 'v = λf'] },
    node: 'S18.5',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.VEL', 'Q.FREQ'],
        keywords: t('波速 波长 频率 v=λf 周期', 'wave speed wavelength frequency v lambda f period'),
    },
    audience: 'highschool',
    complete: 'L1',
    statement: {
        main: String.raw `v=\lambda f=\frac{\lambda}{T}=\frac{\omega}{k}`,
    },
    meaning: t('波速 v 等于波长 λ 乘以频率 f：每秒钟波源振动 f 次、每次铺开一个波长 λ，于是波前每秒前进 λf。波速由介质决定（空气中声速约 340 m/s），与频率无关；频率由波源决定，波长则是两者相除的结果。', 'The wave speed v is the wavelength λ times the frequency f: each second the source vibrates f times and each vibration spreads one wavelength λ, so the front advances λf per second. The speed is set by the medium (sound ≈ 340 m/s in air), not by the frequency; frequency is set by the source, and wavelength follows from the ratio.'),
    symbols: [
        { sym: 'v', name: t('波速', 'wave speed'), unit: 'm/s' },
        { sym: '\\lambda', name: t('波长（此处为波长）', 'wavelength (here λ means wavelength)'), unit: 'm' },
        { sym: 'f', name: t('频率', 'frequency'), unit: 'Hz' },
        { sym: 'T', name: t('周期', 'period'), unit: 's' },
    ],
    conditions: {
        applies: [t('任意线性波', 'Any linear wave')],
        assumes: [t('介质均匀', 'Uniform medium')],
        breaks: [t('色散介质中 v 与 f 有关', 'In dispersive media v depends on f')],
    },
    links: {
        upstream: [{ id: 'phys-wave-equation-1d' }],
        seealso: [{ id: 'wavenumber-wavelength' }, { id: 'angular-frequency' }],
    },
};
export default physWaveSpeedRelation;
//# sourceMappingURL=phys-wave-speed-relation.js.map