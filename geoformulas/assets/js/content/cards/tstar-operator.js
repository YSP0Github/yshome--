import { t } from '../../core/types.js';
/** tstar-operator */
const tstarOperator = {
    id: 'tstar-operator',
    name: t('t* 算子', 'The t* Operator'),
    aliases: { zh: ['t星算子', '累积衰减'], en: ['t-star', 'cumulative attenuation'] },
    node: 'S6.2',
    tags: {
        math: ['MATH.FOURIER', 'MATH.COMPLEX'],
        method: ['METH.ATTEN', 'METH.TELE'],
        quantity: ['Q.AMP', 'Q.TIME'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw ` t^{*}=\int_{\text{ray}}\frac{\mathrm{d}s}{Q\,v(s)},\qquad A(f)=A_0\,e^{-\pi f t^{*}}`,
        variants: [
            { name: t('频谱的衰减形式', 'Attenuation in the spectral domain'), latex: String.raw `\ln A(f)=\ln A_0-\pi t^{*}f` },
            { name: t('用 ω 表示', 'In terms of ω'), latex: String.raw `A(\omega)=A_0\,e^{-\omega t^{*}/2}` },
        ],
    },
    meaning: t('t* 把沿整条射线路径的 Q 累积成一个只有「秒」量纲的单一参数。它的好处是：不管地下 Q 结构多复杂，只要测到频谱高频端的斜率，就能一次性得到整条路径的总衰减。这也是为什么实测谱的形状像一把尺子 —— ln A 对 f 的斜率就是 −πt*。', 't* collapses the Q accumulated along the entire ray path into a single parameter with dimensions of time. Its virtue is that no matter how complicated the subsurface Q structure is, measuring the high-frequency slope of the spectrum gives the total attenuation along the path in one shot. That is why a measured spectrum looks like a ruler: the slope of ln A against f is −πt*.'),
    symbols: [
        { sym: 't^{*}', name: t('累积衰减算子', 'cumulative attenuation operator'), unit: 's', typical: '0.1 – 5' },
        { sym: 'Q', name: t('品质因子', 'quality factor'), unit: '无量纲', typical: '50 – 1000' },
        { sym: 'v(s)', name: t('沿射线的速度', 'velocity along the ray'), unit: 'm/s' },
        { sym: 'A(f)', name: t('频率 f 处的振幅谱', 'amplitude spectrum at frequency f'), unit: '与位移同' },
    ],
    conditions: {
        applies: [t('沿射线路径的累积衰减效应', 'Attenuation accumulated along a ray path')],
        assumes: [
            t('Q 与频率无关（或已选定参考频段）', 'Q is frequency independent (or a reference band is chosen)'),
            t('几何扩散与场地效应已单独校正', 'Geometrical spreading and site effects have been corrected separately'),
        ],
        breaks: [t('Q 明显随频率变化时，谱不再是单一直线', 'When Q is strongly frequency dependent the spectrum is no longer a single straight line')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('振幅随距离的内禀衰减', 'Intrinsic decay of amplitude with distance'),
            latex: String.raw `A(x)=A_0\,e^{-\frac{\omega x}{2Qc}}`,
            note: t('空间衰减系数 α = ω/(2Qc)。', 'The spatial attenuation coefficient is α = ω/(2Qc).') },
        { n: 2, op: 'substitute', title: t('沿射线积分', 'Integrate along the ray'),
            latex: String.raw `A=A_0\exp\!\left[-\int\frac{\omega}{2Q(s)\,v(s)}\,\mathrm{d}s\right]` },
        { n: 3, op: 'setup', title: t('定义 t*', 'Define t*'),
            latex: String.raw ` t^{*}=\int_{\text{ray}}\frac{\mathrm{d}s}{Q\,v}` },
        { n: 4, op: 'result', title: t('写成频率的函数', 'Write as a function of frequency'),
            latex: String.raw `A(\omega)=A_0\,e^{-\omega t^{*}/2}\;\Longrightarrow\; A(f)=A_0\,e^{-\pi f t^{*}}`,
            note: t('取对数后是一条直线：ln A(f) = ln A₀ − π t* f。', 'Taking the logarithm gives a straight line: ln A(f) = ln A₀ − π t* f.') },
    ],
    links: {
        upstream: [{ id: 'quality-factor-q', note: t('Q 的定义', 'Definition of Q') }],
        downstream: [{ id: 'spectral-ratio-q', note: t('实测 t* 的标准方法', 'The standard way to measure t*') }],
    },
    refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.5' }, { text: 'Shearer, Introduction to Seismology, 2nd ed., §6.4' }],
};
export default tstarOperator;
//# sourceMappingURL=tstar-operator.js.map