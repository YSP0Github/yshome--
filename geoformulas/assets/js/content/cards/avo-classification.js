import { t } from '../../core/types.js';
/** avo-classification */
const avoClassification = {
    id: 'avo-classification',
    name: t('AVO 异常分类（I–IV 类）', 'AVO Anomaly Classification (Classes I–IV)'),
    aliases: { zh: ['AVO 分类', '亮点', '暗点'], en: ['AVO classes', 'bright spot', 'dim spot'] },
    node: 'S3.3',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.EXPL'],
        quantity: ['Q.AMP'],
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `R(\theta) \approx A + B\sin^{2}\theta`,
        variants: [
            { name: t('I 类：高阻抗含气砂岩', 'Class I: high-impedance gas sand'), latex: String.raw `A > 0,\ B < 0\ \text{且}\ A + B < 0` },
            { name: t('II 类：近零阻抗差', 'Class II: near-zero impedance contrast'), latex: String.raw `|A| \approx 0,\ B < 0\ \text{（极性可能反转）}` },
            { name: t('III 类：低阻抗含气砂岩（亮点）', 'Class III: low-impedance gas sand (bright spot)'), latex: String.raw `A < 0,\ B < 0\ \text{（负值随角度更负）}` },
            { name: t('IV 类：低阻抗但梯度为正', 'Class IV: low impedance but positive gradient'), latex: String.raw `A < 0,\ B > 0\ \text{（远角度反而变弱）}` },
        ],
    },
    meaning: t('把含气砂岩按截距 A 与梯度 B 的符号组合分成四类，是野外解释最常用的一张「速查表」。III 类（亮点）最容易识别，I 类和 IV 类在叠加剖面上往往看不出来，必须回到叠前道集。', 'Sorting gas sands by the sign combination of intercept A and gradient B gives the most-used quick-reference table in interpretation. Class III (bright spot) is easiest to spot; classes I and IV are often invisible on stacked sections and require going back to pre-stack gathers.'),
    symbols: [
        { sym: 'A', name: t('AVO 截距', 'AVO intercept'), unit: '无量纲', typical: '−0.2 – 0.2' },
        { sym: 'B', name: t('AVO 梯度', 'AVO gradient'), unit: '无量纲', typical: '−0.5 – 0.2' },
        { sym: '\\theta', name: t('入射角', 'incidence angle'), unit: '°' },
    ],
    conditions: {
        applies: [t('碎屑岩含气砂岩的 AVO 快速判别', 'Rapid AVO discrimination for clastic gas sands')],
        assumes: [
            t('R(θ) 对 sin²θ 线性', 'R(θ) is linear in sin²θ'),
            t('资料已做真振幅处理', 'Data are true-amplitude processed'),
        ],
        breaks: [
            t('低饱和度气、致密砂岩会落在类别之间的过渡带', 'Low gas saturation and tight sands fall in transitional zones between classes'),
            t('薄层调谐会伪造 AVO 类型', 'Thin-bed tuning can fake an AVO class'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把反射系数写成截距加梯度', 'Write reflectivity as intercept plus gradient'),
            latex: String.raw `R(\theta) = A + B\sin^{2}\theta` },
        { n: 2, op: 'algebra', title: t('按 A、B 的符号枚举四种情形', 'Enumerate the four sign combinations'),
            latex: String.raw `(A,B) \in \{+-\}\times\{+-\} = 4\ \text{类}` },
        { n: 3, op: 'identity', title: t('叠加剖面只看到 A', 'The stack sees only A'),
            latex: String.raw `A \approx 0 \Longrightarrow \text{叠加剖面上几乎不可见（II 类）}` },
        { n: 4, op: 'result', title: t('判别的实用顺序', 'Practical order of discrimination'),
            latex: String.raw `\text{先看 } A \text{ 的符号，再看 } B \text{ 是否与背景趋势一致}` },
    ],
    viz: [
        {
            id: 'avo-classes',
            level: 'V1',
            title: t('四类 AVO 的原型曲线', 'Prototype curves for the four AVO classes'),
            xlabel: t('入射角 θ (°)', 'incidence angle θ (°)'),
            ylabel: t('反射系数 R', 'reflection coefficient R'),
            controls: [
                { id: 'maxdeg', label: t('最大角度 (°)', 'maximum angle (°)'), min: 15, max: 45, step: 1, value: 35 },
            ],
            note: t('II 类在近角度几乎为零，只有远角度才显形 —— 这就是为什么只做叠加会漏掉它。', 'Class II is nearly zero at near angles and only shows up far out — that is why stacking alone misses it.'),
            compute: (p) => {
                const md = p['maxdeg'];
                const cls = [
                    [0.10, -0.30],
                    [0.02, -0.22],
                    [-0.10, -0.30],
                    [-0.15, 0.12],
                ];
                const cols = ['#185FA5', '#0F6E56', '#993C1D', '#7F77DD'];
                const names = [
                    t('I 类 A>0, B<0', 'class I A>0, B<0'),
                    t('II 类 A≈0, B<0', 'class II A≈0, B<0'),
                    t('III 类 A<0, B<0', 'class III A<0, B<0'),
                    t('IV 类 A<0, B>0', 'class IV A<0, B>0'),
                ];
                const out = [];
                for (let c = 0; c < 4; c++) {
                    const pts = [];
                    for (let i = 0; i <= 120; i++) {
                        const deg = (i / 120) * md;
                        const s2 = Math.sin((deg * Math.PI) / 180) ** 2;
                        pts.push([deg, cls[c][0] + cls[c][1] * s2]);
                    }
                    out.push({ label: names[c], color: cols[c], points: pts });
                }
                return out;
            },
        },
    ],
    example: {
        title: t('解释一张远角度道集', 'Interpreting a far-angle gather'),
        input: t('近角度 R ≈ −0.10，远角度（35°）R ≈ −0.20', 'Near-angle R ≈ −0.10, far-angle (35°) R ≈ −0.20'),
        steps: [
            t('sin²35° = 0.329', 'sin²35° = 0.329'),
            t('B = (−0.20 + 0.10)/0.329 = −0.30', 'B = (−0.20 + 0.10)/0.329 = −0.30'),
        ],
        output: t('A = −0.10、B = −0.30，判为 III 类（典型亮点）', 'A = −0.10, B = −0.30: class III (typical bright spot)'),
    },
    links: {
        upstream: [{ id: 'avo-intercept-gradient', note: t('A、B 的提取方法', 'How A and B are extracted') }],
        seealso: [{ id: 'fluid-factor-avo', note: t('定量化的流体指示', 'A quantitative fluid indicator') }],
    },
    refs: [{ text: 'Rutherford, S. & Williams, R. (1989). Amplitude-versus-offset variations in gas sands. Geophysics, 54, 680–688' }],
};
export default avoClassification;
//# sourceMappingURL=avo-classification.js.map