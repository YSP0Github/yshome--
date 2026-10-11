import { t } from '../../core/types.js';
/** nuc-half-life-mean-life */
const nucHalfLifeMeanLife = {
    id: 'nuc-half-life-mean-life',
    name: t('半衰期与平均寿命', 'Half-life and Mean Lifetime'),
    aliases: { zh: ['T½=ln2/λ', '平均寿命 τ=1/λ'], en: ['half-life T1/2 = ln2/lambda', 'mean lifetime tau = 1/lambda'] },
    node: 'S20.5',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.TIME'],
        keywords: t('半衰期 平均寿命 T1/2=ln2/λ τ=1/λ 碳14 测年', 'half-life mean lifetime radiocarbon dating T1/2 ln2 over lambda'),
    },
    audience: 'bachelor',
    complete: 'L4',
    statement: {
        main: String.raw `T_{1/2}=\frac{\ln 2}{\lambda},\qquad \tau=\frac{1}{\lambda}`,
        variants: [
            { name: t('t 时刻剩余比例', 'Fraction remaining at time t'), latex: String.raw `\frac{N(t)}{N_0}=\left(\frac12\right)^{t/T_{1/2}}` },
        ],
    },
    meaning: t('半衰期 T½ 是一半核衰变所需的时间，T½=ln2/λ≈0.693/λ；平均寿命 τ 是每个核存活时间的统计平均，τ=1/λ。不同核素半衰期天差地别：铀-238 是 45 亿年（地球的年龄），碳-14 是 5730 年（测考古），而某些核只有微秒。测年就是靠"现在剩多少 vs 初始多少"反推时间。', 'The half-life T½ is the time for half the nuclei to decay, T½ = ln2/λ ≈ 0.693/λ; the mean lifetime τ is the statistical average of how long a nucleus survives, τ = 1/λ. Half-lives span an enormous range: uranium-238 is 4.5 billion years (the age of the Earth), carbon-14 is 5730 years (archaeology), while some nuclei last only microseconds. Dating works by comparing "what remains now" to "what there was initially".'),
    symbols: [
        { sym: 'T_{1/2}', name: t('半衰期', 'half-life'), unit: 's' },
        { sym: '\\tau', name: t('平均寿命', 'mean lifetime'), unit: 's' },
        { sym: '\\lambda', name: t('衰变常数', 'decay constant'), unit: 's⁻¹' },
    ],
    conditions: {
        applies: [t('单一衰变模式的放射性核', 'A radioactive nuclide with a single decay mode')],
        assumes: [t('衰变常数恒定（不受温压影响）', 'Decay constant is constant (insensitive to T and pressure)')],
        breaks: [t('有子体继续衰变时需用 Bateman 方程', 'When daughters decay further, use the Bateman equations')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('一半核衰变 N=N₀/2', 'Half the nuclei have decayed, N = N₀/2'), latex: String.raw `\frac{N_0}{2}=N_0e^{-\lambda T_{1/2}}` },
        { n: 2, op: 'algebra', title: t('取对数解出 T½', 'Take logs and solve for T½'), latex: String.raw `\ln\frac12=-\lambda T_{1/2}\;\Rightarrow\;T_{1/2}=\frac{\ln2}{\lambda}` },
    ],
    example: {
        title: t('碳-14 测年：t 时刻剩 12%，求样品年代', 'Radiocarbon dating: 12% of C-14 remains; find the age'),
        input: t('T½=5730 年，N/N₀=0.12', 'T1/2 = 5730 yr, N/N0 = 0.12'),
        steps: [
            t('由 N/N₀=(1/2)^(t/T½) 取对数', 'Take logs of N/N0 = (1/2)^(t/T1/2)'),
            t('t = T½ · log₂(N₀/N) = 5730 · log₂(1/0.12) ≈ 5730 × 3.06', 't = T1/2 · log2(N0/N) = 5730 · log2(1/0.12) ≈ 5730 × 3.06'),
            t('t ≈ 17500 年', 't ≈ 17,500 years'),
        ],
        output: t('样品约 1.75 万年前的生物遗骸。', 'The sample is remains of an organism from about 17,500 years ago.'),
    },
    links: {
        upstream: [{ id: 'nuc-radioactive-decay-law' }],
        downstream: [{ id: 'nuc-activity' }],
    },
    refs: [{ text: 'Krane, Introductory Nuclear Physics, §6' }],
};
export default nucHalfLifeMeanLife;
//# sourceMappingURL=nuc-half-life-mean-life.js.map