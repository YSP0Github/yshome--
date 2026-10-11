import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-satellite-orbit */
const physSatelliteOrbit: FormulaCard = {
  id: 'phys-satellite-orbit',
  name: t('卫星圆轨道与失重', 'Circular Orbit of a Satellite and Weightlessness'),
  aliases: { zh: ['第一宇宙速度', '轨道周期', '失重'], en: ['satellite orbit', 'first cosmic speed', 'orbital period', 'weightlessness'] },
  node: 'S18.2',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.GEOM'],
    method: ['METH.PHYS'],
    quantity: ['Q.GRAV', 'Q.VEL'],
    keywords: t('卫星 圆轨道 第一宇宙速度 轨道周期 失重 万有引力', 'satellite circular orbit first cosmic speed orbital period weightlessness'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`G\frac{M m}{r^{2}}=m\frac{v^{2}}{r}\;\Rightarrow\; v=\sqrt{\frac{GM}{r}},\qquad T=2\pi\sqrt{\frac{r^{3}}{GM}}`,
    variants: [
      { name: t('近地轨道第一宇宙速度', 'first cosmic speed at surface'), latex: String.raw`v_1=\sqrt{gR}\approx 7.9\ \text{km/s}` },
      { name: t('开普勒第三定律', "Kepler's third law"), latex: String.raw`T^{2}=\dfrac{4\pi^{2}}{GM}r^{3}` },
    ],
  },
  meaning: t(
    '卫星不掉下来的原因不是「没有重力」，而是它在不停地、高速地「错过」地面：万有引力恰好全部用来提供绕地球的向心力。轨道越高，需要的速度越小、周期越长。在轨道上，卫星和里面的人都在自由下落，所以处于完全失重状态——并不是不受重力。',
    'A satellite does not fall because gravity is absent; rather it keeps “missing” the ground by moving sideways fast: gravity is entirely used up providing the centripetal force. Higher orbits need less speed but longer periods. On orbit both craft and crew are in continuous free fall, hence weightless — not because gravity vanishes.',
  ),
  symbols: [
    { sym: 'M,m', name: t('地球、卫星质量', 'Earth and satellite masses'), unit: 'kg' },
    { sym: 'r', name: t('轨道半径（地心到卫星）', 'orbital radius from Earth’s centre'), unit: 'm' },
    { sym: 'v', name: t('轨道速率', 'orbital speed'), unit: 'm/s' },
    { sym: 'T', name: t('轨道周期', 'orbital period'), unit: 's' },
    { sym: 'G', name: t('万有引力常数', 'gravitational constant'), unit: 'm³ kg⁻¹ s⁻²' },
  ],
  conditions: {
    applies: [t('圆轨道、只受中心天体引力', 'Circular orbit under a single central mass')],
    assumes: [t('忽略大气阻力与其他天体摄动', 'Atmospheric drag and perturbations neglected')],
    breaks: [t('椭圆轨道需用开普勒第二定律', 'Elliptical orbits need Kepler II')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('万有引力提供向心力', 'Gravity supplies the centripetal force'), latex: String.raw`G\dfrac{Mm}{r^{2}}=m\dfrac{v^{2}}{r}` },
    { n: 2, op: 'algebra', title: t('约去 m 解出 v', 'Cancel m and solve for v'), latex: String.raw`v=\sqrt{\dfrac{GM}{r}}` },
    { n: 3, op: 'identity', title: t('周长 2πr 除以 v 得周期', 'Circumference 2πr over v gives the period'), latex: String.raw`T=\dfrac{2\pi r}{v}=2\pi\sqrt{\dfrac{r^{3}}{GM}}` },
  ],
  links: {
    upstream: [{ id: 'gravity-newton-law' }, { id: 'phys-centripetal-force' }],
    seealso: [{ id: 'phys-apparent-weight-elevator' }],
  },
}

export default physSatelliteOrbit
