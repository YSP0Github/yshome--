import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** migration-impulse-response */
const migrationImpulseResponse: FormulaCard = {
  id: 'migration-impulse-response',
  name: t('绕射双曲线与偏移脉冲响应', 'Diffraction Hyperbola & Migration Impulse Response'),
  aliases: { zh: ['绕射收敛', '偏移脉冲响应', '半圆'], en: ['diffraction collapse', 'migration impulse response', 'semicircle'] },
  node: 'S3.5',
  tags: {
    math: ['MATH.GEOM'],
    method: ['METH.EXPL', 'METH.INV'],
    quantity: ['Q.GEOM', 'Q.TIME'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`t(x) = \frac{2}{v}\sqrt{z_{0}^{2} + (x-x_{0})^{2}},\qquad (x-x_{0})^{2}+z^{2} = \left(\frac{v\,t_{0}}{2}\right)^{2}`,
    variants: [
      { name: t('写成 t₀ 的形式', 'In terms of t₀'), latex: String.raw`t(x) = \sqrt{t_0^{2} + \frac{4(x-x_0)^{2}}{v^{2}}},\qquad t_0 = \frac{2z_0}{v}` },
      { name: t('曲率给出速度', 'Curvature gives the velocity'), latex: String.raw`v = \frac{2}{\sqrt{\text{双曲线曲率参数}}},\qquad t^{2} = t_0^{2} + \frac{4x^{2}}{v^{2}}` },
      { name: t('三维时退化为旋转双曲面', 'In 3D it becomes a hyperboloid'), latex: String.raw`t(x,y) = \frac{2}{v}\sqrt{z_0^{2}+(x-x_0)^{2}+(y-y_0)^{2}}` },
    ],
  },
  meaning: t(
    '一个地下绕射点（断层端点、尖灭、盐丘翼角）在时间剖面上是一条双曲线，而不是一个点。偏移就是把这条双曲线上的能量重新收回到它的顶点。反过来问「时间剖面上的一个脉冲会被偏移到哪儿」，答案是地表点下方的一个半圆 —— 这就是偏移的脉冲响应，也是判断偏移算法是否正确的第一块试金石。',
    'A subsurface diffractor (fault tip, pinch-out, salt flank) appears on a time section as a hyperbola, not a point. Migration collapses that hyperbola back to its apex. Asked the reverse question — where does a single impulse in the data migrate to — the answer is a semicircle beneath the surface point. That semicircle is the migration impulse response, the first test of any migration code.',
  ),
  symbols: [
    { sym: 'z_{0}', name: t('绕射点深度', 'depth of the diffractor'), unit: 'km' },
    { sym: 'x_{0}', name: t('绕射点水平位置', 'horizontal position of the diffractor'), unit: 'km' },
    { sym: 't_{0}', name: t('顶点处的双程时间', 'two-way time at the apex'), unit: 's' },
    { sym: 'v', name: t('介质速度', 'medium velocity'), unit: 'km/s' },
    { sym: 'R', name: t('脉冲响应半圆半径 v t₀/2', 'impulse-response radius v t₀/2'), unit: 'km' },
  ],
  conditions: {
    applies: [t('常速或平滑变速介质中的 Kirchhoff 偏移与质量监控', 'Kirchhoff migration and QC in constant or smoothly varying velocity media')],
    assumes: [
      t('单一绕射点、常速（导出双曲线）', 'A single diffractor in a constant-velocity medium'),
      t('观测孔径足够覆盖双曲线两翼', 'The aperture covers both flanks of the hyperbola'),
    ],
    breaks: [
      t('孔径不足时只收回部分能量，绕射残留呈「笑脸」', 'Insufficient aperture leaves a residual smile'),
      t('速度错误时双曲线收不拢，偏移后出现欠偏移或过偏移', 'Wrong velocity leaves the uncollapsed hyperbola: under- or over-migration'),
    ],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('绕射点到地表点的距离', 'Distance from the diffractor to a surface point'),
      latex: String.raw`L = \sqrt{z_0^{2}+(x-x_0)^{2}}` },
    { n: 2, op: 'substitute', title: t('双程走时', 'Two-way travel time'),
      latex: String.raw`t(x) = \frac{2L}{v} = \frac{2}{v}\sqrt{z_0^{2}+(x-x_0)^{2}}` },
    { n: 3, op: 'algebra', title: t('平方后认出双曲线', 'Square it to recognise the hyperbola'),
      latex: String.raw`\frac{t^{2}}{t_0^{2}} - \frac{(x-x_0)^{2}}{z_0^{2}} = 1,\qquad t_0 = \frac{2z_0}{v}` },
    { n: 4, op: 'geometry', title: t('偏移把每个脉冲映射成半圆', 'Migration maps each impulse to a semicircle'),
      latex: String.raw`(x-x_0)^{2} + z^{2} = \left(\frac{vt_0}{2}\right)^{2}` },
    { n: 5, op: 'result', title: t('沿半圆叠加，交点处相干加强', 'Summing along semicircles, energy interferes constructively at the true point'),
      latex: String.raw`I(x,z) = \sum_{x'} d\!\left(x',\ \frac{2}{v}\sqrt{z^{2}+(x-x')^{2}}\right)` },
  ],
  viz: [
    {
      id: 'diffraction-semicircle',
      level: 'V2',
      title: t('绕射双曲线与偏移半圆', 'Diffraction hyperbola and the migration semicircle'),
      xlabel: t('水平位置 x (km)', 'horizontal position x (km)'),
      ylabel: t('时间 (s) / 深度 (km)', 'time (s) / depth (km)'),
      controls: [
        { id: 'z0', label: t('绕射点深度 z₀ (km)', 'diffractor depth z₀ (km)'), min: 0.2, max: 4, step: 0.05, value: 1.5 },
        { id: 'v', label: t('速度 v (km/s)', 'velocity v (km/s)'), min: 1.5, max: 5, step: 0.05, value: 2.5 },
      ],
      note: t('上面的曲线是时间剖面上的绕射双曲线，下面的半圆是它的偏移脉冲响应 —— 两者互为对偶。', 'The upper curve is the diffraction hyperbola on the time section; the lower semicircle is its migration impulse response — they are dual to each other.'),
      compute: (p) => {
        const z0 = p['z0'], v = p['v']
        const hyp: Array<[number, number]> = []
        const semi: Array<[number, number]> = []
        const R = (v * (2 * z0 / v)) / 2
        for (let i = 0; i <= 200; i++) {
          const x = -4 + (i / 200) * 8
          hyp.push([x, (2 / v) * Math.sqrt(z0 * z0 + x * x) + 1.5])
        }
        for (let i = 0; i <= 200; i++) {
          const th = Math.PI - (i / 200) * Math.PI
          const x = R * Math.cos(th)
          semi.push([x, -R * Math.sin(th) - 0.5])
        }
        return [
          { label: t('绕射双曲线 t(x)', 'diffraction hyperbola t(x)'), color: '#185FA5', points: hyp },
          { label: t('偏移脉冲响应半圆', 'migration impulse semicircle'), color: '#993C1D', points: semi, dash: true },
        ]
      },
    },
  ],
  example: {
    title: t('1.5 km 深处的绕射点', 'A diffractor at 1.5 km depth'),
    input: t('z₀ = 1.5 km，v = 2.5 km/s', 'z₀ = 1.5 km, v = 2.5 km/s'),
    steps: [
      t('t₀ = 2×1.5/2.5 = 1.2 s', 't₀ = 2×1.5/2.5 = 1.2 s'),
      t('偏移距 2 km 处：t = (2/2.5)√(2.25+4) = 0.8×2.5 = 2.0 s', 'At 2 km offset: t = (2/2.5)√(2.25+4) = 0.8×2.5 = 2.0 s'),
    ],
    output: t('双曲线从 1.2 s 张到 2.0 s，偏移后收敛为一点', 'The hyperbola spans 1.2 s to 2.0 s and collapses to a point after migration'),
  },
  links: {
    upstream: [
      { id: 'exploding-reflector-model', note: t('偏移的理论基础', 'Theoretical basis of migration') },
      { id: 'hyperbolic-moveout-offset', note: t('同一条双曲线关系', 'The same hyperbolic relation') },
    ],
    downstream: [{ id: 'kirchhoff-migration', note: t('实现这一收敛的算法', 'The algorithm that performs this collapse') }],
    seealso: [{ id: 'fresnel-zone-radius', note: t('横向分辨率的判据', 'The lateral resolution criterion') }],
  },
  refs: [{ text: 'Claerbout, J. F. (1985). Imaging the Earth’s Interior. Blackwell, ch. 1' }],
}

export default migrationImpulseResponse
