import { t } from '../../core/types.js';
/** reflection-transmission-energy */
const reflectionTransmissionEnergy = {
    id: 'reflection-transmission-energy',
    name: t('反射与透射的能量分配', 'Energy Partitioning at an Interface'),
    aliases: { zh: ['能量守恒', '反射系数能量', '透射系数能量'], en: ['energy partitioning', 'reflection and transmission coefficients', 'energy conservation'] },
    node: 'S3.1',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.EXPL'],
        quantity: ['Q.AMP', 'Q.MAT'],
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `\mathcal{R} + \mathcal{T} = 1,\qquad \mathcal{R} = R^{2},\qquad \mathcal{T} = \frac{4Z_{1}Z_{2}}{(Z_{1}+Z_{2})^{2}}`,
        variants: [
            { name: t('透射系数与位移透射系数', 'Energy and displacement transmission'), latex: String.raw `T = \frac{2Z_{1}}{Z_{1}+Z_{2}},\qquad \mathcal{T} = \frac{Z_{2}}{Z_{1}}T^{2}` },
            { name: t('阻抗相等时全部透射', 'Total transmission when impedances match'), latex: String.raw `Z_1 = Z_2 \Longrightarrow R = 0,\ \mathcal{T} = 1` },
            { name: t('自由表面与刚性界面两个极端', 'The two extremes: free surface and rigid interface'), latex: String.raw `Z_2 = 0 \Longrightarrow R = -1;\qquad Z_2 \to \infty \Longrightarrow R \to +1` },
        ],
    },
    meaning: t('振幅反射系数 R 不是能量反射系数。能量正比于阻抗乘以振幅平方，所以上层阻抗 Z₁ 与下层 Z₂ 不同时，能量反射率是 R²，而能量透射率必须乘上 Z₂/Z₁ 这个「搬运能量效率不同」的修正因子。海水—海底界面 R 可以很大，但透射下去的能量并没有 R² 暗示的那么少。', 'The amplitude reflection coefficient R is not the energy reflection coefficient. Energy scales as impedance times amplitude squared, so when Z₁ and Z₂ differ, the energy reflectance is R² while the energy transmittance carries an extra Z₂/Z₁ factor reflecting the different efficiency of carrying energy. At the seafloor R can be large, yet the transmitted energy is not as small as R² alone would suggest.'),
    symbols: [
        { sym: 'R', name: t('振幅反射系数', 'amplitude reflection coefficient'), unit: '无量纲', typical: '−1 – 1' },
        { sym: 'T', name: t('位移振幅透射系数', 'displacement transmission coefficient'), unit: '无量纲', typical: '0 – 2' },
        { sym: '\\mathcal{R}', name: t('能量反射率', 'energy reflectance'), unit: '无量纲' },
        { sym: '\\mathcal{T}', name: t('能量透射率', 'energy transmittance'), unit: '无量纲' },
        { sym: 'Z', name: t('波阻抗 Z = ρv', 'acoustic impedance Z = ρv'), unit: 'kg/(m²·s)' },
    ],
    conditions: {
        applies: [t('平面波垂直入射到声学（流体）界面', 'Plane waves at normal incidence on an acoustic (fluid) interface')],
        assumes: [
            t('无吸收、无转换波', 'No absorption, no converted waves'),
            t('界面平整、尺度远大于波长', 'The interface is flat and much larger than the wavelength'),
        ],
        breaks: [
            t('斜入射时须用 Zoeppritz 方程', 'Oblique incidence requires the Zoeppritz equations'),
            t('弹性界面上有 P↔S 转换，能量要分给四个系数', 'At an elastic interface P↔S conversion splits energy among four coefficients'),
        ],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('时间平均能流密度', 'Time-averaged energy flux'),
            latex: String.raw `\langle I\rangle = \frac{1}{2}Z\omega^{2}A^{2}` },
        { n: 2, op: 'substitute', title: t('写出三个能流', 'Write the three fluxes'),
            latex: String.raw `I_i \propto Z_1,\quad I_r \propto Z_1R^{2},\quad I_t \propto Z_2T^{2}` },
        { n: 3, op: 'algebra', title: t('能量守恒', 'Energy conservation'),
            latex: String.raw `Z_1 = Z_1R^{2} + Z_2T^{2}\ \Longrightarrow\ \mathcal{R} = R^{2},\ \ \mathcal{T} = \frac{Z_2}{Z_1}T^{2}` },
        { n: 4, op: 'substitute', title: t('代入 T 的显式', 'Insert the explicit T'),
            latex: String.raw `\mathcal{T} = \frac{Z_2}{Z_1}\left(\frac{2Z_1}{Z_1+Z_2}\right)^{2} = \frac{4Z_1Z_2}{(Z_1+Z_2)^{2}}` },
        { n: 5, op: 'result', title: t('验证和为 1', 'Verify the sum is one'),
            latex: String.raw `\mathcal{R}+\mathcal{T} = \frac{(Z_2-Z_1)^{2} + 4Z_1Z_2}{(Z_1+Z_2)^{2}} = \frac{(Z_1+Z_2)^{2}}{(Z_1+Z_2)^{2}} = 1` },
    ],
    viz: [
        {
            id: 'energy-partition',
            level: 'V1',
            title: t('能量分配随阻抗比的变化', 'Energy partitioning versus impedance ratio'),
            xlabel: t('Z₂ / Z₁', 'Z₂ / Z₁'),
            ylabel: t('系数值', 'coefficient value'),
            xScale: 'log',
            controls: [],
            note: t('注意能量透射率在 Z₂=Z₁ 处达到 1，而振幅透射系数却是 1 —— 两者含义不同。', 'Note that the energy transmittance peaks at 1 where Z₂ = Z₁, while the amplitude transmission coefficient is also 1 there — the two mean different things.'),
            compute: () => {
                const r = [];
                const tr = [];
                const ta = [];
                for (let i = 0; i <= 200; i++) {
                    const q = Math.pow(10, -1 + (i / 200) * 3);
                    const R = (q - 1) / (q + 1);
                    const T = 2 / (q + 1);
                    r.push([q, R * R]);
                    ta.push([q, T]);
                    tr.push([q, (4 * q) / (1 + q) ** 2]);
                }
                return [
                    { label: t('能量反射率 R²', 'energy reflectance R²'), color: '#993C1D', points: r },
                    { label: t('能量透射率 𝒯', 'energy transmittance 𝒯'), color: '#185FA5', points: tr },
                    { label: t('振幅透射 T', 'amplitude T'), color: '#0F6E56', points: ta, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('页岩到含气砂岩', 'Shale to gas sand'),
        input: t('Z₁ = 6.0，Z₂ = 4.0（×10⁶ kg/(m²·s)）', 'Z₁ = 6.0, Z₂ = 4.0 (×10⁶ kg/(m²·s))'),
        steps: [
            t('R = (4 − 6)/(4 + 6) = −0.20，能量反射率 = 0.04', 'R = (4 − 6)/(4 + 6) = −0.20, energy reflectance = 0.04'),
            t('𝒯 = 4×4×6/(10²) = 0.96', '𝒯 = 4×4×6/(10²) = 0.96'),
        ],
        output: t('只有 4% 的能量被反射，96% 透射下去 —— 但反射振幅已有 −0.2，足以形成亮点', 'Only 4% of the energy is reflected, 96% transmits — yet a −0.2 reflection amplitude is enough for a bright spot'),
    },
    links: {
        upstream: [{ id: 'acoustic-reflection-coefficient', note: t('振幅反射系数', 'The amplitude reflection coefficient') }],
        downstream: [{ id: 'transmission-loss', note: t('逐层累积的透射损失', 'Transmission loss accumulated layer by layer') }],
        seealso: [{ id: 'transmission-coefficient', note: t('透射系数的定义', 'Definition of the transmission coefficient') }],
    },
    refs: [{ text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §3.3' }],
};
export default reflectionTransmissionEnergy;
//# sourceMappingURL=reflection-transmission-energy.js.map