import { t } from '../../core/types.js';
/** rel-time-dilation */
const relTimeDilation = {
    id: 'rel-time-dilation',
    name: t('时间膨胀', 'Time Dilation'),
    aliases: { zh: ['动钟变慢', 'Δt=γΔτ'], en: ['moving clock runs slow', 'Delta t = gamma Delta tau'] },
    node: 'S20.4',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.TIME', 'Q.VEL'],
        keywords: t('时间膨胀 动钟变慢 固有时 γ μ子 双生子佯谬', 'time dilation moving clock slow proper time gamma muon twin paradox'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\Delta t=\gamma\,\Delta\tau,\qquad \gamma=\frac{1}{\sqrt{1-v^2/c^2}}`,
        variants: [
            { name: t('固有时 Δτ 最短', 'Proper time Δτ is the shortest'), latex: String.raw `\Delta\tau=\Delta t\sqrt{1-v^2/c^2}` },
        ],
    },
    meaning: t('相对观察者运动的钟走得比静止钟慢：运动参考系中同一地点先后发生两事件的时间间隔（固有时 Δτ），在静止观察者看来被拉长为 Δt=γΔτ。速度越接近 c，γ 越大，钟走得越慢。宇宙线 μ 子寿命只有 2.2 μs，却能飞穿大气层到达地面，正是因为它相对地面高速运动，它的"内部钟"慢了。', 'A clock moving relative to an observer runs slower than a stationary one: the time between two events at the same place in the moving frame (the proper time Δτ) is stretched to Δt = γΔτ as seen by the stationary observer. The nearer v is to c, the larger γ and the slower the clock. Cosmic-ray muons live only 2.2 μs yet reach the ground through the whole atmosphere precisely because, moving fast relative to Earth, their "internal clock" runs slow.'),
    symbols: [
        { sym: '\\Delta\\tau', name: t('固有时（同地事件时间间隔）', 'proper time (interval between events at the same place)'), unit: 's' },
        { sym: '\\Delta t', name: t('静止观察者测得的时间间隔', 'interval measured by the stationary observer'), unit: 's' },
        { sym: '\\gamma', name: t('Lorentz 因子', 'Lorentz factor'), unit: '1' },
        { sym: 'v', name: t('相对速度', 'relative speed'), unit: 'm/s' },
    ],
    conditions: {
        applies: [t('惯性系、两事件在运动系中同地发生', 'Inertial frames; the two events occur at the same place in the moving frame')],
        assumes: [t('匀速运动，无加速度', 'Uniform motion, no acceleration')],
        breaks: [t('加速过程（如掉头返回）涉及广义相对性，双生子佯谬由此解决', 'Acceleration (e.g. turning around) involves general aspects and resolves the twin paradox')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('光在运动车内上下反射一次', 'A photon bounces up-down once in a moving car'), latex: String.raw `\Delta\tau=\frac{2L}{c}` },
        { n: 2, op: 'geometry', title: t('地面看光走斜线', 'On the ground the photon travels a slant path'), latex: String.raw `\left(\frac{c\Delta t}{2}\right)^2=L^2+\left(\frac{v\Delta t}{2}\right)^2` },
        { n: 3, op: 'algebra', title: t('解出时间膨胀', 'Solve for time dilation'), latex: String.raw `\Delta t=\frac{\Delta\tau}{\sqrt{1-v^2/c^2}}=\gamma\Delta\tau` },
    ],
    viz: [
        {
            id: 'gamma-beta',
            level: 'V1',
            title: t('Lorentz 因子 γ 与收缩因子 1/γ 随 β 的变化', 'Lorentz factor gamma and 1/gamma versus beta'),
            xlabel: t('速度比 β=v/c', 'speed ratio beta = v/c'),
            ylabel: t('因子值', 'factor value'),
            controls: [
                { id: 'beta', label: t('（曲线为全集，无额外控件）', '(curve is a full profile, no control)'), min: 0, max: 1, step: 1, value: 0, unit: '1' },
            ],
            xRange: [0, 0.99],
            note: t('β≪1 时 γ≈1（日常无相对论效应）；β→1 时 γ 发散——这就是为什么实物粒子永远加速不到光速。1/γ 是长度收缩因子。', 'For beta ≪ 1, gamma ≈ 1 (no relativistic effect in daily life); as beta → 1, gamma diverges — why a material particle can never be accelerated to light speed. 1/gamma is the length-contraction factor.'),
            compute: () => {
                const ptsG = [];
                const ptsI = [];
                for (let i = 0; i <= 400; i++) {
                    const b = (i / 400) * 0.99;
                    const g = 1 / Math.sqrt(1 - b * b);
                    ptsG.push([b, g]);
                    ptsI.push([b, 1 / g]);
                }
                return [
                    { label: t('γ=1/√(1−β²)', 'gamma = 1/sqrt(1-beta^2)'), color: '#185FA5', points: ptsG },
                    { label: t('1/γ', '1/gamma'), color: '#BA7517', points: ptsI },
                ];
            },
        },
    ],
    links: {
        upstream: [{ id: 'rel-lorentz-transformation' }],
        downstream: [{ id: 'rel-length-contraction' }, { id: 'rel-mass-energy-equivalence' }],
    },
    refs: [{ text: 'Taylor & Wheeler, Spacetime Physics, Ch. 3' }],
};
export default relTimeDilation;
//# sourceMappingURL=rel-time-dilation.js.map