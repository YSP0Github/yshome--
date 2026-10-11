# Review R3 — S4 震源物理 / S5 面波与自由振荡 / S6 衰减与 Q

审查范围：S4、S5、S6 三个一级学科下全部已有公式卡片（共 59 张）。
审查日期：2026-10-11。
方法：逐条对照 Aki & Richards、Shearer、Stein & Wysession、Brune (1970)、Kanamori & Anderson (1975)、Hanks & Kanamori (1979)、Dahlen & Tromp 等权威教材，核对 statement 系数/符号/量纲、derivation 每步、conditions、symbols 单位、viz.compute 一致性、双语术语。

---

## 变更清单

| id | 改了什么 | 依据/出处 |
|---|---|---|
| brune-source-spectrum | 推导 step 2–5：原用指数衰减矩率函数推导 ω² 谱，但该函数 Fourier 变换给出 ω⁻¹ 衰减（|Ω| = Ω₀/√(1+(f/f_c)²)），而非 ω⁻²。step 5 注释谎称"两者同阶"。改为从两条渐近极限（低频平台 Ω₀、高频 f⁻²）构造最简有理函数 Ω₀/(1+(f/f_c)²)，与 omega-square-model 卡片一致。 | Brune (1970) JGR; Shearer §9.4; ω² 是经验模型，非简单指数源函数严格推出 |
| apparent-stress | 主公式 η_sw = σ_a/Δσ = 2μE_s/(ΔσM₀)：等式链因子错。σ_a/Δσ = (μE_s/M₀)/Δσ = μE_s/(ΔσM₀)，右侧不应有 2。改为 μE_s/(ΔσM₀)。推导 step 4 同步修正。 | Wyss & Brune (1968); σ_a = μE_s/M₀ 定义直接代入 |
| fracture-energy | 主公式 E_G = ½(σ₀−σ_f)ūA = (σ₀−σ_f)M₀/(2μ)：用总滑移 ū 而非弱化距离 D_c。该式实为总应变能释放 ΔW，非断裂能。改为 E_G = G_c A = ½(σ₀−σ_f)D_c A。推导 step 4–5 及 example 同步修正，新增注记 E_G ≪ ΔW（因 D_c ≪ ū）。 | Kanamori & Rivera (2006); 滑动弱化模型 G_c = ½(σ₀−σ_f)D_c |
| haskell-source-model | 变体"cos θ = v_r/α ⟹ X = 0, C_d = 1"数学错误：X = (ωL/2v_r)(1−(v_r/α)cos θ)，X = 0 要求 cos θ = α/v_r > 1（亚剪切破裂不可能）。改为"θ=0 时 X 最小、C_d 最大"。 | Haskell (1964); 直接代入 X 定义 |
| far-field-body-wave-pulse | 推导 step 2 展开式中远场项写为 M̈/(v²r)，但远场位移应正比于 Ṁ/(v³r)。step 4"对时间积分一次"逻辑不通。修正 step 2–4：远场项为 Ṁ/(v³r)，加入 4πρ 与辐射花样。 | Aki & Richards §4.29; 表示定理 u_i = M_jk * ∂G_ij/∂x_k，空间导数带出时间导数，远场 ∝ Ṁ |
| radiated-seismic-energy | 主公式多了因子 1/2：E_s = ½ρc∫∫u̇²dSdt。推导 step 2 为 E_s = ∫∫ρc u̇² dt dS（无 1/2）。能量流 I = ρc v²，全时间积分不应有 1/2。删除 1/2。 | Aki & Richards §5.5; 能流密度 = ρcv² |
| rayleigh-wave-equation | viz compute 中 r = (1−2ν)/(2(1−ν)) = β²/α²，但 alpha = beta/r 得 α/β = 1/r = (α/β)²（平方错误）。改为 alpha = beta/√r。 | α²/β² = (1−ν)/(½−ν)，故 α/β = √((1−ν)/(½−ν)) = 1/√r |
| rayleigh-velocity-approximation | 同上 viz bug：alpha = 1/r 改为 alpha = 1/√r。 | 同上 |
| phase-group-velocity | 变体"U = c + T dc/dT"错误。正确为 U = c²/(c + T dc/dT)。viz compute 与 note 同步修正（正频散 dc/dT>0 时 U<c，原 note 写反）。删除不正确的积分反演变体。 | U = dω/dk = c + k dc/dk；用 k = 2π/(Tc) 换算得 U = c²/(c+T dc/dT) |
| absorption-band-q | 主公式乱码：Q⁻¹(ω) = Q_m⁻¹·(2/π)arctan((ωτ_m/Q_m)·1/(1+ω²τ_m²)·(标准线性固体))——"标准线性固体"作为因子写入公式无意义，且与推导 step 3 结果不符。替换为推导 step 3 的正确 SLS 结果：Q⁻¹(ω) = ω(τ_σ−τ_ε)/(1+ω²τ_στ_ε)。 | 推导 step 1–3 直接给出；Liu, Anderson & Kanamori (1976) |
| spectral-ratio-q | 推导 step 1 写 A_i = S·G_i⁻¹·R_i·e^{−πft_i*}，与主公式 ln(G₁/G₂) 矛盾。改为 A_i = S·G_i·R_i·e^{−πft_i*}，step 2–3 同步修正。 | 主公式 ln(A₁/A₂) = ln(G₁/G₂)−πf(t₁*−t₂*) 直接要求 G_i 而非 G_i⁻¹ |
| source-spectral-scaling | 推导 step 4 写 f_c ≈ 0.32 β/a，与 step 5（0.49 β(Δσ/M₀)^{1/3} ≈ 0.37 β/a）不一致。改为 0.37 β/a。 | Brune 系数 0.37 β/a 经 (16/7)^{1/3} = 1.31 得 0.49 β(Δσ/M₀)^{1/3}，自洽 |

---

## 存疑项

| id | 疑点 | 原因 |
|---|---|---|
| corner-frequency-source-dimension | 变体"Madariaga 圆盘裂纹模型：f_c ≈ 0.49 β/a" | 0.49 实际是 f_c = 0.49 β(Δσ/M₀)^{1/3} 的系数，非 f_c = 0.49 β/a。Madariaga (1976) 给出的 f_c–β/a 系数文献值在 0.21–0.32 之间（P/S 波不同），未能确认此处 0.49 β/a 是否笔误。主公式 f_c = 0.37 β/a（Brune）正确。 |
| seismic-moment | upstream link id "ps-wave-velocities" 可能不存在 | 卡片注册表中实际 id 可能为 "p-wave-velocity-formula" 和 "s-wave-velocity-formula"。按任务纪律不改 links，仅记录。 |
| spectral-ratio-q | 变体 Q = Δt/(Δt*·v) 中 Δt 记号歧义 | 若 Δt 指路径长度 Δs，则 Q = Δs/(v·Δt*) 正确；若指走时，则应为 Q = Δt/Δt*（无 v）。公式在 Δt=距离 时量纲自洽，但记号易误读。未改。 |

---

## 统计

- 审查卡片总数：59（S4: 33, S5: 15, S6: 11 [含 geometrical-spreading 归 S6.1]）
- 修改卡片数：12
- 存疑项数：3
- 验证：全部修改文件通过 `node scripts/verify-cards.mjs` 校验
