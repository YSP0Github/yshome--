(() => {
  "use strict";

  const oscCanvas = document.getElementById("oscillatorCanvas");
  const histCanvas = document.getElementById("historyCanvas");
  const specCanvas = document.getElementById("spectrumCanvas");
  const octx = oscCanvas.getContext("2d");
  const hctx = histCanvas.getContext("2d");
  const sctx = specCanvas.getContext("2d");

  const driveFreqInput = document.getElementById("driveFreq");
  const naturalFreqInput = document.getElementById("naturalFreq");
  const dampingInput = document.getElementById("damping");
  const forceInput = document.getElementById("force");
  const toggleRun = document.getElementById("toggleRun");
  const resetBtn = document.getElementById("reset");
  const kickBtn = document.getElementById("kick");
  const scanBtn = document.getElementById("scan");
  const statusPill = document.getElementById("statusPill");

  const outputs = {
    driveFreq: document.getElementById("driveFreqValue"),
    naturalFreq: document.getElementById("naturalFreqValue"),
    damping: document.getElementById("dampingValue"),
    force: document.getElementById("forceValue"),
    amp: document.getElementById("ampLabel"),
    phase: document.getElementById("phaseLabel"),
    energy: document.getElementById("energyLabel"),
    state: document.getElementById("stateLabel"),
  };

  let running = true;
  let scanMode = false;
  let time = 0;
  let x = 0.9;
  let v = 0;
  let lastFrame = performance.now();
  const history = [];

  function fitCanvas(canvas, ctx) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: rect.width, h: rect.height };
  }

  function params() {
    return {
      wd: Number(driveFreqInput.value) * Math.PI * 2,
      wn: Number(naturalFreqInput.value) * Math.PI * 2,
      zeta: Number(dampingInput.value),
      force: Number(forceInput.value),
    };
  }

  function updateOutputs() {
    outputs.driveFreq.textContent = Number(driveFreqInput.value).toFixed(2);
    outputs.naturalFreq.textContent = Number(naturalFreqInput.value).toFixed(2);
    outputs.damping.textContent = Number(dampingInput.value).toFixed(2);
    outputs.force.textContent = Number(forceInput.value).toFixed(2);
  }

  function deriv(state, p, t) {
    const [x0, v0] = state;
    const a = p.force * Math.sin(p.wd * t) - 2 * p.zeta * p.wn * v0 - p.wn * p.wn * x0;
    return [v0, a];
  }

  function rk4(dt) {
    const p = params();
    const y = [x, v];
    const k1 = deriv(y, p, time);
    const k2 = deriv(y.map((val, i) => val + 0.5 * dt * k1[i]), p, time + dt * 0.5);
    const k3 = deriv(y.map((val, i) => val + 0.5 * dt * k2[i]), p, time + dt * 0.5);
    const k4 = deriv(y.map((val, i) => val + dt * k3[i]), p, time + dt);
    x += (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    v += (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    time += dt;
  }

  function phaseLag() {
    const p = params();
    const num = 2 * p.zeta * p.wn * p.wd;
    const den = p.wn * p.wn - p.wd * p.wd;
    return Math.atan2(num, den) * 180 / Math.PI;
  }

  function classifyState() {
    const ratio = Number(driveFreqInput.value) / Math.max(0.001, Number(naturalFreqInput.value));
    const damp = Number(dampingInput.value);
    if (Math.abs(ratio - 1) < 0.08 && damp < 0.18) return "强共振";
    if (Math.abs(ratio - 1) < 0.16) return "接近共振";
    if (ratio < 1) return "低频受迫";
    return "高频受迫";
  }

  function pushHistory() {
    history.push({ t: time, x, drive: Math.sin(params().wd * time) });
    while (history.length > 720) history.shift();
  }

  function drawOscillator() {
    const { w, h } = fitCanvas(oscCanvas, octx);
    octx.clearRect(0, 0, w, h);

    const wallX = 72;
    const centerY = h * 0.53;
    const trackLeft = 120;
    const trackRight = w * 0.78;
    const trackWidth = trackRight - trackLeft;
    const massX = trackLeft + trackWidth * 0.5 + x * trackWidth * 0.18;
    const blockW = 92;
    const blockH = 62;

    octx.strokeStyle = "rgba(148,163,184,.45)";
    octx.lineWidth = 5;
    octx.beginPath();
    octx.moveTo(trackLeft - 24, centerY + blockH * 0.62);
    octx.lineTo(trackRight + 40, centerY + blockH * 0.62);
    octx.stroke();

    octx.fillStyle = "rgba(96,165,250,.16)";
    octx.fillRect(30, centerY - 120, 30, 240);

    octx.strokeStyle = "#93c5fd";
    octx.lineWidth = 4;
    octx.beginPath();
    const coils = 14;
    const springStart = wallX;
    const springEnd = massX - blockW * 0.5;
    octx.moveTo(springStart, centerY);
    const dx = (springEnd - springStart) / coils;
    for (let i = 1; i < coils; i += 1) {
      const px = springStart + dx * i;
      const py = centerY + (i % 2 === 0 ? -26 : 26);
      octx.lineTo(px, py);
    }
    octx.lineTo(springEnd, centerY);
    octx.stroke();

    octx.fillStyle = "#34d399";
    octx.fillRect(massX - blockW / 2, centerY - blockH / 2, blockW, blockH);
    octx.fillStyle = "rgba(255,255,255,.85)";
    octx.font = "600 16px Segoe UI";
    octx.fillText("m", massX - 6, centerY + 6);

    const driveX = w * 0.88;
    const driveY = centerY;
    const driveAmp = 54 * Number(forceInput.value) / 2;
    const driver = Math.sin(params().wd * time);
    octx.strokeStyle = "rgba(251,191,36,.82)";
    octx.beginPath();
    octx.arc(driveX, driveY, 34, 0, Math.PI * 2);
    octx.stroke();
    octx.fillStyle = "rgba(251,191,36,.25)";
    octx.beginPath();
    octx.arc(driveX + driver * driveAmp, driveY, 10, 0, Math.PI * 2);
    octx.fill();
    octx.fillStyle = "rgba(229,241,255,.78)";
    octx.fillText("F(t)", driveX - 20, driveY - 52);

    outputs.amp.textContent = Math.max(...history.map((p) => Math.abs(p.x)), Math.abs(x)).toFixed(2);
    outputs.phase.textContent = `${phaseLag().toFixed(0)}°`;
    outputs.energy.textContent = (0.5 * v * v + 0.5 * params().wn * params().wn * x * x).toFixed(2);
    outputs.state.textContent = classifyState();
  }

  function drawHistory() {
    const { w, h } = fitCanvas(histCanvas, hctx);
    hctx.clearRect(0, 0, w, h);
    hctx.strokeStyle = "rgba(148,163,184,.16)";
    for (let i = 0; i <= 5; i += 1) {
      const y = (i / 5) * h;
      hctx.beginPath();
      hctx.moveTo(0, y);
      hctx.lineTo(w, y);
      hctx.stroke();
    }
    if (history.length < 2) return;
    const maxAbs = Math.max(1.2, ...history.map((p) => Math.abs(p.x)));
    hctx.strokeStyle = "#60a5fa";
    hctx.lineWidth = 2;
    hctx.beginPath();
    history.forEach((p, i) => {
      const px = (i / Math.max(1, history.length - 1)) * w;
      const py = h * 0.5 - (p.x / maxAbs) * h * 0.36;
      if (i === 0) hctx.moveTo(px, py); else hctx.lineTo(px, py);
    });
    hctx.stroke();
  }

  function drawSpectrum() {
    const { w, h } = fitCanvas(specCanvas, sctx);
    sctx.clearRect(0, 0, w, h);
    const nat = Number(naturalFreqInput.value);
    const damp = Number(dampingInput.value);
    const current = Number(driveFreqInput.value);

    sctx.strokeStyle = "rgba(148,163,184,.16)";
    for (let i = 0; i <= 4; i += 1) {
      const y = (i / 4) * h;
      sctx.beginPath(); sctx.moveTo(0, y); sctx.lineTo(w, y); sctx.stroke();
    }

    sctx.strokeStyle = "#34d399";
    sctx.lineWidth = 2;
    sctx.beginPath();
    for (let i = 0; i < w; i += 1) {
      const f = 0.2 + (i / w) * 2.8;
      const r = f / nat;
      const mag = 1 / Math.sqrt((1 - r * r) ** 2 + (2 * damp * r) ** 2);
      const y = h - Math.min(h * 0.85, mag * 26);
      if (i === 0) sctx.moveTo(i, y); else sctx.lineTo(i, y);
    }
    sctx.stroke();

    const xMarker = ((current - 0.2) / 2.8) * w;
    sctx.strokeStyle = "#fbbf24";
    sctx.setLineDash([6, 6]);
    sctx.beginPath(); sctx.moveTo(xMarker, 0); sctx.lineTo(xMarker, h); sctx.stroke();
    sctx.setLineDash([]);
    sctx.fillStyle = "rgba(229,241,255,.78)";
    sctx.font = "12px Consolas";
    sctx.fillText(`f=${current.toFixed(2)}`, Math.min(w - 56, xMarker + 6), 18);
  }

  function resetState() {
    time = 0;
    x = 0.9;
    v = 0;
    history.length = 0;
    scanMode = false;
  }

  function tick(now) {
    const elapsed = Math.min(0.04, (now - lastFrame) / 1000);
    lastFrame = now;
    if (running) {
      if (scanMode) {
        const next = 0.2 + ((Math.sin(time * 0.18) + 1) * 0.5) * 2.8;
        driveFreqInput.value = next.toFixed(2);
        updateOutputs();
      }
      let remaining = elapsed;
      const dt = 1 / 180;
      while (remaining > 0) {
        const h = Math.min(dt, remaining);
        rk4(h);
        remaining -= h;
      }
      pushHistory();
    }
    drawOscillator();
    drawHistory();
    drawSpectrum();
    requestAnimationFrame(tick);
  }

  toggleRun.addEventListener("click", () => {
    running = !running;
    toggleRun.textContent = running ? "暂停" : "继续";
    statusPill.textContent = running ? (scanMode ? "扫频中" : "运行中") : "已暂停";
  });
  resetBtn.addEventListener("click", () => {
    resetState();
    statusPill.textContent = running ? "运行中" : "已暂停";
  });
  kickBtn.addEventListener("click", () => { v += 1.2; });
  scanBtn.addEventListener("click", () => {
    scanMode = !scanMode;
    statusPill.textContent = scanMode ? "扫频中" : (running ? "运行中" : "已暂停");
  });
  [driveFreqInput, naturalFreqInput, dampingInput, forceInput].forEach((el) => el.addEventListener("input", updateOutputs));
  window.addEventListener("resize", () => { drawOscillator(); drawHistory(); drawSpectrum(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) lastFrame = performance.now(); });

  updateOutputs();
  drawOscillator();
  drawHistory();
  drawSpectrum();
  requestAnimationFrame((t) => { lastFrame = t; requestAnimationFrame(tick); });
})();
