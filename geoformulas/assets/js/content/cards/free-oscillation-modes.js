import { t } from '../../core/types.js';
/** free-oscillation-modes */
const freeOscillationModes = {
    id: 'free-oscillation-modes',
    name: t('地球自由振荡的模', 'Earth Free-oscillation Modes'),
    aliases: { zh: ['球型模', '环型模', '自由振荡'], en: ['spheroidal modes', 'toroidal modes', 'free oscillations'] },
    node: 'S5.5',
    tags: {
        math: ['MATH.DIFF', 'MATH.VECTOR'],
        method: ['METH.STRUCT'],
        quantity: ['Q.FREQ'],
    },
    audience: 'phd',
    complete: 'L2',
    statement: {
        main: String.raw `{}_nS_\ell\ \text{与}\ {}_nT_\ell:\qquad \omega={}_n\omega_\ell`,
        variants: [
            { name: t('命名规则', 'Naming convention'), latex: String.raw `{}_nS_\ell:\ n=\text{径向阶数},\ \ell=\text{角阶数};\qquad {}_nT_\ell:\ \text{环型（无径向位移）}` },
            { name: t('球型模与环型模的位移场', 'Displacement fields of spheroidal and toroidal modes'), latex: String.raw `\boldsymbol{u}_{S}=U(r)Y_\ell^m\hat{\boldsymbol r}+V(r)\nabla_1 Y_\ell^m,\qquad \boldsymbol{u}_{T}=W(r)\,\hat{\boldsymbol r}\times\nabla_1 Y_\ell^m` },
        ],
    },
    meaning: t('大地震过后，整个地球会像一口钟一样「响」上几天到几个月，这些本征振动就是自由振荡。球型模（S）伴随径向位移和体积变化，能被重力仪与垂直分量记录；环型模（T）只有水平剪切运动，不涉及体积变化。它们的本征频率是唯一能直接约束地球整体密度与弹性结构的观测量。', 'After a great earthquake the whole Earth rings like a bell for days to months; these eigenvibrations are the free oscillations. Spheroidal modes (S) involve radial displacement and volume change, and are recorded by gravimeters and vertical components; toroidal modes (T) are purely horizontal shear and involve no volume change. Their eigenfrequencies are the only observations that constrain the Earth’s overall density and elastic structure directly.'),
    symbols: [
        { sym: '{}_nS_\\ell', name: t('球型模', 'spheroidal mode'), unit: '无量纲' },
        { sym: '{}_nT_\\ell', name: t('环型模', 'toroidal mode'), unit: '无量纲' },
        { sym: 'n', name: t('径向阶数（节点球个数）', 'radial order (number of nodal spheres)'), unit: '无量纲', typical: '0 – 30' },
        { sym: '\\ell', name: t('角阶数（角向波长）', 'angular order (angular wavelength)'), unit: '无量纲', typical: '2 – 100' },
        { sym: 'Y_\\ell^m', name: t('球谐函数', 'spherical harmonic'), unit: '无量纲' },
        { sym: '\\omega', name: t('本征角频率', 'eigenfrequency'), unit: 'rad/s', typical: '10⁻⁴ – 10⁻²' },
    ],
    conditions: {
        applies: [t('球对称、非旋转、各向同性、弹性的地球模型（SNREI）', 'Spherically symmetric, non-rotating, isotropic, elastic Earth model (SNREI)')],
        assumes: [t('小振幅、线性弹性', 'Small amplitude, linear elasticity')],
        breaks: [
            t('地球自转与椭率会使每个模分裂成 2ℓ+1 个多线态', 'Rotation and ellipticity split each mode into 2ℓ+1 multiplets'),
            t('横向非均匀造成模的耦合与频移', 'Lateral heterogeneity causes mode coupling and frequency shifts'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把位移场按球谐展开', 'Expand the displacement field in spherical harmonics'),
            latex: String.raw `\boldsymbol{u}(\boldsymbol{r},t)=\sum_{\ell,m}\left[U Y_\ell^m\hat{\boldsymbol r}+V\nabla_1 Y_\ell^m+W\,\hat{\boldsymbol r}\times\nabla_1Y_\ell^m\right]e^{i\omega t}` },
        { n: 2, op: 'identity', title: t('环型与球型解耦', 'Toroidal and spheroidal motions decouple'),
            latex: String.raw `\hat{\boldsymbol r}\times\nabla_1Y_\ell^m\ \text{与}\ \left(Y_\ell^m\hat{\boldsymbol r},\ \nabla_1Y_\ell^m\right)\ \text{正交}` },
        { n: 3, op: 'physics', title: t('代入运动方程得到两个本征值问题', 'Substituting gives two eigenvalue problems'),
            latex: String.raw `\mathcal{L}_S\begin{bmatrix}U\\V\end{bmatrix}=\omega^{2}\begin{bmatrix}U\\V\end{bmatrix},\qquad \mathcal{L}_T W=\omega^{2}W` },
        { n: 4, op: 'result', title: t('离散本征频率', 'Discrete eigenfrequencies'),
            latex: String.raw `\omega={}_n\omega_\ell^{S}\ \text{或}\ {}_n\omega_\ell^{T}` },
    ],
    example: {
        title: t('几个著名的模', 'Some famous modes'),
        input: t('₀S₂（橄榄球模）、₀S₀（呼吸模）、₀T₂', '₀S₂ (football mode), ₀S₀ (breathing mode), ₀T₂'),
        steps: [
            t('₀S₂ 周期约 3233 s（约 54 分钟）', '₀S₂ has a period of about 3233 s (roughly 54 minutes)'),
            t('₀S₀ 周期约 1228 s，纯径向呼吸', '₀S₀ has a period of about 1228 s, a pure radial breathing'),
            t('₀T₂ 周期约 2638 s', '₀T₂ has a period of about 2638 s'),
        ],
        output: t('这些周期对地球整体密度与体积模量极其敏感，是 PREM 的重要约束', 'These periods are extremely sensitive to the Earth’s overall density and bulk modulus and are key constraints on PREM'),
    },
    links: {
        upstream: [{ id: 'spherical-harmonics', note: t('角向基函数', 'Angular basis functions') }],
        seealso: [{ id: 'normal-mode-summation', note: t('用这些模合成理论地震图', 'Synthesising seismograms from these modes') }],
    },
    refs: [{ text: 'Dahlen & Tromp, Theoretical Global Seismology, §8' }, { text: 'Shearer, Introduction to Seismology, 2nd ed., §11.6' }],
};
export default freeOscillationModes;
//# sourceMappingURL=free-oscillation-modes.js.map