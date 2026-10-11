import { t } from '../../core/types.js';
/** gravity-centrifugal-effect */
const gravityCentrifugalEffect = {
    id: 'gravity-centrifugal-effect',
    name: t('地球自转的离心力效应', 'Centrifugal Effect of Earth Rotation'),
    aliases: { zh: ['离心力', '自转效应'], en: ['centrifugal force', 'rotational effect'] },
    node: 'S14.2',
    tags: {
        math: ['MATH.GEOM', 'MATH.VECTOR'],
        method: ['METH.GRAV'],
        quantity: ['Q.GRAV'],
        keywords: t('离心力 自转角速度 纬度 赤道', 'centrifugal force rotation angular velocity equator'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `g_{\text{cf}}(\varphi)=\omega^{2}R\cos^{2}\varphi`,
        variants: [
            { name: t('赤道离心加速度', 'equatorial centrifugal acceleration'), latex: String.raw `g_{\text{cf, eq}}=\omega^{2}R\approx0.0339\ \mathrm{m/s^{2}}\approx34900\ \mathrm{mGal}` },
        ],
    },
    meaning: t('随地球自转，地面质点受到背离自转轴的离心力。它在赤道最大、两极为零，是正常重力"赤道小、两极大"趋势的主要成因之一，也使地球成为赤道鼓起、两极略扁的旋转椭球。离心力与引力叠加后得到的是"重力"（有效重力），而不是纯引力。', 'A point on the rotating Earth feels a centrifugal force away from the spin axis. It is maximum at the equator and zero at the poles, and is a main reason normal gravity is smaller at the equator — it also makes the Earth an oblate ellipsoid. Gravity (effective gravity) is gravitation plus this centrifugal term, not pure attraction.'),
    symbols: [
        { sym: 'g_{\\text{cf}}', name: t('离心加速度', 'centrifugal acceleration'), unit: 'm/s²' },
        { sym: '\\omega', name: t('地球自转角速度', 'Earth angular rotation rate'), unit: 'rad/s', typical: '7.292×10⁻⁵' },
        { sym: 'R', name: t('地球半径', 'Earth radius'), unit: 'm', typical: '6.371×10⁶' },
        { sym: '\\varphi', name: t('地理纬度', 'geographic latitude'), unit: '°' },
    ],
    conditions: {
        applies: [t('旋转参考系（随地球一起转）', 'Rotating (Earth-fixed) frame')],
        assumes: [t('地球刚体自转', 'Rigid-body rotation')],
        breaks: [t('航天器轨道参考系中不存在', 'Absent in inertial/orbital frames')],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('到自转轴的距离 ρ=R cosφ', 'Distance to axis ρ=R cosφ'),
            latex: String.raw `\rho=R\cos\varphi` },
        { n: 2, op: 'physics', title: t('离心加速度 a=ω²ρ', 'Centrifugal acceleration a=ω²ρ'),
            latex: String.raw `a=\omega^{2}\rho=\omega^{2}R\cos\varphi` },
        { n: 3, op: 'geometry', title: t('取其垂直分量影响重力', 'Take vertical component affecting gravity'),
            latex: String.raw `g_{\text{cf}}=a\cos\varphi=\omega^{2}R\cos^{2}\varphi` },
        { n: 4, op: 'result', title: t('赤道值约 34900 mGal', 'Equatorial value ≈34900 mGal'),
            latex: String.raw `g_{\text{cf, eq}}=\omega^{2}R\approx0.0339\ \mathrm{m/s^{2}}` },
    ],
    links: {
        upstream: [{ id: 'gravity-normal-formula', note: t('离心力是正常重力的组成部分', 'Centrifugal term builds the normal gravity') }],
        seealso: [{ id: 'gravity-spherical-harmonics-j2' }],
    },
    refs: [{ text: 'Hofmann-Wellenhof & Moritz, Physical Geodesy, §5' }],
};
export default gravityCentrifugalEffect;
//# sourceMappingURL=gravity-centrifugal-effect.js.map