import { t } from '../../core/types.js';
/** radial-anisotropy-xi */
const radialAnisotropyXi = {
    id: 'radial-anisotropy-xi',
    name: t('径向各向异性参数 ξ', 'The Radial-anisotropy Parameter ξ'),
    aliases: { zh: ['径向各向异性', 'ξ 参数', 'VsH/VsV'], en: ['radial anisotropy', 'xi parameter', 'VsH/VsV'] },
    node: 'S5.4',
    tags: {
        math: ['MATH.APPROX'],
        method: ['METH.SURF', 'METH.INV'],
        quantity: ['Q.VEL', 'Q.MAT'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `\xi = \left(\frac{V_{SH}}{V_{SV}}\right)^{2},\qquad
\phi = \left(\frac{V_{PV}}{V_{PH}}\right)^{2},\qquad
\eta = \frac{F}{A - 2L}`,
        variants: [
            { name: t('Love–Rayleigh 频散不一致即径向各向异性的证据', 'Love–Rayleigh dispersion inconsistency as evidence for radial anisotropy'), latex: String.raw `c_{\text{Love}}(T) \neq c_{\text{Rayleigh, pred}}(T) \Longrightarrow \xi \neq 1` },
            { name: t('各向异性强度常用百分比表示', 'Anisotropy strength is often quoted in percent'), latex: String.raw `\frac{V_{SH}-V_{SV}}{V_S} \times 100\% \approx \frac{\xi-1}{2}\times 100\%` },
            { name: t('等效各向同性速度', 'The equivalent isotropic velocity'), latex: String.raw `V_S^{\text{iso}} = \sqrt{\frac{2V_{SV}^{2}+V_{SH}^{2}}{3}}` },
        ],
    },
    meaning: t('当岩石的层理、片理或部分熔融呈水平排列时，水平偏振的 S 波和垂直偏振的 S 波速度不同 —— 这就是径向各向异性。单靠 Love 波或单靠 Rayleigh 波都无法察觉，只有把两者放在一起反演才发现它们要求不同的 Vs：这个「Love–Rayleigh 矛盾」正是 20 世纪 60 年代确认上地幔各向异性的关键证据。', 'When layering, foliation or partial melt is horizontally organised, horizontally polarised S waves travel at a different speed than vertically polarised ones — radial anisotropy. Neither Love nor Rayleigh waves alone reveal it; only inverting both together shows they demand different Vs values. This "Love–Rayleigh discrepancy" was the key evidence establishing upper-mantle anisotropy in the 1960s.'),
    symbols: [
        { sym: '\\xi', name: t('S 波径向各向异性参数', 'S radial-anisotropy parameter'), unit: '无量纲' },
        { sym: 'V_{SH}, V_{SV}', name: t('水平/垂直偏振 S 波速度', 'horizontally / vertically polarised S velocity'), unit: 'km/s' },
        { sym: '\\phi, \\eta', name: t('P 波各向异性与 Thomsen 型参数', 'P anisotropy and the Thomsen-type parameter'), unit: '无量纲' },
        { sym: 'A, C, F, L, N', name: t('横向各向同性介质的五个弹性常数', 'the five elastic constants of a TI medium'), unit: 'GPa' },
    ],
    conditions: {
        applies: [t('上地幔各向异性成像、Love–Rayleigh 联合反演', 'Upper-mantle anisotropic imaging, joint Love–Rayleigh inversion')],
        assumes: [t('对称轴垂直（VTI 或径向各向同性叠加）', 'Vertical symmetry axis (VTI or radially isotropic superposition)')],
        breaks: [t('倾斜对称轴或方位各向异性占优时失效', 'Fails when the symmetry axis is tilted or azimuthal anisotropy dominates')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('横向各向同性介质有 5 个独立弹性常数', 'A TI medium has five independent elastic constants'), latex: String.raw `A = \rho V_{PH}^{2},\quad C = \rho V_{PV}^{2},\quad L = \rho V_{SV}^{2},\quad N = \rho V_{SH}^{2}` },
        { n: 2, op: 'physics', title: t('Love 波只受 SH 控制，Rayleigh 波主要受 SV 控制', 'Love waves sense only SH; Rayleigh waves mostly sense SV'), latex: String.raw `\text{Love:}\ N;\qquad \text{Rayleigh:}\ \text{主要}\ L, C` },
        { n: 3, op: 'identity', title: t('定义无量纲比值以便比较', 'Define dimensionless ratios for comparison'), latex: String.raw `\xi = \frac{N}{L} = \left(\frac{V_{SH}}{V_{SV}}\right)^{2}` },
        { n: 4, op: 'algebra', title: t('小量展开成百分比形式', 'Expand to first order as a percentage'), latex: String.raw `\xi = 1+\epsilon \Rightarrow \frac{V_{SH}-V_{SV}}{V_S} \approx \frac{\epsilon}{2}` },
        { n: 5, op: 'result', title: t('由上地幔典型 ξ ≈ 1.05–1.10 得到约 3–5% 各向异性', 'Typical upper-mantle ξ ≈ 1.05–1.10 implies about 3–5% anisotropy'), latex: String.raw `\xi = 1.07 \Rightarrow \frac{\Delta V_S}{V_S} \approx 3.4\%` },
    ],
    viz: [
        {
            id: 'rad-aniso',
            level: 'V2',
            title: t('ξ 对 Love 与 Rayleigh 频散曲线的不同影响', 'How ξ affects Love and Rayleigh dispersion differently'),
            xlabel: t('周期 T (s)', 'period T (s)'),
            ylabel: t('相速度 c (km/s)', 'phase velocity c (km/s)'),
            controls: [
                { id: 'xi', label: t('ξ = (VsH/VsV)²', 'ξ = (VsH/VsV)²'), min: 0.85, max: 1.25, step: 0.01, value: 1.08 },
                { id: 'vs', label: t('参考 Vs (km/s)', 'reference Vs (km/s)'), min: 3, max: 4.8, step: 0.02, value: 4.3 },
            ],
            note: t('ξ 增大时 Love 波（只受 VsH 控制）整体变快，而 Rayleigh 波（主要受 VsV 控制）几乎不动 —— 两条曲线被「撕开」，这个裂口的大小就是各向异性的直接量度。', 'Increasing ξ speeds up Love waves (sensing only VsH) while Rayleigh waves (sensing mainly VsV) barely move — the two curves split apart, and the size of the gap is a direct measure of anisotropy.'),
            compute: (p) => {
                const xi = p['xi'], vs = p['vs'];
                const vsv = vs;
                const vsh = vs * Math.sqrt(xi);
                const out = [];
                const love = [];
                const ray = [];
                const rayIso = [];
                for (let i = 0; i <= 140; i++) {
                    const T = 5 + (i / 140) * 95;
                    // 简化的单调频散模型：长周期看高速基底，短周期看浅部
                    const w = Math.exp(-T / 60);
                    const cSlow = 3.3;
                    const cFast = 4.6;
                    const base = cSlow + (cFast - cSlow) * w;
                    const loveC = base * (0.9 + 0.1 * (vsh / vs));
                    const rayC = base * (0.92 + 0.08 * (vsv / vs));
                    const isoC = base * (0.92 + 0.08 * (vs / vs));
                    love.push([T, loveC]);
                    ray.push([T, rayC]);
                    rayIso.push([T, isoC]);
                }
                out.push({ label: t('Love 波 (VsH)', 'Love (VsH)'), color: '#185FA5', points: love });
                out.push({ label: t('Rayleigh 波 (VsV)', 'Rayleigh (VsV)'), color: '#993C1D', points: ray });
                out.push({ label: t('各向同性参考', 'isotropic reference'), color: '#888780', points: rayIso });
                return out;
            },
        },
    ],
    example: {
        title: t('上地幔典型值', 'A typical upper-mantle value'),
        input: t('ξ = 1.08，Vs(参考) = 4.3 km/s', 'ξ = 1.08, Vs (reference) = 4.3 km/s'),
        steps: [
            t('VsH = 4.3 × √1.08 = 4.47 km/s，VsV = 4.30 km/s', 'VsH = 4.3 × √1.08 = 4.47 km/s, VsV = 4.30 km/s'),
            t('(VsH − VsV)/Vs = (4.47 − 4.30)/4.3 = 3.9%', '(VsH − VsV)/Vs = (4.47 − 4.30)/4.3 = 3.9%'),
        ],
        output: t('约 4% 的径向各向异性，与上地幔观测一致', 'About 4% radial anisotropy, consistent with upper-mantle observations'),
    },
    links: {
        upstream: [
            { id: 'love-wave-dispersion', note: t('Love 波只约束 VsH', 'Love waves constrain only VsH') },
            { id: 'rayleigh-wave-equation', note: t('Rayleigh 波主要约束 VsV', 'Rayleigh waves mainly constrain VsV') },
        ],
        seealso: [
            { id: 'thomsen-parameters', note: t('Thomsen 参数体系', 'The Thomsen parameter system') },
            { id: 'surface-wave-azimuthal-anisotropy', note: t('方位各向异性是另一种类型', 'Azimuthal anisotropy is the other type') },
        ],
    },
    refs: [{ text: 'Dziewonski & Anderson (1981), PREM, Phys. Earth Planet. Inter. 25, 297–356' }],
};
export default radialAnisotropyXi;
//# sourceMappingURL=radial-anisotropy-xi.js.map