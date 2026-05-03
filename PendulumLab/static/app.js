(() => {
  "use strict";

  const canvas = document.getElementById("pendulumCanvas");
  const ctx = canvas.getContext("2d");
  const countSelect = document.getElementById("pendulumCount");
  const toggleRun = document.getElementById("toggleRun");
  const resetBtn = document.getElementById("reset");
  const randomBtn = document.getElementById("randomize");
  const clearTrailBtn = document.getElementById("clearTrail");
  const speedInput = document.getElementById("speed");
  const gravityInput = document.getElementById("gravity");
  const dampingInput = document.getElementById("damping");
  const trailInput = document.getElementById("trailLength");
  const labels = {
    speed: document.getElementById("speedValue"),
    gravity: document.getElementById("gravityValue"),
    damping: document.getElementById("dampingValue"),
    trail: document.getElementById("trailValue"),
    mode: document.getElementById("modeLabel"),
    energy: document.getElementById("energyLabel"),
    time: document.getElementById("timeLabel"),
    fps: document.getElementById("fpsLabel"),
  };

  const params = new URLSearchParams(window.location.search);
  const EMBED_MODE = ["1", "true", "yes"].includes((params.get("embed") || "").toLowerCase());
  const colorSet = ["#5eead4", "#60a5fa", "#f472b6", "#fbbf24"];
  let n = 2;
  let theta = [];
  let omega = [];
  let lengths = [];
  let masses = [];
  let trail = [];
  let running = true;
  let simTime = 0;
  let lastFrame = performance.now();
  let fpsClock = performance.now();
  let frames = 0;
  let dragIndex = -1;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, EMBED_MODE ? 1.1 : 1.5);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function modeName(count) {
    if (count === 2) return "双摆";
    if (count === 3) return "三摆";
    return "四摆";
  }

  function resetState(count = Number(countSelect.value), random = false) {
    n = count;
    countSelect.value = String(n);
    const base = Math.min(canvas.clientWidth, canvas.clientHeight) / (n + 2.2);
    lengths = Array.from({ length: n }, (_, i) => base * (1.0 - i * 0.06));
    masses = Array.from({ length: n }, (_, i) => 1.0 - i * 0.08);
    theta = Array.from({ length: n }, (_, i) => random ? (Math.random() * 2 - 1) * Math.PI * 0.92 : Math.PI * (0.52 + i * 0.06));
    omega = Array(n).fill(0);
    trail = [];
    simTime = 0;
    labels.mode.textContent = modeName(n);
  }

  function tailMasses(m) {
    const tails = Array(m.length).fill(0);
    let sum = 0;
    for (let i = m.length - 1; i >= 0; i -= 1) {
      sum += m[i];
      tails[i] = sum;
    }
    return tails;
  }

  function matrix(thetaVals) {
    const tails = tailMasses(masses);
    const mat = Array.from({ length: n }, () => Array(n).fill(0));
    for (let a = 0; a < n; a += 1) {
      for (let b = 0; b < n; b += 1) {
        mat[a][b] = tails[Math.max(a, b)] * lengths[a] * lengths[b] * Math.cos(thetaVals[a] - thetaVals[b]);
      }
    }
    return mat;
  }

  function dMatrix(a, b, d, thetaVals) {
    if (a === b || (d !== a && d !== b)) return 0;
    const tails = tailMasses(masses);
    const base = tails[Math.max(a, b)] * lengths[a] * lengths[b];
    const s = Math.sin(thetaVals[a] - thetaVals[b]);
    return d === a ? -base * s : base * s;
  }

  function solveLinear(mat, vec) {
    const a = mat.map((row, i) => [...row, vec[i]]);
    for (let col = 0; col < n; col += 1) {
      let pivot = col;
      for (let r = col + 1; r < n; r += 1) {
        if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
      }
      [a[col], a[pivot]] = [a[pivot], a[col]];
      const div = Math.abs(a[col][col]) < 1e-9 ? 1e-9 : a[col][col];
      for (let c = col; c <= n; c += 1) a[col][c] /= div;
      for (let r = 0; r < n; r += 1) {
        if (r === col) continue;
        const factor = a[r][col];
        for (let c = col; c <= n; c += 1) a[r][c] -= factor * a[col][c];
      }
    }
    return a.map((row) => row[n]);
  }

  function acceleration(thetaVals, omegaVals) {
    const g = Number(gravityInput.value);
    const damping = Number(dampingInput.value);
    const mat = matrix(thetaVals);
    const rhs = Array(n).fill(0);
    const tails = tailMasses(masses);

    for (let j = 0; j < n; j += 1) {
      let dT = 0;
      for (let a = 0; a < n; a += 1) {
        for (let b = 0; b < n; b += 1) {
          dT += 0.5 * dMatrix(a, b, j, thetaVals) * omegaVals[a] * omegaVals[b];
        }
      }
      let ddtPart = 0;
      for (let k = 0; k < n; k += 1) {
        for (let d = 0; d < n; d += 1) {
          ddtPart += dMatrix(j, k, d, thetaVals) * omegaVals[d] * omegaVals[k];
        }
      }
      const dV = tails[j] * g * lengths[j] * Math.sin(thetaVals[j]);
      rhs[j] = dT - ddtPart - dV - damping * omegaVals[j] * tails[j] * lengths[j] * lengths[j];
    }
    return solveLinear(mat, rhs);
  }

  function deriv(state) {
    const th = state.slice(0, n);
    const om = state.slice(n);
    return [...om, ...acceleration(th, om)];
  }

  function rk4(dt) {
    const y = [...theta, ...omega];
    const k1 = deriv(y);
    const k2 = deriv(y.map((v, i) => v + k1[i] * dt * 0.5));
    const k3 = deriv(y.map((v, i) => v + k2[i] * dt * 0.5));
    const k4 = deriv(y.map((v, i) => v + k3[i] * dt));
    const next = y.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    theta = next.slice(0, n);
    omega = next.slice(n);
    simTime += dt;
  }

  function positions(thetaVals = theta) {
    const cx = canvas.clientWidth / 2;
    const cy = Math.min(canvas.clientHeight * 0.24, 190);
    const pts = [{ x: cx, y: cy }];
    let x = cx;
    let y = cy;
    for (let i = 0; i < n; i += 1) {
      x += lengths[i] * Math.sin(thetaVals[i]);
      y += lengths[i] * Math.cos(thetaVals[i]);
      pts.push({ x, y });
    }
    return pts;
  }

  function energy() {
    const mat = matrix(theta);
    let kinetic = 0;
    for (let a = 0; a < n; a += 1) {
      for (let b = 0; b < n; b += 1) kinetic += 0.5 * mat[a][b] * omega[a] * omega[b];
    }
    const g = Number(gravityInput.value);
    let potential = 0;
    const tails = tailMasses(masses);
    for (let j = 0; j < n; j += 1) potential += -tails[j] * g * lengths[j] * Math.cos(theta[j]);
    return kinetic + potential;
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const grd = ctx.createRadialGradient(w * 0.55, h * 0.3, 10, w * 0.55, h * 0.3, Math.max(w, h));
    grd.addColorStop(0, "rgba(94, 234, 212, 0.08)");
    grd.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    const pts = positions();
    trail.push({ x: pts[pts.length - 1].x, y: pts[pts.length - 1].y });
    const maxTrail = Number(trailInput.value);
    while (trail.length > maxTrail) trail.shift();

    if (trail.length > 2) {
      const stride = Math.max(1, Math.floor(trail.length / (EMBED_MODE ? 180 : 320)));
      for (let i = Math.max(1, stride); i < trail.length; i += stride) {
        const alpha = i / trail.length;
        ctx.strokeStyle = `rgba(94, 234, 212, ${alpha * 0.55})`;
        ctx.lineWidth = 1 + alpha * 2;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }
    }

    for (let i = 0; i < n; i += 1) {
      ctx.strokeStyle = "rgba(226, 232, 240, 0.78)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(226, 232, 240, 0.95)";
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, 7, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 1; i <= n; i += 1) {
      const r = 13 + masses[i - 1] * 4;
      ctx.fillStyle = colorSet[i - 1];
      ctx.shadowColor = colorSet[i - 1];
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    labels.energy.textContent = energy().toFixed(0);
    labels.time.textContent = `${simTime.toFixed(1)}s`;
  }

  function step(now) {
    const elapsed = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    if (running && dragIndex < 0) {
      const speed = Number(speedInput.value);
      const dt = EMBED_MODE ? 1 / 180 : 1 / 240;
      let remaining = elapsed * speed;
      while (remaining > 0) {
        const h = Math.min(dt, remaining);
        rk4(h);
        remaining -= h;
      }
    }
    draw();
    frames += 1;
    if (now - fpsClock > 500) {
      labels.fps.textContent = Math.round((frames * 1000) / (now - fpsClock));
      frames = 0;
      fpsClock = now;
    }
    requestAnimationFrame(step);
  }

  function updateOutputs() {
    labels.speed.textContent = `${Number(speedInput.value).toFixed(1)}x`;
    labels.gravity.textContent = Number(gravityInput.value).toFixed(1);
    labels.damping.textContent = Number(dampingInput.value).toFixed(3);
    labels.trail.textContent = trailInput.value;
  }

  function pointerPos(evt) {
    const rect = canvas.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  }

  canvas.addEventListener("pointerdown", (evt) => {
    const p = pointerPos(evt);
    const pts = positions();
    dragIndex = -1;
    for (let i = n; i >= 1; i -= 1) {
      if (Math.hypot(p.x - pts[i].x, p.y - pts[i].y) < 26) {
        dragIndex = i - 1;
        canvas.setPointerCapture(evt.pointerId);
        break;
      }
    }
  });

  canvas.addEventListener("pointermove", (evt) => {
    if (dragIndex < 0) return;
    const p = pointerPos(evt);
    const pts = positions();
    const anchor = pts[dragIndex];
    theta[dragIndex] = Math.atan2(p.x - anchor.x, p.y - anchor.y);
    for (let i = dragIndex; i < n; i += 1) omega[i] = 0;
    trail = [];
  });

  canvas.addEventListener("pointerup", () => { dragIndex = -1; });
  canvas.addEventListener("pointercancel", () => { dragIndex = -1; });
  countSelect.addEventListener("change", () => resetState(Number(countSelect.value)));
  document.querySelectorAll(".preset").forEach((btn) => btn.addEventListener("click", () => resetState(Number(btn.dataset.count))));
  toggleRun.addEventListener("click", () => {
    running = !running;
    toggleRun.textContent = running ? "暂停" : "继续";
  });
  resetBtn.addEventListener("click", () => resetState(n));
  randomBtn.addEventListener("click", () => resetState(n, true));
  clearTrailBtn.addEventListener("click", () => { trail = []; });
  [speedInput, gravityInput, dampingInput, trailInput].forEach((input) => input.addEventListener("input", updateOutputs));
  window.addEventListener("resize", () => { resize(); resetState(n); });

  if (EMBED_MODE) {
    trailInput.value = "420";
    speedInput.value = "0.9";
  }

  resize();
  resetState(2);
  updateOutputs();
  requestAnimationFrame((t) => { lastFrame = t; requestAnimationFrame(step); });
})();
