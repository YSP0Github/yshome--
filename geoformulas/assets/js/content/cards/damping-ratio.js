import { t } from '../../core/types.js';
/** damping-ratio */
const dampingRatio = {
    id: 'damping-ratio',
    name: t('阻尼比与品质因子的关系', 'Relation between Damping Ratio and Q'),
    aliases: { zh: ['阻尼比'], en: ['damping ratio', 'damping factor', 'Q and damping'] },
    node: 'S8.1',
    tags: {
        math: ['MATH.DIFF', 'MATH.COMPLEX'],
        method: ['METH.INSTR'],
        quantity: ['Q.AMP', 'Q.FREQ'],
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\zeta=\frac{1}{2Q},\qquad Q=\frac{1}{2\zeta}`,
        variants: [
            { name: t('二阶系统的标准形式', 'Standard form of a second-order system'), latex: String.raw `\ddot{x}+2\zeta\omega_n\dot{x}+\omega_n^{2}x=0,\qquad \omega_n=\sqrt{\frac{k}{m}}` },
            { name: t('欠阻尼时的衰减振荡', 'Underdamped decaying oscillation'), latex: String.raw `x(t)=A\,e^{-\zeta\omega_n t}\cos\!\left(\omega_d t\right),\qquad \omega_d=\omega_n\sqrt{1-\zeta^{2}}` },
            { name: t('对数衰减率', 'Logarithmic decrement'), latex: String.raw `\delta=\ln\frac{x_n}{x_{n+1}}=\frac{2\pi\zeta}{\sqrt{1-\zeta^{2}}}\approx\frac{\pi}{Q}` },
        ],
    },
    meaning: t('阻尼比 ζ 是工程师的语言，品质因子 Q 是物理学家的语言，两者只差一个因子 2。地震计的阻尼通常调到 ζ = 0.7 左右（所谓 Butterworth 条件），这样通带最平坦、阶跃响应过冲最小 —— 你在地震计手册上看到的「阻尼 0.707」就是它。', 'Damping ratio ζ is the language of engineers, quality factor Q that of physicists, and the two differ only by a factor of two. Seismometers are usually damped to about ζ = 0.7, the Butterworth condition, which gives the flattest passband and minimal overshoot — that is the "0.707 damping" quoted in seismometer manuals.'),
    symbols: [
        { sym: '\\zeta', name: t('阻尼比', 'damping ratio'), unit: '无量纲', typical: '0.6 – 0.8（地震计）' },
        { sym: 'Q', name: t('品质因子', 'quality factor'), unit: '无量纲' },
        { sym: '\\omega_n', name: t('无阻尼固有角频率', 'undamped natural angular frequency'), unit: 'rad/s' },
        { sym: '\\omega_d', name: t('有阻尼振荡角频率', 'damped oscillation angular frequency'), unit: 'rad/s' },
        { sym: '\\delta', name: t('对数衰减率', 'logarithmic decrement'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('二阶线性振子（地震计、结构、单自由度体系）', 'Second-order linear oscillators (seismometers, structures, SDOF systems)')],
        assumes: [t('黏性阻尼、线性系统', 'Viscous damping, linear system')],
        breaks: [t('摩擦阻尼、滞回阻尼等非黏性机制不能用单一 ζ 描述', 'Frictional or hysteretic damping cannot be described by a single ζ')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('写出二阶系统的标准形式', 'Write the standard second-order form'),
            latex: String.raw `\ddot{x}+2\zeta\omega_n\dot{x}+\omega_n^{2}x=0` },
        { n: 2, op: 'identity', title: t('与含 Q 的形式对比', 'Compare with the form containing Q'),
            latex: String.raw `\ddot{x}+\frac{\omega_n}{Q}\dot{x}+\omega_n^{2}x=0` },
        { n: 3, op: 'result', title: t('系数相等即得到关系', 'Matching coefficients gives the relation'),
            latex: String.raw `2\zeta=\frac{1}{Q}\;\Longrightarrow\; \zeta=\frac{1}{2Q}` },
    ],
    viz: [
        {
            id: 'damped-response',
            level: 'V1',
            title: t('不同阻尼比下的自由振动', 'Free oscillation for different damping ratios'),
            xlabel: t('时间 (s)', 'time (s)'),
            ylabel: t('位移（相对）', 'displacement (relative)'),
            controls: [
                { id: 'z', label: t('阻尼比 ζ', 'damping ratio ζ'), min: 0.05, max: 1.0, step: 0.01, value: 0.7 },
            ],
            compute: (p) => {
                const z = p['z'];
                const wn = 2 * Math.PI;
                const pts = [];
                for (let i = 0; i <= 600; i++) {
                    const t = (i / 600) * 4;
                    const wd = wn * Math.sqrt(Math.abs(1 - z * z));
                    const val = z < 1 ? Math.exp(-z * wn * t) * Math.cos(wd * t) : Math.exp(-wn * t) * (1 + wn * t);
                    pts.push([t, val]);
                }
                return [{ label: t('x(t)', 'x(t)'), color: '#185FA5', points: pts }];
            },
            note: t('ζ = 0.7 时过冲约 4.6%，且几乎立刻稳定 —— 这正是地震计选它的原因。', 'At ζ = 0.7 the overshoot is about 4.6% and the system settles almost immediately — exactly why seismometers use it.'),
        },
    ],
    links: {
        upstream: [{ id: 'seismometer-equation', note: t('地震计就是这个二阶系统', 'The seismometer is this second-order system') }],
        seealso: [{ id: 'quality-factor-q', note: t('Q 的定义', 'Definition of Q') }],
    },
    refs: [{ text: 'Havskov & Alguacil, Instrumentation in Earthquake Seismology' }],
};
export default dampingRatio;
//# sourceMappingURL=damping-ratio.js.map