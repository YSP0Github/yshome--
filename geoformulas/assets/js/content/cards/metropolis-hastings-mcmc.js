import { t } from '../../core/types.js';
/** metropolis-hastings-mcmc */
const metropolisHastingsMcmc = {
    id: 'metropolis-hastings-mcmc',
    name: t('Metropolis–Hastings 抽样', 'Metropolis–Hastings Sampling'),
    aliases: { zh: ['MCMC', 'Metropolis 抽样', '后验采样'], en: ['MCMC', 'Metropolis sampling', 'posterior sampling'] },
    node: 'S10.3',
    tags: {
        math: ['MATH.STAT', 'MATH.ALGEBRA'],
        method: ['METH.INV'],
        quantity: ['Q.VEL'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `\alpha(\mathbf{m}'\mid\mathbf{m}) = \min\left(1,\ \frac{p(\mathbf{d}\mid\mathbf{m}')\,p(\mathbf{m}')\,q(\mathbf{m}\mid\mathbf{m}')}{p(\mathbf{d}\mid\mathbf{m})\,p(\mathbf{m})\,q(\mathbf{m}'\mid\mathbf{m})}\right)`,
        variants: [
            { name: t('贝叶斯定理', "Bayes' theorem"), latex: String.raw `p(\mathbf{m}\mid\mathbf{d}) = \frac{p(\mathbf{d}\mid\mathbf{m})\,p(\mathbf{m})}{p(\mathbf{d})}` },
            { name: t('对称建议分布时退化为 Metropolis 准则', 'For a symmetric proposal it reduces to the Metropolis rule'), latex: String.raw `\alpha = \min\left(1,\ \frac{L(\mathbf{m}')p(\mathbf{m}')}{L(\mathbf{m})p(\mathbf{m})}\right)` },
            { name: t('高斯误差下的似然', 'Likelihood under Gaussian errors'), latex: String.raw `p(\mathbf{d}\mid\mathbf{m}) \propto \exp\!\left(-\frac{1}{2}(\mathbf{d}-\mathbf{g}(\mathbf{m}))^{\mathsf{T}}\mathbf{C}_d^{-1}(\mathbf{d}-\mathbf{g}(\mathbf{m}))\right)` },
            { name: t('接受率与建议步长的关系', 'Acceptance rate versus proposal step size'), latex: String.raw `\text{步长} \uparrow \Rightarrow \text{接受率} \downarrow;\quad \text{经验最优接受率} \approx 0.23` },
        ],
    },
    meaning: t('当地球物理反演不再只想要「一个最优模型」，而是想知道「这个模型有多不确定」时，就要对后验概率分布采样。Metropolis–Hastings 是最基础的采样器：从当前模型出发随机迈一步，若新模型更拟合且更符合先验就接受，否则以一定概率接受（保留跳出局部最优的可能）。跑足够久之后，访问频率就正比于后验概率 —— 于是均值、标准差、相关性、边缘分布全都可以直接读出来。', 'When a geophysical inversion wants not just "one best model" but "how uncertain is this model", the posterior distribution must be sampled. Metropolis–Hastings is the most basic sampler: take a random step from the current model, accept if the new model fits better and is more consistent with the prior, otherwise accept with some probability (preserving the ability to escape local optima). After running long enough, the visit frequency is proportional to the posterior probability — so means, standard deviations, correlations and marginals can all be read off directly.'),
    symbols: [
        { sym: '\\alpha', name: t('接受概率', 'acceptance probability'), unit: '无量纲' },
        { sym: 'p(\\mathbf{m}\\mid\\mathbf{d})', name: t('后验概率密度', 'posterior probability density'), unit: '—' },
        { sym: 'p(\\mathbf{d}\\mid\\mathbf{m})', name: t('似然', 'likelihood'), unit: '—' },
        { sym: 'p(\\mathbf{m})', name: t('先验', 'prior'), unit: '—' },
        { sym: 'q(\\mathbf{m}^\\prime\\mid\\mathbf{m})', name: t('建议分布（转移核）', 'proposal distribution (transition kernel)'), unit: '—' },
    ],
    conditions: {
        applies: [t('非线性反演的不确定性量化、震源参数后验、地幔热力学反演', 'Uncertainty quantification for nonlinear inversions, source-parameter posteriors, mantle thermochemical inversion')],
        assumes: [t('后验可计算到归一化常数', 'The posterior is computable up to a normalising constant')],
        breaks: [t('高维（数千参数以上）时随机游走效率极低', 'Random-walk sampling is very inefficient in high dimensions (thousands of parameters)'), t('多峰后验时链可能长时间困在一个峰里', 'With multimodal posteriors a chain may stay trapped in one mode')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('目标是按后验 p(m|d) 抽样', 'The goal is to sample from the posterior p(m|d)'), latex: String.raw `p(\mathbf{m}\mid\mathbf{d}) \propto p(\mathbf{d}\mid\mathbf{m})p(\mathbf{m})` },
        { n: 2, op: 'physics', title: t('构造满足细致平衡的马氏链', 'Construct a Markov chain satisfying detailed balance'), latex: String.raw `p(\mathbf{m})T(\mathbf{m}\to\mathbf{m}') = p(\mathbf{m}')T(\mathbf{m}'\to\mathbf{m})` },
        { n: 3, op: 'identity', title: t('转移概率写成建议 × 接受', 'Write the transition as proposal times acceptance'), latex: String.raw `T(\mathbf{m}\to\mathbf{m}') = q(\mathbf{m}'\mid\mathbf{m})\,\alpha(\mathbf{m}'\mid\mathbf{m})` },
        { n: 4, op: 'algebra', title: t('解出接受概率', 'Solve for the acceptance probability'), latex: String.raw `\frac{\alpha(\mathbf{m}'\mid\mathbf{m})}{\alpha(\mathbf{m}\mid\mathbf{m}')} = \frac{p(\mathbf{m}'\mid\mathbf{d})\,q(\mathbf{m}\mid\mathbf{m}')}{p(\mathbf{m}\mid\mathbf{d})\,q(\mathbf{m}'\mid\mathbf{m})}` },
        { n: 5, op: 'result', title: t('取 Metropolis–Hastings 形式', 'Take the Metropolis–Hastings form'), latex: String.raw `\alpha = \min\left(1,\ \frac{p(\mathbf{d}\mid\mathbf{m}')p(\mathbf{m}')q(\mathbf{m}\mid\mathbf{m}')}{p(\mathbf{d}\mid\mathbf{m})p(\mathbf{m})q(\mathbf{m}'\mid\mathbf{m})}\right)` },
    ],
    viz: [
        {
            id: 'mh-chain',
            level: 'V3',
            title: t('Metropolis 抽样在一维高斯后验上的表现', 'Metropolis sampling on a one-dimensional Gaussian posterior'),
            xlabel: t('步数', 'step'),
            ylabel: t('参数 m', 'parameter m'),
            controls: [
                { id: 'step', label: t('建议步长 σ_q', 'proposal step σ_q'), min: 0.02, max: 5, step: 0.02, value: 0.8 },
                { id: 'n', label: t('迭代步数', 'number of iterations'), min: 200, max: 4000, step: 100, value: 2000 },
                { id: 'bimod', label: t('0 = 单峰, 1 = 双峰后验', '0 = unimodal, 1 = bimodal'), min: 0, max: 1, step: 1, value: 0 },
            ],
            note: t('步长太小时链移动缓慢、样本高度相关（看起来像随机游走）；步长太大时几乎每步都被拒绝（看起来像一条水平线）。理想状态是「毛毛虫」般的曲线 —— 既在移动又偶尔停留。经验上把接受率调到约 20–30% 最好。', 'Too small a step makes the chain move slowly with highly correlated samples (it looks like a random walk); too large a step rejects almost every move (it looks like a flat line). The ideal is a "caterpillar" curve — moving yet occasionally staying put. Empirically an acceptance rate of about 20–30% works best.'),
            compute: (p) => {
                const sq = p['step'], N = Math.round(p['n']), bim = Math.round(p['bimod']);
                let seed = 20240101;
                const rnd = () => {
                    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
                    return seed / 0x7fffffff;
                };
                const gauss = () => Math.sqrt(-2 * Math.log(Math.max(rnd(), 1e-12))) * Math.cos(2 * Math.PI * rnd());
                const logPost = (m) => {
                    if (bim === 0)
                        return -0.5 * ((m - 2) / 1) ** 2;
                    const a = Math.exp(-0.5 * ((m + 3) / 0.8) ** 2);
                    const b = Math.exp(-0.5 * ((m - 3) / 0.8) ** 2);
                    return Math.log(Math.max(a + b, 1e-30));
                };
                let m = 0;
                let lp = logPost(m);
                let acc = 0;
                const pts = [];
                for (let i = 0; i < N; i++) {
                    const mp = m + sq * gauss();
                    const lpp = logPost(mp);
                    if (Math.log(Math.max(rnd(), 1e-12)) < lpp - lp) {
                        m = mp;
                        lp = lpp;
                        acc++;
                    }
                    pts.push([i, m]);
                }
                return [{ label: t('链（接受率 ' + ((acc / N) * 100).toFixed(0) + '%）', 'chain (acceptance ' + ((acc / N) * 100).toFixed(0) + '%)'), color: '#185FA5', points: pts }];
            },
        },
        {
            id: 'mh-hist',
            level: 'V2',
            title: t('采样直方图 vs 真实后验', 'Sampling histogram versus the true posterior'),
            xlabel: t('参数 m', 'parameter m'),
            ylabel: t('概率密度', 'probability density'),
            controls: [
                { id: 'step', label: t('建议步长 σ_q', 'proposal step σ_q'), min: 0.02, max: 5, step: 0.02, value: 0.8 },
                { id: 'n', label: t('迭代步数', 'number of iterations'), min: 200, max: 8000, step: 100, value: 4000 },
                { id: 'burn', label: t('烧录期（丢弃前 N 步）', 'burn-in (discard first N steps)'), min: 0, max: 1000, step: 10, value: 100 },
            ],
            note: t('跑得够久之后直方图会收敛到真实后验（红线）。步数少或烧录期不够时，直方图会残留起始点的记忆 —— 这就是为什么 MCMC 必须检查收敛性。', 'After enough steps the histogram converges to the true posterior (red line). With too few steps or insufficient burn-in the histogram retains a memory of the starting point — which is why MCMC convergence must always be checked.'),
            compute: (p) => {
                const sq = p['step'], N = Math.round(p['n']), burn = Math.round(p['burn']);
                let seed = 555;
                const rnd = () => {
                    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
                    return seed / 0x7fffffff;
                };
                const gauss = () => Math.sqrt(-2 * Math.log(Math.max(rnd(), 1e-12))) * Math.cos(2 * Math.PI * rnd());
                const logPost = (m) => -0.5 * ((m - 2) / 1) ** 2;
                let m = 0;
                let lp = logPost(m);
                const keep = [];
                for (let i = 0; i < N; i++) {
                    const mp = m + sq * gauss();
                    const lpp = logPost(mp);
                    if (Math.log(Math.max(rnd(), 1e-12)) < lpp - lp) {
                        m = mp;
                        lp = lpp;
                    }
                    if (i >= burn)
                        keep.push(m);
                }
                const lo = -3, hi = 7;
                const nb = 60;
                const h = new Array(nb).fill(0);
                for (const v of keep) {
                    const b = Math.floor(((v - lo) / (hi - lo)) * nb);
                    if (b >= 0 && b < nb)
                        h[b]++;
                }
                const mx = Math.max(...h, 1);
                const hist = [];
                for (let b = 0; b < nb; b++) {
                    const c = lo + ((b + 0.5) / nb) * (hi - lo);
                    hist.push([c, h[b] / mx]);
                }
                const truth = [];
                for (let i = 0; i <= 300; i++) {
                    const c = lo + (i / 300) * (hi - lo);
                    truth.push([c, Math.exp(-0.5 * ((c - 2) / 1) ** 2)]);
                }
                return [
                    { label: t('采样直方图', 'sampling histogram'), color: '#185FA5', points: hist },
                    { label: t('真实后验', 'true posterior'), color: '#993C1D', points: truth },
                ];
            },
        },
    ],
    example: {
        title: t('调步长', 'Tuning the step size'),
        input: t('一维高斯后验，标准差 1', 'One-dimensional Gaussian posterior with unit standard deviation'),
        steps: [
            t('σ_q = 0.1：接受率 92%，但样本高度相关', 'σ_q = 0.1: 92% acceptance, but samples are highly correlated'),
            t('σ_q = 0.8：接受率约 30%，混合良好', 'σ_q = 0.8: about 30% acceptance, good mixing'),
            t('σ_q = 4：接受率 8%，链几乎不动', 'σ_q = 4: 8% acceptance, the chain barely moves'),
        ],
        output: t('把 σ_q 调到接受率 20–30% 附近', 'Tune σ_q so the acceptance rate lands near 20–30%'),
    },
    links: {
        upstream: [
            { id: 'bayesian-inversion', note: t('贝叶斯反演给出后验的形式', 'Bayesian inversion gives the form of the posterior') },
            { id: 'gaussian-distribution', note: t('高斯误差给出似然', 'Gaussian errors give the likelihood') },
        ],
        downstream: [{ id: 'resolution-matrix', note: t('线性问题下后验协方差就是分辨率分析', 'For linear problems the posterior covariance is the resolution analysis') }],
        seealso: [{ id: 'maximum-likelihood-estimation', note: t('极大似然是 MCMC 只取众数的退化版', 'Maximum likelihood is MCMC reduced to the mode') }],
    },
    refs: [{ text: 'Hastings (1970), Monte Carlo sampling methods using Markov chains, Biometrika 57, 97–109' }],
};
export default metropolisHastingsMcmc;
//# sourceMappingURL=metropolis-hastings-mcmc.js.map