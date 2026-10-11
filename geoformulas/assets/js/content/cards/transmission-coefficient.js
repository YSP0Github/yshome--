import { t } from '../../core/types.js';
/** transmission-coefficient */
const transmissionCoefficient = {
    id: 'transmission-coefficient',
    name: t('垂直入射透射系数', 'Normal-incidence Transmission Coefficient'),
    aliases: { zh: ['透射系数', '透过系数'], en: ['transmission coefficient', 'transmissivity'] },
    node: 'S3.1',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.EXPL'],
        quantity: ['Q.AMP'],
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `T=\frac{2Z_{2}}{Z_{1}+Z_{2}}=\frac{2\rho_{2}\alpha_{2}}{\rho_{1}\alpha_{1}+\rho_{2}\alpha_{2}}`,
        variants: [
            { name: t('位移透射系数', 'Displacement transmission coefficient'), latex: String.raw `T_{u}=\frac{2Z_{1}}{Z_{1}+Z_{2}}` },
            { name: t('与反射系数的关系', 'Relation to the reflection coefficient'), latex: String.raw `T_{u}=1+R,\qquad T_{p}=1-R` },
        ],
    },
    meaning: t('界面上「没有被反射回去的那部分」就是透射。注意位移透射系数与压力透射系数不同：压力波过界面时幅值按 2Z₂/(Z₁+Z₂) 变，而位移按 2Z₁/(Z₁+Z₂) 变，两者相差一个 Z₁/Z₂ 因子。用错 convention 是 AVO 作业里最常见的低级错误。', 'Whatever is not reflected is transmitted. Note that the displacement and pressure transmission coefficients differ: pressure amplitude scales as 2Z₂/(Z₁+Z₂) while displacement scales as 2Z₁/(Z₁+Z₂). Mixing the two conventions is a classic blunder in AVO work.'),
    symbols: [
        { sym: 'T', name: t('压力透射系数', 'pressure transmission coefficient'), unit: '无量纲', typical: '0 – 2' },
        { sym: 'T_u', name: t('位移透射系数', 'displacement transmission coefficient'), unit: '无量纲' },
        { sym: 'Z_i', name: t('波阻抗 ρᵢαᵢ', 'acoustic impedance ρ_i α_i'), unit: 'kg m⁻² s⁻¹', typical: '10⁶ – 10⁷' },
        { sym: '\\rho_i', name: t('密度', 'density'), unit: 'kg/m³', typical: '2000 – 2700' },
        { sym: '\\alpha_i', name: t('P 波速度', 'P-wave velocity'), unit: 'm/s', typical: '1500 – 6000' },
    ],
    conditions: {
        applies: [t('平面波垂直入射到水平界面', 'Plane wave at normal incidence on a horizontal interface')],
        assumes: [
            t('声学介质（无 S 波、无转换波）', 'Acoustic media: no S waves, no converted phases'),
            t('界面两侧介质均匀、无衰减', 'Uniform, lossless media on both sides'),
            t('入射波从介质 1 进入介质 2', 'Incidence from medium 1 into medium 2'),
        ],
        breaks: [
            t('斜入射时必须回到 Zoeppritz 方程组', 'At oblique incidence one must return to the Zoeppritz equations'),
            t('T 可以大于 1（阻抗降低时），这不违反能量守恒', 'T can exceed 1 when impedance drops; this does not violate energy conservation'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('写出两侧的压力场', 'Write the pressure fields on both sides'),
            latex: String.raw `p_1=p_i+p_r,\qquad p_2=p_t`,
            note: t('介质 1 里同时存在入射波与反射波，介质 2 里只有透射波。', 'Medium 1 hosts both incident and reflected waves; medium 2 hosts only the transmitted wave.') },
        { n: 2, op: 'physics', title: t('界面上压力连续', 'Pressure is continuous at the interface'),
            latex: String.raw `p_i+p_r=p_t \;\Longrightarrow\; 1+R=T`,
            note: t('界面不能承受压力差，否则会被无限加速。', 'An interface cannot sustain a pressure jump; otherwise it would be accelerated without bound.') },
        { n: 3, op: 'physics', title: t('法向质点速度连续', 'Normal particle velocity is continuous'),
            latex: String.raw `v_i+v_r=v_t,\qquad v=\frac{p}{Z}\;\text{且反射波反向}\; v_r=-\frac{p_r}{Z_1}`,
            note: t('这是关键一步：反射波沿相反方向传播，所以它的质点速度取负号。', 'This is the crucial step: the reflected wave travels in the opposite direction, so its particle velocity carries a minus sign.') },
        { n: 4, op: 'substitute', title: t('代入 v = p/Z', 'Substitute v = p/Z'),
            latex: String.raw `\frac{p_i}{Z_1}-\frac{p_r}{Z_1}=\frac{p_t}{Z_2}\;\Longrightarrow\;\frac{1-R}{Z_1}=\frac{T}{Z_2}` },
        { n: 5, op: 'algebra', title: t('联立两式求解 T', 'Solve the two equations for T'),
            latex: String.raw `1+R=T \;\text{且}\; \frac{1-R}{Z_1}=\frac{T}{Z_2}\;\Longrightarrow\; \frac{2-T}{Z_1}=\frac{T}{Z_2}` },
        { n: 6, op: 'result', title: t('得到透射系数', 'The transmission coefficient'),
            latex: String.raw `2Z_2=T\left(Z_1+Z_2\right)\;\Longrightarrow\; \boxed{T=\frac{2Z_2}{Z_1+Z_2}}` },
    ],
    viz: [
        {
            id: 'transmission-curve',
            level: 'V1',
            title: t('透射系数随阻抗比的变化', 'Transmission coefficient versus impedance ratio'),
            xlabel: t('阻抗比 Z₂/Z₁', 'impedance ratio Z₂/Z₁'),
            ylabel: t('系数值', 'coefficient value'),
            controls: [],
            compute: () => {
                const tPts = [];
                const rPts = [];
                for (let i = 0; i <= 400; i++) {
                    const q = 0.05 + (i / 400) * 4;
                    tPts.push([q, (2 * q) / (1 + q)]);
                    rPts.push([q, (q - 1) / (q + 1)]);
                }
                return [
                    { label: t('T = 2Z₂/(Z₁+Z₂)', 'T = 2Z₂/(Z₁+Z₂)'), color: '#0F6E56', points: tPts },
                    { label: t('R = (Z₂−Z₁)/(Z₂+Z₁)', 'R = (Z₂−Z₁)/(Z₂+Z₁)'), color: '#993C1D', points: rPts },
                ];
            },
            note: t('T 从 0 单调升到 2，R 从 −1 单调升到 +1。T>1 的部分不代表能量放大。', 'T rises monotonically from 0 to 2 while R goes from −1 to +1. T > 1 does not mean energy amplification.'),
        },
    ],
    example: {
        title: t('海水—砂岩界面', 'A water–sandstone interface'),
        input: t('Z₁ = 1.5×10⁶（水），Z₂ = 6.0×10⁶（砂岩）', 'Z₁ = 1.5×10⁶ (water), Z₂ = 6.0×10⁶ (sandstone)'),
        steps: [
            t('阻抗比 q = 4', 'Impedance ratio q = 4'),
            t('T = 2×4/(1+4) = 1.6', 'T = 2×4/(1+4) = 1.6'),
            t('R = (4−1)/(4+1) = 0.6', 'R = (4−1)/(4+1) = 0.6'),
        ],
        output: t('压力幅值放大到 1.6 倍，但能量透射率只有 (Z₁/Z₂)T² = 0.64，与 R² = 0.36 相加正好为 1', 'Pressure amplitude grows to 1.6×, yet the transmitted energy fraction is only (Z₁/Z₂)T² = 0.64, which with R² = 0.36 sums to exactly 1'),
    },
    links: {
        upstream: [{ id: 'acoustic-reflection-coefficient', note: t('同一组边界条件的另一个解', 'The other solution of the same boundary conditions') }],
        seealso: [{ id: 'shuey-approximation', note: t('斜入射时的推广', 'Generalisation to oblique incidence') }],
    },
    refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.2' }],
};
export default transmissionCoefficient;
//# sourceMappingURL=transmission-coefficient.js.map