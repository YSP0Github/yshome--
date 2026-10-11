import { t } from '../../core/types.js';
/** l-curve-criterion */
const lCurveCriterion = {
    id: 'l-curve-criterion',
    name: t('L 曲线准则与正则化参数选择', 'The L-curve Criterion & Choosing the Regularization Parameter'),
    aliases: { zh: ['L 曲线', '正则化参数', '折中准则'], en: ['L-curve', 'regularization parameter', 'trade-off criterion'] },
    node: 'S10.1',
    tags: {
        math: ['MATH.LINALG', 'MATH.APPROX'],
        method: ['METH.INV'],
        quantity: ['Q.VEL'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `\Phi(\mathbf{m}) = \|\mathbf{d}-\mathbf{Gm}\|^{2} + \lambda^{2}\|\mathbf{L}\mathbf{m}\|^{2},\qquad
\hat{\mathbf{m}}_\lambda = (\mathbf{G}^{\mathsf{T}}\mathbf{G}+\lambda^{2}\mathbf{L}^{\mathsf{T}}\mathbf{L})^{-1}\mathbf{G}^{\mathsf{T}}\mathbf{d}`,
        variants: [
            { name: t('L 曲线的参数化', 'Parametrizing the L-curve'), latex: String.raw `x(\lambda) = \log\|\mathbf{G}\hat{\mathbf{m}}_\lambda-\mathbf{d}\|,\qquad y(\lambda)=\log\|\mathbf{L}\hat{\mathbf{m}}_\lambda\|` },
            { name: t('曲率最大的点即拐角', 'The corner is the point of maximum curvature'), latex: String.raw `\lambda^{*} = \arg\max_{\lambda}\ \kappa(\lambda),\qquad \kappa = \frac{x'y''-x''y'}{(x'^{2}+y'^{2})^{3/2}}` },
            { name: t('广义交叉验证 GCV', 'Generalized cross-validation (GCV)'), latex: String.raw `\mathrm{GCV}(\lambda) = \frac{\|\mathbf{G}\hat{\mathbf{m}}_\lambda-\mathbf{d}\|^{2}}{\left[1-\mathrm{tr}(\mathbf{A}_\lambda)/N\right]^{2}}` },
            { name: t(' discrepancy 原理', 'The discrepancy principle'), latex: String.raw `\|\mathbf{G}\hat{\mathbf{m}}_\lambda-\mathbf{d}\| = \|\mathbf{e}\|\ \text{（残差等于噪声水平）}` },
        ],
    },
    meaning: t('正则化参数 λ 是反演里最难受的选择：λ 太小，解在数据里过拟合、把噪声放大成假结构；λ 太大，解过度平滑、真实结构被抹平。把「残差范数」与「模型范数」画在对数坐标上，会得到一条 L 形的曲线 —— 拐角处正是两者的最佳折中。L 曲线准则就是在找这个拐角，它是实践中最常用、也最不容易出错的自动选参方法。', 'The regularization parameter λ is the most uncomfortable choice in inversion: too small and the solution overfits the data, amplifying noise into spurious structure; too large and it oversmooths, erasing real structure. Plotting the residual norm against the model norm on logarithmic axes yields an L-shaped curve whose corner is the optimal compromise. The L-curve criterion finds that corner — the most widely used and most robust automatic parameter-choice method in practice.'),
    symbols: [
        { sym: '\\lambda', name: t('正则化（阻尼）参数', 'regularization (damping) parameter'), unit: '无量纲' },
        { sym: '\\mathbf{L}', name: t('正则化算子（I、一阶差分或二阶差分）', 'regularization operator (identity, first or second difference)'), unit: '—' },
        { sym: '\\kappa', name: t('L 曲线的曲率', 'curvature of the L-curve'), unit: '—' },
        { sym: '\\mathbf{A}_\\lambda', name: t('影响矩阵 G(GᵀG+λ²LᵀL)⁻¹Gᵀ', 'influence matrix G(GᵀG+λ²LᵀL)⁻¹Gᵀ'), unit: '—' },
    ],
    conditions: {
        applies: [t('任何需要选阻尼的反演：层析、接收函数、面波、FWI 预处理', 'Any inversion needing a damping choice: tomography, receiver functions, surface waves, FWI preconditioning')],
        assumes: [t('残差范数与模型范数都在合理量级内变化', 'Both norms vary over a reasonable dynamic range')],
        breaks: [t('L 曲线非常平滑（无明确拐角）时准则失效', 'The criterion fails when the L-curve is very smooth with no clear corner'), t('误差水平已知时应优先用 discrepancy 原理', 'When the error level is known, prefer the discrepancy principle')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把拟合项与正则项加权相加', 'Add the fit term and the regularization term with a weight'), latex: String.raw `\Phi = \|\mathbf{Gm}-\mathbf{d}\|^{2}+\lambda^{2}\|\mathbf{Lm}\|^{2}` },
        { n: 2, op: 'algebra', title: t('求导并令为零', 'Differentiate and set to zero'), latex: String.raw `(\mathbf{G}^{\mathsf{T}}\mathbf{G}+\lambda^{2}\mathbf{L}^{\mathsf{T}}\mathbf{L})\hat{\mathbf{m}} = \mathbf{G}^{\mathsf{T}}\mathbf{d}` },
        { n: 3, op: 'identity', title: t('定义两个范数随 λ 变化的曲线', 'Define the curve traced by the two norms as λ varies'), latex: String.raw `\rho(\lambda)=\|\mathbf{G}\hat{\mathbf{m}}-\mathbf{d}\|,\quad \eta(\lambda)=\|\mathbf{L}\hat{\mathbf{m}}\|` },
        { n: 4, op: 'transform', title: t('取对数得到 L 形', 'Take logarithms to obtain the L shape'), latex: String.raw `x=\log\rho,\ y=\log\eta` },
        { n: 5, op: 'result', title: t('拐角 = 曲率极大点', 'The corner is the point of maximum curvature'), latex: String.raw `\lambda^{*} = \arg\max_\lambda \kappa(\lambda)` },
    ],
    viz: [
        {
            id: 'lcurve',
            level: 'V2',
            title: t('L 曲线与它的拐角', 'The L-curve and its corner'),
            xlabel: t('log 残差范数 ‖Gm − d‖', 'log residual norm ‖Gm − d‖'),
            ylabel: t('log 模型范数 ‖Lm‖', 'log model norm ‖Lm‖'),
            controls: [
                { id: 'noise', label: t('数据噪声水平', 'data noise level'), min: 0, max: 1, step: 0.02, value: 0.2 },
                { id: 'rough', label: t('真实模型的粗糙度', 'roughness of the true model'), min: 0.05, max: 2, step: 0.05, value: 0.6 },
            ],
            note: t('左上角对应 λ 很大（过度平滑、残差大），右下角对应 λ 很小（过拟合、模型范数爆掉）。拐角处两者同时较小 —— 这就是要选的 λ。噪声越大，拐角越往右上移动，也就是必须接受更大的残差。', 'The upper-left corresponds to large λ (over-smoothed, large residual); the lower-right to tiny λ (overfit, model norm blows up). At the corner both are relatively small — that is the λ to choose. Larger noise pushes the corner up and to the right, meaning a larger residual must be accepted.'),
            compute: (p) => {
                const nz = p['noise'], rough = p['rough'];
                const M = 40;
                // 构造一个一维反演：G 为平滑核，m_true 为有结构的模型
                const mtrue = [];
                for (let i = 0; i < M; i++) {
                    const x = (i / (M - 1)) * 6 - 3;
                    mtrue.push(Math.sin(x) + rough * Math.sin(7 * x) * 0.4);
                }
                let seed = 77;
                const rnd = () => {
                    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
                    return (seed / 0x7fffffff) * 2 - 1;
                };
                const d = [];
                for (let i = 0; i < M; i++) {
                    let s = 0;
                    for (let j = 0; j < M; j++) {
                        s += Math.exp(-((i - j) * (i - j)) / 8) * mtrue[j];
                    }
                    d.push(s + nz * rnd());
                }
                // 核矩阵 G（高斯平滑），并预存以便快速乘积
                const G = [];
                for (let i = 0; i < M; i++) {
                    const row = [];
                    for (let j = 0; j < M; j++)
                        row.push(Math.exp(-((i - j) * (i - j)) / 8));
                    G.push(row);
                }
                const Gm = (m) => G.map((row) => row.reduce((s, v, j) => s + v * m[j], 0));
                const GTv = (v) => G[0].map((_, j) => G.reduce((s, row, i) => s + row[j] * v[i], 0));
                // A·m = (GᵀG + λ²LᵀL)m，其中 LᵀL 用二阶差分自伴随形式近似
                const Amul = (m, lam) => {
                    const a = GTv(Gm(m));
                    const b = new Array(M).fill(0);
                    for (let j = 0; j < M; j++) {
                        const lap = j > 0 && j < M - 1 ? 2 * m[j] - m[j - 1] - m[j + 1] : m[j];
                        b[j] = 2 * lam * lam * lap;
                    }
                    return a.map((v, j) => v + b[j]);
                };
                // 共轭梯度法求解（对称正定，稳定收敛）
                const solve = (lam) => {
                    const rhs = GTv(d);
                    const m = new Array(M).fill(0);
                    let r = rhs.slice();
                    let pp = r.slice();
                    let rs = r.reduce((s, v) => s + v * v, 0);
                    for (let it = 0; it < 200; it++) {
                        const Ap = Amul(pp, lam);
                        const den = pp.reduce((s, v, j) => s + v * Ap[j], 0);
                        if (!Number.isFinite(den) || Math.abs(den) < 1e-14)
                            break;
                        const al = rs / den;
                        if (!Number.isFinite(al))
                            break;
                        for (let j = 0; j < M; j++) {
                            m[j] += al * pp[j];
                            r[j] -= al * Ap[j];
                        }
                        const rsNew = r.reduce((s, v) => s + v * v, 0);
                        if (rsNew < 1e-16 || !Number.isFinite(rsNew))
                            break;
                        const be = rsNew / rs;
                        for (let j = 0; j < M; j++)
                            pp[j] = r[j] + be * pp[j];
                        rs = rsNew;
                    }
                    const pred = Gm(m);
                    let res = 0;
                    for (let i = 0; i < M; i++)
                        res += (pred[i] - d[i]) * (pred[i] - d[i]);
                    let mn = 0;
                    for (let j = 0; j < M - 1; j++)
                        mn += (m[j + 1] - m[j]) * (m[j + 1] - m[j]);
                    const rr = Math.sqrt(Math.max(res, 0)) / M;
                    const mm = Math.sqrt(Math.max(mn, 0));
                    return [Number.isFinite(rr) ? rr : 1e-9, Number.isFinite(mm) ? mm : 1e-9];
                };
                const pts = [];
                for (let k = 0; k <= 30; k++) {
                    const lam = Math.pow(10, -3 + (k / 30) * 6);
                    const [r, mn] = solve(lam);
                    pts.push([Math.log10(Math.max(r, 1e-9)), Math.log10(Math.max(mn, 1e-9))]);
                }
                return [{ label: t('L 曲线', 'L-curve'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('拐角处的 λ', 'λ at the corner'),
        input: t('一个 40 参数的一维反演，噪声 0.2', 'A 40-parameter 1-D inversion with noise 0.2'),
        steps: [
            t('λ = 10⁻³ 时残差 0.05、模型范数 8（过拟合）', 'λ = 10⁻³ gives residual 0.05 and model norm 8 (overfit)'),
            t('λ = 10² 时残差 0.9、模型范数 0.3（过度平滑）', 'λ = 10² gives residual 0.9 and model norm 0.3 (over-smoothed)'),
            t('拐角在 λ ≈ 1，残差 0.2、模型范数 1.1', 'The corner is near λ ≈ 1, with residual 0.2 and model norm 1.1'),
        ],
        output: t('选 λ ≈ 1，残差与噪声水平相当', 'Choose λ ≈ 1, where the residual matches the noise level'),
    },
    links: {
        upstream: [
            { id: 'damped-least-squares', note: t('阻尼最小二乘给出 m̂_λ', 'Damped least squares gives m̂_λ') },
            { id: 'least-squares-normal-equations', note: t('未正则化的原始解', 'The unregularized original solution') },
        ],
        downstream: [{ id: 'resolution-matrix', note: t('选定 λ 后要检查分辨率', 'After choosing λ, check the resolution') }],
        seealso: [{ id: 'bayesian-inversion', note: t('贝叶斯视角下 λ 是先验方差之比', 'In the Bayesian view λ is a ratio of prior variances') }],
    },
    refs: [{ text: 'Hansen & O\'Leary (1993), The use of the L-curve in the regularization of discrete ill-posed problems, SIAM J. Sci. Comput. 14, 1487–1503' }],
};
export default lCurveCriterion;
//# sourceMappingURL=l-curve-criterion.js.map