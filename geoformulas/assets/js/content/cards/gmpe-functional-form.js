import { t } from '../../core/types.js';
/** gmpe-functional-form */
const gmpeFunctionalForm = {
    id: 'gmpe-functional-form',
    name: t('地震动预测方程的函数形式', 'Functional Form of Ground-motion Prediction Equations'),
    aliases: { zh: ['GMPE', '衰减关系'], en: ['GMPE', 'ground-motion prediction equation', 'attenuation relation'] },
    node: 'S11.2',
    tags: {
        math: ['MATH.STAT', 'MATH.APPROX'],
        method: ['METH.HAZARD'],
        quantity: ['Q.HAZARD', 'Q.AMP'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `\ln Y=f_{\text{mag}}(M)+f_{\text{dist}}(R,M)+f_{\text{site}}+\varepsilon,\qquad \varepsilon\sim N(0,\sigma)`,
        variants: [
            { name: t('震级项（含饱和）', 'Magnitude term (with saturation)'), latex: String.raw `f_{\text{mag}}=\begin{cases} b_1 M & M\le M_h\\ b_1M_h+b_2(M-M_h) & M>M_h \end{cases}` },
            { name: t('距离项（含几何扩散与滞弹性衰减）', 'Distance term (geometric spreading and anelastic decay)'), latex: String.raw `f_{\text{dist}}=\left(c_1+c_2M\right)\ln\sqrt{R^{2}+h^{2}}+c_3\sqrt{R^{2}+h^{2}}` },
            { name: t('总标准差分解', 'Decomposition of the total sigma'), latex: String.raw `\sigma^{2}=\tau^{2}+\phi^{2}\quad(\text{事件间} + \text{事件内})` },
        ],
    },
    meaning: t('GMPE（也叫衰减关系）是「给定震级、距离、场地条件，预测地震动有多大」的回归公式。它的每一项都对应一个物理机制：震级项在大震时斜率变小（震级饱和），距离项里的 ln R 是几何扩散、线性 R 项是滞弹性吸收，场地项 Vs30 体现土层放大。它和它右边那个 σ，一起决定了危险性分析的结果。', 'A GMPE, also called an attenuation relation, is a regression formula predicting how strong shaking will be given magnitude, distance and site condition. Each term maps to a physical mechanism: the magnitude term flattens for large earthquakes (magnitude saturation); in the distance term ln R represents geometrical spreading and the linear R term anelastic absorption; the Vs30 site term captures soil amplification. Together with σ, it determines the outcome of any hazard analysis.'),
    symbols: [
        { sym: 'Y', name: t('目标地震动参数（PGA、Sa 等）', 'target ground-motion parameter (PGA, Sa, …)'), unit: 'g' },
        { sym: 'M', name: t('震级', 'magnitude'), unit: '无量纲' },
        { sym: 'R', name: t('距离（震源距或断层距）', 'distance (hypocentral or rupture distance)'), unit: 'km' },
        { sym: 'h', name: t('虚拟深度，避免 R→0 时发散', 'fictitious depth preventing divergence as R → 0'), unit: 'km', typical: '4 – 10' },
        { sym: '\\sigma,\\tau,\\phi', name: t('总、事件间、事件内标准差', 'total, between-event and within-event standard deviations'), unit: 'ln 单位', typical: '0.5 – 0.8' },
    ],
    conditions: {
        applies: [t('给定震级—距离—场地条件下预测地震动', 'Predicting ground motion for given magnitude, distance and site')],
        assumes: [t('回归数据覆盖目标区域与震级—距离范围', 'The regression data cover the target region and magnitude–distance range')],
        breaks: [t('外推到数据未覆盖的近场大震区（R < 10 km）时不确定性极大', 'Extrapolation into the near-field (R < 10 km) of large events, which data rarely cover, is highly uncertain')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('假设各因素可分离相乘', 'Assume the factors are separable and multiplicative'),
            latex: String.raw `Y=Y_{\text{mag}}(M)\cdot Y_{\text{dist}}(R)\cdot Y_{\text{site}}\cdot e^{\varepsilon}` },
        { n: 2, op: 'identity', title: t('取对数变加法', 'Taking logs makes it additive'),
            latex: String.raw `\ln Y=f_{\text{mag}}+f_{\text{dist}}+f_{\text{site}}+\varepsilon` },
        { n: 3, op: 'physics', title: t('几何扩散给出 ln R 项', 'Geometrical spreading gives the ln R term'),
            latex: String.raw `\text{体波}\propto\frac{1}{R}\;\Longrightarrow\; \ln Y\propto-\ln R` },
        { n: 4, op: 'physics', title: t('滞弹性吸收给出线性 R 项', 'Anelastic absorption gives the linear R term'),
            latex: String.raw `e^{-\pi f R/(Qc)}\;\Longrightarrow\; \ln Y\propto-R` },
        { n: 5, op: 'result', title: t('大震饱和用折线处理', 'Large-event saturation handled by a hinge'),
            latex: String.raw `f_{\text{mag}}=b_1M+b_2\max\left(0,M-M_h\right)` },
    ],
    viz: [
        {
            id: 'gmpe-curve',
            level: 'V1',
            title: t('PGA 随距离的衰减曲线', 'PGA attenuation with distance'),
            xlabel: t('断层距 R (km)', 'rupture distance R (km)'),
            ylabel: t('PGA (g)', 'PGA (g)'),
            xScale: 'log',
            yScale: 'log',
            controls: [
                { id: 'M', label: t('震级 M', 'magnitude M'), min: 4, max: 8.5, step: 0.1, value: 7 },
                { id: 'c3', label: t('滞弹性吸收系数', 'anelastic absorption coefficient'), min: 0, max: 0.01, step: 0.0005, value: 0.004, unit: '1/km' },
            ],
            compute: (p) => {
                const M = p['M'], c3 = p['c3'];
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const R = 1 * Math.pow(10, (i / 200) * 3);
                    const lnY = 0.6 * M - 1.0 * Math.log(Math.sqrt(R * R + 36)) - c3 * Math.sqrt(R * R + 36) - 3.0;
                    pts.push([R, Math.exp(lnY)]);
                }
                return [{ label: t('PGA(R)', 'PGA(R)'), color: '#185FA5', points: pts }];
            },
            note: t('近场曲线被 h² 项「抹平」，避免了 R→0 时的奇点 —— 这正是虚拟深度的作用。', 'The near-field curve is smoothed by the h² term, removing the singularity as R → 0 — exactly the role of the fictitious depth.'),
        },
    ],
    links: {
        upstream: [{ id: 'ground-motion-parameters', note: t('被预测的量大', 'Defines the predicted quantity') }],
        downstream: [{ id: 'psha-integral', note: t('GMPE 是 PSHA 的输入', 'GMPEs are the input to PSHA') }],
    },
    refs: [{ text: 'Abrahamson et al. (2014), Earthquake Spectra, 30 (NGA-West2)' }],
};
export default gmpeFunctionalForm;
//# sourceMappingURL=gmpe-functional-form.js.map