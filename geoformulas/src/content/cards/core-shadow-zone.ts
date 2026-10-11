import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** core-shadow-zone */
const coreShadowZone: FormulaCard = {
  id: 'core-shadow-zone',
  name: t('P 波阴影区与地核', 'The P-Wave Shadow Zone and the Earth\'s Core'),
  aliases: {
    zh: ['阴影区', 'P 波阴影区', '核幔边界', '古登堡'],
    en: ['shadow zone', 'core shadow', 'core-mantle boundary', 'Gutenberg'],
  },
  node: 'S2.1',
  tags: {
    math: ['MATH.GEOM'],
    method: ['METH.TELE', 'METH.STRUCT'],
    quantity: ['Q.GEOM', 'Q.VEL', 'Q.TIME'],
    keywords: t('阴影区 地核 核幔边界 CMB 折射 PKP PKIKP 古登堡 间断面', 'shadow zone core core-mantle boundary CMB refraction PKP PKIKP Gutenberg discontinuity'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\sin i_{\mathrm{core}}=\frac{\alpha_{\mathrm{oc}}}{\alpha_{\mathrm{base}}}\,\sin i_{\mathrm{CMB}},\qquad \frac{\alpha_{\mathrm{oc}}}{\alpha_{\mathrm{base}}}=\frac{8.06}{13.72}\approx 0.59`,
    variants: [
      {
        name: t('阴影区的角距范围', 'Angular extent of the shadow zone'),
        latex: String.raw`103^{\circ}<\Delta<142^{\circ}\;:\ \text{无直达 P}\quad(\text{宽度约 } 39^{\circ})`,
      },
      {
        name: t('掠过核幔边界的射线参数', 'Ray parameter of the CMB-grazing ray'),
        latex: String.raw`p_{\mathrm{CMB}}=\frac{r_{\mathrm{CMB}}}{\alpha\left(r_{\mathrm{CMB}}^{-}\right)}\approx\frac{3480}{13.72}\approx 254\ \mathrm{s}\approx 4.4\ \mathrm{s/deg}`,
      },
      {
        name: t('速度降与掠射射线的偏折', 'Velocity drop and the deflection of a grazing ray'),
        latex: String.raw`i_{\mathrm{CMB}}=90^{\circ}\ \Longrightarrow\ i_{\mathrm{core}}=\arcsin\!\left(0.59\right)\approx 36^{\circ}`,
      },
      {
        name: t('S 波阴影区', 'The S-wave shadow zone'),
        latex: String.raw`\Delta>103^{\circ}\;:\ \beta_{\mathrm{oc}}=0\ \Longrightarrow\ \text{无直达 S}`,
      },
    ],
  },
  meaning: t(
    '地幔底部 P 波速度约 13.7 km/s，跨过核幔边界骤降到约 8.1 km/s。这么大的负梯度把射进外核的射线狠狠折向铅垂方向，使它们要绕行极大的角距才回到地表；而贴着核幔边界掠过、不进核的最深地幔射线只走到 103°。两者之间 103°–142° 的 39° 空档就是 P 波阴影区——1913 年古登堡正是用它测定了核幔边界的深度。',
    'At the base of the mantle the P velocity is about 13.7 km/s, and it drops abruptly to about 8.1 km/s across the core–mantle boundary. Such a large negative gradient bends the rays that enter the outer core sharply toward the vertical, so they must sweep an enormous angular distance before returning to the surface, while the deepest mantle ray that merely grazes the boundary reaches only 103°. The resulting 39° gap between 103° and 142° is the P shadow zone — the feature Gutenberg used in 1913 to fix the depth of the core–mantle boundary.',
  ),
  symbols: [
    { sym: '\\Delta', name: t('震中距', 'epicentral distance'), unit: '°', typical: '0 – 180' },
    { sym: 'r_{\\mathrm{CMB}}', name: t('核幔边界半径（深 2891 km）', 'radius of the core–mantle boundary (2891 km depth)'), unit: 'km', typical: '3480' },
    { sym: '\\alpha_{\\mathrm{base}}', name: t('地幔底部 P 波速度', 'P velocity at the base of the mantle'), unit: 'km/s', typical: '13.72' },
    { sym: '\\alpha_{\\mathrm{oc}}', name: t('外核顶部 P 波速度', 'P velocity at the top of the outer core'), unit: 'km/s', typical: '8.06' },
    { sym: 'i_{\\mathrm{CMB}}', name: t('射线在核幔边界上的入射角（自法线量起）', 'incidence angle at the CMB (from the normal)'), unit: '°' },
    { sym: 'i_{\\mathrm{core}}', name: t('射线进入外核后的折射角（自法线量起）', 'refraction angle inside the outer core (from the normal)'), unit: '°' },
    { sym: 'p', name: t('射线参数 p = r sin i / α', 'ray parameter p = r sin i / α'), unit: 's 或 s/deg', typical: '4 – 20 s/deg' },
    { sym: '\\beta_{\\mathrm{oc}}', name: t('外核中的 S 波速度（液态，为零）', 'S velocity in the outer core (liquid, zero)'), unit: 'km/s', typical: '0' },
  ],
  conditions: {
    applies: [
      t('全球尺度（Δ ≳ 20°）远震体波的初动分析', 'Onset analysis of teleseismic body waves at global distances (Δ ≳ 20°)'),
      t('由震相有无反推地球内部大间断面', 'Inferring major internal discontinuities from the presence or absence of phases'),
    ],
    assumes: [
      t('球对称速度结构（PREM / IASP91 量级）', 'A spherically symmetric velocity structure (PREM / IASP91 class)'),
      t('射线理论成立，忽略绕射', 'Ray theory holds and diffraction is ignored'),
    ],
    breaks: [
      t('绕射（Pdiff）与散射会让阴影区边缘并非完全静默，只是振幅骤降', 'Diffraction (Pdiff) and scattering keep the edge of the shadow zone from being perfectly silent; amplitudes merely collapse'),
      t('核幔边界上方的 D″ 层横向非均匀会产生 PKP 前驱波等异常震相', 'Lateral heterogeneity in the D″ layer above the CMB produces anomalous phases such as PKP precursors'),
      t('阴影区边界随所用参考模型而变，103°/142° 是一级近似', 'The boundaries depend on the reference model; 103° and 142° are first-order values'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('模型事实：核幔边界处 P 速度骤降', 'Model fact: the P velocity drops at the CMB'),
      latex: String.raw`\alpha\left(r_{\mathrm{CMB}}^{-}\right)=13.72\ \mathrm{km/s}\;\longrightarrow\;\alpha\left(r_{\mathrm{CMB}}^{+}\right)=8.06\ \mathrm{km/s}`,
      note: t('降幅约 41%，是整个地球内部最剧烈的一处速度间断。', 'A drop of about 41% — the sharpest velocity discontinuity anywhere inside the Earth.'),
    },
    {
      n: 2,
      op: 'physics',
      title: t('球面 Snell 定律：p = r sin i / α 沿射线守恒', 'Spherical Snell: p = r sin i / α is conserved along the ray'),
      latex: String.raw`\frac{r_{\mathrm{CMB}}\sin i_{\mathrm{CMB}}}{\alpha_{\mathrm{base}}}=\frac{r_{\mathrm{CMB}}\sin i_{\mathrm{core}}}{\alpha_{\mathrm{oc}}}`,
      note: t('界面两侧 r 相同，所以平面形式的 Snell 定律可直接照搬。', 'The radius is the same on both sides of the interface, so the plane form of Snell\'s law carries over directly.'),
    },
    {
      n: 3,
      op: 'algebra',
      title: t('速度降低 ⇒ sin i 减小 ⇒ 射线转向铅垂方向', 'Lower velocity ⇒ smaller sin i ⇒ the ray swings toward the vertical'),
      latex: String.raw`\sin i_{\mathrm{core}}=\frac{\alpha_{\mathrm{oc}}}{\alpha_{\mathrm{base}}}\sin i_{\mathrm{CMB}}=0.59\,\sin i_{\mathrm{CMB}}`,
      note: t('这是「向下折」而不是「全反射」：速度降低时射线更接近法线。', 'The ray is refracted downward rather than totally reflected: a velocity decrease pushes rays toward the normal.'),
    },
    {
      n: 4,
      op: 'geometry',
      title: t('掠射射线几乎垂直下插', 'A grazing ray plunges almost vertically'),
      latex: String.raw`i_{\mathrm{CMB}}=90^{\circ}\;\Rightarrow\; i_{\mathrm{core}}=\arcsin\left(0.59\right)\approx 36^{\circ}`,
      note: t('原本水平的射线进入外核后立刻变成与铅垂方向只差 36°，必须深入核内再绕出，角距因此暴涨。', 'A nearly horizontal ray becomes one only 36° from the vertical on entering the outer core; it has to dive deep and swing back out, so its angular distance jumps.'),
    },
    {
      n: 5,
      op: 'result',
      title: t('两端边界之间就是阴影区', 'The gap between the two branches is the shadow zone'),
      latex: String.raw`\Delta_{\max}^{\mathrm{mantle}}\approx 103^{\circ},\qquad \Delta_{\min}^{\mathrm{PKP}}\approx 142^{\circ}\;\Longrightarrow\; \text{阴影区宽约 }39^{\circ}`,
      note: t('前者是贴着核幔边界掠过的地幔射线，后者是刚能穿过外核的 PKP。', 'The first is the mantle ray grazing the CMB, the second the PKP ray that just manages to cross the outer core.'),
    },
    {
      n: 6,
      op: 'physics',
      title: t('（附）S 波：外核液态，阴影区没有终点', '(Appendix) S waves: the outer core is liquid, so the shadow has no end'),
      latex: String.raw`\beta_{\mathrm{oc}}=0\;\Longrightarrow\; \Delta>103^{\circ}\ \text{无直达 S，只有 ScS、SKS 等反射/转换震相}`,
      note: t('S 波完全不进入外核，这是外核为液态最直接的运动学证据。', 'S waves never enter the outer core at all — the most direct kinematic evidence that it is liquid.'),
    },
  ],
  viz: [
    {
      id: 'shadow-pdelta',
      level: 'V1',
      title: t('震中距—射线参数图上的阴影区', 'The shadow zone on a distance–ray-parameter plot'),
      xlabel: t('震中距 Δ (°)', 'epicentral distance Δ (deg)'),
      ylabel: t('射线参数 p (s/deg)', 'ray parameter p (s/deg)'),
      controls: [
        { id: 'vc', label: t('外核顶部 P 速度', 'P velocity at the top of the outer core'), min: 7.0, max: 12.0, step: 0.05, value: 8.06, unit: 'km/s' },
        { id: 'vm', label: t('地幔底部 P 速度', 'P velocity at the base of the mantle'), min: 12.0, max: 14.5, step: 0.05, value: 13.72, unit: 'km/s' },
      ],
      xRange: [0, 180],
      yRange: [0, 20],
      note: t('蓝支是底部留在地幔里的射线：射线参数越小（出射越陡）走得越远，最远只到约 96°（真实地球 103°）。绿支是穿过外核的 PKP/PKIKP，一出现就跳到约 145° 以外（真实地球 142°）。中间那段没有任何曲线的横向空档就是阴影区。把外核速度调高到接近地幔底部速度，空档会合拢——阴影区完全是速度间断造成的。', 'The blue branch are rays that stay in the mantle: smaller ray parameter (steeper takeoff) goes farther, but never beyond about 96° (103° in the real Earth). The green branch, PKP/PKIKP through the outer core, appears only beyond about 145° (142° in the real Earth). The horizontal gap with no curve between them is the shadow zone. Raise the outer-core velocity toward the mantle value and the gap closes — the shadow zone is entirely a consequence of the velocity discontinuity.'),
      compute: (p) => {
        const dvc = p['vc'] - 8.06
        const dvm = p['vm'] - 13.72
        const seg: Array<[number, number, number, number]> = [
          [6371, 6346, 5.8, 6.5],
          [6346, 6200, 8.04, 8.6],
          [6200, 6000, 8.6, 9.5],
          [6000, 5800, 9.5, 10.3],
          [5800, 5701, 10.3, 10.75],
          [5701, 5400, 10.75, 11.2],
          [5400, 5000, 11.2, 11.9],
          [5000, 4500, 11.9 + dvm, 12.6 + dvm],
          [4500, 4000, 12.6 + dvm, 13.3 + dvm],
          [4000, 3480, 13.3 + dvm, 13.72 + dvm],
          [3480, 3200, 8.06 + dvc, 8.7 + dvc],
          [3200, 2900, 8.7 + dvc, 9.2 + dvc],
          [2900, 2600, 9.2 + dvc, 9.7 + dvc],
          [2600, 2300, 9.7 + dvc, 10.0 + dvc],
          [2300, 2000, 10.0 + dvc, 10.2 + dvc],
          [2000, 1500, 10.2 + dvc, 10.35 + dvc],
          [1500, 1221, 10.35 + dvc, 10.36 + dvc],
          [1221, 800, 11.03 + dvc, 11.15 + dvc],
          [800, 400, 11.15 + dvc, 11.22 + dvc],
          [400, 0, 11.22 + dvc, 11.26 + dvc],
        ]
        const vAt = (r: number): number => {
          if (r >= 6371) return seg[0][2]
          for (let i = 0; i < seg.length; i++) {
            const s = seg[i]
            if (r <= s[0] && r >= s[1]) {
              const f = (s[0] - r) / (s[0] - s[1])
              return s[2] + (s[3] - s[2]) * f
            }
          }
          return seg[seg.length - 1][3]
        }
        const turnR = (pp: number): number => {
          let prevR = 6371
          for (let r = 6367; r > 0; r -= 4) {
            if (r - pp * vAt(r) <= 0) {
              let lo = r
              let hi = prevR
              for (let k = 0; k < 40; k++) {
                const m = (lo + hi) / 2
                if (m - pp * vAt(m) <= 0) lo = m
                else hi = m
              }
              return (lo + hi) / 2
            }
            prevR = r
          }
          return 0
        }
        const deltaOf = (pp: number, rt: number): number => {
          const w = Math.sqrt(6371 - rt)
          const n = 700
          const dw = w / n
          let sum = 0
          for (let i = 0; i < n; i++) {
            const wm = (i + 0.5) * dw
            const r = rt + wm * wm
            const pv = pp * vAt(r)
            const diff = (r - pv) * (r + pv)
            if (diff <= 0) continue
            const g = ((pv / (r * Math.sqrt(diff))) * 2 * wm) * dw
            if (Number.isFinite(g)) sum += g
          }
          return (2 * sum * 180) / Math.PI
        }
        const mantle: Array<[number, number]> = []
        const core: Array<[number, number]> = []
        for (let i = 0; i <= 220; i++) {
          const pp = 1050 - (1045 * i) / 220
          const rt = turnR(pp)
          const d = deltaOf(pp, rt)
          if (!Number.isFinite(d)) continue
          const pt: [number, number] = [d, (pp * Math.PI) / 180]
          if (rt >= 3480) mantle.push(pt)
          else core.push(pt)
        }
        return [
          { label: t('地幔射线（P）', 'mantle rays (P)'), color: '#185FA5', points: mantle },
          { label: t('穿过外核（PKP/PKIKP）', 'through the outer core (PKP/PKIKP)'), color: '#0F6E56', points: core },
        ]
      },
    },
  ],
  example: {
    title: t('用阴影区宽度估计核幔边界深度', 'Estimating the CMB depth from the width of the shadow zone'),
    input: t('观测到直达 P 在 Δ = 103° 处突然消失，PKP 在 Δ = 142° 处重新出现', 'Direct P vanishes at Δ = 103° and PKP reappears at Δ = 142°'),
    steps: [
      t('消失点对应贴着核幔边界掠过的地幔射线，其底部深度即为间断面深度', 'The cut-off corresponds to the mantle ray grazing the boundary; its bottoming depth is the discontinuity depth'),
      t('由走时表反查：该射线的底部深度约 2890 km', 'Reading the travel-time tables backwards gives a bottoming depth of about 2890 km'),
      t('r_CMB = 6371 − 2890 ≈ 3480 km', 'r_CMB = 6371 − 2890 ≈ 3480 km'),
    ],
    output: t('核幔边界深约 2891 km，与现代地震学模型（PREM 2891 km）一致', 'The core–mantle boundary lies about 2891 km deep, consistent with modern models (PREM: 2891 km)'),
  },
  links: {
    upstream: [
      { id: 'snell-ray-parameter', note: t('球面形式 p = r sin i / α 是判据', 'the spherical form p = r sin i / α is the criterion') },
      { id: 'seismic-phase-nomenclature', note: t('PKP、PKIKP、ScS 的命名给出路径', 'the names PKP, PKIKP, ScS encode the paths') },
    ],
    downstream: [{ id: 'adams-williamson', note: t('由地震学速度模型反推密度结构', 'recovering density from the seismic velocity model') }],
    seealso: [{ id: 'snell-law-spherical-interface' }],
  },
  refs: [
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §3.5' },
    { text: 'Dziewonski & Anderson (1981), Preliminary Reference Earth Model, Phys. Earth Planet. Inter. 25, 297–356' },
    { text: 'Stein & Wysession, An Introduction to Seismology, Earthquakes and Earth Structure, §4.4' },
  ],
}

export default coreShadowZone
