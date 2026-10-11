/**
 * 验证「鼠标斥力」与「可点击性」不冲突。
 * 常数与 src/views/bubble.ts 保持一致。
 *
 * 场景：鼠标悬停在一个气泡上（hovered 已置位），考察它能否留在命中半径内。
 * 注意：只检验 offset <= 命中半径 的组合 —— 鼠标不在气泡上时 hovered 本就不会置位，
 * 那不是缺陷，而是正确行为。
 */
const MOUSE_R=190, MOUSE_F=30, HOVER_W=0.42, HOVER_Z=1.0, MAX_V=26, DAMP=0.72, ALPHA_MIN=0.0005
const MIN_HIT_R = 13

/** exempt=true → 修复后（豁免斥力 + 弹簧）；false → 修复前（吃自己斥力） */
function trial(r, off, exempt) {
  let px=off, py=0, vx=0, vy=0
  const traj=[]
  for (let f=0;f<40;f++){
    if(!exempt){
      const dx=px, dy=py, d=Math.hypot(dx,dy)
      if(d<MOUSE_R&&d>0.5){
        const g=(1-d/MOUSE_R)**2*MOUSE_F*(0.6+r/70)
        vx+=(dx/d)*g; vy+=(dy/d)*g
      }
    }
    vx+=(HOVER_W*HOVER_W*(-px)-2*HOVER_Z*HOVER_W*vx)*ALPHA_MIN
    vy+=(HOVER_W*HOVER_W*(-py)-2*HOVER_Z*HOVER_W*vy)*ALPHA_MIN
    vx*=DAMP; vy*=DAMP
    const sp=Math.hypot(vx,vy); if(sp>MAX_V){vx=vx/sp*MAX_V; vy=vy/sp*MAX_V}
    px+=vx; py+=vy
    traj.push(Math.hypot(px,py))
  }
  return traj
}
const score=(r,off,exempt)=>{
  const tr=trial(r,off,exempt)
  const hitR=Math.max(r,MIN_HIT_R)+3
  return { n:tr.filter(d=>d<=hitR).length, end:tr[39], ok:tr.every(d=>d<=hitR) }
}

let fails=0, oldFails=0, cases=0
console.log('半径 偏移 命中半径 │ 修复前 命中帧/最终距离   结果 │ 修复后 命中帧/最终距离   结果')
for(const r of [10,20,35,50,70]){
  const hitR=Math.max(r,MIN_HIT_R)+3
  for(const off of [0, hitR*0.5, hitR*0.9]){
    const o=score(r,off,false), n=score(r,off,true)
    cases++
    if(!o.ok) oldFails++
    if(!n.ok) fails++
    const f=(v)=>String(v).padStart(6)
    console.log(
      `${String(r).padStart(4)} ${off.toFixed(0).padStart(5)} ${hitR.toFixed(0).padStart(8)} │` +
      ` ${f(o.n+'/40')}${f(o.end.toFixed(0)+'px')}   ${o.ok?'✓':'✗ 抓不住'} │` +
      ` ${f(n.n+'/40')}${f(n.end.toFixed(0)+'px')}   ${n.ok?'✓':'✗ 抓不住'}`)
  }
}
console.log(`\n共${cases} 个用例（均为鼠标确实落在气泡上的合法状态）`)
console.log(`修复前失败 ${oldFails}/${cases}，修复后失败 ${fails}/${cases}`)
console.log(fails===0 ? '\n✓ 修复有效：气泡不再躲避鼠标，全部可点中' : '\n✗ 仍有问题')
process.exit(fails===0?0:1)
