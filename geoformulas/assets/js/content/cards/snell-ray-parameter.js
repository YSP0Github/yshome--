import { t } from '../../core/types.js';
/** snell-ray-parameter */
const snellRayParameter = {
    id: 'snell-ray-parameter',
    name: t('Snell 定律与射线参数', "Snell's Law and the Ray Parameter"),
    aliases: { zh: ['折射定律', '射线参数', 'snell'], en: ['Snell', 'ray parameter', 'refraction'] },
    node: 'S2.2',
    tags: {
        math: ['MATH.GEOM', 'MATH.VECTOR'],
        method: ['METH.EXPL', 'METH.TELE'],
        quantity: ['Q.VEL', 'Q.GEOM'],
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\frac{\sin i_{1}}{\alpha_{1}}=\frac{\sin i_{2}}{\alpha_{2}}=p`,
        variants: [
            { name: t('水平界面的守恒形式', 'Conserved form for horizontal layering'), latex: String.raw `p=\frac{\sin i}{c\left(z\right)}=\text{const along the ray}` },
            { name: t('转换波的形式', 'For converted phases'), latex: String.raw `\frac{\sin i_{P}}{\alpha}=\frac{\sin j_{S}}{\beta}=p` },
            { name: t('折射定律的光学写法', 'Optics notation'), latex: String.raw `n_1\sin i_1=n_2\sin i_2` },
        ],
    },
    meaning: t('射线参数 p 是分层介质里唯一沿射线守恒的量，它的物理意义是「水平慢度」。整个 τ-p（慢度）方法、平面波分解、VSP 反演，都建立在这一条守恒上。', 'The ray parameter p is the only quantity conserved along a ray in layered media; physically it is the horizontal slowness. Everything from τ–p methods to plane-wave decomposition rests on this conservation.'),
    symbols: [
        { sym: 'i', name: t('射线与界面法线的夹角', 'angle between ray and interface normal'), unit: '° 或 rad' },
        { sym: '\\alpha', name: t('P 波速度', 'P-wave velocity'), unit: 'm/s' },
        { sym: '\\beta', name: t('S 波速度', 'S-wave velocity'), unit: 'm/s' },
        { sym: 'p', name: t('射线参数（水平慢度）', 'ray parameter (horizontal slowness)'), unit: 's/m', typical: '0 – 1.3e-4' },
        { sym: 'i_c', name: t('临界角', 'critical angle'), unit: '°' },
    ],
    conditions: {
        applies: [t('高频近似下，速度在波长尺度内变化缓慢', 'High-frequency limit: velocity varies slowly over a wavelength')],
        assumes: [
            t('速度只随深度变化（水平层状）', 'Velocity varies with depth only (horizontal layering)'),
            t('各向同性', 'Isotropic'),
        ],
        breaks: [
            t('横向变速介质中 p 不再严格守恒', 'With lateral velocity variation p is no longer strictly conserved'),
            t('频率接近层厚对应的标度时射线理论失效', 'Ray theory breaks down when wavelengths approach layer thickness'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('设界面水平，两侧速度分别为 c₁, c₂', 'A horizontal interface with speeds c₁, c₂'),
            latex: String.raw `\text{射线在 }x\text{ 方向的表观速度必须两侧一致}` },
        { n: 2, op: 'geometry', title: t('由 Huygens 原理：波前必须在界面上连续', 'From Huygens: the wavefront must be continuous across the interface'),
            latex: String.raw `\frac{\Delta t}{\Delta x}=\frac{\sin i}{c}` },
        { n: 3, op: 'algebra', title: t('两侧取同一 Δx、Δt', 'Use the same Δx, Δt on both sides'),
            latex: String.raw `\frac{\sin i_1}{c_1}=\frac{\sin i_2}{c_2}` },
        { n: 4, op: 'setup', title: t('定义射线参数', 'Define the ray parameter'),
            latex: String.raw `p\equiv\frac{\sin i}{c}` },
        { n: 5, op: 'identity', title: t('推广到连续介质', 'Generalise to a continuously varying medium'),
            latex: String.raw `p=\frac{\sin i\left(z\right)}{c\left(z\right)}=\text{const}`,
            note: t('把介质切成无穷多薄层并对每层套用 Snell，取极限即得。', 'Slice the medium into infinitely many thin layers, apply Snell to each and take the limit.') },
        { n: 6, op: 'result', title: t('临界角：透射角达到 90° 时', 'Critical angle: when the transmitted angle reaches 90°'),
            latex: String.raw `\sin i_{c}=\frac{c_1}{c_2}\;\Rightarrow\; i_{c}=\arcsin\!\left(\frac{c_1}{c_2}\right)`,
            note: t('超过临界角就发生全反射并产生首波（head wave），这是广角反射地震学的核心信号。', 'Beyond it the wave is totally reflected and generates a head wave — the core signal of wide-angle refraction seismology.') },
    ],
    viz: [
        {
            id: 'snell-curve',
            level: 'V1',
            title: t('透射角随入射角变化（速度递增）', 'Transmission angle versus incidence angle (speed increasing)'),
            xlabel: t('入射角 i₁ (度)', 'incidence angle i₁ (deg)'),
            ylabel: t('透射角 i₂ (度)', 'transmission angle i₂ (deg)'),
            controls: [
                { id: 'c1', label: t('上层速度 c₁', 'upper speed c₁'), min: 1500, max: 6000, step: 100, value: 3000, unit: 'm/s' },
                { id: 'c2', label: t('下层速度 c₂', 'lower speed c₂'), min: 1500, max: 8000, step: 100, value: 5000, unit: 'm/s' },
            ],
            xRange: [0, 90],
            yRange: [0, 95],
            note: t('曲线在 i₁ = i_c 处到达 90° 后不再有实数解：超过临界角，就没有透射 P 波了。把 c₂ 调到小于 c₁ 试试，曲线会反向弯。', 'The curve reaches 90° at i₁ = i_c and then stops having real solutions. Try setting c₂ below c₁ and the curve bends the other way.'),
            compute: (p) => {
                const c1 = p['c1'], c2 = p['c2'];
                const pts = [];
                const ref = [];
                for (let d = 0; d <= 90; d += 0.5) {
                    const s = (Math.sin((d * Math.PI) / 180) * c2) / c1;
                    if (Math.abs(s) <= 1)
                        pts.push([d, (Math.asin(s) * 180) / Math.PI]);
                    ref.push([d, d]);
                }
                return [
                    { label: t('透射角 i₂', 'transmission angle i₂'), color: '#185FA5', points: pts },
                    { label: t('参考线 i₂ = i₁', 'reference i₂ = i₁'), color: '#B4B2A9', dash: true, points: ref },
                ];
            },
        },
    ],
    links: {
        upstream: [{ id: 'ps-wave-velocities', note: t('给出 α 与 β', 'supplies α and β') }],
        downstream: [
            { id: 'reflection-hyperbola' },
            { id: 'acoustic-reflection-coefficient' },
        ],
    },
    refs: [{ text: 'Shearer, Introduction to Seismology, 2nd ed., §4.1' }],
};
export default snellRayParameter;
//# sourceMappingURL=snell-ray-parameter.js.map