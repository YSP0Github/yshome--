import { t } from '../../core/types.js';
/** bayesian-inversion */
const bayesianInversion = {
    id: 'bayesian-inversion',
    name: t('贝叶斯反演', 'Bayesian Inversion'),
    aliases: { zh: ['贝叶斯方法', '后验概率'], en: ['Bayesian inversion', 'posterior distribution', 'MCMC'] },
    node: 'S10.3',
    tags: {
        math: ['MATH.STAT', 'MATH.LINALG'],
        method: ['METH.INV'],
        quantity: ['Q.VEL'],
    },
    audience: 'phd',
    complete: 'L2',
    statement: {
        main: String.raw `p(\boldsymbol{m}\mid\boldsymbol{d})=\frac{p(\boldsymbol{d}\mid\boldsymbol{m})\,p(\boldsymbol{m})}{p(\boldsymbol{d})}\propto\underbrace{p(\boldsymbol{d}\mid\boldsymbol{m})}_{\text{似然}}\underbrace{p(\boldsymbol{m})}_{\text{先验}}`,
        variants: [
            { name: t('高斯噪声下的似然', 'Likelihood under Gaussian noise'), latex: String.raw `p(\boldsymbol{d}\mid\boldsymbol{m})\propto\exp\!\left[-\frac{1}{2}\left(\boldsymbol{d}-\boldsymbol{g}(\boldsymbol{m})\right)^{\mathsf{T}}\mathbf{C}_d^{-1}\left(\boldsymbol{d}-\boldsymbol{g}(\boldsymbol{m})\right)\right]` },
            { name: t('线性问题 + 高斯先验的解析后验', 'Analytic posterior for a linear problem with Gaussian prior'), latex: String.raw `\mathbf{C}_M=\left(\mathbf{G}^{\mathsf{T}}\mathbf{C}_d^{-1}\mathbf{G}+\mathbf{C}_p^{-1}\right)^{-1},\qquad \overline{\boldsymbol{m}}=\mathbf{C}_M\left(\mathbf{G}^{\mathsf{T}}\mathbf{C}_d^{-1}\boldsymbol{d}+\mathbf{C}_p^{-1}\boldsymbol{m}_p\right)` },
            { name: t('最大后验估计 MAP', 'The maximum a posteriori estimate'), latex: String.raw `\hat{\boldsymbol{m}}_{\mathrm{MAP}}=\arg\max_{\boldsymbol{m}}\left[\ln p(\boldsymbol{d}\mid\boldsymbol{m})+\ln p(\boldsymbol{m})\right]` },
        ],
    },
    meaning: t('贝叶斯反演不给出一个「答案」，而给出「答案的概率分布」。它强迫你把先验知识显式写出来（而不是偷偷塞进正则化），并且天然给出不确定度。代价是计算：非线性问题只能靠 MCMC 或变分推断近似采样，一条三维模型往往要跑几天。', 'Bayesian inversion does not deliver a single answer but a probability distribution over answers. It forces you to write prior knowledge down explicitly instead of smuggling it into regularisation, and it yields uncertainty for free. The price is computation: nonlinear problems need MCMC or variational inference, and a 3D model can take days to sample.'),
    symbols: [
        { sym: 'p(\\boldsymbol{m}\\mid\\boldsymbol{d})', name: t('后验分布', 'posterior distribution'), unit: '—' },
        { sym: 'p(\\boldsymbol{d}\\mid\\boldsymbol{m})', name: t('似然', 'likelihood'), unit: '—' },
        { sym: 'p(\\boldsymbol{m})', name: t('先验', 'prior'), unit: '—' },
        { sym: '\\mathbf{C}_d,\\mathbf{C}_p', name: t('数据与先验的协方差', 'data and prior covariance'), unit: '—' },
        { sym: '\\mathbf{C}_M', name: t('后验协方差', 'posterior covariance'), unit: '—' },
    ],
    conditions: {
        applies: [t('需要量化不确定度的反演问题', 'Inverse problems where uncertainty must be quantified')],
        assumes: [t('先验与噪声统计模型已正确指定', 'The prior and noise statistics are correctly specified')],
        breaks: [t('先验选得过于自信时，后验会被先验拖住而看不出数据信息', 'An over-confident prior drags the posterior and hides the information in the data')],
    },
    derivation: [
        { n: 1, op: 'identity', title: t('由条件概率定义出发', 'Start from the definition of conditional probability'),
            latex: String.raw `p(\boldsymbol{m}\mid\boldsymbol{d})=\frac{p(\boldsymbol{m},\boldsymbol{d})}{p(\boldsymbol{d})}=\frac{p(\boldsymbol{d}\mid\boldsymbol{m})p(\boldsymbol{m})}{p(\boldsymbol{d})}` },
        { n: 2, op: 'setup', title: t('高斯数据噪声 → 负二次型', 'Gaussian data noise → negative quadratic form'),
            latex: String.raw `p(\boldsymbol{d}\mid\boldsymbol{m})\propto e^{-\frac12\left(\boldsymbol{d}-\boldsymbol{g}\right)^{\mathsf{T}}\mathbf{C}_d^{-1}\left(\boldsymbol{d}-\boldsymbol{g}\right)}` },
        { n: 3, op: 'setup', title: t('高斯先验', 'Gaussian prior'),
            latex: String.raw `p(\boldsymbol{m})\propto e^{-\frac12\left(\boldsymbol{m}-\boldsymbol{m}_p\right)^{\mathsf{T}}\mathbf{C}_p^{-1}\left(\boldsymbol{m}-\boldsymbol{m}_p\right)}` },
        { n: 4, op: 'algebra', title: t('线性 g = Gm 时后验仍为高斯', 'For linear g = Gm the posterior is still Gaussian'),
            latex: String.raw `-\ln p(\boldsymbol{m}\mid\boldsymbol{d})=\frac12(\boldsymbol{Gm}-\boldsymbol{d})^{\mathsf{T}}\mathbf{C}_d^{-1}(\boldsymbol{Gm}-\boldsymbol{d})+\frac12(\boldsymbol{m}-\boldsymbol{m}_p)^{\mathsf{T}}\mathbf{C}_p^{-1}(\boldsymbol{m}-\boldsymbol{m}_p)+\text{const}` },
        { n: 5, op: 'result', title: t('配方得到均值与协方差', 'Complete the square to get mean and covariance'),
            latex: String.raw `\mathbf{C}_M=\left(\mathbf{G}^{\mathsf{T}}\mathbf{C}_d^{-1}\mathbf{G}+\mathbf{C}_p^{-1}\right)^{-1},\quad \overline{\boldsymbol{m}}=\mathbf{C}_M\left(\mathbf{G}^{\mathsf{T}}\mathbf{C}_d^{-1}\boldsymbol{d}+\mathbf{C}_p^{-1}\boldsymbol{m}_p\right)` },
    ],
    links: {
        upstream: [{ id: 'damped-least-squares', note: t('MAP 估计在高斯假设下等价于阻尼最小二乘', 'Under Gaussian assumptions the MAP estimate equals damped least squares') }],
        seealso: [{ id: 'resolution-matrix', note: t('频率派的不确定度描述', 'The frequentist description of uncertainty') }],
    },
    refs: [{ text: 'Tarantola, Inverse Problem Theory' }, { text: 'Mosegaard & Tarantola (1995), J. Geophys. Res., 100' }],
};
export default bayesianInversion;
//# sourceMappingURL=bayesian-inversion.js.map