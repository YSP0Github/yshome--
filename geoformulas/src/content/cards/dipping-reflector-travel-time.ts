import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** dipping-reflector-travel-time */
const dippingReflectorTravelTime: FormulaCard = {
  id: 'dipping-reflector-travel-time',
  name: t('倾斜界面反射的时距方程', 'Travel-Time Equation for a Dipping Reflector'),
  aliases: {
    zh: ['倾斜界面', '倾角时距', '倾角动校正速度', 'DMO'],
    en: ['dipping reflector', 'dip moveout', 'dipping-interface travel time'],
  },
  node: 'S2.3',
  tags: {
    math: ['MATH.GEOM', 'MATH.APPROX'],
    method: ['METH.EXPL', 'METH.PROC'],
    quantity: ['Q.TIME', 'Q.VEL', 'Q.GEOM'],
    keywords: t('倾斜界面 倾角 时距 动校正速度 DMO 视倾角 镜像法', 'dipping reflector dip travel time NMO velocity DMO apparent dip image method'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`t^{2}=t_{0}^{2}+\frac{x^{2}\cos^{2}\varphi}{v^{2}}`,
    variants: [
      {
        name: t('显式解出 t', 'Solved for t'),
        latex: String.raw`t\left(x\right)=\frac{\cos\varphi}{v}\sqrt{x^{2}+4d^{2}}`,
      },
      {
        name: t('倾角下的动校正速度', 'NMO velocity for a dipping reflector'),
        latex: String.raw`v_{\mathrm{NMO}}=\frac{v}{\cos\varphi}\ \ge v`,
      },
      {
        name: t('零偏移距时间随 CMP 位置的变化', 'Variation of the zero-offset time with CMP position'),
        latex: String.raw`\frac{\mathrm{d}t_{0}}{\mathrm{d}x_{m}}=\frac{2\sin\varphi}{v}`,
      },
      {
        name: t('视倾角', 'Apparent dip'),
        latex: String.raw`\tan\varphi_{\mathrm{app}}=\tan\varphi\,\cos\alpha\qquad (\alpha=\text{测线与倾向的夹角})`,
      },
    ],
  },
  meaning: t(
    '反射面一旦倾斜，时距曲线依然是双曲线，但等效速度变成 v/cos φ：倾角越大曲线越平。这带来两个后果——一是用水平界面公式做速度分析会系统性地把速度估高，二是反射点不在 CMP 正下方，水平叠加会把倾斜同相轴放到错误位置，必须先做 DMO 或偏移。同时零偏移距时间随 CMP 位置线性变化，其斜率就是界面倾角在剖面上的直接读数。',
    'Once the reflector dips, the travel-time curve is still a hyperbola but with an effective velocity v/cos φ: the steeper the dip, the flatter the curve. Two consequences follow — velocity analysis with the horizontal formula systematically overestimates velocity, and because the reflection point is no longer beneath the CMP, stacking places the dipping event in the wrong position unless DMO or migration is applied first. At the same time the zero-offset time varies linearly with CMP position, and its slope is a direct read-out of the dip on the section.',
  ),
  symbols: [
    { sym: 't', name: t('双程反射走时', 'two-way reflection travel time'), unit: 's', typical: '0.3 – 5' },
    { sym: 't_{0}', name: t('该 CMP 处的零偏移距双程走时，t₀ = 2d cos φ / v', 'zero-offset two-way time at this CMP, t₀ = 2d cos φ / v'), unit: 's' },
    { sym: 'x', name: t('炮检距（沿倾向测线）', 'offset (along the dip line)'), unit: 'm', typical: '100 – 6000' },
    { sym: '\\varphi', name: t('界面倾角', 'dip angle of the reflector'), unit: '°', typical: '0 – 45' },
    { sym: 'd', name: t('界面在 CMP 中点正下方的铅垂深度', 'vertical depth of the reflector beneath the CMP midpoint'), unit: 'm' },
    { sym: 'v', name: t('上覆介质速度', 'velocity of the overlying medium'), unit: 'm/s', typical: '1500 – 5000' },
    { sym: 'v_{\\mathrm{NMO}}', name: t('倾斜界面的动校正速度', 'NMO velocity for the dipping reflector'), unit: 'm/s' },
    { sym: '\\varphi_{\\mathrm{app}}', name: t('视倾角（测线不与倾向平行时）', 'apparent dip when the line is oblique to the dip direction'), unit: '°' },
    { sym: 'x_{m}', name: t('CMP 中点位置', 'CMP midpoint position'), unit: 'm' },
  ],
  conditions: {
    applies: [
      t('沿倾向布置的测线（dip line）上的反射时距', 'Reflection travel times on a line shot along the dip direction'),
      t('倾角速度分析、DMO 处理与倾角校正', 'Dip-dependent velocity analysis, DMO processing and dip correction'),
    ],
    assumes: [
      t('反射面为平面、倾角 φ 在测线范围内恒定', 'The reflector is a plane of constant dip φ over the length of the line'),
      t('上覆介质速度恒定（或可用等效速度近似），各向同性', 'Constant (or effectively constant) isotropic overlying velocity'),
    ],
    breaks: [
      t('界面弯曲或非平面时不存在单一 φ，需逐点成像（偏移）', 'Curved or non-planar reflectors have no single φ and require point-by-point imaging (migration)'),
      t('沿走向测线（strike line）时 φ_app = 0，公式退化为水平情形', 'On a strike line φ_app = 0 and the formula degenerates to the horizontal case'),
      t('大倾角（φ > 45°）与大偏移距叠加时双曲近似仍会失效', 'At large dips (φ > 45°) combined with large offsets the hyperbolic approximation still fails'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('坐标设定：CMP 中点在原点，反射面倾斜 φ', 'Coordinates: the CMP midpoint at the origin, reflector dipping by φ'),
      latex: String.raw`S=\left(-\frac{x}{2},0\right),\quad R=\left(\frac{x}{2},0\right),\quad \text{界面： } z=d+X\tan\varphi`,
    },
    {
      n: 2,
      op: 'geometry',
      title: t('镜像法：把震源关于反射面镜像', 'Image method: mirror the source in the reflector'),
      latex: String.raw`\mathbf{n}=\left(-\sin\varphi,\ \cos\varphi\right),\qquad f\left(S\right)=\left(\frac{x}{2}\tan\varphi-d\right)\cos\varphi`,
      note: t('镜像点 S′ = S − 2f(S)n，于是总路径长就是 |S′R|。', 'The image point is S′ = S − 2 f(S) n, so the total path length is simply |S′R|.'),
    },
    {
      n: 3,
      op: 'substitute',
      title: t('写出镜像点坐标', 'Write the coordinates of the image point'),
      latex: String.raw`S'=\left(-\frac{x}{2}+x\sin^{2}\varphi-2d\sin\varphi\cos\varphi,\ \ -x\sin\varphi\cos\varphi+2d\cos^{2}\varphi\right)`,
    },
    {
      n: 4,
      op: 'algebra',
      title: t('求 |S′R|²，交叉项恰好抵消', 'Compute |S′R|²; the cross terms cancel exactly'),
      latex: String.raw`\Delta X=-\cos\varphi\left(x\cos\varphi+2d\sin\varphi\right),\quad \Delta Z=\cos\varphi\left(2d\cos\varphi-x\sin\varphi\right)`,
    },
    {
      n: 5,
      op: 'identity',
      title: t('合并得路径长', 'Combine to get the path length'),
      latex: String.raw`L^{2}=\Delta X^{2}+\Delta Z^{2}=\cos^{2}\varphi\left(x^{2}+4d^{2}\right)`,
      note: t('4dx sinφ cosφ 这一项在平方中一正一负正好抵消，剩下的形式与水平界面只差一个 cos²φ。', 'The 4dx sinφ cosφ terms cancel one positive against one negative, leaving a form that differs from the horizontal case only by a factor cos²φ.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('除以速度并写成双曲形式', 'Divide by velocity and write it in hyperbolic form'),
      latex: String.raw`t=\frac{\cos\varphi}{v}\sqrt{x^{2}+4d^{2}},\qquad t_{0}=\frac{2d\cos\varphi}{v}\;\Longrightarrow\; t^{2}=t_{0}^{2}+\frac{x^{2}\cos^{2}\varphi}{v^{2}}`,
      note: t('与标准式 t² = t₀² + x²/v_NMO² 对比即得 v_NMO = v/cos φ：倾角越大，动校正速度越高，曲线越平。', 'Comparison with t² = t₀² + x²/v_NMO² gives v_NMO = v/cos φ: the steeper the dip, the higher the correction velocity and the flatter the curve.'),
    },
  ],
  viz: [
    {
      id: 'dip-moveout',
      level: 'V1',
      title: t('倾角对时距曲线的影响', 'Effect of dip on the travel-time curve'),
      xlabel: t('炮检距 x (m)', 'offset x (m)'),
      ylabel: t('双程走时 t (s)', 'two-way time t (s)'),
      controls: [
        { id: 'dphi', label: t('界面倾角 φ', 'reflector dip φ'), min: 0, max: 45, step: 1, value: 20, unit: '°' },
        { id: 'dv', label: t('介质速度 v', 'medium velocity v'), min: 1500, max: 5000, step: 50, value: 2500, unit: 'm/s' },
        { id: 'dt0', label: t('零偏移距走时 t₀', 'zero-offset time t₀'), min: 0.4, max: 3, step: 0.05, value: 1.0, unit: 's' },
      ],
      xRange: [0, 6000],
      note: t('倾角越大曲线越平：同样的弯曲程度，若误按水平界面解释，就会得到一个偏大的速度 v/cos φ。φ = 30° 时这个偏差已达 15%，足以让叠加剖面变差——这正是必须先做 DMO 或偏移的定量理由。', 'The steeper the dip, the flatter the curve: interpreting the same curvature with the horizontal formula returns a velocity that is too high by the factor 1/cos φ. At φ = 30° the bias is already 15%, enough to degrade the stack — the quantitative reason why DMO or migration must come first.'),
      compute: (p) => {
        const phi = (p['dphi'] * Math.PI) / 180
        const v = p['dv']
        const t0 = p['dt0']
        const c = Math.cos(phi)
        const dip: Array<[number, number]> = []
        const flat: Array<[number, number]> = []
        for (let i = 0; i <= 300; i++) {
          const x = (i / 300) * 6000
          dip.push([x, Math.sqrt(t0 * t0 + (x * x * c * c) / (v * v))])
          flat.push([x, Math.sqrt(t0 * t0 + (x * x) / (v * v))])
        }
        return [
          { label: t('倾斜界面', 'dipping reflector'), color: '#185FA5', points: dip },
          { label: t('水平界面（φ = 0）', 'horizontal (φ = 0)'), color: '#B4B2A9', dash: true, points: flat },
        ]
      },
    },
  ],
  example: {
    title: t('倾角引起的速度偏差', 'Velocity bias caused by dip'),
    input: t('真实 v = 2500 m/s，φ = 30°，速度分析按水平界面解释', 'True v = 2500 m/s, φ = 30°, analysed with the horizontal formula'),
    steps: [
      t('真实动校正速度 v_NMO = 2500/cos 30° = 2887 m/s', 'The true NMO velocity is 2500/cos 30° = 2887 m/s'),
      t('若误认为水平，就把 2887 m/s 当成介质速度', 'Interpreted as horizontal, 2887 m/s is taken as the medium velocity'),
      t('偏差 = (2887 − 2500)/2500 ≈ 15%', 'bias = (2887 − 2500)/2500 ≈ 15%'),
    ],
    output: t('速度被高估 15%，对应的深度也被高估约 15%；同时反射点相对 CMP 中点向上倾方向偏移 (d + x²/4d)·sin φ·cos φ（30° 时约为 0.43(d + x²/4d)），必须靠 DMO 或偏移归位', 'Velocity is overestimated by 15%, and depth with it; the reflection point also sits up-dip of the CMP midpoint by (d + x²/4d)·sin φ·cos φ (about 0.43(d + x²/4d) at 30°), which only DMO or migration can restore'),
  },
  links: {
    upstream: [
      { id: 'reflection-hyperbola', note: t('φ = 0 时退化为标准双曲时距', 'degenerates to the standard hyperbolic form at φ = 0') },
      { id: 'snell-ray-parameter', note: t('镜像法仍依赖反射定律', 'the image method still rests on the law of reflection') },
    ],
    downstream: [{ id: 'hyperbolic-moveout-offset', note: t('动校正量须改用 v/cos φ', 'the moveout correction must use v/cos φ') }],
    seealso: [{ id: 'rms-velocity-definition' }],
  },
  refs: [
    { text: 'Yilmaz, Seismic Data Analysis, Vol. 1, Ch. 4' },
    { text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §4.3' },
  ],
}

export default dippingReflectorTravelTime
