import { t } from '../../core/types.js';
/** rel-length-contraction */
const relLengthContraction = {
    id: 'rel-length-contraction',
    name: t('长度收缩', 'Length Contraction (Lorentz Contraction)'),
    aliases: { zh: ['动尺缩短', 'L=L₀/γ'], en: ['Lorentz contraction', 'L = L0/gamma'] },
    node: 'S20.4',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.GEOM', 'Q.VEL'],
        keywords: t('长度收缩 动尺缩短 固有长度 L0 运动方向', 'length contraction Lorentz contraction proper length along motion direction'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `L=\frac{L_0}{\gamma}=L_0\sqrt{1-v^2/c^2}`,
        variants: [
            { name: t('只在运动方向收缩，垂直方向不变', 'Only the motion direction contracts; transverse unchanged'), latex: String.raw `L_{\perp}=L_{0,\perp}` },
        ],
    },
    meaning: t('相对观察者运动的物体，沿运动方向的长度会缩短：固有长度 L₀（物体静止时测得的长度）在运动观察者看来变成 L=L₀/γ。注意只在运动方向收缩，垂直方向不缩。它和时间膨胀是同一枚硬币的两面——都来自 Lorentz 变换，且收缩是"测量效应"，不是真的把物体压坏。', 'An object moving relative to an observer is shortened along its direction of motion: its proper length L₀ (measured at rest) becomes L = L₀/γ for a moving observer. Only the motion direction contracts; transverse dimensions do not. Length contraction and time dilation are two sides of the same Lorentz-transformed coin, and the contraction is a measurement effect, not a physical crushing of the object.'),
    symbols: [
        { sym: 'L_0', name: t('固有长度（物体静止时测量）', 'proper length (measured at rest)'), unit: 'm' },
        { sym: 'L', name: t('运动观察者测得的长度', 'length measured by a moving observer'), unit: 'm' },
        { sym: '\\gamma', name: t('Lorentz 因子', 'Lorentz factor'), unit: '1' },
    ],
    conditions: {
        applies: [t('同时测量运动物体两端坐标', 'Endpoints measured simultaneously in the observer frame')],
        assumes: [t('长度沿相对运动方向', 'Length along the relative motion direction')],
        breaks: [t('垂直于运动方向不收缩', 'No contraction perpendicular to motion')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('由 Lorentz 变换同时测两端 Δt=0', 'Measure both ends simultaneously, Δt = 0, via Lorentz transform'), latex: String.raw `\Delta x'=\gamma(\Delta x-v\Delta t)=\gamma\Delta x` },
        { n: 2, op: 'algebra', title: t('整理得收缩', 'Rearrange for contraction'), latex: String.raw `L=\Delta x=\frac{\Delta x'}{\gamma}=\frac{L_0}{\gamma}` },
    ],
    links: {
        upstream: [{ id: 'rel-time-dilation' }, { id: 'rel-lorentz-transformation' }],
        downstream: [{ id: 'rel-relativistic-momentum' }],
    },
    refs: [{ text: 'Taylor & Wheeler, Spacetime Physics, Ch. 3' }],
};
export default relLengthContraction;
//# sourceMappingURL=rel-length-contraction.js.map