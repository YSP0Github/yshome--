import { t } from '../../core/types.js';
/** slip-distribution-inversion */
const slipDistributionInversion = {
    id: 'slip-distribution-inversion',
    name: t('有限断层滑动分布反演', 'Finite-fault Slip-distribution Inversion'),
    aliases: { zh: ['滑动分布反演', '有限断层反演', '破裂过程'], en: ['slip inversion', 'finite-fault inversion', 'rupture process'] },
    node: 'S4.4',
    tags: {
        math: ['MATH.LINALG', 'MATH.STAT'],
        method: ['METH.INV', 'METH.TELE'],
        quantity: ['Q.SOURCE', 'Q.GEOM'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `\mathbf{m} = \left(\mathbf{G}^{T}\mathbf{G} + \lambda^{2}\mathbf{L}^{T}\mathbf{L}\right)^{-1}\mathbf{G}^{T}\mathbf{d}`,
        variants: [
            { name: t('目标函数', 'Objective function'), latex: String.raw `\Phi(\mathbf{m}) = \|\mathbf{G}\mathbf{m}-\mathbf{d}\|^{2} + \lambda^{2}\|\mathbf{L}\mathbf{m}\|^{2}` },
            { name: t('平滑约束（拉普拉斯）', 'Smoothing constraint (Laplacian)'), latex: String.raw `\mathbf{L} = \nabla^{2}_{\text{空间}}` },
            { name: t('附加约束', 'Additional constraints'), latex: String.raw `m_i \ge 0\ (\text{滑动不反向}),\qquad \sum_i \mu m_i A_i = M_0` },
        ],
    },
    meaning: t('把断层面切成许多小块，每块一个未知滑动量，用地震波或大地测量数据反求它们的分布 —— 这就是有限断层反演。问题是方程严重欠定：数据分辨率远低于子断层数量，所以必须加平滑约束。λ 的选择决定结果是「光滑但宽」还是「粗糙但尖锐」，是所有反演中最需要谨慎的一步。', 'Discretise the fault into many subfaults with one unknown slip each and invert seismic or geodetic data for their distribution — that is finite-fault inversion. The problem is severely underdetermined: data resolution is far coarser than the number of subfaults, so smoothing is mandatory. The choice of λ decides whether the result is smooth-but-broad or rough-but-sharp, and is the most delicate step in the whole inversion.'),
    symbols: [
        { sym: '\\mathbf{m}', name: t('各子断层的滑动量矢量', 'vector of subfault slips'), unit: 'm' },
        { sym: '\\mathbf{G}', name: t('Green 函数矩阵', 'Green-function matrix'), unit: '1/m' },
        { sym: '\\mathbf{d}', name: t('观测数据', 'observed data'), unit: 'm 或 m/s' },
        { sym: '\\lambda', name: t('平滑权重', 'smoothing weight'), unit: '无量纲', typical: '0.1 – 10' },
        { sym: '\\mathbf{L}', name: t('正则化算子', 'regularisation operator'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('大地震破裂过程成像、海啸与强地面运动模拟的输入', 'Imaging the rupture process of large earthquakes; input for tsunami and strong-motion modelling')],
        assumes: [
            t('断层几何已知或已单独确定', 'Fault geometry is known or determined separately'),
            t('Green 函数准确（速度结构可靠）', 'Green functions are accurate (velocity structure is reliable)'),
        ],
        breaks: [
            t('断层几何错误会让滑动分布完全失真', 'Wrong fault geometry completely distorts the slip distribution'),
            t('过度平滑会掩盖真实凹凸体，平滑不足会产生虚假细节', 'Over-smoothing hides real asperities; under-smoothing invents false detail'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把断层离散化', 'Discretise the fault'),
            latex: String.raw `\mathbf{d} = \mathbf{G}\mathbf{m},\qquad m_i = \text{第 } i \text{ 个子断层的滑动量}` },
        { n: 2, op: 'algebra', title: t('写最小二乘目标函数', 'Write the least-squares objective'),
            latex: String.raw `\Phi = \|\mathbf{G}\mathbf{m}-\mathbf{d}\|^{2} + \lambda^{2}\|\mathbf{L}\mathbf{m}\|^{2}` },
        { n: 3, op: 'algebra', title: t('对 m 求导并令其为零', 'Differentiate with respect to m and set to zero'),
            latex: String.raw `2\mathbf{G}^{T}(\mathbf{G}\mathbf{m}-\mathbf{d}) + 2\lambda^{2}\mathbf{L}^{T}\mathbf{L}\mathbf{m} = 0` },
        { n: 4, op: 'algebra', title: t('整理出正规方程', 'Collect the normal equations'),
            latex: String.raw `(\mathbf{G}^{T}\mathbf{G} + \lambda^{2}\mathbf{L}^{T}\mathbf{L})\mathbf{m} = \mathbf{G}^{T}\mathbf{d}` },
        { n: 5, op: 'result', title: t('求逆得到解', 'Invert to obtain the solution'),
            latex: String.raw `\mathbf{m} = (\mathbf{G}^{T}\mathbf{G}+\lambda^{2}\mathbf{L}^{T}\mathbf{L})^{-1}\mathbf{G}^{T}\mathbf{d}` },
    ],
    viz: [
        {
            id: 'lcurve',
            level: 'V2',
            title: t('L 曲线：数据拟合与模型粗糙度的权衡', 'The L-curve: data fit versus model roughness'),
            xlabel: t('log 模型粗糙度 ‖Lm‖', 'log model roughness ‖Lm‖'),
            ylabel: t('log 数据残差 ‖Gm−d‖', 'log data residual ‖Gm−d‖'),
            controls: [
                { id: 'g', label: t('Green 函数灵敏度 g', 'Green-function sensitivity g'), min: 0.2, max: 3, step: 0.05, value: 1 },
            ],
            note: t('曲线拐角处就是最优 λ：再往左残差爆炸，再往右模型被过度平滑。', 'The corner of the curve is the optimal λ: to its left the residual explodes, to its right the model is over-smoothed.'),
            compute: (p) => {
                const g = p['g'];
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const lam = Math.pow(10, -2 + (i / 200) * 4);
                    const m = (g * 1) / (g * g + lam * lam);
                    const res = Math.abs(g * m - 1);
                    const rough = Math.abs(m);
                    pts.push([Math.log10(rough + 1e-12), Math.log10(res + 1e-12)]);
                }
                return [{ label: t('L 曲线', 'L-curve'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('选择平滑权重', 'Choosing the smoothing weight'),
        input: t('单参数问题，g = 1，d = 1', 'Single-parameter problem with g = 1, d = 1'),
        steps: [
            t('λ = 0.1：m = 1/1.01 = 0.990，残差 0.010', 'λ = 0.1: m = 1/1.01 = 0.990, residual 0.010'),
            t('λ = 1：m = 0.5，残差 0.5', 'λ = 1: m = 0.5, residual 0.5'),
        ],
        output: t('λ 与 g 同量级时解被严重压缩 —— 平滑权重必须远小于数据灵敏度', 'When λ is comparable to g the solution is heavily damped — the smoothing weight must be well below the data sensitivity'),
    },
    links: {
        upstream: [
            { id: 'okada-dislocation', note: t('Green 函数的静态部分', 'The static part of the Green functions') },
            { id: 'damped-least-squares', note: t('阻尼最小二乘的一般形式', 'General form of damped least squares') },
        ],
        seealso: [{ id: 'resolution-matrix', note: t('评估反演的分辨率', 'Assessing inversion resolution') }],
    },
    refs: [{ text: 'Hartzell, S. & Heaton, T. (1983). Inversion of strong ground motion and teleseismic waveform data. Bull. Seismol. Soc. Am., 73, 1–31' }],
};
export default slipDistributionInversion;
//# sourceMappingURL=slip-distribution-inversion.js.map