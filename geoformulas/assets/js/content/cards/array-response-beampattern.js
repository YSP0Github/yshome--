import { t } from '../../core/types.js';
/** array-response-beampattern */
const arrayResponseBeampattern = {
    id: 'array-response-beampattern',
    name: t('台阵响应函数与波束图', 'Array Response Function & Beam Pattern'),
    aliases: { zh: ['台阵响应', '波束图', '主瓣旁瓣'], en: ['array response', 'beam pattern', 'main lobe and side lobes'] },
    node: 'S8.3',
    tags: {
        math: ['MATH.FOURIER', 'MATH.GEOM'],
        method: ['METH.INSTR', 'METH.PROC'],
        quantity: ['Q.VEL', 'Q.AMP'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `B(\mathbf{k}) = \frac{1}{N}\sum_{j=1}^{N} e^{i\mathbf{k}\cdot\mathbf{r}_j},\qquad
|W(\mathbf{k} - \mathbf{k}_0)| = \left|\frac{1}{N}\sum_{j=1}^{N} e^{i(\mathbf{k}-\mathbf{k}_0)\cdot\mathbf{r}_j}\right|`,
        variants: [
            { name: t('主瓣宽度反比于孔径', 'Main-lobe width scales inversely with aperture'), latex: String.raw `\Delta k \approx \frac{2\pi}{D_{\max}},\qquad \Delta\theta \approx \frac{\lambda}{D_{\max}\cos\theta_0}` },
            { name: t('旁瓣由台站稀疏与不规则产生', 'Side lobes arise from sparse, irregular station spacing'), latex: String.raw `\text{台间距} \gtrsim \frac{\lambda}{2} \Rightarrow \text{出现空间假频（旁瓣与主瓣同高）}` },
            { name: t('聚束输出功率', 'Beam power output'), latex: String.raw `P(\mathbf{k}) = \mathbf{e}^{\dagger}\mathbf{R}\,\mathbf{e},\qquad \mathbf{e}_j = e^{i\mathbf{k}\cdot\mathbf{r}_j}` },
            { name: t('Capon（MVDR）自适应波束', 'Capon (MVDR) adaptive beam'), latex: String.raw `P_{\text{Capon}}(\mathbf{k}) = \frac{1}{\mathbf{e}^{\dagger}\mathbf{R}^{-1}\mathbf{e}}` },
        ],
    },
    meaning: t('台阵相当于一个空间滤波器：它把来自某个方向的信号相加、把来自其它方向的信号部分抵消。这个滤波器的形状就是台阵响应（波束图），由台站的几何分布唯一决定，与信号无关。主瓣越窄意味着方向分辨越好，但旁瓣越高意味着强干扰会从「后门」漏进来 —— 主瓣宽度与旁瓣水平的权衡，是台阵设计的核心问题。', 'An array acts as a spatial filter: it sums signals arriving from one direction while partially cancelling those from others. The shape of that filter is the array response (beam pattern), determined solely by station geometry and independent of the signal. A narrower main lobe means better directional resolution, but higher side lobes mean strong interference leaks in through the "back door" — the trade-off between main-lobe width and side-lobe level is the central problem of array design.'),
    symbols: [
        { sym: 'B(\\mathbf{k})', name: t('台阵响应（波束）', 'array response (beam)'), unit: '无量纲' },
        { sym: '\\mathbf{r}_j', name: t('第 j 个台站相对于阵心的位置', 'position of station j relative to the array centre'), unit: 'km' },
        { sym: 'D_{\\max}', name: t('台阵孔径（最大台间距）', 'array aperture (maximum station separation)'), unit: 'km' },
        { sym: '\\mathbf{R}', name: t('互谱密度矩阵', 'cross-spectral density matrix'), unit: '—' },
        { sym: '\\lambda', name: t('波长', 'wavelength'), unit: 'km' },
    ],
    conditions: {
        applies: [t('台阵设计、慢度—方位估计、聚束增强弱信号', 'Array design, slowness–azimuth estimation, beamforming to enhance weak signals')],
        assumes: [t('波场为平面波（远场）', 'The wavefield is a plane wave (far field)')],
        breaks: [t('近场或非平面波前时聚束失效', 'Beamforming fails in the near field or for non-planar wavefronts'), t('台间距超过半波长会出现空间假频', 'Station spacing beyond half a wavelength causes spatial aliasing')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('平面波在第 j 个台站的到时为 t − k·r_j', 'A plane wave arrives at station j at time t − k·r_j'), latex: String.raw `u_j(t) = A\,e^{i(\omega t - \mathbf{k}_0\cdot\mathbf{r}_j)}` },
        { n: 2, op: 'physics', title: t('对每个台站加延迟后再求和（聚束）', 'Apply a delay to each station and sum (beamforming)'), latex: String.raw `y(t) = \frac{1}{N}\sum_j u_j(t + \mathbf{k}\cdot\mathbf{r}_j/\omega)` },
        { n: 3, op: 'algebra', title: t('求和得到一个复指数之和', 'The sum is a sum of complex exponentials'), latex: String.raw `y = A e^{i\omega t}\cdot\frac{1}{N}\sum_j e^{i(\mathbf{k}-\mathbf{k}_0)\cdot\mathbf{r}_j}` },
        { n: 4, op: 'identity', title: t('定义台阵响应 W', 'Define the array response W'), latex: String.raw `W(\Delta\mathbf{k}) = \frac{1}{N}\sum_{j} e^{i\Delta\mathbf{k}\cdot\mathbf{r}_j},\qquad |W| \le 1` },
        { n: 5, op: 'result', title: t('Δk = 0 时 |W| = 1（主瓣）；其它方向由干涉决定（旁瓣）', '|W| = 1 at Δk = 0 (main lobe); other directions follow from interference (side lobes)'), latex: String.raw `\Delta k \approx \frac{2\pi}{D_{\max}}` },
    ],
    viz: [
        {
            id: 'beampattern',
            level: 'V3',
            title: t('台阵波束图随孔径与频率的变化', 'Beam pattern versus aperture and frequency'),
            xlabel: t('方位角偏差 Δθ (°)', 'azimuth deviation Δθ (°)'),
            ylabel: t('|W| (dB)', '|W| (dB)'),
            controls: [
                { id: 'D', label: t('台阵孔径 D (km)', 'array aperture D (km)'), min: 0.5, max: 50, step: 0.5, value: 10 },
                { id: 'v', label: t('视速度 v (km/s)', 'apparent velocity v (km/s)'), min: 2, max: 15, step: 0.1, value: 8 },
                { id: 'f', label: t('频率 f (Hz)', 'frequency f (Hz)'), min: 0.05, max: 5, step: 0.05, value: 1 },
                { id: 'nst', label: t('台站数 N', 'number of stations N'), min: 3, max: 40, step: 1, value: 12 },
            ],
            note: t('提高频率或加大孔径都会让主瓣变窄（分辨率变好），但同时旁瓣变多变高。台站数增加主要压低旁瓣而不改变主瓣宽度 —— 这是「孔径管分辨率、密度管旁瓣」的定量体现。', 'Raising frequency or enlarging the aperture narrows the main lobe (better resolution) but also makes side lobes more numerous and higher. Adding stations mainly suppresses side lobes without narrowing the main lobe — the quantitative expression of "aperture controls resolution, density controls side lobes".'),
            compute: (p) => {
                const D = p['D'], v = p['v'], f = p['f'], N = Math.round(p['nst']);
                const lam = v / f;
                const k = (2 * Math.PI) / lam;
                // 台站沿一条线随机—均匀混合分布
                const xs = [];
                for (let j = 0; j < N; j++) {
                    const frac = N > 1 ? j / (N - 1) : 0.5;
                    xs.push((frac - 0.5) * D + 0.06 * D * Math.sin(j * 12.9898));
                }
                const pts = [];
                for (let i = 0; i <= 400; i++) {
                    const dth = -60 + (i / 400) * 120;
                    const rad = (dth * Math.PI) / 180;
                    let re = 0, im = 0;
                    for (let j = 0; j < N; j++) {
                        const ph = k * xs[j] * Math.sin(rad);
                        re += Math.cos(ph);
                        im += Math.sin(ph);
                    }
                    const w = Math.sqrt(re * re + im * im) / N;
                    pts.push([dth, 20 * Math.log10(Math.max(w, 1e-6))]);
                }
                return [{ label: t('台阵响应 |W|', 'array response |W|'), color: '#185FA5', points: pts }];
            },
        },
        {
            id: 'res-aperture',
            level: 'V1',
            title: t('方位分辨率随孔径的变化', 'Azimuth resolution versus aperture'),
            xlabel: t('孔径 D (km)', 'aperture D (km)'),
            ylabel: t('主瓣半宽 (°)', 'main-lobe half width (°)'),
            controls: [
                { id: 'v', label: t('视速度 v (km/s)', 'apparent velocity v (km/s)'), min: 2, max: 15, step: 0.1, value: 8 },
                { id: 'f', label: t('频率 f (Hz)', 'frequency f (Hz)'), min: 0.05, max: 5, step: 0.05, value: 1 },
            ],
            note: t('分辨率 λ/D 很快饱和：孔径从 1 km 增到 10 km 改善巨大，从 100 km 增到 1000 km 却收效甚微（因为公式里已经是 1° 以下）。这也说明为什么区域台阵很少做到上百公里。', 'The λ/D resolution saturates quickly: growing the aperture from 1 km to 10 km helps enormously, but from 100 km to 1000 km barely helps (the value is already below 1°). This explains why regional arrays are rarely built beyond a hundred kilometres.'),
            compute: (p) => {
                const v = p['v'], f = p['f'];
                const lam = v / f;
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const D = 0.5 + (i / 200) * 199.5;
                    const halfw = (Math.asin(Math.min(1, lam / D)) * 180) / Math.PI;
                    pts.push([D, halfw]);
                }
                return [{ label: t('主瓣半宽', 'main-lobe half width'), color: '#993C1D', points: pts }];
            },
        },
    ],
    example: {
        title: t('一个区域台阵的分辨率', 'Resolution of a regional array'),
        input: t('孔径 10 km，视速度 8 km/s，频率 1 Hz', 'aperture 10 km, apparent velocity 8 km/s, frequency 1 Hz'),
        steps: [
            t('λ = v/f = 8 km', 'λ = v/f = 8 km'),
            t('Δθ ≈ λ/D = 0.8 rad ≈ 46°（这是很差的方向分辨）', 'Δθ ≈ λ/D = 0.8 rad ≈ 46° (a poor directional resolution)'),
            t('若把频率提到 4 Hz，λ = 2 km，Δθ ≈ 11°', 'At 4 Hz, λ = 2 km and Δθ ≈ 11°'),
        ],
        output: t('要获得几度的方向分辨，需要孔径为波长的十倍以上', 'Resolving direction to a few degrees requires an aperture more than ten wavelengths'),
    },
    links: {
        upstream: [
            { id: 'array-beamforming', note: t('聚束是响应的实际应用', 'Beamforming is the practical use of the response') },
            { id: 'fk-analysis', note: t('f–k 分析是频率域版本', 'f–k analysis is the frequency-domain version') },
        ],
        seealso: [{ id: 'wavenumber-wavelength', note: t('波数是波束图的自变量', 'Wavenumber is the independent variable of the beam pattern') }],
    },
    refs: [{ text: 'Rost & Thomas (2002), Array seismology: methods and applications, Rev. Geophys. 40, 1008' }],
};
export default arrayResponseBeampattern;
//# sourceMappingURL=array-response-beampattern.js.map