import { t } from '../../core/types.js';
/** pole-zero-response */
const poleZeroResponse = {
    id: 'pole-zero-response',
    name: t('仪器响应的零极点表示', 'Pole–zero Representation of Instrument Response'),
    aliases: { zh: ['零极点', '仪器响应'], en: ['poles and zeros', 'instrument response', 'RESP file'] },
    node: 'S8.2',
    tags: {
        math: ['MATH.COMPLEX', 'MATH.FOURIER'],
        method: ['METH.INSTR', 'METH.PROC'],
        quantity: ['Q.AMP', 'Q.FREQ'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `T(s)=A_0\,\frac{\prod_{k=1}^{n_z}\left(s-z_k\right)}{\prod_{k=1}^{n_p}\left(s-p_k\right)},\qquad s=i\omega`,
        variants: [
            { name: t('频域形式', 'Frequency-domain form'), latex: String.raw `T(f)=A_0\,\frac{\prod_{k}\left(i2\pi f-z_k\right)}{\prod_{k}\left(i2\pi f-p_k\right)}` },
            { name: t('幅频与相频', 'Amplitude and phase response'), latex: String.raw `|T(f)|,\qquad \arg T(f)` },
        ],
    },
    meaning: t('任何线性时不变地震计，其响应都能写成复平面上若干零点与极点的比值。SEED 标准里的 RESP 文件存的就是这些零极点加上归一化因子 A₀。拿到它就能把「记录到的 counts」换算成「真实的地面运动」—— 这个过程叫去仪器响应，是所有定量地震学分析的第一步。', 'The response of any linear time-invariant seismometer can be written as a ratio of zeros and poles in the complex plane. A SEED RESP file stores exactly these zeros and poles plus a normalisation factor A₀. With them one converts recorded counts into true ground motion — removing the instrument response, the first step of every quantitative seismological analysis.'),
    symbols: [
        { sym: 'T(s)', name: t('传递函数', 'transfer function'), unit: 'counts / (m/s)' },
        { sym: 'z_k', name: t('零点', 'zeros'), unit: 'rad/s' },
        { sym: 'p_k', name: t('极点', 'poles'), unit: 'rad/s' },
        { sym: 'A_0', name: t('归一化因子', 'normalisation factor'), unit: '无量纲' },
        { sym: 's=i\\omega', name: t('复频率（Laplace 变量）', 'complex frequency (Laplace variable)'), unit: 'rad/s' },
    ],
    conditions: {
        applies: [t('线性、时不变的地震计与数据采集器', 'Linear, time-invariant seismometers and digitisers')],
        assumes: [t('仪器工作在线性范围内', 'The instrument operates within its linear range')],
        breaks: [t('强震导致仪器饱和、或存在非线性漂移时不适用', 'Not applicable when strong motion saturates the instrument or nonlinear drift is present')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把系统写成分式', 'Write the system as a rational function'),
            latex: String.raw `T(s)=\frac{b_0+b_1 s+\cdots}{a_0+a_1 s+\cdots}` },
        { n: 2, op: 'algebra', title: t('分子分母分别因式分解', 'Factor numerator and denominator'),
            latex: String.raw `T(s)=A_0\frac{\prod_k\left(s-z_k\right)}{\prod_k\left(s-p_k\right)}` },
        { n: 3, op: 'substitute', title: t('取 s = iω 得到频率响应', 'Set s = iω to get the frequency response'),
            latex: String.raw `T(i\omega)=A_0\frac{\prod_k\left(i\omega-z_k\right)}{\prod_k\left(i\omega-p_k\right)}` },
        { n: 4, op: 'result', title: t('幅值与相位', 'Amplitude and phase'),
            latex: String.raw `|T|=\sqrt{T\,T^{*}},\qquad \arg T=\arctan\frac{\operatorname{Im}T}{\operatorname{Re}T}` },
    ],
    viz: [
        {
            id: 'pole-zero-bode',
            level: 'V1',
            title: t('一个二阶地震计的幅频响应', 'Amplitude response of a second-order seismometer'),
            xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
            ylabel: t('|T| (dB)', '|T| (dB)'),
            xScale: 'log',
            controls: [
                { id: 'f0', label: t('固有频率 f₀', 'natural frequency f₀'), min: 0.002, max: 5, step: 0.002, value: 0.02, unit: 'Hz' },
                { id: 'h', label: t('阻尼比 h', 'damping ratio h'), min: 0.2, max: 1.5, step: 0.01, value: 0.7 },
            ],
            compute: (p) => {
                const f0 = p['f0'], h = p['h'];
                const pts = [];
                for (let i = 0; i <= 300; i++) {
                    const f = 0.001 * Math.pow(10, (i / 300) * 4);
                    const r = f / f0;
                    const mag = (r * r) / Math.sqrt((1 - r * r) ** 2 + (2 * h * r) ** 2);
                    pts.push([f, 20 * Math.log10(Math.max(mag, 1e-6))]);
                }
                return [{ label: t('|T(f)|', '|T(f)|'), color: '#185FA5', points: pts }];
            },
            note: t('对速度计而言，低于 f₀ 时响应按 f² 衰减；宽频带地震计的 f₀ 通常在 0.003–0.02 Hz。', 'For a velocity sensor the response falls as f² below f₀; broadband seismometers typically have f₀ between 0.003 and 0.02 Hz.'),
        },
    ],
    example: {
        title: t('STS-2 宽频带地震计（简化）', 'STS-2 broadband seismometer (simplified)'),
        input: t('3 个零点、5 个极点，f₀ ≈ 0.0083 Hz（120 s）', '3 zeros, 5 poles, f₀ ≈ 0.0083 Hz (120 s)'),
        steps: [
            t('读取 RESP 中的零极点列表', 'Read the pole–zero list from the RESP file'),
            t('补上 A₀ 与增益级', 'Append A₀ and the gain stages'),
            t('在目标频段做复数除法完成去卷积', 'Divide in the complex domain over the target band to deconvolve'),
        ],
        output: t('得到以 m/s 为单位的地面速度记录', 'A ground-velocity record in m/s'),
    },
    links: {
        upstream: [{ id: 'seismometer-equation', note: t('运动方程给出极点位置', 'The equation of motion gives the pole locations') }],
        downstream: [{ id: 'instrument-deconvolution', note: t('用它做反卷积', 'It is used for deconvolution') }],
    },
    refs: [{ text: 'SEED Reference Manual, IRIS' }, { text: 'Havskov & Alguacil, Instrumentation in Earthquake Seismology' }],
};
export default poleZeroResponse;
//# sourceMappingURL=pole-zero-response.js.map