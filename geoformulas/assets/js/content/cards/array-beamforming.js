import { t } from '../../core/types.js';
/** array-beamforming */
const arrayBeamforming = {
    id: 'array-beamforming',
    name: t('台阵聚束', 'Array Beamforming'),
    aliases: { zh: ['聚束', 'beamforming', '慢度估计'], en: ['beamforming', 'beam power', 'slowness estimation'] },
    node: 'S8.3',
    tags: {
        math: ['MATH.FOURIER', 'MATH.VECTOR', 'MATH.STAT'],
        method: ['METH.INSTR', 'METH.PROC'],
        quantity: ['Q.VEL', 'Q.AMP'],
    },
    audience: 'phd',
    complete: 'L2',
    statement: {
        main: String.raw `B(\boldsymbol{p},f)=\frac{1}{N^{2}}\left|\sum_{j=1}^{N}\tilde{u}_j(f)\,e^{i2\pi f\,\boldsymbol{p}\cdot\boldsymbol{r}_j}\right|^{2}`,
        variants: [
            { name: t('宽频带聚束（对频率求和）', 'Wideband beam (sum over frequency)'), latex: String.raw `B(\boldsymbol{p})=\sum_{f}B(\boldsymbol{p},f)` },
            { name: t('时域直接叠加', 'Direct time-domain stack'), latex: String.raw `b(t)=\frac{1}{N}\sum_{j}u_j\left(t+\boldsymbol{p}\cdot\boldsymbol{r}_j\right)` },
        ],
    },
    meaning: t('台阵把 N 个台站当作一个孔径更大的「合成地震计」。按不同慢度 p 对各台做时移再叠加：若 p 猜对了，所有台的同相信号对齐相加，能量是 N²；猜错了则互相抵消。聚束功率图上最亮的那一点就给出了波的来向与视速度 —— 这是从噪声中提取微弱信号最有效的手段。', 'An array turns N stations into a single seismometer with a much larger aperture. Signals are time-shifted for a trial slowness p and stacked: if p is right, the coherent signals align and add, giving energy ∝ N²; if wrong they cancel. The brightest point of the beam-power map gives the incoming direction and apparent velocity — the most effective way to extract weak signals from noise.'),
    symbols: [
        { sym: 'B(\\boldsymbol{p},f)', name: t('聚束功率', 'beam power'), unit: '与振幅平方同' },
        { sym: '\\boldsymbol{p}', name: t('试验水平慢度矢量', 'trial horizontal slowness vector'), unit: 's/km' },
        { sym: '\\boldsymbol{r}_j', name: t('第 j 个台的位置', 'position of the j-th station'), unit: 'km' },
        { sym: 'N', name: t('台站数', 'number of stations'), unit: '无量纲' },
        { sym: '\\tilde{u}_j(f)', name: t('第 j 台的频谱', 'spectrum at the j-th station'), unit: '与位移同' },
    ],
    conditions: {
        applies: [t('孔径适中、台站密集的地震台阵', 'Seismic arrays of moderate aperture with dense stations')],
        assumes: [
            t('波前在台阵孔径内近似平面', 'The wavefront is approximately planar across the array aperture'),
            t('各台仪器响应一致且已校正', 'Instrument responses are consistent and corrected'),
        ],
        breaks: [t('孔径过大时波前弯曲，平面波假设失效', 'With too large an aperture the wavefront curves and the plane-wave assumption fails')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('设平面波以慢度 p 传播', 'Assume a plane wave with slowness p'),
            latex: String.raw `u_j(t)=s\left(t-\boldsymbol{p}\cdot\boldsymbol{r}_j\right)` },
        { n: 2, op: 'transform', title: t('变换到频域', 'Transform to the frequency domain'),
            latex: String.raw `\tilde{u}_j(f)=\tilde{s}(f)\,e^{-i2\pi f\,\boldsymbol{p}\cdot\boldsymbol{r}_j}` },
        { n: 3, op: 'substitute', title: t('用试验慢度做补偿叠加', 'Stack with a trial slowness as compensation'),
            latex: String.raw `\tilde{b}=\frac{1}{N}\sum_j\tilde{u}_j(f)\,e^{+i2\pi f\,\boldsymbol{p}\cdot\boldsymbol{r}_j}` },
        { n: 4, op: 'result', title: t('取模平方得到聚束功率', 'Take the squared modulus to get beam power'),
            latex: String.raw `B(\boldsymbol{p},f)=\left|\tilde{b}\right|^{2}=\frac{1}{N^{2}}\left|\sum_j\tilde{u}_j(f)e^{i2\pi f\boldsymbol{p}\cdot\boldsymbol{r}_j}\right|^{2}` },
    ],
    links: {
        upstream: [{ id: 'fourier-shift-theorem', note: t('时移 ↔ 相移', 'Time shift ↔ phase shift') }],
        seealso: [{ id: 'fk-analysis', note: t('频率—波数域的等价表述', 'The equivalent frequency–wavenumber formulation') }],
    },
    refs: [{ text: 'Rost & Thomas (2002), Rev. Geophys., 40' }],
};
export default arrayBeamforming;
//# sourceMappingURL=array-beamforming.js.map