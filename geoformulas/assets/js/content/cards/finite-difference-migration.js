import { t } from '../../core/types.js';
/** finite-difference-migration */
const finiteDifferenceMigration = {
    id: 'finite-difference-migration',
    name: t('有限差分偏移与单程波方程', 'Finite-difference Migration & the One-way Wave Equation'),
    aliases: { zh: ['15 度方程', '45 度方程', '旁轴近似'], en: ['15-degree equation', '45-degree equation', 'paraxial approximation'] },
    node: 'S3.5',
    tags: {
        math: ['MATH.DIFF', 'MATH.APPROX'],
        method: ['METH.EXPL', 'METH.INV'],
        quantity: ['Q.VEL', 'Q.FREQ'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `\frac{\partial \tilde P}{\partial z} = -\frac{i\omega}{v}\sqrt{1-\frac{v^{2}k_{x}^{2}}{\omega^{2}}}\;\tilde P`,
        variants: [
            { name: t('15° 旁轴方程', 'The 15° paraxial equation'), latex: String.raw `\sqrt{1-s^{2}} \approx 1-\frac{s^{2}}{2} \Longrightarrow \frac{\partial^{2}P}{\partial z\,\partial t} = -\frac{v}{2}\frac{\partial^{2}P}{\partial x^{2}}` },
            { name: t('45° Padé 近似', 'The 45° Padé approximation'), latex: String.raw `\sqrt{1-s^{2}} \approx \frac{1-\frac{3}{4}s^{2}}{1-\frac{1}{4}s^{2}}` },
            { name: t('倾角变量 s', 'The dip variable s'), latex: String.raw `s = \frac{v k_x}{\omega} = \sin\theta` },
        ],
    },
    meaning: t('完整波动方程允许波向上传播和向下传播；偏移只需要向下延拓的那一个方向。把平方根算符（单程波）用有理函数近似成可差分求解的形式，就得到了 15°、45° 等一系列有限差分偏移。近似阶数越高，能正确成像的倾角越陡。', 'The full wave equation admits both upgoing and downgoing waves; migration needs only the downgoing continuation. Approximating the square-root (one-way) operator by rational functions that can be differenced gives the 15°, 45°, … family of finite-difference migrations. The higher the order, the steeper the dip that can be imaged correctly.'),
    symbols: [
        { sym: '\\tilde{P}', name: t('频率—波数域波场', 'frequency–wavenumber wavefield'), unit: '振幅' },
        { sym: 'k_{x}', name: t('水平波数', 'horizontal wavenumber'), unit: '1/km' },
        { sym: 'k_{z}', name: t('垂直波数', 'vertical wavenumber'), unit: '1/km' },
        { sym: 's', name: t('归一化水平波数 = sin θ', 'normalised horizontal wavenumber = sin θ'), unit: '无量纲' },
        { sym: '\\theta', name: t('传播方向与竖直方向的夹角', 'propagation angle from vertical'), unit: '°' },
    ],
    conditions: {
        applies: [t('中等横向变速、需要陡倾角成像的叠后/叠前偏移', 'Post-/pre-stack migration with moderate lateral velocity variation and steep dips')],
        assumes: [
            t('单程（向下延拓）近似成立', 'The one-way (downward continuation) approximation holds'),
            t('速度场平滑', 'The velocity field is smooth'),
        ],
        breaks: [
            t('存在强多次波、回转波时单程波不成立，需逆时偏移', 'With strong multiples or turning waves the one-way assumption fails and RTM is needed'),
            t('15° 方程在倾角大于 15°–20° 时严重错误', 'The 15° equation is badly wrong for dips above 15°–20°'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('从标量波动方程的色散关系出发', 'Start from the scalar wave equation dispersion relation'),
            latex: String.raw `k_x^{2}+k_z^{2} = \frac{\omega^{2}}{v^{2}}` },
        { n: 2, op: 'algebra', title: t('解出 k_z 并取向下延拓的符号', 'Solve for k_z with the downgoing branch'),
            latex: String.raw `k_z = \frac{\omega}{v}\sqrt{1-\frac{v^{2}k_x^{2}}{\omega^{2}}}` },
        { n: 3, op: 'identity', title: t('向下延拓就是一个相移', 'Downward continuation is a phase shift'),
            latex: String.raw `\tilde P(z+\Delta z) = \tilde P(z)\,e^{-ik_z\Delta z}` },
        { n: 4, op: 'taylor', title: t('把平方根做 Taylor 展开得到 15° 方程', 'Taylor-expand the square root to get the 15° equation'),
            latex: String.raw `\sqrt{1-s^{2}} \approx 1-\frac{s^{2}}{2}\ \Longrightarrow\ \frac{\partial^{2}P}{\partial z\partial t} = -\frac{v}{2}\frac{\partial^{2}P}{\partial x^{2}}` },
        { n: 5, op: 'result', title: t('更高阶用 Padé 连分式', 'Higher orders use Padé continued fractions'),
            latex: String.raw `\sqrt{1-s^{2}} \approx \frac{1-\frac{3}{4}s^{2}}{1-\frac{1}{4}s^{2}}\quad (45^{\circ})` },
    ],
    viz: [
        {
            id: 'paraxial-accuracy',
            level: 'V1',
            title: t('各阶旁轴近似的精度随倾角变化', 'Accuracy of paraxial approximations versus dip'),
            xlabel: t('传播角 θ (°)', 'propagation angle θ (°)'),
            ylabel: t('k_z v / ω（真值 cos θ）', 'k_z v / ω (true value cos θ)'),
            controls: [
                { id: 'ord', label: t('Padé 阶数参数 a', 'Padé order parameter a'), min: 0, max: 0.25, step: 0.005, value: 0.25 },
            ],
            note: t('把 a 从 0 调到 0.25，能看到近似从 15° 改善到 45°：曲线贴合真值的角度范围明显变宽。', 'Moving a from 0 to 0.25 improves the approximation from 15° to 45°: the curve tracks the true value over a much wider angular range.'),
            compute: (p) => {
                const a = p['ord'];
                const exact = [];
                const p15 = [];
                const pad = [];
                for (let i = 0; i <= 180; i++) {
                    const deg = (i / 180) * 70;
                    const th = (deg * Math.PI) / 180;
                    const s2 = Math.sin(th) ** 2;
                    exact.push([deg, Math.cos(th)]);
                    p15.push([deg, 1 - s2 / 2]);
                    pad.push([deg, (1 - (0.75 + a) * s2) / (1 - a * s2)]);
                }
                return [
                    { label: t('精确 cos θ', 'exact cos θ'), color: '#888780', points: exact, dash: true },
                    { label: t('15° 近似', '15° approximation'), color: '#993C1D', points: p15 },
                    { label: t('Padé 近似', 'Padé approximation'), color: '#185FA5', points: pad },
                ];
            },
        },
    ],
    example: {
        title: t('30° 倾角时的误差', 'Error at 30° dip'),
        input: t('θ = 30°', 'θ = 30°'),
        steps: [
            t('真值 cos 30° = 0.866', 'True value cos 30° = 0.866'),
            t('15° 近似：1 − 0.25/2 = 0.875（误差 +1%）', '15° approximation: 1 − 0.25/2 = 0.875 (+1% error)'),
            t('45° 近似：(1 − 0.75×0.25)/(1 − 0.25×0.25) = 0.8125/0.9375 = 0.867（误差 +0.1%）', '45° approximation: (1 − 0.75×0.25)/(1 − 0.25×0.25) = 0.8125/0.9375 = 0.867 (+0.1% error)'),
        ],
        output: t('45° 方程在 30° 处的精度比 15° 方程高一个数量级', 'At 30° the 45° equation is an order of magnitude more accurate than the 15° one'),
    },
    links: {
        upstream: [
            { id: 'acoustic-wave-equation', note: t('出发点', 'The starting point') },
            { id: 'exploding-reflector-model', note: t('把反射问题变成延拓问题', 'Turns reflection into continuation') },
        ],
        seealso: [
            { id: 'phase-shift-migration', note: t('不做近似的精确相移', 'Exact phase shift without approximation') },
            { id: 'reverse-time-migration', note: t('完全不做单程近似', 'Avoids the one-way approximation entirely') },
        ],
    },
    refs: [{ text: 'Claerbout, J. F. (1985). Imaging the Earth’s Interior. Blackwell, ch. 2' }],
};
export default finiteDifferenceMigration;
//# sourceMappingURL=finite-difference-migration.js.map