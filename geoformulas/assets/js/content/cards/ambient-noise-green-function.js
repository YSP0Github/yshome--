import { t } from '../../core/types.js';
/** ambient-noise-green-function */
const ambientNoiseGreenFunction = {
    id: 'ambient-noise-green-function',
    name: t('噪声互相关提取格林函数', 'Extracting Green Functions from Ambient Noise'),
    aliases: { zh: ['背景噪声成像', '地震干涉'], en: ['ambient noise tomography', 'seismic interferometry', 'noise correlation'] },
    node: 'S9.6',
    tags: {
        math: ['MATH.FOURIER', 'MATH.STAT', 'MATH.DIFF'],
        method: ['METH.SURF', 'METH.PROC'],
        quantity: ['Q.VEL', 'Q.TIME'],
    },
    audience: 'phd',
    complete: 'L2',
    statement: {
        main: String.raw `\frac{\mathrm{d}C_{AB}(t)}{\mathrm{d}t}\propto-\left[G(\boldsymbol{r}_A,\boldsymbol{r}_B,t)-G(\boldsymbol{r}_A,\boldsymbol{r}_B,-t)\right]`,
        variants: [
            { name: t('互相关的定义', 'Definition of the correlation'), latex: String.raw `C_{AB}(t)=\left\langle u(\boldsymbol{r}_A,\tau)\,u(\boldsymbol{r}_B,\tau+t)\right\rangle_\tau` },
            { name: t('频域形式', 'Frequency-domain form'), latex: String.raw `\tilde{C}_{AB}(\omega)=\tilde{u}_A^{*}(\omega)\,\tilde{u}_B(\omega)` },
        ],
    },
    meaning: t('两个台站长期记录到的背景噪声做互相关再对时间求导，收敛到两台之间的格林函数 —— 也就是在 A 放一个震源、B 收到的完整波形。这相当于凭空造出了地震，不用等地震发生就能做成像。这是过去二十年地震学最重要的技术突破之一，它把「噪声」变成了信号。', 'Cross-correlating long ambient-noise records at two stations and differentiating in time converges to the Green function between them: the complete waveform that would be recorded at B from a source at A. It is as if an earthquake were created out of thin air, allowing imaging without waiting for one. This is one of the most important technical breakthroughs in seismology of the past two decades, turning noise into signal.'),
    symbols: [
        { sym: 'C_{AB}(t)', name: t('两台的噪声互相关', 'noise cross-correlation between two stations'), unit: '振幅平方' },
        { sym: 'G(\\boldsymbol{r}_A,\\boldsymbol{r}_B,t)', name: t('A 到 B 的格林函数', 'Green function from A to B'), unit: '1/m' },
        { sym: '\\langle\\cdot\\rangle_\\tau', name: t('对长时间窗求平均', 'average over a long time window'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('噪声源方位分布均匀（或至少双向均衡）的各向同性噪声场', 'A diffuse noise field with azimuthally uniform or at least balanced sources')],
        assumes: [
            t('噪声源在空间中均匀分布或至少方位均衡', 'Noise sources are spatially uniform or azimuthally balanced'),
            t('记录时间足够长（数月到数年）', 'Records are long enough (months to years)'),
        ],
        breaks: [t('噪声源单向聚集（如固定风暴源）会造成到时偏差与虚假不对称', 'One-sided noise sources such as persistent storms bias arrival times and create spurious asymmetry')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把噪声场写成许多远场源的叠加', 'Write the noise field as a superposition of far-field sources'),
            latex: String.raw `u(\boldsymbol{r},t)=\sum_j S_j(t)*G(\boldsymbol{r},\boldsymbol{s}_j,t)` },
        { n: 2, op: 'substitute', title: t('代入互相关定义', 'Substitute into the correlation'),
            latex: String.raw `C_{AB}=\sum_{j,k}S_j\star S_k\;*\;\left(G_A^{(j)}\star G_B^{(k)}\right)` },
        { n: 3, op: 'identity', title: t('源不相关时只剩 j = k 项', 'For uncorrelated sources only j = k survives'),
            latex: String.raw `C_{AB}\approx\sum_j\left(S_j\star S_j\right)*\left(G_A^{(j)}\star G_B^{(j)}\right)` },
        { n: 4, op: 'identity', title: t('利用格林函数的互易与叠加关系', 'Use reciprocity and the Green-function identity'),
            latex: String.raw `\sum_j G(\boldsymbol{r}_A,\boldsymbol{s}_j,-t)*G(\boldsymbol{s}_j,\boldsymbol{r}_B,t)\propto G(\boldsymbol{r}_A,\boldsymbol{r}_B,t)-G(\boldsymbol{r}_A,\boldsymbol{r}_B,-t)` },
        { n: 5, op: 'result', title: t('求导后得到因果与反因果两支', 'Differentiating gives causal and anticausal branches'),
            latex: String.raw `\frac{\mathrm{d}C_{AB}}{\mathrm{d}t}\propto-\left[G_{AB}(t)-G_{AB}(-t)\right]` },
    ],
    links: {
        upstream: [
            { id: 'cross-correlation', note: t('核心运算', 'The core operation') },
            { id: 'green-function-definition', note: t('被提取的对象', 'The object being extracted') },
        ],
        seealso: [{ id: 'phase-group-velocity', note: t('提取出的面波用来测频散', 'The extracted surface waves feed dispersion measurement') }],
    },
    refs: [{ text: 'Shapiro & Campillo (2004), Geophys. Res. Lett., 31' }, { text: 'Wapenaar et al. (2010), Geophysics, 75' }],
};
export default ambientNoiseGreenFunction;
//# sourceMappingURL=ambient-noise-green-function.js.map