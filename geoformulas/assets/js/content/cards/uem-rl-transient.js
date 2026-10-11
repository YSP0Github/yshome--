import { t } from '../../core/types.js';
/** uem-rl-transient */
const uemRlTransient = {
    id: 'uem-rl-transient',
    name: t('RL 电路暂态', 'RL Transients'),
    aliases: { zh: ['RL 暂态', '时间常数 τ=L/R'], en: ['RL transient', 'time constant L/R'] },
    node: 'S19.4',
    tags: {
        math: ['MATH.DIFF', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.TIME', 'Q.ELEC'],
        keywords: t('RL 暂态 时间常数 L/R 电流上升 衰减 自感', 'RL transient time constant L over R current rise decay self induction'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\tau=\frac{L}{R},\quad I(t)=\frac{\mathcal{E}}{R}\left(1-e^{-t/\tau}\right)\ (\text{接通}),\quad I(t)=I_{0}e^{-t/\tau}\ (\text{断开})`,
        variants: [
            { name: t('电感电压', 'Inductor voltage'), latex: String.raw `U_{L}(t)=\mathcal{E}\,e^{-t/\tau}` },
        ],
    },
    meaning: t('电感与电阻串联接电源时，电流因自感"惯性"而指数上升，时间常数 τ=L/R；断开电源后电流指数衰减。τ 越大电流变化越慢。这是与 RC 电路对偶的一阶暂态。', 'When an inductor and resistor are in series with a source, the current rises exponentially due to inductive "inertia" with time constant τ=L/R; after disconnection it decays exponentially. Larger τ means slower change. It is the first-order transient dual to the RC circuit.'),
    symbols: [
        { sym: '\\tau', name: t('时间常数', 'time constant'), unit: 's' },
        { sym: 'L', name: t('电感', 'inductance'), unit: 'H' },
        { sym: 'R', name: t('电阻', 'resistance'), unit: 'Ω' },
        { sym: 'I', name: t('电流', 'current'), unit: 'A' },
    ],
    conditions: {
        applies: [t('R 与 L 串联、接直流电源或短接', 'R and L in series, driven by DC source or shorted')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('KVL 列方程', 'Write KVL'),
            latex: String.raw `\mathcal{E}=IR+L\dfrac{dI}{dt}` },
        { n: 2, op: 'setup', title: t('一阶微分方程', 'First-order ODE'),
            latex: String.raw `\dfrac{dI}{dt}+\dfrac{R}{L}I=\dfrac{\mathcal{E}}{R}\cdot\dfrac{R}{L}` },
        { n: 3, op: 'result', title: t('解得上升曲线', 'Solve for rising current'),
            latex: String.raw `I(t)=\dfrac{\mathcal{E}}{R}\left(1-e^{-Rt/L}\right),\quad \tau=\dfrac{L}{R}` },
    ],
    viz: [
        {
            id: 'rl-curves',
            level: 'V2',
            title: t('RL 电流上升与衰减', 'RL current rise and decay'),
            xlabel: t('时间 t (τ 单位)', 'time t (in units of τ)'),
            ylabel: t('电流 I / (ε/R)', 'current I / (ε/R)'),
            xRange: [0, 6],
            controls: [
                { id: 'tau', label: t('时间常数 τ=L/R (ms)', 'time constant τ'), min: 1, max: 100, step: 1, value: 10, unit: 'ms' },
            ],
            compute: (p) => {
                void p['tau']; // shape in units of τ; τ only relabels physical time
                const rise = [];
                const decay = [];
                for (let i = 0; i <= 240; i++) {
                    const x = (i / 240) * 6;
                    rise.push([x, 1 - Math.exp(-x)]);
                    decay.push([x, Math.exp(-x)]);
                }
                return [
                    { label: t('接通 1−e^(−t/τ)', 'rise 1−e^(−t/τ)'), color: '#0F6E56', points: rise },
                    { label: t('断开 e^(−t/τ)', 'decay e^(−t/τ)'), color: '#BA7517', points: decay, dash: true },
                ];
            },
            note: t('t=τ 时上升到 63%、衰减剩 37%；约 5τ 趋于稳态。', 'At t=τ rise reaches 63% and decay keeps 37%; ~5τ to steady state.'),
        },
    ],
    links: {
        upstream: [{ id: 'uem-self-inductance' }, { id: 'uem-inductor-energy' }],
        seealso: [{ id: 'uem-rc-transient', note: t('对偶的 RC 暂态', 'dual RC transient') }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §30' }],
};
export default uemRlTransient;
//# sourceMappingURL=uem-rl-transient.js.map