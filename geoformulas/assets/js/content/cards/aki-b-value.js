import { t } from '../../core/types.js';
/** aki-b-value */
const akiBValue = {
    id: 'aki-b-value',
    name: t('Aki 极大似然 b 值估计', 'Aki’s Maximum-likelihood b-value Estimator'),
    aliases: { zh: ['b 值估计', '极大似然 b'], en: ['Aki b-value estimator', 'maximum likelihood b value'] },
    node: 'S12.4',
    tags: {
        math: ['MATH.STAT', 'MATH.ALGEBRA'],
        method: ['METH.STAT'],
        quantity: ['Q.SOURCE'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `b=\frac{\log_{10}e}{\overline{M}-M_c}=\frac{1}{\ln 10\,\left(\overline{M}-M_c\right)}`,
        variants: [
            { name: t('标准误', 'Standard error'), latex: String.raw `\sigma_b=\frac{b}{\sqrt{N}}\quad\text{（Aki 给出的近似）}` },
            { name: t('Utsu 更精确的估计', 'Utsu’s more accurate estimate'), latex: String.raw `\sigma_b=2.30\,b^{2}\sqrt{\frac{\sum\left(M_i-\overline{M}\right)^{2}}{N(N-1)}}` },
            { name: t('分档数据的修正（分档宽度 ΔM）', 'Correction for binned data (bin width ΔM)'), latex: String.raw `b=\frac{\log_{10}e}{\overline{M}-\left(M_c-\Delta M/2\right)}` },
        ],
    },
    meaning: t('直接用震级—频度图做最小二乘拟合 b 值是错的（点数在对数轴上不均匀、且不独立）。Aki 1965 年给出的极大似然估计只用「平均震级」和「完备震级」两个数，形式极简且统计性质最优 —— 这是目前所有 b 值计算的标准做法。', 'Fitting the b value by least squares on a magnitude–frequency plot is wrong: the points are not uniformly spaced on a log axis and not independent. Aki’s 1965 maximum-likelihood estimator uses only the mean magnitude and the completeness magnitude, is extremely simple, and has optimal statistical properties. It is the standard way to compute b today.'),
    symbols: [
        { sym: 'b', name: t('b 值', 'b value'), unit: '无量纲', typical: '0.6 – 1.4' },
        { sym: '\\overline{M}', name: t('M ≥ M_c 样本的算术平均震级', 'arithmetic mean magnitude of the M ≥ M_c sample'), unit: '无量纲' },
        { sym: 'M_c', name: t('完备震级', 'completeness magnitude'), unit: '无量纲' },
        { sym: 'N', name: t('样本数', 'sample size'), unit: '个' },
        { sym: '\\Delta M', name: t('震级分档宽度', 'magnitude bin width'), unit: '无量纲', typical: '0.1' },
    ],
    conditions: {
        applies: [t('震级在 M_c 以上连续、满足指数分布', 'Magnitudes above M_c are continuous and exponentially distributed')],
        assumes: [t('M_c 已正确估计', 'M_c has been estimated correctly')],
        breaks: [t('M_c 估计偏低会把 b 系统性估小', 'Underestimating M_c biases the estimated b low')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('指数分布的密度', 'Density of the exponential distribution'),
            latex: String.raw `f(M)=\beta\,e^{-\beta(M-M_c)},\qquad \beta=b\ln 10` },
        { n: 2, op: 'setup', title: t('写出似然函数', 'Write the likelihood'),
            latex: String.raw `L(\beta)=\prod_{i=1}^{N}\beta\,e^{-\beta(M_i-M_c)}` },
        { n: 3, op: 'identity', title: t('取对数', 'Take logs'),
            latex: String.raw `\ln L=N\ln\beta-\beta\sum_i\left(M_i-M_c\right)` },
        { n: 4, op: 'taylor', title: t('对 β 求导并置零', 'Differentiate with respect to β and set to zero'),
            latex: String.raw `\frac{\partial\ln L}{\partial\beta}=\frac{N}{\beta}-\sum_i\left(M_i-M_c\right)=0` },
        { n: 5, op: 'result', title: t('解出 β 与 b', 'Solve for β and b'),
            latex: String.raw `\hat\beta=\frac{1}{\overline{M}-M_c}\;\Longrightarrow\; \hat b=\frac{\hat\beta}{\ln 10}=\frac{\log_{10}e}{\overline{M}-M_c}` },
    ],
    example: {
        title: t('一批余震的 b 值', 'b value of an aftershock sequence'),
        input: t('N = 500，M_c = 2.0，平均震级 M̄ = 2.43', 'N = 500, M_c = 2.0, mean magnitude M̄ = 2.43'),
        steps: [
            t('b = 0.4343/(2.43 − 2.0) = 1.01', 'b = 0.4343/(2.43 − 2.0) = 1.01'),
            t('σ_b ≈ b/√N = 1.01/22.4 = 0.045', 'σ_b ≈ b/√N = 1.01/22.4 = 0.045'),
        ],
        output: t('b = 1.01 ± 0.05 —— 典型的余震序列值（余震 b 值常高于背景 1.0 以上）', 'b = 1.01 ± 0.05 — typical for an aftershock sequence, where b often exceeds the background value of 1.0'),
    },
    links: {
        upstream: [{ id: 'gutenberg-richter-law', note: t('被估计的对象', 'The law being estimated') }],
        seealso: [{ id: 'omori-law', note: t('余震序列的另一半规律', 'The other half of aftershock statistics') }],
    },
    refs: [{ text: 'Aki (1965), Bull. Earthq. Res. Inst., 43' }, { text: 'Utsu (1966), Geophys. Bull. Hokkaido Univ., 13' }],
};
export default akiBValue;
//# sourceMappingURL=aki-b-value.js.map