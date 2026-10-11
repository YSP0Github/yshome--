import { t } from '../../core/types.js';
/** deviatoric-stress */
const deviatoricStress = {
    id: 'deviatoric-stress',
    name: t('偏应力张量与球应力分解', 'The Deviatoric Stress and the Spherical Decomposition'),
    aliases: { zh: ['偏应力', '球应力', '静水压力分量', '应力分解'], en: ['deviatoric stress', 'spherical stress', 'hydrostatic component', 'stress decomposition'] },
    node: 'S1.1',
    tags: {
        math: ['MATH.LINALG', 'MATH.VECTOR'],
        method: ['METH.STRUCT', 'METH.ROCK'],
        quantity: ['Q.TENSOR', 'Q.MAT'],
        keywords: t('偏应力 球应力 平均应力 静水压力 形状改变 体积改变 von Mises J2', 'deviatoric spherical mean stress hydrostatic shape change volume change von Mises'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\sigma_{ij}=s_{ij}+\frac{1}{3}\sigma_{kk}\delta_{ij},\qquad s_{ij}=\sigma_{ij}-\bar{\sigma}\,\delta_{ij}`,
        variants: [
            { name: t('（地震学常用：压为正）', 'Seismological convention: compression positive'), latex: String.raw `\sigma_{ij}=s_{ij}-p\,\delta_{ij},\qquad p=-\frac{\sigma_{kk}}{3}` },
            { name: t('偏应力第二不变量', 'Second invariant of the deviator'), latex: String.raw `J_2=\frac{1}{2}s_{ij}s_{ij}=\frac{1}{6}\left[\left(\sigma_1-\sigma_2\right)^{2}+\left(\sigma_2-\sigma_3\right)^{2}+\left(\sigma_3-\sigma_1\right)^{2}\right]` },
            { name: t('von Mises 等效应力', 'von Mises equivalent stress'), latex: String.raw `\sigma_{\mathrm{eq}}=\sqrt{3J_2}` },
            { name: t('与 Hooke 定律对接：体积归 K，形状归 μ', 'Matched to Hooke’s law: volume to K, shape to μ'), latex: String.raw `\bar{\sigma}=-K\,\theta,\qquad s_{ij}=2\mu\left(\varepsilon_{ij}-\frac{1}{3}\theta\delta_{ij}\right)` },
            { name: t('应力比（用于反演震源区应力场）', 'Stress ratio used when inverting tectonic stress'), latex: String.raw `R=\frac{\sigma_1-\sigma_2}{\sigma_1-\sigma_3}\in[0,1]` },
        ],
    },
    meaning: t('把应力切成两半：一半是各方向相同的球量（只压体积、不改变形状），另一半是迹为零的偏量（只扭形状、不改变体积）。这个切分之所以重要，是因为岩石对这两者的反应截然不同 —— 静水压力几乎不会压破岩石，而偏应力稍大就产生破裂与地震；同时波速也据此分成 P（体积）与 S（形状）两支。', 'Split the stress in two: a spherical part that is the same in every direction, which changes volume but not shape, and a trace-free deviatoric part, which changes shape but not volume. The split matters because rock responds to the two in completely different ways — hydrostatic pressure almost never breaks rock, while a modest deviatoric stress produces fracture and earthquakes. The same split is why wave speeds separate into a P branch for volume and an S branch for shape.'),
    symbols: [
        { sym: 's_{ij}', name: t('偏应力张量（迹为零）', 'deviatoric stress tensor (trace-free)'), unit: 'Pa' },
        { sym: '\\bar{\\sigma}', name: t('平均正应力（球应力，拉为正）', 'mean normal stress (spherical, tension positive)'), unit: 'Pa' },
        { sym: 'p', name: t('压力 = −σ̄（此处为力学压力，不是射线参数）', 'pressure = −σ̄ (mechanical pressure here, not ray parameter)'), unit: 'Pa', typical: '0 – 10⁹ Pa' },
        { sym: '\\delta_{ij}', name: t('Kronecker δ', 'Kronecker delta'), unit: '', dimension: '无量纲' },
        { sym: 'J_2', name: t('偏应力第二不变量', 'second deviatoric invariant'), unit: 'Pa²' },
        { sym: '\\sigma_{\\mathrm{eq}}', name: t('von Mises 等效应力', 'von Mises equivalent stress'), unit: 'Pa' },
        { sym: 'K', name: t('体积模量', 'bulk modulus'), unit: 'Pa', typical: '10¹⁰ Pa' },
        { sym: '\\mu', name: t('剪切模量', 'shear modulus'), unit: 'Pa', typical: '10¹⁰ Pa' },
        { sym: 'R', name: t('应力比', 'stress ratio'), unit: '', dimension: '无量纲', typical: '0.3 – 0.7' },
    ],
    conditions: {
        applies: [
            t('任意应力状态，任意坐标系', 'Any stress state in any coordinate system'),
            t('分析破裂、屈服、震源机制与 P/S 波分解时', 'Analysing failure, yielding, focal mechanisms and the P/S decomposition'),
        ],
        assumes: [
            t('σ 对称，因此可对角化，分解在主轴下最直观', 'σ is symmetric and therefore diagonalisable; the decomposition is most transparent on the principal axes'),
            t('线弹性：球量与偏量各自独立地联系到 K 与 μ', 'Linear elasticity: the spherical and deviatoric parts connect independently to K and μ'),
        ],
        breaks: [
            t('高压下 K 与 μ 随压力变化，体积与形状不再解耦', 'At high pressure K and μ themselves depend on pressure, so volume and shape responses no longer decouple'),
            t('塑性、孔隙弹性与破裂后行为需要额外的内变量', 'Plasticity, poroelasticity and post-failure behaviour require additional internal variables'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把恒等张量抽出来', 'Extract the identity part'),
            latex: String.raw `\sigma_{ij}=\left(\sigma_{ij}-\frac{1}{3}\sigma_{kk}\delta_{ij}\right)+\frac{1}{3}\sigma_{kk}\delta_{ij}`,
            note: t('这个技巧对任何二阶张量都成立：先减掉自己的迹，再补回去。', 'The trick works for any second-rank tensor: subtract its own trace, then add it back.') },
        { n: 2, op: 'identity', title: t('验证偏量部分迹为零', 'Check that the deviator is trace-free'),
            latex: String.raw `s_{kk}=\sigma_{kk}-\frac{1}{3}\sigma_{kk}\delta_{kk}=\sigma_{kk}-\frac{1}{3}\sigma_{kk}\cdot 3=0`,
            note: t('δ_kk = 3（三维）。迹为零正是「不改变体积」的数学表达。', 'δ_kk = 3 in three dimensions. A vanishing trace is exactly the mathematical expression of "does not change volume".') },
        { n: 3, op: 'result', title: t('物理含义：球量压体积，偏量改形状', 'Physics: the sphere squeezes volume, the deviator twists shape'),
            latex: String.raw `\bar{\sigma}=-K\,\theta,\qquad s_{ij}=2\mu\,\varepsilon'_{ij},\qquad \varepsilon'_{ij}=\varepsilon_{ij}-\frac{1}{3}\theta\delta_{ij}`,
            note: t('注意两个模量各管一段，互不干扰 —— 这就是体积模量与剪切模量物理分工的来源。', 'Two moduli, two jobs, no interference between them: this is the physical division of labour between bulk and shear modulus.') },
        { n: 4, op: 'identity', title: t('偏量的第二不变量', 'Second invariant of the deviator'),
            latex: String.raw `J_2=\frac{1}{2}s_{ij}s_{ij}=\frac{1}{6}\left[\left(\sigma_1-\sigma_2\right)^{2}+\left(\sigma_2-\sigma_3\right)^{2}+\left(\sigma_3-\sigma_1\right)^{2}\right]`,
            note: t('只含差值：J₂ 对任何静水压力都不敏感，这正是它被选作屈服判据的原因。', 'Only differences appear, so J₂ is completely insensitive to any hydrostatic pressure — precisely why it is chosen for yield criteria.') },
        { n: 5, op: 'result', title: t('为什么静水压力压不破岩石', 'Why hydrostatic pressure does not break rock'),
            latex: String.raw `\text{hydrostatic:}\; s_{ij}=0\;\Longrightarrow\; J_2=0\;\Longrightarrow\; \text{no shear on any plane}`,
            note: t('s_ij = 0 时任意取向的 Mohr 圆退化成一个点，τ ≡ 0，没有任何面可以被剪开。', 'When s_ij = 0 the Mohr circle degenerates to a single point with τ ≡ 0, so no plane can be sheared apart.') },
        { n: 6, op: 'result', title: t('地震学中的用途：P 轴与 T 轴', 'Use in seismology: the P and T axes'),
            latex: String.raw `\boldsymbol{s}=\sigma_1'\hat{\boldsymbol{e}}_1\hat{\boldsymbol{e}}_1+\sigma_2'\hat{\boldsymbol{e}}_2\hat{\boldsymbol{e}}_2+\sigma_3'\hat{\boldsymbol{e}}_3\hat{\boldsymbol{e}}_3,\qquad \sigma_1'+\sigma_2'+\sigma_3'=0`,
            note: t('震源机制解能恢复的往往只是偏应力的方向（P/T/B 轴）与应力比 R，静水部分在地震矩张量里通常不可分辨。', 'Focal mechanisms typically recover only the orientation of the deviatoric stress, the P/T/B axes and the ratio R; the hydrostatic part is usually unresolvable in the moment tensor.') },
    ],
    viz: [
        {
            id: 'deviator-vs-ratio',
            level: 'V1',
            title: t('应力比 R 如何重新分配三个偏主应力', 'How the stress ratio R redistributes the three deviatoric principal stresses'),
            xlabel: t('应力比 R = (σ₁ − σ₂)/(σ₁ − σ₃)', 'stress ratio R = (σ₁ − σ₂)/(σ₁ − σ₃)'),
            ylabel: t('偏主应力 s_i (MPa)', 'deviatoric principal stress s_i (MPa)'),
            controls: [
                { id: 'd1', label: t('最大主应力 σ₁', 'maximum principal stress σ₁'), min: 0, max: 400, step: 5, value: 150, unit: 'MPa' },
                { id: 'd3', label: t('最小主应力 σ₃', 'minimum principal stress σ₃'), min: 0, max: 400, step: 5, value: 30, unit: 'MPa' },
            ],
            xRange: [0, 1],
            note: t('三条曲线之和恒为零 —— 这是偏应力最硬的约束。R = 0 时 σ₂ 贴近 σ₁（纯挤压加一个侧向松弛），R = 1 时 σ₂ 贴近 σ₃。震源机制反演里 R 就是靠这个自由度区分走滑、正断与逆断型应力场。', 'The three curves always sum to zero, the hardest constraint on the deviator. At R = 0 the intermediate stress hugs σ₁; at R = 1 it hugs σ₃. In stress inversions this single degree of freedom is what separates strike-slip, normal and thrust regimes.'),
            compute: (p) => {
                const s1 = Math.max(p['d1'], p['d3']);
                const s3 = Math.min(p['d1'], p['d3']);
                const A = [];
                const B = [];
                const C = [];
                for (let i = 0; i <= 200; i++) {
                    const R = i / 200;
                    const s2 = s1 - R * (s1 - s3);
                    const mean = (s1 + s2 + s3) / 3;
                    A.push([R, s1 - mean]);
                    B.push([R, s2 - mean]);
                    C.push([R, s3 - mean]);
                }
                const zero = [[0, 0], [1, 0]];
                return [
                    { label: t('s₁（最大偏主应力）', 's₁ (largest deviatoric)'), color: '#185FA5', points: A },
                    { label: t('s₂（中间偏主应力）', 's₂ (intermediate deviatoric)'), color: '#0F6E56', points: B },
                    { label: t('s₃（最小偏主应力）', 's₃ (smallest deviatoric)'), color: '#993C1D', points: C },
                    { label: t('零线（s₁+s₂+s₃ = 0）', 'zero line (s₁+s₂+s₃ = 0)'), color: '#B4B2A9', dash: true, points: zero },
                ];
            },
        },
    ],
    links: {
        upstream: [{ id: 'stress-invariants', note: t('I₁ 给出球量，其余归偏量', 'I₁ gives the spherical part, everything else is deviatoric') }],
        downstream: [{ id: 'hookes-law-isotropic', note: t('分解后 K 与 μ 各管一段', 'after the split K and μ each take one part') }],
        seealso: [{ id: 'mohr-circle-max-shear' }],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
        { text: 'Zoback, Reservoir Geomechanics, §1.3' },
    ],
};
export default deviatoricStress;
//# sourceMappingURL=deviatoric-stress.js.map