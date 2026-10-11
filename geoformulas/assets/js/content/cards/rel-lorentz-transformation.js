import { t } from '../../core/types.js';
/** rel-lorentz-transformation */
const relLorentzTransformation = {
    id: 'rel-lorentz-transformation',
    name: t('Lorentz 变换', 'Lorentz Transformation'),
    aliases: { zh: ['洛伦兹变换', 'γ=1/√(1−β²)'], en: ['Lorentz transformation', 'gamma = 1/sqrt(1 - beta^2)'] },
    node: 'S20.4',
    tags: {
        math: ['MATH.LINALG', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.VEL', 'Q.TIME'],
        keywords: t('洛伦兹变换 Lorentz factor γ 坐标变换 相对论 β=v/c', 'Lorentz transformation Lorentz factor gamma coordinate transform relativity beta = v over c'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `x'=\gamma(x-vt),\qquad t'=\gamma\left(t-\frac{vx}{c^2}\right),\qquad \gamma=\frac{1}{\sqrt{1-v^2/c^2}}`,
        variants: [
            { name: t('逆变换', 'Inverse transformation'), latex: String.raw `x=\gamma(x'+vt'),\qquad t=\gamma\left(t'+\frac{vx'}{c^2}\right)` },
        ],
    },
    meaning: t('Lorentz 变换是两个惯性系之间坐标与时间的正确换算，取代 Galileo 变换。它引入 Lorentz 因子 γ=1/√(1−v²/c²)：低速时 γ≈1，退回经典；速度接近 c 时 γ→∞，时间和坐标互相"纠缠"（t′ 依赖于 x）。时间膨胀、长度收缩、同时性的相对性都是它的推论。', 'The Lorentz transformation is the correct conversion of coordinates and times between two inertial frames, replacing the Galilean one. It introduces the Lorentz factor γ = 1/√(1−v²/c²): at low speed γ ≈ 1 and it reduces to the classical form; near c, γ → ∞ and time and coordinates become entangled (t′ depends on x). Time dilation, length contraction and the relativity of simultaneity are all its consequences.'),
    symbols: [
        { sym: "x,x',t,t'", name: t('两系中的坐标与时间', 'coordinates and times in the two frames'), unit: 'm, s' },
        { sym: 'v', name: t('两系相对速度', 'relative speed of the two frames'), unit: 'm/s' },
        { sym: '\\gamma', name: t('Lorentz 因子', 'Lorentz factor'), unit: '1' },
        { sym: 'c', name: t('真空中光速', 'speed of light in vacuum'), unit: 'm/s' },
    ],
    conditions: {
        applies: [t('惯性系之间、沿 x 方向相对运动', 'Between inertial frames moving along x')],
        assumes: [t('t=t′=0 时两原点重合', 'Origins coincide at t = t′ = 0')],
        breaks: [t('加速系需广义相对论', 'Accelerated frames need general relativity')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('线性变换、相对性原理要求', 'Linearity and the relativity principle require'), latex: String.raw `x'=\gamma(x-vt)` },
        { n: 2, op: 'physics', title: t('光速不变：x=ct 必对应 x′=ct′', 'Constancy of c: x = ct must map to x′ = ct′'), latex: String.raw `ct'=\gamma(ct-vt)=\gamma t(c-v)` },
        { n: 3, op: 'algebra', title: t('解出 γ', 'Solve for γ'), latex: String.raw `\gamma=\frac{1}{\sqrt{1-v^2/c^2}},\quad t'=\gamma\left(t-\frac{vx}{c^2}\right)` },
    ],
    links: {
        upstream: [{ id: 'rel-galilean-transformation' }, { id: 'rel-sr-postulates' }],
        downstream: [{ id: 'rel-time-dilation' }, { id: 'rel-length-contraction' }, { id: 'rel-relativistic-velocity-addition' }],
    },
    refs: [{ text: 'Taylor & Wheeler, Spacetime Physics, Ch. 3' }],
};
export default relLorentzTransformation;
//# sourceMappingURL=rel-lorentz-transformation.js.map