import { t } from '../../core/types.js';
/** phys-string-wave-speed */
const physStringWaveSpeed = {
    id: 'phys-string-wave-speed',
    name: t('弦上波速', 'Wave Speed on a String'),
    aliases: { zh: ['弦波速 v=√(T/μ)'], en: ['wave speed on a string', 'v = √(T/μ)'] },
    node: 'S18.5',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.VEL'],
        keywords: t('弦上波速 张力 线密度 吉他 调音', 'string wave speed tension linear density guitar tuning'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `v=\sqrt{\frac{T}{\mu}}`,
    },
    meaning: t('绷紧的弦上，横波传播速度等于张力 T 除以单位长度质量 μ 的平方根：拉得越紧、弦越轻，波传得越快。吉他调音就是拧旋钮改变张力 T，从而改变波速、改变音高；粗弦 μ 大、波速慢、音低。', 'On a taut string the transverse wave speed is the square root of tension T over mass per unit length μ: tighter and lighter means faster. Guitar tuning twists the peg to change T and hence the speed and pitch; a thick string has large μ, slow speed and a low note.'),
    symbols: [
        { sym: 'v', name: t('波速', 'wave speed'), unit: 'm/s' },
        { sym: 'T', name: t('弦的张力', 'string tension'), unit: 'N' },
        { sym: '\\mu', name: t('线密度（单位长度质量）', 'linear mass density'), unit: 'kg/m' },
    ],
    conditions: {
        applies: [t('绷紧、柔软的弦', 'A taut, flexible string')],
        assumes: [t('小振幅、弦无刚度', 'Small amplitude, string has no bending stiffness')],
        breaks: [t('粗实杆中波速含杨氏模量', 'Thick rods involve Young’s modulus in the speed')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('弦元受力由张力差提供', 'The string element is driven by the tension difference'), latex: String.raw `\Delta F\approx T\,\dfrac{\partial^{2}y}{\partial x^{2}}\,\mathrm{d}x` },
        { n: 2, op: 'physics', title: t('牛顿第二定律：质量=μdx', 'Newton II: mass = μ dx'), latex: String.raw `\mu\,\mathrm{d}x\,\dfrac{\partial^{2}y}{\partial t^{2}}=T\,\mathrm{d}x\,\dfrac{\partial^{2}y}{\partial x^{2}}` },
        { n: 3, op: 'algebra', title: t('与波动方程对比得 v²=T/μ', 'Match the wave equation: v² = T/μ'), latex: String.raw `v^{2}=\dfrac{T}{\mu}\;\Rightarrow\; v=\sqrt{\dfrac{T}{\mu}}` },
    ],
    links: { upstream: [{ id: 'phys-wave-equation-1d' }] },
};
export default physStringWaveSpeed;
//# sourceMappingURL=phys-string-wave-speed.js.map