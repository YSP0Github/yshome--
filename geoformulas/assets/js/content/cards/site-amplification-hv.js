import { t } from '../../core/types.js';
/** site-amplification-hv */
const siteAmplificationHv = {
    id: 'site-amplification-hv',
    name: t('H/V 谱比与场地共振频率', 'H/V Spectral Ratio & Site Resonance'),
    aliases: { zh: ['H/V 谱比', 'Nakamura 方法', '场地放大'], en: ['H/V ratio', 'Nakamura method', 'site amplification'] },
    node: 'S8.4',
    tags: {
        math: ['MATH.FOURIER', 'MATH.STAT'],
        method: ['METH.HAZARD', 'METH.INSTR'],
        quantity: ['Q.AMP', 'Q.FREQ'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `\frac{H}{V}(f)=\frac{\sqrt{|H_1(f)|^{2}+|H_2(f)|^{2}}}{\sqrt{3}\,|V(f)|},\qquad f_0=\frac{V_{S}}{4H}`,
        variants: [
            { name: t('土层的一阶共振频率', 'Fundamental resonance of a soil layer'), latex: String.raw `f_0=\frac{V_S}{4H}` },
            { name: t('第 n 阶共振', 'The n-th resonance'), latex: String.raw `f_n=\frac{(2n-1)V_S}{4H},\qquad n=1,2,\ldots` },
        ],
    },
    meaning: t('把地面运动记录的水平分量谱除以垂直分量谱，得到的 H/V 曲线在土层共振频率处会出现明显峰值。这是 Nakamura 1989 年提出的方法：只用单台的背景噪声（不需要参考基岩台）就能估计软土层的共振频率与厚度，成本极低，因此在场地效应普查中被大规模使用。要注意它给出的是共振频率，放大倍数仍需谨慎。', 'Dividing the horizontal-component spectrum by the vertical-component spectrum gives an H/V curve with a clear peak at the soil resonance frequency. Proposed by Nakamura in 1989, the method estimates the resonance frequency and thickness of soft soil from ambient noise at a single station, with no reference rock site needed. Its very low cost has made it standard for site-effect reconnaissance. Note that it yields the resonance frequency reliably, but the amplification factor requires caution.'),
    symbols: [
        { sym: 'H/V', name: t('水平/垂直谱比', 'horizontal-to-vertical spectral ratio'), unit: '无量纲', typical: '1 – 10' },
        { sym: 'f_0', name: t('场地基本共振频率', 'fundamental site resonance frequency'), unit: 'Hz', typical: '0.2 – 10' },
        { sym: 'V_S', name: t('土层剪切波速度', 'shear-wave velocity of the soil layer'), unit: 'm/s', typical: '100 – 800' },
        { sym: 'H', name: t('土层厚度', 'soil layer thickness'), unit: 'm', typical: '5 – 500' },
    ],
    conditions: {
        applies: [t('软土覆盖在坚硬基岩上的一维场地', 'One-dimensional sites with soft soil over stiff bedrock')],
        assumes: [
            t('土层与基岩阻抗反差大', 'Strong impedance contrast between soil and bedrock'),
            t('噪声源主要为面波或体波，且分布平稳', 'Noise sources are mainly surface or body waves, statistically stationary'),
        ],
        breaks: [t('二维/三维盆地效应、倾斜基岩时，H/V 峰不对应 f₀', 'In 2D/3D basin settings or with dipping bedrock the H/V peak does not correspond to f₀')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('土层中上行波与下行波叠加', 'Superpose upgoing and downgoing waves in the layer'),
            latex: String.raw `u(z)=A\,e^{i k z}+B\,e^{-ikz}` },
        { n: 2, op: 'physics', title: t('自由表面应力为零、底部为刚性边界', 'Zero traction at the free surface, rigid base'),
            latex: String.raw `\left.\frac{\partial u}{\partial z}\right|_{z=0}=0,\qquad u(H)=0` },
        { n: 3, op: 'algebra', title: t('本征值条件', 'Eigenvalue condition'),
            latex: String.raw `\cos(kH)=0\;\Longrightarrow\; kH=\frac{(2n-1)\pi}{2}` },
        { n: 4, op: 'result', title: t('换算成频率', 'Convert to frequency'),
            latex: String.raw `k=\frac{2\pi f}{V_S}\;\Longrightarrow\; f_n=\frac{(2n-1)V_S}{4H}` },
    ],
    viz: [
        {
            id: 'hv-resonance',
            level: 'V1',
            title: t('共振频率随土层厚度与速度的变化', 'Resonance frequency versus layer thickness and velocity'),
            xlabel: t('土层厚度 H (m)', 'soil thickness H (m)'),
            ylabel: t('共振频率 f₀ (Hz)', 'resonance frequency f₀ (Hz)'),
            xScale: 'log',
            yScale: 'log',
            controls: [
                { id: 'vs', label: t('土层 V_S', 'soil V_S'), min: 100, max: 800, step: 10, value: 300, unit: 'm/s' },
            ],
            compute: (p) => {
                const vs = p['vs'];
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const H = 5 * Math.pow(10, (i / 200) * 2);
                    pts.push([H, vs / (4 * H)]);
                }
                return [{ label: t('f₀ = V_S/(4H)', 'f₀ = V_S/(4H)'), color: '#185FA5', points: pts }];
            },
            note: t('30 m 厚、V_S = 300 m/s 的土层共振在 2.5 Hz —— 正好落在多数建筑的自振频率范围内。', 'A 30 m layer with V_S = 300 m/s resonates at 2.5 Hz, right in the range of natural frequencies of many buildings.'),
        },
    ],
    example: {
        title: t('Mexico City 式的软土场地', 'A Mexico City style soft-soil site'),
        input: t('V_S = 80 m/s，H = 40 m', 'V_S = 80 m/s, H = 40 m'),
        steps: [t('f₀ = 80/(4×40) = 0.5 Hz', 'f₀ = 80/(4×40) = 0.5 Hz')],
        output: t('0.5 Hz 的共振 —— 1985 年墨西哥城地震中高层建筑的灾难性破坏正源于此', 'A 0.5 Hz resonance, the cause of the catastrophic damage to high-rise buildings in the 1985 Mexico City earthquake'),
    },
    links: {
        seealso: [{ id: 'ground-motion-parameters', note: t('场地效应在地震动参数上的体现', 'How site effects show up in ground-motion parameters') }],
    },
    refs: [{ text: 'Nakamura (1989), Quarterly Report of RTRI, 30' }, { text: 'Bard (1999), in Effects of Surface Geology on Seismic Motion' }],
};
export default siteAmplificationHv;
//# sourceMappingURL=site-amplification-hv.js.map