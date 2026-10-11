import { t } from '../../core/types.js';
/** mohorovicic-discontinuity */
const mohorovicicDiscontinuity = {
    id: 'mohorovicic-discontinuity',
    name: t('莫霍面（壳幔边界）', 'The Mohorovičić Discontinuity'),
    aliases: { zh: ['莫霍面', 'Moho', '壳幔边界'], en: ['Moho', 'Mohorovicic discontinuity', 'crust-mantle boundary'] },
    node: 'S7.3',
    tags: {
        math: ['MATH.GEOM', 'MATH.ALGEBRA'],
        method: ['METH.STRUCT'],
        quantity: ['Q.GEOM', 'Q.VEL'],
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `\Delta v_{P} \approx 1\text{–}2\ \text{km/s},\qquad Z_{\text{Moho}} \approx 30\text{–}40\ \text{km}\ (\text{陆壳}),\ 5\text{–}10\ \text{km}\ (\text{洋壳})`,
        variants: [
            { name: t('由 PmP–Pg 到时差求深度', 'Depth from the PmP–Pg time difference'), latex: String.raw `h = \frac{\Delta t\,v_1}{2\cos i},\qquad \sin i = \frac{p\,v_1}{1}` },
            { name: t('接收函数中的 Ps 转换波', 'The Ps converted phase in receiver functions'), latex: String.raw `t_{Ps} = h\left(\frac{1}{v_S}-\frac{1}{v_P}\right)\ \text{（近似）}` },
            { name: t('自由空气重力异常的约束', 'Constraint from free-air gravity anomalies'), latex: String.raw `\Delta g \approx 2\pi G\,\Delta\rho\,h` },
        ],
    },
    meaning: t('1909 年莫霍洛维奇发现：稍远一点的地震记录上会出现一个「先到的弱震相」，它只能在地下存在速度跳跃时解释。这个跳跃面就是地壳与地幔的分界 —— 人类第一次用地震波「看见」了地球内部的一层界面，地球内部结构研究由此开端。', 'In 1909 Mohorovičić noticed that records at slightly larger distances contained an extra early arrival, explicable only by a velocity jump at depth. That jump is the crust–mantle boundary — the first time anyone “saw” an internal interface with seismic waves, marking the beginning of Earth-structure research.'),
    symbols: [
        { sym: 'h', name: t('莫霍面深度', 'Moho depth'), unit: 'km', typical: '5 – 70' },
        { sym: '\\Delta v_{P}', name: t('P 波速度跳跃', 'P-velocity jump'), unit: 'km/s', typical: '1 – 2' },
        { sym: 'v_{1}', name: t('地壳平均速度', 'mean crustal velocity'), unit: 'km/s', typical: '6.0 – 6.5' },
        { sym: 't_{Ps}', name: t('Ps 转换波相对 P 的到时差', 'delay of the Ps converted phase relative to P'), unit: 's' },
        { sym: '\\Delta\\rho', name: t('壳幔密度差', 'crust–mantle density contrast'), unit: 'kg/m³', typical: '300 – 600' },
    ],
    conditions: {
        applies: [t('地壳厚度研究、壳幔边界成像', 'Crustal thickness studies and crust–mantle boundary imaging')],
        assumes: [
            t('界面近水平、速度跳跃明显', 'The interface is near-horizontal with a clear velocity jump'),
            t('地壳速度结构已知或可用平均速度近似', 'Crustal velocity structure is known or approximated by an average velocity'),
        ],
        breaks: [
            t('造山带下方莫霍面双重或倾斜，单一深度无意义', 'Beneath orogens the Moho is doubled or dipping; a single depth is meaningless'),
            t('壳内低速层会使 PmP 识别困难', 'Intra-crustal low-velocity zones make PmP hard to identify'),
        ],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('首波出现的条件', 'Condition for the head wave'),
            latex: String.raw `v_2 > v_1 \Longrightarrow \text{临界角以后出现沿界面滑行的波}` },
        { n: 2, op: 'geometry', title: t('写出反射路径', 'Write the reflection path'),
            latex: String.raw `L = 2\sqrt{h^{2}+\left(\frac{x}{2}\right)^{2}}` },
        { n: 3, op: 'algebra', title: t('与直达波到时相减', 'Subtract the direct arrival time'),
            latex: String.raw `\Delta t = \frac{L}{v_1} - \frac{x}{v_1}` },
        { n: 4, op: 'taylor', title: t('远场展开求深度', 'Expand in the far field to get the depth'),
            latex: String.raw `\Delta t \approx \frac{2h}{v_1\cos i} \Longrightarrow h = \frac{\Delta t\,v_1}{2\cos i}` },
        { n: 5, op: 'result', title: t('现代做法：接收函数', 'Modern approach: receiver functions'),
            latex: String.raw `t_{Ps} = h\left(\frac{1}{v_S}-\frac{1}{v_P}\right)` },
    ],
    viz: [
        {
            id: 'moho-depth',
            level: 'V1',
            title: t('Ps 到时差随莫霍面深度的变化', 'Ps delay versus Moho depth'),
            xlabel: t('莫霍面深度 h (km)', 'Moho depth h (km)'),
            ylabel: t('t_Ps (s)', 't_Ps (s)'),
            controls: [
                { id: 'vp', label: t('地壳 v_P (km/s)', 'crustal v_P (km/s)'), min: 5, max: 7, step: 0.05, value: 6.3 },
                { id: 'k', label: t('v_P / v_S', 'v_P / v_S'), min: 1.6, max: 2.0, step: 0.01, value: 1.75 },
            ],
            note: t('v_P/v_S 是最敏感的参数：它错 3%，反演出的地壳厚度就错约 1 km。', 'v_P/v_S is the most sensitive parameter: a 3% error shifts the inferred crustal thickness by about 1 km.'),
            compute: (p) => {
                const vp = p['vp'], k = p['k'];
                const vs = vp / k;
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const h = (i / 200) * 70;
                    const tt = h * (1 / vs - 1 / vp);
                    pts.push([h, tt]);
                }
                return [{ label: t('t_Ps(h)', 't_Ps(h)'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('青藏高原的厚地壳', 'The thick crust beneath Tibet'),
        input: t('h = 70 km，v_P = 6.3 km/s，v_P/v_S = 1.75', 'h = 70 km, v_P = 6.3 km/s, v_P/v_S = 1.75'),
        steps: [
            t('v_S = 6.3/1.75 = 3.60 km/s', 'v_S = 6.3/1.75 = 3.60 km/s'),
            t('t_Ps = 70×(1/3.6 − 1/6.3) = 70×(0.278−0.159) = 70×0.119 = 8.3 s', 't_Ps = 70×(1/3.6 − 1/6.3) = 70×(0.278−0.159) = 70×0.119 = 8.3 s'),
        ],
        output: t('8.3 s 的到时差是接收函数上识别巨厚地壳的直接标志', 'An 8.3 s delay is the direct signature of very thick crust on a receiver function'),
    },
    links: {
        upstream: [
            { id: 'head-wave-critical-angle', note: t('首波是发现它的关键', 'Head waves were the key to its discovery') },
            { id: 'acoustic-reflection-coefficient', note: t('速度跳跃产生反射', 'The velocity jump produces a reflection') },
        ],
        downstream: [{ id: 'receiver-function-h-kappa', note: t('现代的 H–κ 方法', 'The modern H–κ method') }],
        seealso: [{ id: 'mantle-discontinuities', note: t('更深处的间断面', 'Deeper discontinuities') }],
    },
    refs: [{ text: 'Mohorovičić, A. (1910). Potres od 8. listopada 1909. Godišnje izvješće Zagrebačkog meteorološkog opservatorija' }],
};
export default mohorovicicDiscontinuity;
//# sourceMappingURL=mohorovicic-discontinuity.js.map