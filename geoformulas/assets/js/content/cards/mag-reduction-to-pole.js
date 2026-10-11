import { t } from '../../core/types.js';
/** mag-reduction-to-pole */
const magReductionToPole = {
    id: 'mag-reduction-to-pole',
    name: t('化极（化到地磁极）', 'Reduction to the Pole (RTP)'),
    aliases: { zh: ['化极', 'RTP'], en: ['reduction to the pole', 'RTP'] },
    node: 'S15.4',
    tags: {
        math: ['MATH.FOURIER', 'MATH.ALGEBRA'],
        method: ['METH.MAG', 'METH.PROC'],
        quantity: ['Q.MAG'],
        keywords: t('化极 RTP 磁异常 移位 倾角', 'reduction to the pole RTP magnetic anomaly shift inclination'),
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `\Delta F_{\text{RTP}}(u,v)=\frac{\Delta F(u,v)}{\left(\frac{i\,u}{k}\cos I+\frac{i\,v}{k}\cos D\sin I+\sin I\right)^{2}}`,
        variants: [
            { name: t('物理效果', 'physical effect'), latex: String.raw `\text{化极后异常中心与场源重心重合}` },
        ],
    },
    meaning: t('中低纬度地磁场倾斜，观测到的总场异常 ΔF 会向磁南北方向偏离磁化体上方，甚至出现负异常"尾巴"，让解释者找不准场源。化极（RTP）在频率域用一个滤波器把倾斜磁化校正为垂直磁化，使正异常中心直接落在场源正上方，极大简化横向解释。它是航磁、地面磁测常规处理的核心一步。', 'At mid/low latitudes the inclined field makes the observed total-field anomaly shift away from the magnetized body toward magnetic north/south, often with a negative "tail", obscuring the source. Reduction to the pole (RTP) applies a frequency-domain filter that corrects inclined magnetization to vertical, placing the positive anomaly directly over the source and greatly simplifying lateral interpretation. It is a standard step in aeromagnetic and ground-magnetic processing.'),
    symbols: [
        { sym: '\\Delta F(u,v)', name: t('总场异常频谱', 'total-field anomaly spectrum'), unit: 'nT' },
        { sym: 'u,v', name: t('平面波数', 'wavenumbers'), unit: 'rad/m' },
        { sym: 'k', name: t('|k|=√(u²+v²)', 'total wavenumber'), unit: 'rad/m' },
        { sym: 'I,D', name: t('当地倾角与偏角', 'local inclination and declination'), unit: '°' },
    ],
    conditions: {
        applies: [t('航磁、地面磁测常规处理', 'Standard aeromagnetic/ground magnetic processing')],
        assumes: [t('磁化方向与地磁场平行（感磁为主）', 'Magnetization parallel to present field (induced dominant)')],
        breaks: [t('剩磁方向偏离时化极失真', 'Biased when remanence deviates from present field')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('ΔF ∝ 磁化方向与场方向的点积', 'ΔF ∝ dot of magnetization and field direction'),
            latex: String.raw `\Delta F\propto (\mathbf{M}\cdot\hat{\mathbf{r}})(\mathbf{H}\cdot\hat{\mathbf{r}})` },
        { n: 2, op: 'transform', title: t('Fourier 域把方向算子写成乘子', 'In Fourier domain this is a multiplicative filter'),
            latex: String.raw `L(u,v)=\frac{i u}{k}\cos I+\frac{i v}{k}\cos D\sin I+\sin I` },
        { n: 3, op: 'algebra', title: t('化极 = 除以该算子的平方', 'RTP = divide by L²'),
            latex: String.raw `\Delta F_{\text{RTP}}=\frac{\Delta F}{L^{2}}` },
        { n: 4, op: 'result', title: t('等效为垂直磁化', 'Equivalent to vertical magnetization'),
            latex: String.raw `I=90^{\circ}\ \Rightarrow\ L=\sin I=1` },
    ],
    links: {
        upstream: [{ id: 'mag-element-conversions' }],
        seealso: [{ id: 'mag-diurnal-correction' }],
    },
    refs: [{ text: 'Baranov (1957), Geophysics; Blakely, Potential Theory, §9' }],
};
export default magReductionToPole;
//# sourceMappingURL=mag-reduction-to-pole.js.map