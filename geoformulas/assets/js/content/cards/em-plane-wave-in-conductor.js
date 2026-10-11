import { t } from '../../core/types.js';
/** em-plane-wave-in-conductor */
const emPlaneWaveInConductor = {
    id: 'em-plane-wave-in-conductor',
    name: t('导电介质中的平面电磁波', 'Plane EM Wave in a Conductor'),
    aliases: { zh: ['复波数', '电磁波扩散方程'], en: ['complex wavenumber', 'EM diffusion equation'] },
    node: 'S16.2',
    tags: {
        math: ['MATH.DIFF', 'MATH.COMPLEX'],
        method: ['METH.EM'],
        quantity: ['Q.ELEC', 'Q.FREQ'],
        keywords: t('平面波 复波数 衰减常数 相位常数 趋肤效应', 'plane wave complex wavenumber attenuation phase skin effect'),
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `k^{2}=i\,\mu\sigma\,\omega\;\Rightarrow\; k=(1+i)\sqrt{\frac{\mu\sigma\omega}{2}}=\frac{1+i}{\delta}`,
        variants: [
            { name: t('场随深度衰减', 'Field decay with depth'), latex: String.raw `E(z)=E_{0}\,e^{-z/\delta}\,e^{-i z/\delta}` },
            { name: t('α 与 β', 'Attenuation/phase constants'), latex: String.raw `\alpha=\beta=\sqrt{\dfrac{\mu\sigma\omega}{2}}=\dfrac{1}{\delta}` },
        ],
    },
    meaning: t('在导电介质中，位移电流可略，Maxwell 方程退化为扩散方程。平面波解的波数 k 是复数，实部（衰减 α）与虚部（相位 β）相等：场每深入 δ 就衰减到 1/e，同时相位滞后 1 弧度量级。与真空中电磁波的"传播"不同，这里电磁波是"扩散"——低频、高导时才穿得深。', 'In a conductor the displacement current is negligible and Maxwell equations reduce to a diffusion equation. The plane-wave wavenumber k is complex with equal real (attenuation α) and imaginary (phase β) parts: every depth δ the field drops to 1/e while phase lags by ~1 rad. Unlike propagation in vacuum, EM fields diffuse through the earth — they penetrate deeply only at low frequency and in low-conductivity rock.'),
    symbols: [
        { sym: 'k', name: t('复波数', 'complex wavenumber'), unit: '1/m' },
        { sym: '\\mu', name: t('磁导率（真空 μ0=4π×10⁻⁷）', 'permeability'), unit: 'H/m' },
        { sym: '\\sigma', name: t('电导率', 'conductivity'), unit: 'S/m' },
        { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
        { sym: '\\delta', name: t('趋肤深度', 'skin depth'), unit: 'm' },
        { sym: 'z', name: t('深度', 'depth'), unit: 'm' },
    ],
    conditions: {
        applies: [t('均匀各向同性导体、平面波垂直入射', 'Uniform isotropic conductor, normal-incidence plane wave')],
        assumes: [t('准静态、μ≈μ0', 'Quasi-static, μ≈μ0')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('准静态 Maxwell 旋度方程', 'Quasi-static curl equations'),
            latex: String.raw `\nabla\times\mathbf{E}=-i\omega\mu\mathbf{H}\;,\quad \nabla\times\mathbf{H}=\sigma\mathbf{E}` },
        { n: 2, op: 'algebra', title: t('消去 H 得 E 的扩散方程', 'Eliminate H for E'),
            latex: String.raw `\nabla^{2}\mathbf{E}=i\omega\mu\sigma\,\mathbf{E}=k^{2}\mathbf{E}` },
        { n: 3, op: 'algebra', title: t('取平面波解 E∝e^{ikz}', 'Plane-wave ansatz E∝e^{ikz}'),
            latex: String.raw `k^{2}=i\mu\sigma\omega\;\Rightarrow\; k=(1+i)\sqrt{\dfrac{\mu\sigma\omega}{2}}` },
    ],
    links: {
        upstream: [{ id: 'em-maxwell-equations' }],
        downstream: [{ id: 'em-skin-depth' }, { id: 'em-cagniard-apparent-resistivity' }],
        seealso: [{ id: 'complex-phasor-representation' }],
    },
    refs: [{ text: 'Ward & Hohmann (1988), Electromagnetic Methods in Applied Geophysics' }],
};
export default emPlaneWaveInConductor;
//# sourceMappingURL=em-plane-wave-in-conductor.js.map