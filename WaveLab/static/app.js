(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const waveCanvas = $("waveCanvas");
  const gatherCanvas = $("gatherCanvas");
  const profileCanvas = $("profileCanvas");
  const dispersionCanvas = $("dispersionCanvas");
  const wctx = waveCanvas.getContext("2d", { alpha: false });
  const gctx = gatherCanvas.getContext("2d", { alpha: false });
  const pctx = profileCanvas.getContext("2d");
  const dctx = dispersionCanvas.getContext("2d");

  const controls = {
    preset: $("preset"),
    layerDepth: $("layerDepth"),
    vs1: $("vs1"),
    vs2: $("vs2"),
    slope: $("slope"),
    frequency: $("frequency"),
    sourceX: $("sourceX"),
    receiverCount: $("receiverCount"),
    receiverSpacing: $("receiverSpacing"),
  };

  const outputs = {
    layerDepth: $("layerDepthValue"),
    vs1: $("vs1Value"),
    vs2: $("vs2Value"),
    slope: $("slopeValue"),
    frequency: $("frequencyValue"),
    sourceX: $("sourceXValue"),
    receiverCount: $("receiverCountValue"),
    receiverSpacing: $("receiverSpacingValue"),
    run: $("runLabel"),
    boundary: $("boundaryLabel"),
    rayleigh: $("rayleighLabel"),
    wavelength: $("wavelengthLabel"),
    time: $("timeLabel"),
    peak: $("peakLabel"),
    modelTag: $("modelTag"),
    sourceTag: $("sourceTag"),
  };

  const buttons = {
    toggleRun: $("toggleRun"),
    reset: $("reset"),
    fire: $("fire"),
    clearGather: $("clearGather"),
    toggleBoundary: $("toggleBoundary"),
  };

  const cols = 220;
  const rows = 124;
  const dx = 1;
  const dz = 1;
  const dt = 1 / 180;
  const maxGatherSamples = 320;

  let curr = new Float32Array(cols * rows);
  let prev = new Float32Array(cols * rows);
  let next = new Float32Array(cols * rows);
  let velocity = new Float32Array(cols * rows);
  let interfaceDepth = new Float32Array(cols);
  let gather = new Float32Array(maxGatherSamples * 36);
  let gatherSamples = 0;
  let imageData = null;
  let gatherImage = null;
  let running = true;
  let absorbing = true;
  let simTime = 0;
  let lastFrame = performance.now();
  let shotClock = 0;
  let shotActive = true;

  const presetMeta = {
    lowVelocityCap: { label: "低速覆盖层", layerDepth: 8, vs1: 180, vs2: 420, slope: 0 },
    twoLayer: { label: "双层地基", layerDepth: 12, vs1: 260, vs2: 520, slope: 0 },
    homogeneous: { label: "均匀半空间", layerDepth: 18, vs1: 320, vs2: 320, slope: 0 },
    dipping: { label: "缓倾界面", layerDepth: 10, vs1: 220, vs2: 520, slope: 4 },
  };

  function idx(x, y) { return y * cols + x; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothstep(a, b, x) {
    const t = clamp((x - a) / (b - a || 1), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function fitCanvas(canvas, ctx, dprCap = 1.2) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: rect.width, h: rect.height };
  }

  function applyPreset(name) {
    const p = presetMeta[name];
    if (!p) return;
    controls.preset.value = name;
    controls.layerDepth.value = p.layerDepth;
    controls.vs1.value = p.vs1;
    controls.vs2.value = p.vs2;
    controls.slope.value = p.slope;
    resetSimulation(true);
  }

  function interfaceForColumn(x) {
    const base = Number(controls.layerDepth.value);
    const slopeDeg = Number(controls.slope.value);
    const center = cols * 0.5;
    const delta = Math.tan((slopeDeg * Math.PI) / 180) * ((x - center) * dx) * 0.35;
    return clamp(base + delta, 3, rows - 10);
  }

  function simVelocity(vs) {
    return clamp((vs / 1000) * 0.72, 0.12, 0.72);
  }

  function buildVelocityModel() {
    const vs1 = Number(controls.vs1.value);
    const vs2 = Number(controls.vs2.value);
    for (let x = 0; x < cols; x += 1) {
      interfaceDepth[x] = interfaceForColumn(x);
      for (let y = 0; y < rows; y += 1) {
        const blend = smoothstep(interfaceDepth[x] - 2, interfaceDepth[x] + 2, y);
        const vs = lerp(vs1, vs2, blend);
        const surfaceBias = 0.84 + 0.16 * (1 - Math.exp(-y / 10));
        velocity[idx(x, y)] = simVelocity(vs) * surfaceBias;
      }
    }
  }

  function receiverXs() {
    const count = Number(controls.receiverCount.value);
    const spacing = Number(controls.receiverSpacing.value);
    const start = clamp(Number(controls.sourceX.value) + 5, 6, cols - 8);
    return Array.from({ length: count }, (_, i) => clamp(Math.round(start + i * spacing), 4, cols - 5));
  }

  function sourceCell() {
    return { x: clamp(Math.round(Number(controls.sourceX.value)), 5, cols - 6), y: 4 };
  }

  function estimatedRayleighVelocity(freq = Number(controls.frequency.value)) {
    const vs1 = Number(controls.vs1.value);
    const vs2 = Number(controls.vs2.value);
    const h = Number(controls.layerDepth.value);
    const trial = Math.max(6, freq);
    const depthSense = Math.max(1.5, (0.92 * vs1) / trial * 0.72);
    const weightDeep = 1 - Math.exp(-depthSense / Math.max(1, h));
    return 0.92 * (vs1 * (1 - weightDeep) + vs2 * weightDeep * 0.95);
  }

  function dominantWavelength() {
    const cr = estimatedRayleighVelocity();
    const f = Number(controls.frequency.value);
    return cr / Math.max(1, f);
  }

  function updateReadouts() {
    outputs.layerDepth.textContent = `${Number(controls.layerDepth.value).toFixed(0)} m`;
    outputs.vs1.textContent = `${Number(controls.vs1.value).toFixed(0)} m/s`;
    outputs.vs2.textContent = `${Number(controls.vs2.value).toFixed(0)} m/s`;
    outputs.slope.textContent = `${Number(controls.slope.value).toFixed(1)}°`;
    outputs.frequency.textContent = `${Number(controls.frequency.value).toFixed(0)} Hz`;
    outputs.sourceX.textContent = `${Number(controls.sourceX.value).toFixed(0)} m`;
    outputs.receiverCount.textContent = `${Number(controls.receiverCount.value)}`;
    outputs.receiverSpacing.textContent = `${Number(controls.receiverSpacing.value).toFixed(1)} m`;
    outputs.run.textContent = running ? "运行中" : "已暂停";
    outputs.boundary.textContent = absorbing ? "自由表面 + 吸收层" : "自由表面 + 侧底反射";
    outputs.rayleigh.textContent = `${estimatedRayleighVelocity().toFixed(0)} m/s`;
    outputs.wavelength.textContent = `${dominantWavelength().toFixed(1)} m`;
    outputs.time.textContent = `${simTime.toFixed(2)} s`;
    outputs.modelTag.textContent = presetMeta[controls.preset.value].label;
    outputs.sourceTag.textContent = `Ricker ${Number(controls.frequency.value).toFixed(0)} Hz`;
    buttons.toggleBoundary.textContent = absorbing ? "侧底边界：吸收" : "侧底边界：反射";
  }

  function resetWavefield() {
    curr.fill(0);
    prev.fill(0);
    next.fill(0);
    simTime = 0;
    shotClock = 0;
    shotActive = true;
  }

  function clearGather() {
    gather.fill(0);
    gatherSamples = 0;
  }

  function resetSimulation(rebuildModel = true) {
    if (rebuildModel) buildVelocityModel();
    resetWavefield();
    clearGather();
    updateReadouts();
    drawAll();
  }

  function ricker(t, f0) {
    const a = Math.PI * Math.PI * f0 * f0 * (t - 1.4 / f0) ** 2;
    return (1 - 2 * a) * Math.exp(-a);
  }

  function injectSurfaceWave(x, y, amp) {
    const offsets = [
      [0, 0, 1.1], [-1, 0, 0.84], [1, 0, 0.84],
      [0, 1, 0.62], [-1, 1, 0.48], [1, 1, 0.48],
      [0, 2, 0.22],
    ];
    offsets.forEach(([dxo, dyo, scale]) => {
      const xx = x + dxo;
      const yy = y + dyo;
      if (xx > 1 && xx < cols - 2 && yy > 1 && yy < rows - 2) curr[idx(xx, yy)] += amp * scale;
    });
  }

  function fireShot(strength = 1) {
    const s = sourceCell();
    injectSurfaceWave(s.x, s.y, 0.3 * strength);
    shotClock = 0;
    shotActive = true;
  }

  function applySource() {
    if (!shotActive) return;
    const f0 = Number(controls.frequency.value);
    const value = ricker(shotClock, f0) * 0.92;
    const s = sourceCell();
    injectSurfaceWave(s.x, s.y, value);
    injectSurfaceWave(Math.min(cols - 5, s.x + 1), s.y, value * 0.25);
    shotClock += dt;
    if (shotClock > Math.max(0.32, 2.8 / f0)) shotActive = false;
  }

  function stepModel() {
    const attenuationBase = 0.0018 + Number(controls.frequency.value) / 18000;
    for (let y = 1; y < rows - 1; y += 1) {
      for (let x = 1; x < cols - 1; x += 1) {
        const i = idx(x, y);
        const c = velocity[i];
        const lap = curr[idx(x - 1, y)] + curr[idx(x + 1, y)] + curr[idx(x, y - 1)] + curr[idx(x, y + 1)] - 4 * curr[i];
        const surfaceBoost = y < 9 ? 1.006 - y * 0.00045 : 1;
        next[i] = (2 * curr[i] - prev[i] + c * c * lap) * (1 - attenuationBase) * surfaceBoost;
      }
    }

    for (let x = 1; x < cols - 1; x += 1) {
      next[idx(x, 0)] = -next[idx(x, 1)] * 0.985;
      next[idx(x, 1)] = next[idx(x, 1)] * 0.998 + next[idx(x, 2)] * 0.006;
    }

    for (let x = 2; x < cols - 2; x += 1) {
      next[idx(x, 2)] = next[idx(x, 2)] * 0.98 + (next[idx(x - 1, 2)] + next[idx(x + 1, 2)]) * 0.01;
      next[idx(x, 3)] = next[idx(x, 3)] * 0.99 + (next[idx(x - 1, 3)] + next[idx(x + 1, 3)]) * 0.005;
    }

    if (absorbing) {
      const pad = 18;
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          let factor = 1;
          if (x < pad) factor *= 1 - ((pad - x) / pad) ** 2 * 0.09;
          if (x > cols - 1 - pad) factor *= 1 - ((x - (cols - 1 - pad)) / pad) ** 2 * 0.09;
          if (y > rows - 1 - pad) factor *= 1 - ((y - (rows - 1 - pad)) / pad) ** 2 * 0.11;
          next[idx(x, y)] *= factor;
        }
      }
    } else {
      for (let x = 0; x < cols; x += 1) next[idx(x, rows - 1)] = next[idx(x, rows - 2)] * 0.99;
      for (let y = 0; y < rows; y += 1) {
        next[idx(0, y)] = next[idx(1, y)] * 0.992;
        next[idx(cols - 1, y)] = next[idx(cols - 2, y)] * 0.992;
      }
    }

    applySource();
    [prev, curr, next] = [curr, next, prev];
    simTime += dt;
  }

  function recordGather() {
    const xs = receiverXs();
    const count = xs.length;
    if (gatherSamples < maxGatherSamples) {
      gatherSamples += 1;
    } else {
      gather.copyWithin(0, 36, maxGatherSamples * 36);
    }
    const rowIndex = gatherSamples - 1;
    const y = 3;
    for (let i = 0; i < 36; i += 1) gather[rowIndex * 36 + i] = 0;
    xs.forEach((x, i) => {
      const val = curr[idx(x, y)] * 1.25 + curr[idx(x, y + 1)] * 0.35;
      gather[rowIndex * 36 + i] = val;
    });
  }

  function colorFor(v, vel) {
    const amp = clamp(Math.abs(v) * 2.2, 0, 1);
    const tone = clamp(vel / 0.72, 0, 1);
    if (v >= 0) {
      return [28 + amp * 230, 90 + amp * 120 + tone * 16, 200 - amp * 92 + tone * 22];
    }
    return [10 + tone * 10, 54 + amp * 115, 135 + amp * 112 + tone * 20];
  }

  function drawWavefield() {
    const { w, h } = fitCanvas(waveCanvas, wctx, 1.0);
    if (!imageData || imageData.width !== cols || imageData.height !== rows) imageData = wctx.createImageData(cols, rows);
    let peak = 0;
    for (let i = 0; i < curr.length; i += 1) {
      const v = curr[i];
      peak = Math.max(peak, Math.abs(v));
      const off = i * 4;
      const [r, g, b] = colorFor(v, velocity[i]);
      imageData.data[off] = r;
      imageData.data[off + 1] = g;
      imageData.data[off + 2] = b;
      imageData.data[off + 3] = 255;
    }
    const temp = document.createElement("canvas");
    temp.width = cols;
    temp.height = rows;
    temp.getContext("2d").putImageData(imageData, 0, 0);
    wctx.clearRect(0, 0, w, h);
    wctx.imageSmoothingEnabled = false;
    wctx.drawImage(temp, 0, 0, w, h);

    wctx.strokeStyle = "rgba(255,255,255,.16)";
    wctx.lineWidth = 2;
    wctx.beginPath();
    for (let x = 0; x < cols; x += 1) {
      const px = (x / (cols - 1)) * w;
      const py = (interfaceDepth[x] / (rows - 1)) * h;
      if (x === 0) wctx.moveTo(px, py); else wctx.lineTo(px, py);
    }
    wctx.stroke();

    const source = sourceCell();
    wctx.fillStyle = "#fbbf24";
    wctx.beginPath();
    wctx.arc(((source.x + 0.5) / cols) * w, ((source.y + 0.5) / rows) * h, 6, 0, Math.PI * 2);
    wctx.fill();

    wctx.strokeStyle = "rgba(226,232,240,.82)";
    wctx.lineWidth = 1.5;
    const recY = ((3.5) / rows) * h;
    const xs = receiverXs();
    wctx.beginPath();
    wctx.moveTo((xs[0] / cols) * w, recY);
    wctx.lineTo((xs[xs.length - 1] / cols) * w, recY);
    wctx.stroke();
    xs.forEach((rx) => {
      wctx.beginPath();
      wctx.arc(((rx + 0.5) / cols) * w, recY, 2.5, 0, Math.PI * 2);
      wctx.fillStyle = "rgba(241,245,249,.95)";
      wctx.fill();
    });

    outputs.peak.textContent = peak.toFixed(3);
  }

  function drawGather() {
    const { w, h } = fitCanvas(gatherCanvas, gctx, 1.0);
    const count = Number(controls.receiverCount.value);
    if (!gatherImage || gatherImage.width !== 36 || gatherImage.height !== maxGatherSamples) {
      gatherImage = gctx.createImageData(36, maxGatherSamples);
    }
    for (let y = 0; y < maxGatherSamples; y += 1) {
      for (let x = 0; x < 36; x += 1) {
        const v = gather[y * 36 + x];
        const shade = clamp(128 + v * 600, 12, 244);
        const off = (y * 36 + x) * 4;
        gatherImage.data[off] = shade;
        gatherImage.data[off + 1] = shade;
        gatherImage.data[off + 2] = shade + 6;
        gatherImage.data[off + 3] = x < count ? 255 : 18;
      }
    }
    const temp = document.createElement("canvas");
    temp.width = 36;
    temp.height = maxGatherSamples;
    temp.getContext("2d").putImageData(gatherImage, 0, 0);
    gctx.clearRect(0, 0, w, h);
    gctx.imageSmoothingEnabled = false;
    gctx.drawImage(temp, 0, 0, w, h);

    gctx.strokeStyle = "rgba(148,163,184,.18)";
    for (let i = 0; i <= 4; i += 1) {
      const y = (i / 4) * h;
      gctx.beginPath();
      gctx.moveTo(0, y);
      gctx.lineTo(w, y);
      gctx.stroke();
    }
    for (let i = 0; i < count; i += 1) {
      const x = ((i + 0.5) / count) * w;
      gctx.fillStyle = "rgba(226,232,240,.75)";
      gctx.fillRect(x - 0.7, 0, 1.4, 8);
    }
  }

  function drawProfile() {
    const { w, h } = fitCanvas(profileCanvas, pctx, 1.0);
    pctx.clearRect(0, 0, w, h);
    pctx.strokeStyle = "rgba(148,163,184,.14)";
    for (let i = 0; i <= 4; i += 1) {
      const y = (i / 4) * h;
      pctx.beginPath();
      pctx.moveTo(0, y);
      pctx.lineTo(w, y);
      pctx.stroke();
    }
    const vs1 = Number(controls.vs1.value);
    const vs2 = Number(controls.vs2.value);
    const depth = Number(controls.layerDepth.value);
    const maxVs = Math.max(vs1, vs2) * 1.15;
    const x1 = (vs1 / maxVs) * w * 0.9 + w * 0.05;
    const x2 = (vs2 / maxVs) * w * 0.9 + w * 0.05;
    const yInt = (depth / rows) * h * 3.3;
    pctx.lineWidth = 3;
    pctx.strokeStyle = "#60a5fa";
    pctx.beginPath();
    pctx.moveTo(x1, 10);
    pctx.lineTo(x1, yInt);
    pctx.lineTo(x2, yInt);
    pctx.lineTo(x2, h - 10);
    pctx.stroke();
    pctx.fillStyle = "#cbd5e1";
    pctx.font = "12px Inter, sans-serif";
    pctx.fillText(`Vs1 ${vs1.toFixed(0)} m/s`, Math.min(w - 110, x1 + 8), 18);
    pctx.fillText(`Vs2 ${vs2.toFixed(0)} m/s`, Math.min(w - 110, x2 + 8), Math.min(h - 12, yInt + 18));
    pctx.fillText(`h ${depth.toFixed(0)} m`, 12, Math.min(h - 10, yInt - 6));
  }

  function drawDispersion() {
    const { w, h } = fitCanvas(dispersionCanvas, dctx, 1.0);
    dctx.clearRect(0, 0, w, h);
    dctx.strokeStyle = "rgba(148,163,184,.15)";
    for (let i = 0; i <= 4; i += 1) {
      const y = (i / 4) * h;
      dctx.beginPath();
      dctx.moveTo(0, y);
      dctx.lineTo(w, y);
      dctx.stroke();
    }
    const freqs = [];
    for (let f = 6; f <= 40; f += 1) freqs.push(f);
    const values = freqs.map((f) => estimatedRayleighVelocity(f));
    const minV = Math.min(...values) * 0.92;
    const maxV = Math.max(...values) * 1.06;
    dctx.strokeStyle = "#fbbf24";
    dctx.lineWidth = 3;
    dctx.beginPath();
    freqs.forEach((f, i) => {
      const x = ((f - freqs[0]) / (freqs[freqs.length - 1] - freqs[0])) * (w - 30) + 16;
      const y = h - ((values[i] - minV) / (maxV - minV || 1)) * (h - 24) - 12;
      if (i === 0) dctx.moveTo(x, y); else dctx.lineTo(x, y);
    });
    dctx.stroke();
    const activeF = Number(controls.frequency.value);
    const activeV = estimatedRayleighVelocity(activeF);
    const ax = ((activeF - freqs[0]) / (freqs[freqs.length - 1] - freqs[0])) * (w - 30) + 16;
    const ay = h - ((activeV - minV) / (maxV - minV || 1)) * (h - 24) - 12;
    dctx.fillStyle = "#fde68a";
    dctx.beginPath();
    dctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
    dctx.fill();
    dctx.fillStyle = "#cbd5e1";
    dctx.font = "12px Inter, sans-serif";
    dctx.fillText("频率 (Hz)", w - 62, h - 10);
    dctx.fillText("相速度", 12, 16);
  }

  function drawAll() {
    drawWavefield();
    drawGather();
    drawProfile();
    drawDispersion();
  }

  function tick(now) {
    const elapsed = Math.min(0.028, (now - lastFrame) / 1000);
    lastFrame = now;
    if (running) {
      let remain = elapsed;
      while (remain > 0) {
        stepModel();
        recordGather();
        remain -= dt;
      }
      updateReadouts();
    }
    drawAll();
    requestAnimationFrame(tick);
  }

  waveCanvas.addEventListener("pointerdown", (evt) => {
    const rect = waveCanvas.getBoundingClientRect();
    const x = clamp(Math.round(((evt.clientX - rect.left) / rect.width) * cols), 5, cols - 5);
    controls.sourceX.value = x;
    updateReadouts();
    fireShot(1.25);
  });

  controls.preset.addEventListener("change", () => applyPreset(controls.preset.value));
  document.querySelectorAll(".preset").forEach((btn) => btn.addEventListener("click", () => applyPreset(btn.dataset.preset)));
  [controls.layerDepth, controls.vs1, controls.vs2, controls.slope, controls.frequency, controls.sourceX, controls.receiverCount, controls.receiverSpacing].forEach((el) => {
    el.addEventListener("input", () => {
      buildVelocityModel();
      updateReadouts();
      drawAll();
    });
  });

  buttons.toggleRun.addEventListener("click", () => {
    running = !running;
    buttons.toggleRun.textContent = running ? "暂停" : "继续";
    updateReadouts();
  });
  buttons.reset.addEventListener("click", () => resetSimulation(true));
  buttons.fire.addEventListener("click", () => fireShot(1));
  buttons.clearGather.addEventListener("click", () => clearGather());
  buttons.toggleBoundary.addEventListener("click", () => { absorbing = !absorbing; updateReadouts(); drawAll(); });
  window.addEventListener("resize", drawAll);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) lastFrame = performance.now(); });

  applyPreset("lowVelocityCap");
  requestAnimationFrame((t) => { lastFrame = t; requestAnimationFrame(tick); });
})();
