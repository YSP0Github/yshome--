import { t } from '../../core/types.js';
/** dc-ves-curve */
const dcVesCurve = {
    id: 'dc-ves-curve',
    name: t('直流电阻率测深（二层曲线）', 'DC Resistivity Sounding (Two-layer Curve)'),
    aliases: { zh: ['VES 曲线', '电测深量板'], en: ['VES curve', 'sounding master curve'] },
    node: 'S16.1',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.EM', 'METH.INV'],
        quantity: ['Q.ELEC', 'Q.GEOM'],
        keywords: t('电测深 VES 二层曲线 量板 视电阻率随极距', 'VES sounding two-layer master curve apparent resistivity spacing'),
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `\rho_{a}(r)=\rho_{1}\left[1+2\sum_{n=1}^{\infty}k^{n}\frac{1}{\sqrt{1+\left(\dfrac{2nh_{1}}{r}\right)^{2}}}\right]`,
        variants: [
            { name: t('反射系数', 'Reflection coefficient'), latex: String.raw `k=\dfrac{\rho_{2}-\rho_{1}}{\rho_{2}+\rho_{1}}` },
            { name: t('渐近行为', 'Asymptotes'), latex: String.raw `r\to 0:\ \rho_{a}\to\rho_{1}\;;\quad r\to\infty:\ \rho_{a}\to\rho_{2}` },
        ],
    },
    meaning: t('保持装置在原点、不断增大供电极距 r=AB/2，电流线逐渐向下深入，测得的 ρa 由浅层 ρ1 平滑过渡到深层 ρ2。把实测 ρa–r 双对数曲线与理论量板对比（或数值反演），即可定出层厚 h1 与各层电阻率。', 'Keeping the array centered and enlarging the current spacing r=AB/2 drives current progressively deeper; the measured ρa smoothly transitions from the near-surface ρ1 to the basement ρ2. Matching the measured ρa–r log-log curve to master curves (or numerical inversion) yields the layer thickness h1 and the layer resistivities.'),
    symbols: [
        { sym: '\\rho_{a}', name: t('视电阻率', 'apparent resistivity'), unit: 'Ω·m' },
        { sym: 'r', name: t('AB/2，供电半极距', 'half current spacing AB/2'), unit: 'm' },
        { sym: '\\rho_{1}', name: t('第一层电阻率', 'first-layer resistivity'), unit: 'Ω·m' },
        { sym: '\\rho_{2}', name: t('下伏层电阻率', 'basement resistivity'), unit: 'Ω·m' },
        { sym: 'h_{1}', name: t('第一层厚度', 'first-layer thickness'), unit: 'm' },
        { sym: 'k', name: t('电阻率反射系数', 'resistivity reflection coefficient'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('水平层状介质、Schlumberger/Wenner 测深', 'Horizontally layered earth, Schlumberger/Wenner sounding')],
        assumes: [t('层界水平、无各向异性', 'Horizontal interfaces, no anisotropy')],
        breaks: [t('倾斜界面、三维体使曲线无法解释', 'Dipping interfaces or 3D bodies invalidate the 1D curve')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('镜像法逐层求电位', 'Images build the potential layer by layer'),
            latex: String.raw `U\propto 1+\sum_{n}k^{n}/\sqrt{r^{2}+(2nh_{1})^{2}}` },
        { n: 2, op: 'algebra', title: t('归一到 ρ1', 'Normalize by ρ1'),
            latex: String.raw `\rho_{a}=\rho_{1}\left[1+2\sum_{n=1}^{\infty}\dfrac{k^{n}}{\sqrt{1+(2nh_{1}/r)^{2}}}\right]` },
        { n: 3, op: 'result', title: t('大小极距渐近', 'Small/large spacing asymptotes'),
            latex: String.raw `r\to 0\Rightarrow\rho_{a}\to\rho_{1}\;;\quad r\to\infty\Rightarrow\rho_{a}\to\rho_{2}` },
    ],
    viz: [
        {
            id: 'ves-2layer',
            level: 'V1',
            title: t('二层地电断面的 ρa–r 曲线', 'ρa–r curve over a two-layer earth'),
            xlabel: t('AB/2 半极距 r (m)', 'half spacing r (m)'),
            ylabel: t('视电阻率 ρa (Ω·m)', 'apparent resistivity ρa (Ω·m)'),
            xScale: 'log',
            yScale: 'log',
            controls: [
                { id: 'rho1', label: t('ρ1 第一层电阻率', 'ρ1 first layer'), min: 1, max: 1000, step: 1, value: 50, unit: 'Ω·m' },
                { id: 'rho2', label: t('ρ2 下伏层电阻率', 'ρ2 basement'), min: 1, max: 10000, step: 1, value: 500, unit: 'Ω·m' },
                { id: 'h1', label: t('h1 第一层厚度', 'h1 layer thickness'), min: 1, max: 100, step: 1, value: 20, unit: 'm' },
            ],
            compute: (p) => {
                const rho1 = p['rho1'], rho2 = p['rho2'], h1 = p['h1'];
                const k = (rho2 - rho1) / (rho2 + rho1);
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const r = Math.pow(10, -1 + (i / 200) * 3.5); // 0.1 .. ~316 m
                    let sum = 0;
                    for (let n = 1; n <= 25; n++) {
                        sum += Math.pow(k, n) / Math.sqrt(1 + Math.pow((2 * n * h1) / r, 2));
                    }
                    const rhoa = rho1 * (1 + 2 * sum);
                    pts.push([r, rhoa]);
                }
                return [{ label: t('二层 ρa', 'two-layer ρa'), color: '#185FA5', points: pts }];
            },
            note: t('小极距读出 ρ1，大极距趋近 ρ2；拐点位置约在 r≈h1。把 ρ2 调到小于 ρ1 即得到低阻基底（H 型）曲线。', 'Small spacing reads ρ1, large spacing tends to ρ2; the knee sits near r≈h1. Setting ρ2 < ρ1 gives the low-basement (H-type) curve.'),
        },
    ],
    links: {
        upstream: [{ id: 'dc-schlumberger-array' }, { id: 'dc-apparent-resistivity' }],
        downstream: [{ id: 'dc-formation-factor-ro-rw', note: t('进一步解释 ρ 与孔隙流体', 'Interpreting ρ in terms of pore fluid') }],
    },
    refs: [{ text: 'Koefoed (1979), Geoelectrical Depth Soundings' }],
};
export default dcVesCurve;
//# sourceMappingURL=dc-ves-curve.js.map