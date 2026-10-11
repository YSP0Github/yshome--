import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** checkerboard-resolution-test */
const checkerboardResolutionTest: FormulaCard = {
  id: 'checkerboard-resolution-test',
  name: t('检测板分辨率试验', 'The Checkerboard Resolution Test'),
  aliases: { zh: ['检测板试验', '棋盘格试验', '分辨率检验'], en: ['checkerboard test', 'resolution test', 'synthetic recovery'] },
  node: 'S10.2',
  tags: {
    math: ['MATH.LINALG', 'MATH.STAT'],
    method: ['METH.INV', 'METH.STRUCT'],
    quantity: ['Q.VEL'],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\mathbf{d}^{\text{syn}} = \mathbf{G}\mathbf{m}^{\text{check}},\qquad
\hat{\mathbf{m}} = (\mathbf{G}^{\mathsf{T}}\mathbf{G}+\lambda^{2}\mathbf{L}^{\mathsf{T}}\mathbf{L})^{-1}\mathbf{G}^{\mathsf{T}}\mathbf{d}^{\text{syn}},\qquad
\mathcal{R} = \mathrm{corr}(\hat{\mathbf{m}}, \mathbf{m}^{\text{check}})`,
    variants: [
      { name: t('恢复度', 'Recovery'), latex: String.raw`R_k = \frac{\hat{m}_k}{m_k^{\text{check}}}\ \ (\text{理想值}\ 1)` },
      { name: t('由分辨率矩阵直接看', 'Reading it off the resolution matrix'), latex: String.raw`\hat{\mathbf{m}} = \mathbf{R}\mathbf{m}^{\text{true}},\quad \mathbf{R} = (\mathbf{G}^{\mathsf{T}}\mathbf{G}+\lambda^{2}\mathbf{L}^{\mathsf{T}}\mathbf{L})^{-1}\mathbf{G}^{\mathsf{T}}\mathbf{G}` },
      { name: t('对角线主导性', 'Diagonal dominance'), latex: String.raw`R_{kk} \approx 1 \Longrightarrow \text{第}\ k\ \text{个参数被独立分辨}` },
      { name: t('拖尾效应（smearing）', 'Smearing'), latex: String.raw`|R_{kj}| \gg 0\ (j\ne k) \Longrightarrow \text{相邻参数互相泄漏}` },
    ],
  },
  meaning: t(
    '层析成像给出的图看起来再漂亮，也需要回答一个诚实的问题：如果地下真的是某个已知图案，我的数据和反演参数能不能把它恢复出来？检测板试验就是这么做的 —— 构造一个正负交替的棋盘图案，用真实的射线覆盖做正演，再用同样的反演参数反演，看看棋盘还在不在。棋盘能清晰恢复的区域就是可信区；图案被抹平、拉长或错位的区域必须谨慎解释。',
    'However beautiful a tomographic image looks, it must answer an honest question: if the Earth really had a known pattern, could my data and inversion parameters recover it? The checkerboard test does exactly that — build an alternating positive–negative pattern, forward-model it with the real ray coverage, then invert with the same parameters and see whether the checkerboard survives. Regions where the pattern is cleanly recovered are trustworthy; regions where it is smeared, stretched or displaced must be interpreted with caution.',
  ),
  symbols: [
    { sym: '\\mathbf{m}^{\\text{check}}', name: t('棋盘状合成模型', 'checkerboard synthetic model'), unit: '—' },
    { sym: '\\mathbf{R}', name: t('分辨率矩阵', 'resolution matrix'), unit: '—' },
    { sym: '\\mathcal{R}', name: t('恢复图案与真实图案的相关系数', 'correlation between recovered and true pattern'), unit: '无量纲' },
    { sym: 'R_{kk}', name: t('第 k 个参数的分辨率对角线值', 'resolution diagonal for parameter k'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('走时层析、面波层析、各向异性成像的结果可信度评估', 'Assessing the credibility of travel-time, surface-wave and anisotropic tomography')],
    assumes: [t('合成模型的扰动幅度与实际异常相当', 'The synthetic anomaly amplitude is comparable to the real one')],
    breaks: [t('扰动幅度过大时会高估分辨率（线性假设的假象）', 'Too large an anomaly overestimates resolution (an artefact of linearity)'), t('只测射线覆盖，不反映数据误差与建模误差的影响', 'It tests ray coverage only, not the effect of data and modelling errors')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('构造棋盘状合成模型', 'Build a checkerboard synthetic model'), latex: String.raw`m_k^{\text{check}} = A\,\mathrm{sgn}\!\left[\sin\frac{\pi i}{n_x}\sin\frac{\pi j}{n_y}\right]` },
    { n: 2, op: 'physics', title: t('用真实射线覆盖正演合成数据', 'Forward-model synthetic data with the real ray coverage'), latex: String.raw`\mathbf{d}^{\text{syn}} = \mathbf{G}\mathbf{m}^{\text{check}}` },
    { n: 3, op: 'substitute', title: t('用与实际反演完全相同的参数反演', 'Invert with exactly the same parameters as the real inversion'), latex: String.raw`\hat{\mathbf{m}} = (\mathbf{G}^{\mathsf{T}}\mathbf{G}+\lambda^{2}\mathbf{L}^{\mathsf{T}}\mathbf{L})^{-1}\mathbf{G}^{\mathsf{T}}\mathbf{d}^{\text{syn}}` },
    { n: 4, op: 'identity', title: t('等价地，这就是分辨率矩阵作用于真模型', 'Equivalently, this is the resolution matrix acting on the true model'), latex: String.raw`\hat{\mathbf{m}} = \mathbf{R}\mathbf{m}^{\text{check}}` },
    { n: 5, op: 'result', title: t('计算相关系数定量评价恢复程度', 'Compute the correlation to quantify the recovery'), latex: String.raw`\mathcal{R} = \mathrm{corr}(\hat{\mathbf{m}},\mathbf{m}^{\text{check}})\in[-1,1]` },
  ],
  viz: [
    {
      id: 'checker',
      level: 'V3',
      title: t('射线覆盖不足时棋盘图案如何被破坏', 'How poor ray coverage destroys the checkerboard pattern'),
      xlabel: t('横向位置', 'lateral position'),
      ylabel: t('恢复幅度 / 真实幅度', 'recovered / true amplitude'),
      controls: [
        { id: 'nx', label: t('棋盘格子数', 'number of checkerboard cells'), min: 2, max: 12, step: 1, value: 6 },
        { id: 'cov', label: t('射线覆盖密度 (0–1)', 'ray coverage density (0–1)'), min: 0.1, max: 1, step: 0.02, value: 0.85 },
        { id: 'lam', label: t('阻尼 λ', 'damping λ'), min: 0, max: 2, step: 0.02, value: 0.3 },
        { id: 'noise', label: t('数据噪声', 'data noise'), min: 0, max: 1, step: 0.02, value: 0.1 },
      ],
      note: t('覆盖越好、阻尼越小、噪声越低，恢复的棋盘越接近原始方波。把覆盖调到 0.3 以下，图案立刻退化成缓慢起伏 —— 这正是「射线稀疏区不可信」的定量表现。注意恢复曲线总是被平滑并略向零收缩，即便覆盖完美也是如此。', 'Better coverage, smaller damping and lower noise make the recovered checkerboard closer to the original square wave. Dropping coverage below 0.3 immediately degrades the pattern into a gentle undulation — the quantitative expression of "sparse-ray regions are untrustworthy". Note the recovered curve is always smoothed and slightly shrunken toward zero, even with perfect coverage.'),
      compute: (p) => {
        const nx = Math.round(p['nx']), cov = p['cov'], lam = p['lam'], nz = p['noise']
        const truth: Array<[number, number]> = []
        const rec: Array<[number, number]> = []
        const N = 600
        let seed = 1717
        const rnd = () => {
          seed = (seed * 1103515245 + 12345) & 0x7fffffff
          return (seed / 0x7fffffff) * 2 - 1
        }
        // 覆盖不足 → 有效平滑宽度变大
        const smooth = (1 - cov) * 0.35 + lam * 0.25
        const raw: number[] = []
        for (let i = 0; i <= N; i++) {
          const u = (i / N) * nx
          raw.push(Math.sign(Math.sin(Math.PI * u)) || 1)
        }
        for (let i = 0; i <= N; i++) {
          const x = (i / N) * nx
          truth.push([x, raw[i]])
          // 盒式平滑
          const w = Math.max(1, Math.round(smooth * N / nx))
          let s = 0, c = 0
          for (let k = -w; k <= w; k++) {
            const j = i + k
            if (j >= 0 && j <= N) { s += raw[j]; c++ }
          }
          const amp = 1 / (1 + lam * 0.8)
          const v = c > 0 ? (s / c) * amp * cov : 0
          rec.push([x, v + nz * 0.12 * rnd()])
        }
        return [
          { label: t('真实棋盘', 'true checkerboard'), color: '#888780', points: truth },
          { label: t('恢复结果', 'recovered'), color: '#185FA5', points: rec },
        ]
      },
    },
  ],
  example: {
    title: t('判断可信区', 'Delineating the trustworthy region'),
    input: t('某区域层析结果的棋盘试验：西部 R = 0.85，东部 R = 0.32', 'A checkerboard test of a regional tomography: R = 0.85 in the west, R = 0.32 in the east'),
    steps: [
      t('西部棋盘清晰恢复，异常可信', 'In the west the checkerboard is cleanly recovered, so anomalies are credible'),
      t('东部图案严重平滑，只能讨论大尺度趋势', 'In the east the pattern is heavily smoothed, so only large-scale trends can be discussed'),
    ],
    output: t('论文中应只解释西部的细节结构', 'Only the detailed structure in the west should be interpreted in the paper'),
  },
  links: {
    upstream: [
      { id: 'resolution-matrix', note: t('检测板试验是分辨率矩阵的直观版本', 'The checkerboard test is the visual version of the resolution matrix') },
      { id: 'travel-time-tomography', note: t('层析是需要检验的对象', 'Tomography is what needs testing') },
    ],
    seealso: [
      { id: 'ray-path-perturbation-frechet', note: t('核决定 G 的每一行', 'The kernel determines each row of G') },
      { id: 'damped-least-squares', note: t('阻尼直接影响恢复程度', 'Damping directly affects recovery') },
    ],
  },
  refs: [{ text: 'Lévêque, Rivera & Wittlinger (1993), On the use of the checker-board test to assess the resolution of tomographic inversions, GJI 115, 313–318' }],
}

export default checkerboardResolutionTest
