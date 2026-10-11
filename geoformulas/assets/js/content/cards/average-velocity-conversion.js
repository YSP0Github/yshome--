import { t } from '../../core/types.js';
/** average-velocity-conversion */
const averageVelocityConversion = {
    id: 'average-velocity-conversion',
    name: t('平均速度与层速度的换算', 'Converting between Average and Interval Velocity'),
    aliases: {
        zh: ['平均速度', '层速度', '时深转换'],
        en: ['average velocity', 'interval velocity', 'time-depth conversion'],
    },
    node: 'S2.3',
    tags: {
        math: ['MATH.STAT', 'MATH.APPROX'],
        method: ['METH.EXPL', 'METH.PROC'],
        quantity: ['Q.VEL', 'Q.TIME'],
        keywords: t('平均速度 层速度 时深转换 均方根速度 方差 加权', 'average velocity interval velocity time-depth conversion rms velocity variance weighting'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `v_{\mathrm{avg}}=\frac{\displaystyle\sum_{i}h_{i}}{\displaystyle\sum_{i}\tau_{i}}=\frac{\sum_{i}v_{i}\tau_{i}}{\sum_{i}\tau_{i}},\qquad \tau_{i}=\frac{h_{i}}{v_{i}}`,
        variants: [
            {
                name: t('时深转换用法', 'Use for time-to-depth conversion'),
                latex: String.raw `z=\frac{v_{\mathrm{avg}}\,t_{0}}{2}=\sum_{i}h_{i}`,
            },
            {
                name: t('与均方根速度的精确关系', 'Exact relation to the rms velocity'),
                latex: String.raw `v_{\mathrm{rms}}^{2}=v_{\mathrm{avg}}^{2}+\frac{\sum_{i}\tau_{i}\left(v_{i}-v_{\mathrm{avg}}\right)^{2}}{\sum_{i}\tau_{i}}`,
            },
            {
                name: t('由两个界面的平均速度反推层速度', 'Recovering an interval velocity from two average velocities'),
                latex: String.raw `v_{n}=\frac{v_{\mathrm{avg},n}t_{n}-v_{\mathrm{avg},n-1}t_{n-1}}{t_{n}-t_{n-1}}`,
            },
            {
                name: t('连续介质形式', 'Continuum form'),
                latex: String.raw `v_{\mathrm{avg}}\left(t_{0}\right)=\frac{1}{t_{0}}\int_{0}^{t_{0}}v\left(\tau\right)\mathrm{d}\tau`,
            },
        ],
    },
    meaning: t('平均速度是「总厚度除以总垂直旅行时间」，是把时间剖面变成深度剖面时真正需要的量；而均方根速度是速度分析与动校正里出现的量。两者都以垂直旅行时间为权，只是一个对 v 取平均、一个对 v² 取平均，于是由方差非负立刻得到 v_rms ≥ v_avg，且层速度差异越大两者差得越多。混用这两个速度是时深转换中最常见的错误来源。', 'The average velocity is total thickness divided by total vertical travel time — exactly the quantity needed to turn a time section into a depth section — whereas the rms velocity is what appears in velocity analysis and moveout correction. Both are weighted by vertical travel time, but one averages v and the other v², so non-negative variance immediately gives v_rms ≥ v_avg, with a larger gap for larger interval-velocity contrasts. Confusing the two is the most common source of error in time-to-depth conversion.'),
    symbols: [
        { sym: 'v_{\\mathrm{avg}}', name: t('平均速度（总厚度 / 总垂直单程时间）', 'average velocity (total thickness / total one-way vertical time)'), unit: 'm/s', typical: '1500 – 4500' },
        { sym: 'v_{\\mathrm{rms}}', name: t('均方根速度', 'root-mean-square velocity'), unit: 'm/s' },
        { sym: 'v_{i}', name: t('第 i 层的层速度', 'interval velocity of layer i'), unit: 'm/s' },
        { sym: 'h_{i}', name: t('第 i 层厚度', 'thickness of layer i'), unit: 'm' },
        { sym: '\\tau_{i}', name: t('第 i 层的垂直单程旅行时间', 'vertical one-way travel time through layer i'), unit: 's' },
        { sym: 't_{0}\\ \\text{或}\\ t_{n}', name: t('到第 n 个界面的垂直双程（或单程）走时', 'vertical two-way (or one-way) time to interface n'), unit: 's' },
        { sym: 'z', name: t('深度', 'depth'), unit: 'm' },
    ],
    conditions: {
        applies: [
            t('时间剖面转深度剖面、深度域构造成图', 'Converting time sections to depth, structural mapping in the depth domain'),
            t('由地震速度校准井速度、建立速度场', 'Calibrating seismic velocities against well data and building velocity fields'),
        ],
        assumes: [
            t('水平层状、各层内速度恒定、各向同性', 'Horizontal layers with constant isotropic velocity in each layer'),
            t('走时是垂直入射（零偏移距）走时', 'Times are normal-incidence (zero-offset) times'),
        ],
        breaks: [
            t('倾斜层或射线偏折时垂直走时不对应垂直路径，平均速度不再给出正确深度', 'For dipping layers or bent rays the vertical time does not correspond to a vertical path and the average velocity no longer gives the correct depth'),
            t('各向异性介质中垂直速度与成像速度不同，需专门处理', 'In anisotropic media the vertical velocity differs from the imaging velocity and must be handled separately'),
            t('速度横向变化剧烈时必须用速度模型做深度偏移，而非简单时深转换', 'With strong lateral velocity variation one must depth-migrate with a velocity model rather than do a simple time-depth conversion'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('定义平均速度为总厚度除以总时间', 'Define the average velocity as total thickness over total time'),
            latex: String.raw `v_{\mathrm{avg}}=\frac{\sum_{i}h_{i}}{\sum_{i}\tau_{i}}=\frac{\sum_{i}v_{i}\tau_{i}}{\sum_{i}\tau_{i}}`,
            note: t('第二步用了 h_i = v_i τ_i：平均速度是「以时间为权的 v 的算术平均」。', 'The second step uses h_i = v_i τ_i: the average velocity is the time-weighted arithmetic mean of v.'),
        },
        {
            n: 2,
            op: 'identity',
            title: t('均方根速度是同权的 v² 平均', 'The rms velocity is the equally weighted mean of v²'),
            latex: String.raw `v_{\mathrm{rms}}^{2}=\frac{\sum_{i}v_{i}^{2}\tau_{i}}{\sum_{i}\tau_{i}}`,
        },
        {
            n: 3,
            op: 'algebra',
            title: t('两者之差是一个加权方差', 'Their difference is a weighted variance'),
            latex: String.raw `v_{\mathrm{rms}}^{2}-v_{\mathrm{avg}}^{2}=\frac{\sum_{i}\tau_{i}v_{i}^{2}}{\sum_{i}\tau_{i}}-\left(\frac{\sum_{i}\tau_{i}v_{i}}{\sum_{i}\tau_{i}}\right)^{2}=\frac{\sum_{i}\tau_{i}\left(v_{i}-v_{\mathrm{avg}}\right)^{2}}{\sum_{i}\tau_{i}}`,
            note: t('这就是概率论里的 Var = E[X²] − (E[X])²，只是权重换成了旅行时间。', 'This is exactly Var = E[X²] − (E[X])² from probability, with travel time as the weight.'),
        },
        {
            n: 4,
            op: 'result',
            title: t('方差非负 ⇒ v_rms ≥ v_avg', 'Non-negative variance ⇒ v_rms ≥ v_avg'),
            latex: String.raw `v_{\mathrm{rms}}\ge v_{\mathrm{avg}},\qquad \text{等号仅当所有层速度相同}`,
        },
        {
            n: 5,
            op: 'substitute',
            title: t('逐层反推：两个界面之间求层速度', 'Layer by layer: interval velocity between two interfaces'),
            latex: String.raw `v_{\mathrm{avg},n}t_{n}-v_{\mathrm{avg},n-1}t_{n-1}=\sum_{i}h_{i}-\sum_{i<n}h_{i}=h_{n}=v_{n}\left(t_{n}-t_{n-1}\right)`,
        },
        {
            n: 6,
            op: 'result',
            title: t('层速度与厚度', 'Interval velocity and thickness'),
            latex: String.raw `v_{n}=\frac{v_{\mathrm{avg},n}t_{n}-v_{\mathrm{avg},n-1}t_{n-1}}{t_{n}-t_{n-1}},\qquad h_{n}=\frac{v_{n}\left(t_{n}-t_{n-1}\right)}{2}\ \ (\text{若 } t \text{ 为双程})`,
            note: t('与 Dix 公式形式相同，只是把 v_rms² 换成了 v_avg——平均速度反演层速度是线性的，因而比 Dix 稳定得多。', 'The form is identical to the Dix formula with v_rms² replaced by v_avg — inverting average velocities for interval velocity is linear and therefore far more stable than Dix.'),
        },
    ],
    links: {
        upstream: [{ id: 'rms-velocity-definition', note: t('同权重的另一种平均', 'a different mean with the same weights') }],
        downstream: [{ id: 'dix-formula', note: t('用 v_rms 做同样的事，但噪声被放大', 'does the same with v_rms but amplifies noise') }],
        seealso: [{ id: 'reflection-hyperbola' }],
    },
    refs: [
        { text: 'Yilmaz, Seismic Data Analysis, Vol. 1, Ch. 3' },
        { text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §4.5' },
    ],
};
export default averageVelocityConversion;
//# sourceMappingURL=average-velocity-conversion.js.map