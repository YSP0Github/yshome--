import { t } from '../../core/types.js';
/** opt-path-difference-phase */
const optPathDifferencePhase = {
    id: 'opt-path-difference-phase',
    name: t('光程差与相位差、相干条件', 'Path Difference, Phase Difference and Coherence'),
    aliases: { zh: ['干涉加强减弱条件', '相长干涉 相消干涉'], en: ['constructive/destructive interference', 'fringe conditions'] },
    node: 'S20.2',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.GEOM'],
        method: ['METH.PHYS'],
        quantity: ['Q.OPT', 'Q.FREQ'],
        keywords: t('光程差 相位差 相长 相消 相干 干涉条纹 明纹暗纹', 'path difference phase difference constructive destructive coherence interference fringes'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\delta=k\lambda\Rightarrow\text{明纹};\qquad \delta=\left(k+\tfrac12\right)\lambda\Rightarrow\text{暗纹}`,
        variants: [
            { name: t('相位差与光程差', 'Phase difference from path difference'), latex: String.raw `\Delta\varphi=\frac{2\pi}{\lambda}\delta` },
            { name: t('半波损失：界面反射时有额外 π 相位突变', 'Half-wave loss: an extra π phase jump on reflection at an interface'), latex: String.raw `\delta\mapsto\delta+\frac{\lambda}{2}\quad(\text{半波损失})` },
        ],
    },
    meaning: t('两束相干光相遇时，振动是相加还是相消，完全由光程差 δ 决定：δ 为波长整数倍时相位差 2π 的整数倍，波峰遇波峰，明纹；δ 为半波长奇数倍时波峰遇波谷，暗纹。若其中一束在光密介质界面反射，会多出"半波损失"（额外 λ/2），明纹暗纹位置整体对调。', 'Whether two coherent beams reinforce or cancel on meeting is fixed by the optical path difference δ: an integer number of wavelengths gives a phase difference of 2π·k, peak meets peak (bright fringe); an odd half-integer gives peak meets trough (dark fringe). If one beam reflects off an optically denser medium it picks up a "half-wave loss" (an extra λ/2), swapping bright and dark.'),
    symbols: [
        { sym: '\\delta', name: t('两束光的光程差', 'optical path difference'), unit: 'm' },
        { sym: '\\lambda', name: t('波长（此处为波长）', 'wavelength — note: wavelength here'), unit: 'm' },
        { sym: '\\Delta\\varphi', name: t('相位差', 'phase difference'), unit: 'rad' },
        { sym: 'k', name: t('条纹级次（0,1,2,…）', 'fringe order (0, 1, 2, …)'), unit: '1' },
    ],
    conditions: {
        applies: [t('两束光频率相同、振动方向相同、相位差恒定（相干）', 'Two beams of equal frequency, same polarization and fixed phase difference (coherent)')],
        assumes: [t('在真空中或同一介质中讨论波长', 'Wavelength is taken in vacuum or in the same medium')],
        breaks: [t('两束光不相干时条纹平均掉，只见均匀亮度', 'Incoherent beams average out the fringes into uniform brightness')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('两束光振幅叠加', 'Superpose the two amplitudes'), latex: String.raw `I=I_1+I_2+2\sqrt{I_1I_2}\cos\Delta\varphi` },
        { n: 2, op: 'substitute', title: t('代入 Δφ=2πδ/λ', 'Substitute Δφ = 2πδ/λ'), latex: String.raw `\Delta\varphi=\frac{2\pi}{\lambda}\delta` },
        { n: 3, op: 'result', title: t('极值条件', 'Extremal conditions'), latex: String.raw `\delta=k\lambda\ (\text{明}),\qquad \delta=(k+\tfrac12)\lambda\ (\text{暗})` },
    ],
    links: {
        upstream: [{ id: 'opt-optical-path-length' }],
        downstream: [{ id: 'opt-double-slit-interference' }, { id: 'opt-thin-film-interference' }],
    },
    refs: [{ text: 'Hecht, Optics, 5th ed., §8.1' }],
};
export default optPathDifferencePhase;
//# sourceMappingURL=opt-path-difference-phase.js.map