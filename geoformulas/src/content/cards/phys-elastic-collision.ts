import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phys-elastic-collision */
const physElasticCollision: FormulaCard = {
  id: 'phys-elastic-collision',
  name: t('一维弹性碰撞', 'One-Dimensional Elastic Collision'),
  aliases: { zh: ['弹性碰撞', '动能守恒碰撞'], en: ['elastic collision'] },
  node: 'S18.3',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.VECTOR'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('弹性碰撞 动能守恒 动量守恒 速度交换 台球', 'elastic collision kinetic energy conserved billiards equal mass exchange'),
  },
  audience: 'bachelor',
  complete: 'L4',
  statement: {
    main: String.raw`v_1'=\frac{(m_1-m_2)v_1+2m_2 v_2}{m_1+m_2},\qquad v_2'=\frac{(m_2-m_1)v_2+2m_1 v_1}{m_1+m_2}`,
    variants: [
      { name: t('质量相等时速度交换', 'equal masses exchange velocities'), latex: String.raw`m_1=m_2\;\Rightarrow\; v_1'=v_2,\quad v_2'=v_1` },
      { name: t('入射静止靶', 'target initially at rest'), latex: String.raw`v_2=0\;\Rightarrow\; v_1'=\dfrac{m_1-m_2}{m_1+m_2}v_1,\quad v_2'=\dfrac{2m_1}{m_1+m_2}v_1` },
    ],
  },
  meaning: t(
    '弹性碰撞中动量和动能同时守恒（碰撞后不粘在一起、无能量损失）。解两个守恒方程即得碰撞后速度。台球之间、分子气体碰撞都近似弹性。最有趣的极限是等质量：两球直接交换速度；大质量撞小质量时后者几乎以两倍速度飞出。',
    'In an elastic collision both momentum and kinetic energy are conserved (bodies bounce apart, no energy loss). Solving the two conservation equations gives the post-collision velocities. Billiard balls and gas molecules are nearly elastic. The striking limit is equal masses, which simply exchange velocities; a heavy ball hitting a light one sends it off at nearly twice the speed.',
  ),
  symbols: [
    { sym: 'm_1,m_2', name: t('两球质量', 'masses'), unit: 'kg' },
    { sym: 'v_1,v_2', name: t('碰撞前速度', 'pre-collision velocities'), unit: 'm/s' },
    { sym: "v_1',v_2'", name: t('碰撞后速度', 'post-collision velocities'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('对心（一维）碰撞、无能量损失', 'Head-on, energy-conserving collision')],
    assumes: [t('两体、孤立', 'Two isolated bodies')],
    breaks: [t('粘连或发声发热即非弹性', 'Sticking, sound or heat means inelastic')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('动量守恒', 'Momentum conserved'), latex: String.raw`m_1 v_1+m_2 v_2=m_1 v_1'+m_2 v_2'` },
    { n: 2, op: 'physics', title: t('动能守恒', 'Kinetic energy conserved'), latex: String.raw`\tfrac{1}{2}m_1 v_1^{2}+\tfrac{1}{2}m_2 v_2^{2}=\tfrac{1}{2}m_1 {v_1'}^{2}+\tfrac{1}{2}m_2 {v_2'}^{2}` },
    { n: 3, op: 'algebra', title: t('两式化简得相对速度反向', 'Reduce to relative velocity reversal'), latex: String.raw`v_1-v_2=v_2'-v_1'` },
    { n: 4, op: 'result', title: t('联立解出 v₁′、v₂′', 'Solve for the final velocities'), latex: String.raw`v_1'=\dfrac{(m_1-m_2)v_1+2m_2 v_2}{m_1+m_2}` },
  ],
  viz: [
    {
      id: 'elastic-collision-vel',
      level: 'V1',
      title: t('碰撞后速度随质量比的变化（靶静止）', 'Post-collision speeds vs mass ratio (target at rest)'),
      xlabel: t('质量比 m₁/m₂', 'mass ratio m₁/m₂'),
      ylabel: t('速度 / 入射速度', 'speed / incident speed'),
      controls: [
        { id: 'ratio', label: t('入射速度 v₁', 'incident speed v₁'), min: 1, max: 20, step: 1, value: 5, unit: 'm/s' },
      ],
      xRange: [0, 10],
      note: t('m₁≪m₂ 时入射球原速弹回（v₁′≈−v₁）；m₁=m₂ 时速度全部转移；m₁≫m₂ 时靶球以≈2v₁飞出。', 'm₁≪m₂: incident ball rebounds nearly unchanged; m₁=m₂: all speed transfers; m₁≫m₂: target flies off at ≈2v₁.'),
      compute: (p) => {
        const v1 = p['ratio']
        const b1: Array<[number, number]> = []
        const b2: Array<[number, number]> = []
        for (let i = 1; i <= 200; i++) {
          const r = i / 20
          const v1p = ((r - 1) / (r + 1)) * v1
          const v2p = ((2 * r) / (r + 1)) * v1
          b1.push([r, v1p / v1])
          b2.push([r, v2p / v1])
        }
        return [
          { label: t('v₁′/v₁', "v₁′/v₁"), color: '#185FA5', points: b1 },
          { label: t('v₂′/v₁', "v₂′/v₁"), color: '#BA7517', points: b2 },
        ]
      },
    },
  ],
  example: {
    title: t('台球等质量碰撞', 'Equal-mass billiard collision'),
    input: t('母球 v₁=3 m/s 撞静止的等重球 v₂=0', 'Cue ball v₁=3 m/s strikes an equal ball at rest v₂=0'),
    steps: [
      t('等质量：v₁′=v₂=0，v₂′=v₁=3 m/s', 'Equal mass: v₁′=v₂=0, v₂′=v₁=3 m/s'),
      t('母球停下，目标球以 3 m/s 飞出', 'Cue ball stops, object ball leaves at 3 m/s'),
    ],
    output: t('两球交换速度，动能全部转移', 'The balls exchange velocities; all kinetic energy transfers'),
  },
  links: {
    upstream: [{ id: 'phys-conservation-momentum' }, { id: 'phys-kinetic-energy' }],
    downstream: [{ id: 'phys-coefficient-restitution' }],
  },
}

export default physElasticCollision
