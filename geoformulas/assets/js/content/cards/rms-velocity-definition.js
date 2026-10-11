import { t } from '../../core/types.js';
/** rms-velocity-definition */
const rmsVelocityDefinition = {
    id: 'rms-velocity-definition',
    name: t('均方根速度的定义与加权', 'Definition and Weighting of the Root-Mean-Square Velocity'),
    aliases: {
        zh: ['均方根速度', 'vrms', '叠加速度'],
        en: ['rms velocity', 'root-mean-square velocity', 'stacking velocity'],
    },
    node: 'S2.3',
    tags: {
        math: ['MATH.APPROX', 'MATH.STAT'],
        method: ['METH.EXPL', 'METH.PROC'],
        quantity: ['Q.VEL', 'Q.TIME'],
        keywords: t('均方根速度 rms 叠加速度 时间加权 Dix 时距 双曲近似', 'rms velocity stacking velocity time-weighted Dix travel time hyperbolic approximation'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `v_{\mathrm{rms}}^{2}=\frac{\displaystyle\sum_{i=1}^{n}v_{i}^{2}\,\tau_{i}}{\displaystyle\sum_{i=1}^{n}\tau_{i}},\qquad \tau_{i}=\frac{h_{i}}{v_{i}}`,
        variants: [
            {
                name: t('用厚度与速度直接写出', 'Written directly with thicknesses'),
                latex: String.raw `v_{\mathrm{rms}}^{2}=\frac{\sum v_{i}h_{i}}{\sum h_{i}/v_{i}}`,
            },
            {
                name: t('双曲时距中的角色', 'Its role in the hyperbolic travel time'),
                latex: String.raw `t^{2}=t_{0}^{2}+\frac{x^{2}}{v_{\mathrm{rms}}^{2}},\qquad t_{0}=2\sum_{i}\tau_{i}`,
            },
            {
                name: t('连续介质形式', 'Continuum form'),
                latex: String.raw `v_{\mathrm{rms}}^{2}\left(t_{0}\right)=\frac{1}{t_{0}}\int_{0}^{t_{0}}v^{2}\left(\tau\right)\mathrm{d}\tau`,
            },
            {
                name: t('与平均速度的不等式', 'Inequality against the average velocity'),
                latex: String.raw `v_{\mathrm{rms}}\ge v_{\mathrm{avg}}`,
            },
        ],
    },
    meaning: t('层状介质里没有单一速度能精确描述走时，但在中等偏移距上，用「按垂直单程旅行时间加权」的均方根速度 v_rms 代替真速度，双曲时距关系仍然近似成立。权重是时间而不是厚度，所以厚而慢的层权重小、薄而快的层权重大——v_rms 总是偏向高速层，因此它总是不小于平均速度。', 'In a layered medium no single velocity reproduces travel times exactly, yet at moderate offsets the hyperbolic relation still holds approximately if the true velocity is replaced by the rms velocity weighted by vertical one-way travel time. The weight is time, not thickness, so thick slow layers count little and thin fast layers count a lot — v_rms is biased toward fast layers and is therefore never smaller than the average velocity.'),
    symbols: [
        { sym: 'v_{\\mathrm{rms}}', name: t('均方根速度（叠加速度的一级近似）', 'root-mean-square velocity (first-order approximation to the stacking velocity)'), unit: 'm/s', typical: '1500 – 5000' },
        { sym: 'v_{i}', name: t('第 i 层的层速度', 'interval velocity of layer i'), unit: 'm/s', typical: '1500 – 6000' },
        { sym: 'h_{i}', name: t('第 i 层厚度', 'thickness of layer i'), unit: 'm', typical: '10 – 2000' },
        { sym: '\\tau_{i}', name: t('第 i 层的垂直单程旅行时间', 'vertical one-way travel time through layer i'), unit: 's' },
        { sym: 't_{0}', name: t('到第 n 层底界面的垂直双程走时', 'vertical two-way travel time to the base of layer n'), unit: 's' },
        { sym: 'x', name: t('偏移距', 'offset'), unit: 'm' },
        { sym: 'p', name: t('射线参数（水平慢度）', 'ray parameter (horizontal slowness)'), unit: 's/m' },
    ],
    conditions: {
        applies: [
            t('水平层状介质的中—小偏移距（x/z ≲ 1）时距近似', 'Small to moderate offsets (x/z ≲ 1) in horizontally layered media'),
            t('速度分析得到的叠加速度的一级解释', 'First-order interpretation of stacking velocities from velocity analysis'),
        ],
        assumes: [
            t('各层水平、各向同性、层内速度恒定', 'Horizontal, isotropic layers with constant velocity inside each layer'),
            t('偏移距展开只保留到二阶（双曲近似）', 'The offset expansion is truncated at second order (hyperbolic approximation)'),
        ],
        breaks: [
            t('大偏移距或强速度反差时出现明显非双曲，v_rms 不再足够', 'At large offsets or with strong velocity contrast the moveout becomes visibly non-hyperbolic and v_rms is no longer adequate'),
            t('各向异性（VTI）介质中叠加速度由 η、δ 等参数共同决定', 'In anisotropic (VTI) media the stacking velocity also involves parameters such as η and δ'),
            t('薄层调谐与层间多次波会污染拾取的叠加速度', 'Thin-bed tuning and interbed multiples contaminate picked stacking velocities'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('N 层水平介质，用射线参数 p 参数化射线', 'N horizontal layers, with the ray parameterised by p'),
            latex: String.raw `\sin\theta_{i}=p\,v_{i},\qquad \tau_{i}=\frac{h_{i}}{v_{i}}`,
        },
        {
            n: 2,
            op: 'geometry',
            title: t('写出偏移距与走时的精确和式', 'Write the exact sums for offset and travel time'),
            latex: String.raw `X=2\sum_{i}h_{i}\tan\theta_{i},\qquad T=2\sum_{i}\frac{h_{i}}{v_{i}\cos\theta_{i}}`,
        },
        {
            n: 3,
            op: 'taylor',
            title: t('小 p（小偏移距）展开到二阶', 'Expand in small p (small offset) to second order'),
            latex: String.raw `\tan\theta_{i}\simeq p v_{i},\qquad \frac{1}{\cos\theta_{i}}\simeq 1+\frac{p^{2}v_{i}^{2}}{2}`,
        },
        {
            n: 4,
            op: 'substitute',
            title: t('代回并保留最低阶', 'Substitute back and keep the lowest orders'),
            latex: String.raw `X\simeq 2p\sum_{i}h_{i}v_{i},\qquad T\simeq 2\sum_{i}\tau_{i}+p^{2}\sum_{i}h_{i}v_{i}=T_{0}+p^{2}A`,
            note: t('这里 A = Σ h_i v_i = Σ τ_i v_i²，它就是后面出现的加权和。', 'Here A = Σ h_i v_i = Σ τ_i v_i², the weighted sum that will appear below.'),
        },
        {
            n: 5,
            op: 'algebra',
            title: t('消去 p，得到 T² − T₀²', 'Eliminate p to obtain T² − T₀²'),
            latex: String.raw `p=\frac{X}{2A}\;\Longrightarrow\; T-T_{0}=\frac{X^{2}}{4A}\;\Longrightarrow\; T^{2}-T_{0}^{2}\simeq 2T_{0}\left(T-T_{0}\right)=\frac{T_{0}X^{2}}{2A}`,
        },
        {
            n: 6,
            op: 'result',
            title: t('与双曲形式对比即得 v_rms', 'Comparing with the hyperbolic form gives v_rms'),
            latex: String.raw `\frac{1}{v_{\mathrm{rms}}^{2}}=\frac{T_{0}}{2A}=\frac{2\sum_{i}\tau_{i}}{2\sum_{i}\tau_{i}v_{i}^{2}}=\frac{\sum_{i}\tau_{i}}{\sum_{i}\tau_{i}v_{i}^{2}}\;\Longrightarrow\; v_{\mathrm{rms}}^{2}=\frac{\sum_{i}v_{i}^{2}\tau_{i}}{\sum_{i}\tau_{i}}`,
            note: t('因为 A = Στ_i v_i²、T₀ = 2Στ_i，权重天然就是垂直旅行时间 τ_i，而不是厚度 h_i。', 'Because A = Στ_i v_i² and T₀ = 2Στ_i, the weight is naturally the vertical travel time τ_i rather than the thickness h_i.'),
        },
    ],
    links: {
        upstream: [
            { id: 'reflection-hyperbola', note: t('v_rms 是层状介质中双曲近似的等效速度', 'v_rms is the equivalent velocity of the hyperbolic approximation for layering') },
            { id: 'ray-parameter-slope', note: t('推导中用到的 p 参数化', 'the p parameterisation used in the derivation') },
        ],
        downstream: [
            { id: 'dix-formula', note: t('由相邻两层的 v_rms 反推层速度', 'recovers interval velocity from two adjacent v_rms values') },
            { id: 'average-velocity-conversion', note: t('另一种加权：平均速度', 'a different weighting: the average velocity') },
        ],
        seealso: [{ id: 'hyperbolic-moveout-offset' }],
    },
    refs: [
        { text: 'Yilmaz, Seismic Data Analysis, Vol. 1, Ch. 3' },
        { text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §4.3' },
    ],
};
export default rmsVelocityDefinition;
//# sourceMappingURL=rms-velocity-definition.js.map