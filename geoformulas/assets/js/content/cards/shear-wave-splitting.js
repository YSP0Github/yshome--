import { t } from '../../core/types.js';
/** shear-wave-splitting */
const shearWaveSplitting = {
    id: 'shear-wave-splitting',
    name: t('剪切波分裂', 'Shear-wave Splitting'),
    aliases: { zh: ['SKS 分裂', '各向异性分裂'], en: ['shear-wave splitting', 'SKS splitting', 'birefringence'] },
    node: 'S7.5',
    tags: {
        math: ['MATH.VECTOR', 'MATH.FOURIER'],
        method: ['METH.STRUCT'],
        quantity: ['Q.TIME', 'Q.VEL'],
    },
    audience: 'phd',
    complete: 'L2',
    statement: {
        main: String.raw `\delta t=\int_{\text{ray}}\frac{\delta v}{v^{2}}\,\mathrm{d}s\approx\frac{\delta v}{v}\,\frac{L}{v}`,
        variants: [
            { name: t('快慢波的时间延迟', 'Delay between fast and slow waves'), latex: String.raw `\delta t=\frac{L}{v_{\text{slow}}}-\frac{L}{v_{\text{fast}}}` },
            { name: t('反演用的网格搜索目标', 'Grid-search objective used in inversion'), latex: String.raw `\min_{\phi,\delta t}\left\|\boldsymbol{u}_{\perp}\left(t+\delta t\right)-\text{旋转后的}\ \boldsymbol{u}_{\parallel}\right\|^{2}` },
        ],
    },
    meaning: t('S 波进入各向异性介质后会分裂成两支偏振方向互相垂直、速度略有差异的波，就像光透过方解石。快波偏振方向 φ 指示了变形/流动的方向，延迟时间 δt 反映各向异性的强度与厚度。SKS 等核相在进入接收区前是纯 SV，因此台站下方测到的分裂可以干净地归因于台站下方各向异性 —— 这是研究地幔流动最直接的观测。', 'An S wave entering an anisotropic medium splits into two orthogonally polarised waves of slightly different speeds, just as light does in calcite. The fast polarisation φ indicates the direction of deformation or flow, and the delay δt reflects the strength and thickness of anisotropy. Core phases such as SKS are pure SV before reaching the receiver, so splitting measured at a station can be attributed cleanly to anisotropy beneath it — the most direct observation of mantle flow.'),
    symbols: [
        { sym: '\\delta t', name: t('快慢波延迟时间', 'delay time between fast and slow waves'), unit: 's', typical: '0.5 – 3' },
        { sym: '\\phi', name: t('快波偏振方位', 'fast polarisation azimuth'), unit: '°' },
        { sym: '\\delta v', name: t('快慢波速度差', 'velocity difference between fast and slow'), unit: 'm/s' },
        { sym: 'L', name: t('各向异性层厚度', 'thickness of the anisotropic layer'), unit: 'km', typical: '100 – 300' },
    ],
    conditions: {
        applies: [t('穿过各向异性介质的 S 波或核相（SKS、SKKS）', 'S waves or core phases (SKS, SKKS) traversing anisotropic media')],
        assumes: [
            t('各向异性为弱扰动（δv/v ≲ 5%）', 'Anisotropy is a weak perturbation (δv/v ≲ 5%)'),
            t('对称轴近水平', 'The symmetry axis is nearly horizontal'),
        ],
        breaks: [t('对称轴倾斜或多各向异性层叠加时，φ、δt 随方位呈周期变化', 'With a tilted axis or multiple anisotropic layers, φ and δt vary periodically with azimuth')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('各向异性使两个偏振有不同速度', 'Anisotropy gives the two polarisations different speeds'),
            latex: String.raw `v_{\text{fast}}\neq v_{\text{slow}}` },
        { n: 2, op: 'geometry', title: t('走过厚度 L 后的到时差', 'Arrival difference after traversing thickness L'),
            latex: String.raw `\delta t=\frac{L}{v_{\text{slow}}}-\frac{L}{v_{\text{fast}}}=L\,\frac{v_{\text{fast}}-v_{\text{slow}}}{v_{\text{fast}}v_{\text{slow}}}` },
        { n: 3, op: 'taylor', title: t('弱各向异性下近似', 'Approximate for weak anisotropy'),
            latex: String.raw `v_{\text{fast}}v_{\text{slow}}\approx v^{2}\;\Longrightarrow\; \delta t\approx\frac{\delta v}{v^{2}}L` },
        { n: 4, op: 'result', title: t('百分比各向异性的换算', 'Conversion to percent anisotropy'),
            latex: String.raw `\frac{\delta v}{v}\approx\frac{\delta t\cdot v}{L}` },
    ],
    links: {
        upstream: [{ id: 'vti-sh-azimuthal-velocity', note: t('各向异性波速的来源', 'Source of the anisotropic velocities') }],
        seealso: [{ id: 'surface-wave-azimuthal-anisotropy', note: t('面波给出的方位各向异性', 'Azimuthal anisotropy from surface waves') }],
    },
    refs: [{ text: 'Silver & Chan (1991), J. Geophys. Res., 96' }],
};
export default shearWaveSplitting;
//# sourceMappingURL=shear-wave-splitting.js.map