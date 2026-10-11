import { t } from '../../core/types.js';
/** moment-tensor-source-type-plot */
const momentTensorSourceTypePlot = {
    id: 'moment-tensor-source-type-plot',
    name: t('震源类型图（DC–CLVD–ISO）', 'Source-type Plot (DC–CLVD–ISO)'),
    aliases: { zh: ['震源类型图', 'CLVD 成分', 'Hudson 图'], en: ['source-type diagram', 'CLVD component', 'Hudson plot'] },
    node: 'S4.7',
    tags: {
        math: ['MATH.LINALG', 'MATH.GEOM'],
        method: ['METH.TELE', 'METH.INV'],
        quantity: ['Q.TENSOR', 'Q.SOURCE'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `\varepsilon = \frac{|\lambda_{2}|}{\max(|\lambda_{1}|,|\lambda_{3}|)},\qquad f_{ISO} = \frac{\mathrm{tr}(\mathbf{M})}{3\max|\lambda_{i}|}`,
        variants: [
            { name: t('特征值排序', 'Eigenvalue ordering'), latex: String.raw `\lambda_1 \ge \lambda_2 \ge \lambda_3` },
            { name: t('纯双力偶', 'Pure double couple'), latex: String.raw `\lambda = (1,0,-1)\,M \Longrightarrow \varepsilon = 0,\ f_{ISO} = 0` },
            { name: t('纯 CLVD', 'Pure CLVD'), latex: String.raw `\lambda = (2,-1,-1)\,M \Longrightarrow \varepsilon = 0.5` },
            { name: t('纯爆炸', 'Pure explosion'), latex: String.raw `\lambda = (1,1,1)\,M \Longrightarrow f_{ISO} = 1` },
        ],
    },
    meaning: t('矩张量的三个特征值完整刻画了震源的「类型」：中间那个特征值 λ₂ 的大小衡量偏离双力偶的程度（CLVD 成分），三个特征值之和衡量体积变化（ISO 成分）。把这两项画在一张图上，天然地震、火山事件、矿山塌陷、核爆就自然分成几堆 —— 这是判别震源性质最直观的工具。', 'The three eigenvalues of the moment tensor fully characterise the source type: the size of the intermediate eigenvalue λ₂ measures the departure from a double couple (the CLVD component), and the sum of the three measures the volume change (the ISO component). Plotting the two against each other separates tectonic earthquakes, volcanic events, mine collapses and nuclear explosions into distinct clusters — the most intuitive tool for classifying sources.'),
    symbols: [
        { sym: '\\lambda_{1},\\lambda_{2},\\lambda_{3}', name: t('矩张量的三个特征值（降序）', 'the three eigenvalues of the moment tensor (descending)'), unit: 'N·m' },
        { sym: '\\varepsilon', name: t('CLVD 程度，0 = 纯 DC，0.5 = 纯 CLVD', 'CLVD degree: 0 = pure DC, 0.5 = pure CLVD'), unit: '无量纲' },
        { sym: 'f_{ISO}', name: t('各向同性成分比例', 'isotropic fraction'), unit: '无量纲', typical: '−1 – 1' },
        { sym: '\\mathrm{tr}(\\mathbf{M})', name: t('矩张量的迹 = 体积变化 × 体积模量', 'trace of the moment tensor = volume change × bulk modulus'), unit: 'N·m' },
    ],
    conditions: {
        applies: [t('矩张量解的分类与解释、非构造事件识别', 'Classification and interpretation of moment-tensor solutions; identifying non-tectonic events')],
        assumes: [
            t('矩张量已可靠反演', 'The moment tensor has been reliably inverted'),
            t('采用一致的特征值排序约定', 'A consistent eigenvalue-ordering convention is used'),
        ],
        breaks: [
            t('反演误差大时 ε 会被系统性高估（噪声偏向 CLVD）', 'With large inversion errors ε is systematically over-estimated (noise biases toward CLVD)'),
            t('存在多种 ε 定义，跨文献比较需核对约定', 'Several definitions of ε exist; check the convention when comparing across studies'),
        ],
    },
    derivation: [
        { n: 1, op: 'identity', title: t('把矩张量分解为三部分', 'Decompose the moment tensor into three parts'),
            latex: String.raw `\mathbf{M} = \mathbf{M}_{ISO} + \mathbf{M}_{CLVD} + \mathbf{M}_{DC}` },
        { n: 2, op: 'identity', title: t('各部分的典型特征值', 'Typical eigenvalues of each part'),
            latex: String.raw `ISO:\ (1,1,1),\quad CLVD:\ (2,-1,-1),\quad DC:\ (1,0,-1)` },
        { n: 3, op: 'algebra', title: t('由 λ₂ 读出 DC 与 CLVD 的比例', 'Read the DC/CLVD ratio off λ₂'),
            latex: String.raw `\varepsilon = \frac{|\lambda_2|}{\max(|\lambda_1|,|\lambda_3|)}` },
        { n: 4, op: 'identity', title: t('由迹读出体积变化', 'Read the volume change off the trace'),
            latex: String.raw `\mathrm{tr}(\mathbf{M}) = 3K\,\Delta V` },
        { n: 5, op: 'result', title: t('归一化得到无量纲坐标', 'Normalise to get dimensionless coordinates'),
            latex: String.raw `f_{ISO} = \frac{\mathrm{tr}(\mathbf{M})}{3\max|\lambda_i|}` },
    ],
    viz: [
        {
            id: 'source-type-eigenvalues',
            level: 'V2',
            title: t('给定 ISO 与 CLVD 比例时的特征值', 'Eigenvalues for a chosen ISO and CLVD fraction'),
            xlabel: t('特征值序号', 'eigenvalue index'),
            ylabel: t('归一化特征值', 'normalised eigenvalue'),
            controls: [
                { id: 'fiso', label: t('ISO 成分 f_ISO', 'ISO fraction f_ISO'), min: -1, max: 1, step: 0.01, value: 0 },
                { id: 'fclvd', label: t('CLVD 成分 f_CLVD', 'CLVD fraction f_CLVD'), min: 0, max: 1, step: 0.01, value: 0 },
            ],
            note: t('把 f_CLVD 拉到 1，λ₂ 会变成 λ₁ 的一半（ε = 0.5）；把 f_ISO 拉到 ±1，三个特征值会趋于相等。', 'Push f_CLVD to 1 and λ₂ becomes half of λ₁ (ε = 0.5); push f_ISO to ±1 and the three eigenvalues converge.'),
            compute: (p) => {
                const fiso = p['fiso'], fclvd = p['fclvd'];
                const dc = (1 - Math.abs(fiso) - fclvd) < 0 ? 0 : 1 - Math.abs(fiso) - fclvd;
                const lam = [
                    dc * 1 + fiso * 1 + fclvd * 2,
                    dc * 0 + fiso * 1 + fclvd * -1,
                    dc * -1 + fiso * 1 + fclvd * -1,
                ];
                const pts = lam.map((v, i) => [i + 1, v]);
                return [{ label: t('特征值 λᵢ', 'eigenvalues λᵢ'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('一次火山型事件', 'A volcanic event'),
        input: t('λ = (2.2, 1.0, 0.9) ×10¹⁶ N·m', 'λ = (2.2, 1.0, 0.9) ×10¹⁶ N·m'),
        steps: [
            t('ε = 1.0/2.2 = 0.45 —— 接近纯 CLVD', 'ε = 1.0/2.2 = 0.45 — close to pure CLVD'),
            t('tr = 4.1×10¹⁶ ≠ 0 —— 有正的体积变化', 'tr = 4.1×10¹⁶ ≠ 0 — a positive volume change'),
        ],
        output: t('同时具有 CLVD 与正 ISO 成分，指向岩浆或流体注入', 'Both CLVD and positive ISO components, pointing to magma or fluid injection'),
    },
    links: {
        upstream: [{ id: 'dc-iso-clvd-decomposition', note: t('分解的定义', 'Definition of the decomposition') }],
        downstream: [{ id: 'centroid-moment-tensor', note: t('实际产出的标准产品', 'The standard product produced in practice') }],
        seealso: [{ id: 'mb-ms-discrimination', note: t('另一种震源判别', 'Another source discriminant') }],
    },
    refs: [{ text: 'Hudson, J. A., Pearce, R. G. & Rogers, R. M. (1989). Source type plot for inversion of the moment tensor. J. Geophys. Res., 94, 765–774' }],
};
export default momentTensorSourceTypePlot;
//# sourceMappingURL=moment-tensor-source-type-plot.js.map