import json
import pathlib
import re
from textwrap import dedent


ROOT = pathlib.Path(__file__).resolve().parent


def write(path: pathlib.Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


COMMON_CSS = dedent(
    """
    :root {
      --bg: #07111f;
      --panel: rgba(11, 21, 38, 0.92);
      --line: rgba(255,255,255,0.08);
      --text: #f6f8ff;
      --muted: #a1b2cf;
      --brand: #7c5cff;
      --brand-2: #2dd4bf;
      --accent: #ff9860;
      --shadow: 0 24px 60px rgba(0,0,0,0.34);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at 14% 16%, rgba(124,92,255,0.22), transparent 24%),
        radial-gradient(circle at 84% 18%, rgba(45,212,191,0.16), transparent 24%),
        linear-gradient(180deg, #040912 0%, #07111f 100%);
      padding: 24px;
    }

    a { color: inherit; text-decoration: none; }
    button, input, select, textarea { font: inherit; }

    .mg-app {
      width: min(1120px, 100%);
      margin: 0 auto;
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 24px;
      align-items: start;
    }

    .mg-panel,
    .mg-stage {
      background: var(--panel);
      border-radius: 28px;
      border: 1px solid var(--line);
      box-shadow: var(--shadow);
    }

    .mg-panel { padding: 28px; position: sticky; top: 24px; }
    .mg-stage { padding: 22px; }

    .mg-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      color: #e8edff;
      font-weight: 700;
      font-size: 0.92rem;
    }

    .mg-title {
      margin: 16px 0 12px;
      font-size: clamp(2rem, 4.4vw, 3rem);
      line-height: 1.05;
    }

    .mg-lead,
    .mg-subtle,
    .mg-tips li {
      color: var(--muted);
      line-height: 1.75;
    }

    .mg-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin: 18px 0;
    }

    .mg-btn,
    .mg-ghost {
      min-height: 48px;
      border-radius: 16px;
      border: 0;
      padding: 0 16px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
    }

    .mg-btn {
      color: #fff;
      background: linear-gradient(135deg, var(--brand), #9e84ff);
      box-shadow: 0 12px 26px rgba(124,92,255,0.24);
      flex: 1 1 120px;
    }

    .mg-ghost {
      color: var(--text);
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.06);
      flex: 1 1 120px;
    }

    .mg-tips {
      margin: 18px 0 0;
      padding-left: 18px;
      display: grid;
      gap: 8px;
    }

    .mg-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 18px;
    }

    .mg-stat {
      padding: 16px;
      border-radius: 18px;
      background: rgba(255,255,255,0.05);
    }

    .mg-stat strong {
      display: block;
      margin-top: 6px;
      font-size: 1.35rem;
    }

    .mg-board {
      padding: 12px;
      border-radius: 24px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.06);
    }

    .mg-message {
      margin-top: 18px;
      padding: 16px 18px;
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(124,92,255,0.14), rgba(45,212,191,0.08));
      font-weight: 700;
    }

    .mg-grid {
      display: grid;
      gap: 10px;
    }

    .mg-tile {
      min-height: 52px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.07);
      color: var(--text);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 10px;
      transition: transform 0.16s ease, filter 0.16s ease, background 0.16s ease;
    }

    .mg-tile:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: brightness(1.05);
    }

    .mg-tile:disabled { cursor: default; opacity: 0.88; }

    .mg-choice-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-top: 18px;
    }

    .mg-question {
      padding: 18px;
      border-radius: 22px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.06);
      font-size: clamp(1.3rem, 2.4vw, 2rem);
      font-weight: 700;
      text-align: center;
    }

    .mg-textarea {
      width: 100%;
      min-height: 150px;
      padding: 16px 18px;
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.06);
      color: var(--text);
      outline: none;
    }

    @media (max-width: 980px) {
      .mg-app { grid-template-columns: 1fr; }
      .mg-panel { position: static; }
    }

    @media (max-width: 720px) {
      body { padding: 18px; }
      .mg-panel, .mg-stage { padding: 20px; }
      .mg-stats { grid-template-columns: repeat(2, 1fr); }
      .mg-choice-grid { grid-template-columns: 1fr; }
    }
    """
).strip()


COMMON_JS = dedent(
    """
    (() => {
      const cfg = window.MICROGAME_CONFIG;
      const bestKey = `funhome-best-${cfg.id}`;
      const state = {
        score: 0,
        round: 1,
        time: cfg.timeLimit || 45,
        best: Number(localStorage.getItem(bestKey) || 0),
        running: false,
        timerId: null,
        progress: 0
      };

      document.body.innerHTML = `
        <main class="mg-app">
          <section class="mg-panel">
            <div class="mg-eyebrow">${cfg.icon} ${cfg.category}</div>
            <h1 class="mg-title">${cfg.title}</h1>
            <p class="mg-lead">${cfg.desc}</p>
            <div class="mg-actions">
              <button class="mg-btn" id="startBtn" type="button">${cfg.startLabel || '开始挑战'}</button>
              <a class="mg-ghost" href="funhome.html#library">← 返回趣味屋</a>
            </div>
            <ul class="mg-tips">${cfg.tips.map(item => `<li>${item}</li>`).join('')}</ul>
          </section>
          <section class="mg-stage">
            <div class="mg-stats">
              <div class="mg-stat">${cfg.statLabels[0]}<strong id="statA">0</strong></div>
              <div class="mg-stat">${cfg.statLabels[1]}<strong id="statB">0</strong></div>
              <div class="mg-stat">${cfg.statLabels[2]}<strong id="statC">0</strong></div>
              <div class="mg-stat">${cfg.statLabels[3]}<strong id="statD">0</strong></div>
            </div>
            <div class="mg-board" id="board"></div>
            <div class="mg-message" id="messageBox">${cfg.intro}</div>
          </section>
        </main>
      `;

      const els = {
        board: document.getElementById('board'),
        message: document.getElementById('messageBox'),
        start: document.getElementById('startBtn'),
        statA: document.getElementById('statA'),
        statB: document.getElementById('statB'),
        statC: document.getElementById('statC'),
        statD: document.getElementById('statD')
      };

      function setBest(value) {
        if (value > state.best) {
          state.best = value;
          localStorage.setItem(bestKey, String(value));
        }
      }

      function startTimer(onEnd) {
        clearInterval(state.timerId);
        state.timerId = setInterval(() => {
          state.time -= 1;
          engine.updateStats();
          if (state.time <= 0) {
            state.time = 0;
            clearInterval(state.timerId);
            onEnd();
          }
        }, 1000);
      }

      function stopTimer() {
        clearInterval(state.timerId);
        state.timerId = null;
      }

      function shuffle(list) {
        const arr = [...list];
        for (let i = arr.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      }

      function pick(list) {
        return list[Math.floor(Math.random() * list.length)];
      }

      const engineFactory = {
        spot() {
          let targetIndex = -1;
          let currentPair = null;
          let totalRounds = cfg.totalRounds || 10;

          function buildRound() {
            const size = Math.min(7, 4 + Math.floor((state.round - 1) / 3));
            const total = size * size;
            currentPair = pick(cfg.pairs);
            targetIndex = Math.floor(Math.random() * total);
            els.board.innerHTML = `<div class="mg-grid" style="grid-template-columns:repeat(${size},1fr);">${Array.from({length: total}, (_, index) => `
              <button class="mg-tile" type="button" data-index="${index}" style="font-size:clamp(1.4rem,2.8vw,2rem);aspect-ratio:1/1;">${index === targetIndex ? currentPair.odd : currentPair.base}</button>
            `).join('')}</div>`;
            els.board.querySelectorAll('[data-index]').forEach(btn => {
              btn.addEventListener('click', () => {
                if (!state.running) return;
                if (Number(btn.dataset.index) === targetIndex) {
                  state.score += 8 + size;
                  state.round += 1;
                  setBest(state.round - 1);
                  if (state.round > totalRounds) {
                    finish(`恭喜通关，成功完成 ${totalRounds} 轮。`);
                    return;
                  }
                  els.message.textContent = '找到了，下一轮会更密一点。';
                  updateStats();
                  buildRound();
                } else {
                  state.time = Math.max(0, state.time - 2);
                  els.message.textContent = '点错了，扣 2 秒。';
                  updateStats();
                }
              });
            });
          }

          function updateStats() {
            els.statA.textContent = `${Math.min(state.round, totalRounds)} / ${totalRounds}`;
            els.statB.textContent = state.score;
            els.statC.textContent = state.time;
            els.statD.textContent = state.best;
          }

          function start() {
            state.score = 0;
            state.round = 1;
            state.time = cfg.timeLimit || 45;
            state.running = true;
            els.message.textContent = '找出不同的那个。';
            buildRound();
            updateStats();
            startTimer(() => finish(`时间到，最终完成第 ${Math.max(1, state.round - 1)} 轮。`));
          }

          function finish(text) {
            state.running = false;
            stopTimer();
            updateStats();
            els.message.textContent = text;
          }

          return { start, updateStats };
        },

        order() {
          let expected = 0;
          let activeSet = [];
          const maxRound = cfg.maxRound || 10;

          function buildRound() {
            const count = Math.min(cfg.sequence.length, cfg.startSize + state.round - 1);
            activeSet = cfg.sequence.slice(0, count);
            const shuffled = shuffle(activeSet);
            expected = 0;
            els.board.innerHTML = `<div class="mg-grid" style="grid-template-columns:repeat(${Math.min(4, Math.ceil(Math.sqrt(count)))},1fr);">${shuffled.map(item => `
              <button class="mg-tile" type="button" data-value="${item}" style="min-height:70px;font-size:1.15rem;">${item}</button>
            `).join('')}</div>`;
            els.board.querySelectorAll('[data-value]').forEach(btn => {
              btn.addEventListener('click', () => {
                if (!state.running) return;
                const value = btn.dataset.value;
                if (value === activeSet[expected]) {
                  expected += 1;
                  btn.disabled = true;
                  btn.style.opacity = '0.5';
                  state.progress = expected;
                  updateStats();
                  if (expected === activeSet.length) {
                    state.score += 10 + activeSet.length * 2;
                    state.round += 1;
                    setBest(state.round - 1);
                    if (state.round > maxRound) {
                      finish(`顺序挑战完成，共通过 ${maxRound} 轮。`);
                      return;
                    }
                    els.message.textContent = '顺序正确，进入下一轮。';
                    buildRound();
                  }
                } else {
                  state.time = Math.max(0, state.time - 3);
                  expected = 0;
                  state.progress = 0;
                  els.message.textContent = '顺序错了，本轮从头再来。';
                  buildRound();
                }
              });
            });
          }

          function updateStats() {
            els.statA.textContent = `${Math.min(state.round, maxRound)} / ${maxRound}`;
            els.statB.textContent = `${state.progress} / ${activeSet.length || 0}`;
            els.statC.textContent = state.time;
            els.statD.textContent = state.best;
          }

          function start() {
            state.score = 0;
            state.round = 1;
            state.time = cfg.timeLimit || 50;
            state.progress = 0;
            state.running = true;
            buildRound();
            updateStats();
            startTimer(() => finish(`时间到，你通过了 ${Math.max(0, state.round - 1)} 轮。`));
          }

          function finish(text) {
            state.running = false;
            stopTimer();
            updateStats();
            els.message.textContent = text;
          }

          return { start, updateStats };
        },

        math() {
          let streak = 0;
          let questionCount = 0;
          let currentCorrect = 0;

          function randomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
          }

          function makeQuestion() {
            const op = pick(cfg.operators);
            let a = randomInt(cfg.min, cfg.max);
            let b = randomInt(cfg.min, cfg.max);
            let text = '';
            let correct = 0;

            if (op === '+') {
              text = `${a} + ${b} = ?`;
              correct = a + b;
            } else if (op === '-') {
              if (a < b) [a, b] = [b, a];
              text = `${a} - ${b} = ?`;
              correct = a - b;
            } else if (op === '×') {
              text = `${a} × ${b} = ?`;
              correct = a * b;
            } else {
              correct = a * b;
              text = `${correct} ÷ ${b} = ?`;
              correct = a;
            }

            currentCorrect = correct;
            const options = new Set([correct]);
            while (options.size < 4) {
              const delta = randomInt(-10, 10) || 1;
              options.add(correct + delta);
            }

            els.board.innerHTML = `
              <div class="mg-question">${text}</div>
              <div class="mg-choice-grid">${shuffle([...options]).map(value => `
                <button class="mg-tile" type="button" data-value="${value}" style="min-height:74px;font-size:1.2rem;">${value}</button>
              `).join('')}</div>
            `;

            els.board.querySelectorAll('[data-value]').forEach(btn => {
              btn.addEventListener('click', () => {
                if (!state.running) return;
                questionCount += 1;
                if (Number(btn.dataset.value) === currentCorrect) {
                  streak += 1;
                  state.score += 8 + streak * 2;
                  setBest(state.score);
                  els.message.textContent = '答对了。';
                } else {
                  streak = 0;
                  state.time = Math.max(0, state.time - 2);
                  els.message.textContent = `答错了，正确答案是 ${currentCorrect}。`;
                }
                updateStats();
                makeQuestion();
              });
            });
          }

          function updateStats() {
            els.statA.textContent = state.score;
            els.statB.textContent = streak;
            els.statC.textContent = state.time;
            els.statD.textContent = state.best;
          }

          function start() {
            state.score = 0;
            state.time = cfg.timeLimit || 45;
            streak = 0;
            questionCount = 0;
            state.running = true;
            makeQuestion();
            updateStats();
            startTimer(() => finish(`时间到，最终得分 ${state.score}。`));
          }

          function finish(text) {
            state.running = false;
            stopTimer();
            updateStats();
            els.message.textContent = text;
          }

          return { start, updateStats };
        },

        memory() {
          let pattern = [];
          let inputIndex = 0;
          const maxRound = cfg.maxRound || 9;

          function flash(indexes) {
            indexes.forEach((index, seqIndex) => {
              setTimeout(() => {
                const button = els.board.querySelector(`[data-index="${index}"]`);
                button?.animate(
                  [
                    { transform: 'scale(1)', filter: 'brightness(1)' },
                    { transform: 'scale(1.08)', filter: 'brightness(1.3)' },
                    { transform: 'scale(1)', filter: 'brightness(1)' }
                  ],
                  { duration: 360, easing: 'ease' }
                );
              }, 520 * seqIndex);
            });
          }

          function buildRound() {
            const size = cfg.gridSize || 4;
            const total = size * size;
            const available = Array.from({ length: total }, (_, index) => index);
            pattern = shuffle(available).slice(0, cfg.baseCount + state.round - 1);
            inputIndex = 0;
            els.board.innerHTML = `<div class="mg-grid" style="grid-template-columns:repeat(${size},1fr);">${available.map(index => `
              <button class="mg-tile" type="button" data-index="${index}" style="aspect-ratio:1/1;font-size:1.4rem;">${cfg.cellEmoji}</button>
            `).join('')}</div>`;
            updateStats();
            els.message.textContent = '先记住亮起的位置。';
            flash(pattern);
            setTimeout(() => {
              els.message.textContent = '轮到你复现顺序。';
              els.board.querySelectorAll('[data-index]').forEach(btn => {
                btn.addEventListener('click', () => {
                  if (!state.running) return;
                  const idx = Number(btn.dataset.index);
                  if (idx === pattern[inputIndex]) {
                    inputIndex += 1;
                    state.progress = inputIndex;
                    btn.style.background = 'rgba(45,212,191,0.2)';
                    updateStats();
                    if (inputIndex === pattern.length) {
                      state.round += 1;
                      setBest(state.round - 1);
                      if (state.round > maxRound) {
                        finish(`记忆挑战完成，共通过 ${maxRound} 轮。`);
                        return;
                      }
                      setTimeout(buildRound, 500);
                    }
                  } else {
                    finish(`顺序错了，止步第 ${state.round} 轮。`);
                  }
                }, { once: false });
              });
            }, 520 * pattern.length + 300);
          }

          function updateStats() {
            els.statA.textContent = `${Math.min(state.round, maxRound)} / ${maxRound}`;
            els.statB.textContent = `${state.progress} / ${pattern.length || 0}`;
            els.statC.textContent = state.time;
            els.statD.textContent = state.best;
          }

          function start() {
            state.round = 1;
            state.progress = 0;
            state.time = cfg.timeLimit || 60;
            state.running = true;
            buildRound();
            updateStats();
            startTimer(() => finish(`时间到，你通过了 ${Math.max(0, state.round - 1)} 轮。`));
          }

          function finish(text) {
            state.running = false;
            stopTimer();
            updateStats();
            els.message.textContent = text;
          }

          return { start, updateStats };
        },

        safe() {
          let currentTargets = 0;
          let foundTargets = 0;
          let roundGoal = cfg.roundGoal || 10;

          function buildRound() {
            const size = Math.min(6, 4 + Math.floor((state.round - 1) / 3));
            const total = size * size;
            const targetCount = Math.min(8, 2 + Math.floor(state.round / 2));
            const bombCount = Math.min(5, 1 + Math.floor(state.round / 3));
            const cells = Array(total).fill({ type: 'filler', icon: pick(cfg.filler) }).map(cell => ({ ...cell }));
            const order = shuffle(Array.from({ length: total }, (_, index) => index));
            order.slice(0, targetCount).forEach(index => cells[index] = { type: 'target', icon: cfg.target });
            order.slice(targetCount, targetCount + bombCount).forEach(index => cells[index] = { type: 'bomb', icon: cfg.bomb });
            currentTargets = targetCount;
            foundTargets = 0;
            els.board.innerHTML = `<div class="mg-grid" style="grid-template-columns:repeat(${size},1fr);">${cells.map((cell, index) => `
              <button class="mg-tile" type="button" data-index="${index}" data-type="${cell.type}" style="aspect-ratio:1/1;font-size:1.5rem;">${cell.icon}</button>
            `).join('')}</div>`;
            els.board.querySelectorAll('[data-index]').forEach(btn => {
              btn.addEventListener('click', () => {
                if (!state.running || btn.disabled) return;
                const type = btn.dataset.type;
                btn.disabled = true;
                if (type === 'target') {
                  foundTargets += 1;
                  state.score += 6;
                  btn.style.background = 'rgba(45,212,191,0.18)';
                  if (foundTargets === currentTargets) {
                    state.round += 1;
                    setBest(state.round - 1);
                    if (state.round > roundGoal) {
                      finish(`成功通过 ${roundGoal} 轮。`);
                      return;
                    }
                    buildRound();
                  }
                } else if (type === 'bomb') {
                  state.time = Math.max(0, state.time - 4);
                  state.score = Math.max(0, state.score - 5);
                  btn.style.background = 'rgba(255,99,120,0.22)';
                  els.message.textContent = '踩到炸弹，扣分扣时间。';
                }
                updateStats();
              });
            });
            updateStats();
          }

          function updateStats() {
            els.statA.textContent = `${Math.min(state.round, roundGoal)} / ${roundGoal}`;
            els.statB.textContent = state.score;
            els.statC.textContent = state.time;
            els.statD.textContent = state.best;
          }

          function start() {
            state.round = 1;
            state.score = 0;
            state.time = cfg.timeLimit || 45;
            state.running = true;
            els.message.textContent = `点 ${cfg.target}，别碰 ${cfg.bomb}。`;
            buildRound();
            startTimer(() => finish(`时间到，你完成了 ${Math.max(0, state.round - 1)} 轮。`));
          }

          function finish(text) {
            state.running = false;
            stopTimer();
            updateStats();
            els.message.textContent = text;
          }

          return { start, updateStats };
        },

        count() {
          function buildRound() {
            const size = Math.min(6, 4 + Math.floor((state.round - 1) / 3));
            const total = size * size;
            const target = pick(cfg.targets);
            const count = Math.max(2, Math.floor(Math.random() * Math.min(total - 2, 4 + state.round)) + 1);
            const fillers = cfg.fillers.filter(item => item !== target);
            const cells = Array.from({ length: total }, (_, index) => index < count ? target : pick(fillers));
            const shuffled = shuffle(cells);
            const options = new Set([count]);
            while (options.size < 4) options.add(Math.max(0, count + Math.floor(Math.random() * 7) - 3));

            els.board.innerHTML = `
              <div class="mg-question">这一屏有几个 ${target}？</div>
              <div class="mg-grid" style="grid-template-columns:repeat(${size},1fr);margin-top:18px;">
                ${shuffled.map(symbol => `<div class="mg-tile" style="cursor:default;aspect-ratio:1/1;font-size:1.45rem;">${symbol}</div>`).join('')}
              </div>
              <div class="mg-choice-grid">${shuffle([...options]).map(option => `
                <button class="mg-tile" type="button" data-count="${option}" style="min-height:70px;font-size:1.15rem;">${option}</button>
              `).join('')}</div>
            `;

            els.board.querySelectorAll('[data-count]').forEach(btn => {
              btn.addEventListener('click', () => {
                if (!state.running) return;
                if (Number(btn.dataset.count) === count) {
                  state.score += 8;
                  state.round += 1;
                  setBest(state.round - 1);
                  els.message.textContent = '数对了，下一轮。';
                } else {
                  state.time = Math.max(0, state.time - 3);
                  els.message.textContent = `答错了，正确是 ${count}。`;
                }
                updateStats();
                buildRound();
              });
            });
          }

          function updateStats() {
            els.statA.textContent = state.round;
            els.statB.textContent = state.score;
            els.statC.textContent = state.time;
            els.statD.textContent = state.best;
          }

          function start() {
            state.round = 1;
            state.score = 0;
            state.time = cfg.timeLimit || 45;
            state.running = true;
            buildRound();
            updateStats();
            startTimer(() => finish(`时间到，最终到达第 ${state.round} 轮。`));
          }

          function finish(text) {
            state.running = false;
            stopTimer();
            updateStats();
            els.message.textContent = text;
          }

          return { start, updateStats };
        }
      };

      const engine = engineFactory[cfg.mode]();
      window.addEventListener('beforeunload', () => stopTimer());
      els.start.addEventListener('click', engine.start);
      engine.updateStats();
    })();
    """
).strip()


def page_html(config: dict) -> str:
    return dedent(
        f"""\
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{config['title']}｜趣味屋</title>
          <meta name="description" content="{config['desc']}">
          <link rel="stylesheet" href="microgames.css">
        </head>
        <body>
          <script>
            window.MICROGAME_CONFIG = {json.dumps(config, ensure_ascii=False)};
          </script>
          <script src="microgames.js"></script>
        </body>
        </html>
        """
    )


spot_pairs = {
    "fruit": [("🍎", "🍏"), ("🍊", "🍋"), ("🍓", "🍒"), ("🍉", "🥝"), ("🍇", "🫐"), ("🍑", "🍐")],
    "animal": [("🐶", "🐱"), ("🐭", "🐹"), ("🐰", "🐻"), ("🦊", "🐯"), ("🐼", "🐨"), ("🐸", "🐵")],
    "marine": [("🐟", "🐠"), ("🐳", "🐬"), ("🦀", "🦞"), ("🐙", "🦑"), ("🦈", "🐋"), ("🪼", "🐡")],
    "weather": [("☀️", "🌤️"), ("🌙", "⭐"), ("⛅", "🌥️"), ("🌧️", "⛈️"), ("❄️", "🌨️"), ("🌈", "☁️")],
    "face": [("😀", "😄"), ("😊", "🙂"), ("😎", "🤓"), ("🥳", "😜"), ("😴", "😵"), ("😇", "🥰")],
    "sport": [("⚽", "🏀"), ("🏈", "🏉"), ("🎾", "🏓"), ("🏸", "🥅"), ("🥊", "🥋"), ("🏐", "🎳")],
    "dessert": [("🍰", "🧁"), ("🍪", "🍩"), ("🍫", "🍬"), ("🍮", "🍨"), ("🍧", "🍦"), ("🥧", "🍯")],
    "plant": [("🌵", "🌴"), ("🌸", "🌺"), ("🌻", "🌼"), ("🍀", "☘️"), ("🌿", "🍃"), ("🪴", "🌱")],
    "book": [("📘", "📗"), ("📕", "📙"), ("📚", "📝"), ("✏️", "🖋️"), ("📎", "📐"), ("📖", "📒")],
    "party": [("🎈", "🎉"), ("🎊", "🪅"), ("🎁", "🧧"), ("🎂", "🕯️"), ("🥂", "🍾"), ("🎆", "✨")],
    "travel": [("✈️", "🚆"), ("🚗", "🚌"), ("🚲", "🛵"), ("🚢", "⛵"), ("🧳", "🎒"), ("🗺️", "🧭")],
    "music": [("🎵", "🎶"), ("🎧", "🎤"), ("🎹", "🎷"), ("🎻", "🥁"), ("📻", "🔊"), ("🪕", "🎺")],
    "office": [("💻", "⌨️"), ("🖥️", "🖨️"), ("📱", "☎️"), ("🗂️", "📁"), ("📌", "📍"), ("🕒", "⏰")],
    "toy": [("🧸", "🪀"), ("🎲", "🧩"), ("🪁", "🎯"), ("🛹", "🪄"), ("🎮", "🕹️"), ("🎳", "🪅")],
    "cat": [("🐈", "🐱"), ("😺", "😸"), ("😹", "😻"), ("🙀", "😼"), ("🐾", "🧶"), ("🐟", "🐈")],
    "dog": [("🐶", "🦮"), ("🐕", "🐩"), ("🦴", "🎾"), ("🐾", "🐕"), ("🏠", "🐶"), ("🦴", "🐕")],
    "space": [("🌍", "🌎"), ("🪐", "🌕"), ("☄️", "🌠"), ("🚀", "🛰️"), ("👨‍🚀", "🌌"), ("🌟", "✨")],
    "food": [("🍔", "🍟"), ("🍕", "🌮"), ("🍜", "🍣"), ("🥟", "🍙"), ("🍛", "🥘"), ("🌭", "🥪")],
    "festival": [("🏮", "🎆"), ("🎋", "🎑"), ("🧨", "🎇"), ("🥮", "🍡"), ("🧧", "🎁"), ("🎏", "🎐")],
    "game": [("🎮", "🕹️"), ("♟️", "🎲"), ("🧩", "🪄"), ("🎯", "🏹"), ("🃏", "🎴"), ("🏓", "⚽")],
}

order_sets = [
    ("数字快排", "按从小到大的顺序点击数字。", ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]),
    ("字母快排", "按字母顺序点击。", list("ABCDEFGHIJKL")),
    ("罗马序列", "按罗马数字顺序点击。", ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]),
    ("星期排序", "按一周顺序点击。", ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]),
    ("月份顺序", "按月份顺序点击。", ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月"]),
    ("季节日程", "按自然变化顺序点击。", ["春", "夏", "秋", "冬", "晨", "午", "暮", "夜"]),
    ("星球顺序", "按离太阳远近顺序点击。", ["水星", "金星", "地球", "火星", "木星", "土星", "天王", "海王"]),
    ("方向轮盘", "按顺时针顺序点击方向。", ["北", "东北", "东", "东南", "南", "西南", "西", "西北"]),
    ("颜色层级", "按彩虹顺序点击颜色。", ["红", "橙", "黄", "绿", "青", "蓝", "紫"]),
    ("节奏步点", "按节奏顺序点击。", ["拍1", "拍2", "拍3", "拍4", "拍5", "拍6", "拍7", "拍8"]),
    ("训练序列", "按编号顺序点击训练点。", ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C1", "C2"]),
    ("棋盘坐标", "按棋盘坐标顺序点击。", ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "C4"]),
    ("城市路线", "按路线顺序点击站点。", ["一站", "二站", "三站", "四站", "五站", "六站", "七站", "八站"]),
    ("倒数回正", "按正确顺序恢复数字。", ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]),
    ("层级编号", "按层级从上到下点击。", ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10"]),
]

math_sets = [
    ("加法冲刺", ["+"], 1, 20, "在倒计时内尽量多答对简单加法。"),
    ("减法冲刺", ["-"], 1, 20, "在倒计时内尽量多答对减法。"),
    ("乘法快答", ["×"], 2, 9, "九九乘法表也能玩成小游戏。"),
    ("除法快答", ["/"], 2, 9, "整除题，要求又快又准。"),
    ("混合速算", ["+", "-", "×"], 1, 12, "三种运算混合在一起。"),
    ("小学数学", ["+", "-"], 5, 30, "适合热身的心算题。"),
    ("心算挑战", ["+", "-", "×"], 3, 15, "速度和正确率都很重要。"),
    ("双位加减", ["+", "-"], 10, 50, "双位数加减更考验节奏。"),
    ("乘除训练", ["×", "/"], 2, 12, "乘除切换，别算错。"),
    ("连续口算", ["+", "-", "×", "/"], 1, 12, "四种运算一起上。"),
    ("小店老板", ["+", "-"], 5, 40, "把它当成收银训练也行。"),
    ("试卷速答", ["+", "-", "×"], 1, 25, "像在刷一张短时小卷。"),
    ("数字极限", ["+", "×"], 2, 20, "分数涨得很快，但也容易算错。"),
    ("脑力热身", ["+", "-", "/", "×"], 1, 10, "开始工作前先来一轮。"),
    ("速算大师", ["+", "-", "×"], 6, 18, "难度适中，但很吃稳定性。"),
]

memory_sets = [
    ("水果记忆阵", "🍓", 4, 3, 9),
    ("动物记忆阵", "🐱", 4, 3, 9),
    ("甜品记忆阵", "🧁", 4, 3, 9),
    ("海洋记忆阵", "🐠", 4, 3, 9),
    ("宇宙记忆阵", "🪐", 4, 3, 9),
    ("音乐记忆阵", "🎵", 4, 3, 9),
    ("花园记忆阵", "🌼", 4, 3, 9),
    ("像素记忆阵", "🟪", 4, 4, 8),
    ("星光记忆阵", "⭐", 4, 4, 8),
    ("方块记忆阵", "🔷", 4, 4, 8),
    ("按钮记忆阵", "🔘", 5, 3, 8),
    ("表情记忆阵", "🙂", 5, 3, 8),
    ("棋子记忆阵", "♟️", 5, 3, 8),
    ("节奏记忆阵", "🎧", 5, 3, 8),
    ("魔法记忆阵", "✨", 5, 3, 8),
]

safe_sets = [
    ("摘草莓", "🍓", "💣", ["🍀", "🌿", "🍃"]),
    ("捡宝石", "💎", "💣", ["🪨", "⚪", "🔹"]),
    ("抓星星", "⭐", "💥", ["☁️", "✨", "🌙"]),
    ("收金币", "🪙", "💣", ["🟤", "🥔", "🍪"]),
    ("摘樱桃", "🍒", "🐞", ["🍃", "🌱", "🍏"]),
    ("捞小鱼", "🐟", "🦈", ["🫧", "🐚", "🌊"]),
    ("接雪花", "❄️", "🔥", ["☁️", "💧", "🌫️"]),
    ("拣贝壳", "🐚", "🦀", ["🪨", "🫧", "🌊"]),
    ("采花瓣", "🌸", "🐝", ["🍃", "🌱", "🌼"]),
    ("收方块", "🟪", "💥", ["⬜", "⬛", "🔷"]),
]

count_sets = [
    ("数水果", ["🍎", "🍊", "🍋", "🍉"], ["🍎", "🍊", "🍋", "🍉", "🍇", "🍓"]),
    ("数动物", ["🐶", "🐱", "🐰", "🐻"], ["🐶", "🐱", "🐰", "🐻", "🦊", "🐼"]),
    ("数星星", ["⭐", "🌟", "✨"], ["⭐", "🌟", "✨", "☁️", "🌙"]),
    ("数球类", ["⚽", "🏀", "🎾"], ["⚽", "🏀", "🎾", "🏓", "🏐"]),
    ("数甜品", ["🍰", "🍩", "🍪"], ["🍰", "🍩", "🍪", "🍫", "🍬"]),
    ("数图标", ["🔺", "🔵", "🟨"], ["🔺", "🔵", "🟨", "⬜", "🔷"]),
    ("数海洋", ["🐟", "🐙", "🦀"], ["🐟", "🐙", "🦀", "🫧", "🐚"]),
    ("数植物", ["🌵", "🌸", "🌻"], ["🌵", "🌸", "🌻", "🍃", "🌱"]),
    ("数音乐", ["🎵", "🎤", "🎧"], ["🎵", "🎤", "🎧", "🎹", "🥁"]),
    ("数表情", ["😀", "😎", "🥳"], ["😀", "😎", "🥳", "🙂", "🤓"]),
]


generated_games = []


def add_game(meta: dict, config: dict):
    generated_games.append(meta)
    write(ROOT / meta["file"], page_html(config))


# 20 spot games
for key, pairs in spot_pairs.items():
    title_map = {
        "fruit": "水果找不同",
        "animal": "动物找不同",
        "marine": "海洋找不同",
        "weather": "天气找不同",
        "face": "表情找不同",
        "sport": "运动找不同",
        "dessert": "甜品找不同",
        "plant": "植物找不同",
        "book": "文具找不同",
        "party": "派对找不同",
        "travel": "旅行找不同",
        "music": "音乐找不同",
        "office": "办公找不同",
        "toy": "玩具找不同",
        "cat": "猫咪找不同",
        "dog": "狗狗找不同",
        "space": "宇宙找不同",
        "food": "美食找不同",
        "festival": "节日找不同",
        "game": "游戏找不同",
    }
    title = title_map[key]
    filename = f"spot-{key}.html"
    add_game(
        {
            "title": title,
            "file": filename,
            "emoji": "🧐",
            "category": "眼力",
            "difficulty": "轻松",
            "time": "2-5 分钟",
            "badge": "NEW",
            "desc": f"在一堆相似图案里快速找出不一样的那个，主题是“{title.replace('找不同', '')}”。",
            "tags": ["找不同", "眼力", "短局"],
        },
        {
            "id": filename.replace(".html", ""),
            "mode": "spot",
            "icon": "🧐",
            "category": "眼力挑战",
            "title": title,
            "desc": f"每一轮都会出现一格不同的图案，找到它就能进入下一轮。主题：{title.replace('找不同', '')}。",
            "tips": ["差异一开始明显，后面会越来越密。", "点错会扣时间。", "非常适合短时间来一把。"],
            "intro": "找出不同的那个。",
            "startLabel": "开始找不同",
            "statLabels": ["轮数", "得分", "剩余时间", "最佳轮数"],
            "timeLimit": 45,
            "totalRounds": 10,
            "pairs": [{"base": a, "odd": b} for a, b in pairs],
        },
    )


# 15 order games
for idx, (title, desc, seq) in enumerate(order_sets, start=1):
    filename = f"order-{idx:02d}.html"
    add_game(
        {
            "title": title,
            "file": filename,
            "emoji": "🔢",
            "category": "顺序",
            "difficulty": "中等",
            "time": "2-6 分钟",
            "badge": "NEW",
            "desc": desc,
            "tags": ["顺序点击", "专注", "反应"],
        },
        {
            "id": filename.replace(".html", ""),
            "mode": "order",
            "icon": "🔢",
            "category": "顺序挑战",
            "title": title,
            "desc": desc,
            "tips": ["每轮会增加项目数量。", "顺序错了，本轮会重置。", "适合练专注和手速。"],
            "intro": "按正确顺序点击。",
            "startLabel": "开始顺序挑战",
            "statLabels": ["轮数", "本轮进度", "剩余时间", "最佳轮数"],
            "timeLimit": 50,
            "maxRound": 10,
            "startSize": 4,
            "sequence": seq,
        },
    )


# 15 math games
for idx, (title, ops, low, high, desc) in enumerate(math_sets, start=1):
    filename = f"math-{idx:02d}.html"
    add_game(
        {
            "title": title,
            "file": filename,
            "emoji": "🧠",
            "category": "数学",
            "difficulty": "可选",
            "time": "2-5 分钟",
            "badge": "NEW",
            "desc": desc,
            "tags": ["口算", "速度", "脑力"],
        },
        {
            "id": filename.replace(".html", ""),
            "mode": "math",
            "icon": "🧠",
            "category": "数学快答",
            "title": title,
            "desc": desc,
            "tips": ["答错会扣时间。", "连续答对会叠加连击收益。", "适合拿来热身。"],
            "intro": "准备好开始答题。",
            "startLabel": "开始速算",
            "statLabels": ["得分", "连击", "剩余时间", "最佳得分"],
            "timeLimit": 45,
            "operators": ops,
            "min": low,
            "max": high,
        },
    )


# 15 memory games
for idx, (title, emoji, grid_size, base_count, max_round) in enumerate(memory_sets, start=1):
    filename = f"memory-grid-{idx:02d}.html"
    add_game(
        {
            "title": title,
            "file": filename,
            "emoji": "🧠",
            "category": "记忆",
            "difficulty": "渐进",
            "time": "3-8 分钟",
            "badge": "NEW",
            "desc": f"{title}：先记住亮起的格子，再按同样顺序复现。",
            "tags": ["记忆", "顺序", "观察"],
        },
        {
            "id": filename.replace(".html", ""),
            "mode": "memory",
            "icon": "🧠",
            "category": "记忆挑战",
            "title": title,
            "desc": f"先看清亮起的位置，再按同样顺序复现。主题图标是 {emoji}。",
            "tips": ["每一轮都会多记一格。", "顺序错了就结束。", "适合练短时记忆。"],
            "intro": "点开始后先观察，再跟着点。",
            "startLabel": "开始记忆",
            "statLabels": ["轮数", "当前进度", "剩余时间", "最佳轮数"],
            "timeLimit": 60,
            "gridSize": grid_size,
            "baseCount": base_count,
            "maxRound": max_round,
            "cellEmoji": emoji,
        },
    )


# 10 safe games
for idx, (title, target, bomb, filler) in enumerate(safe_sets, start=1):
    filename = f"safe-click-{idx:02d}.html"
    add_game(
        {
            "title": title,
            "file": filename,
            "emoji": target,
            "category": "点击",
            "difficulty": "轻快",
            "time": "2-5 分钟",
            "badge": "NEW",
            "desc": f"点 {target}，躲开 {bomb}，看你能冲到第几轮。",
            "tags": ["点击", "避雷", "节奏"],
        },
        {
            "id": filename.replace(".html", ""),
            "mode": "safe",
            "icon": target,
            "category": "安全点击",
            "title": title,
            "desc": f"你的目标是点中 {target}，同时尽量别碰到 {bomb}。",
            "tips": ["目标和干扰物会混在一起。", "点到炸弹会扣分并扣时间。", "完成当前目标后自动进入下一轮。"],
            "intro": f"点 {target}，别碰 {bomb}。",
            "startLabel": "开始点击",
            "statLabels": ["轮数", "得分", "剩余时间", "最佳轮数"],
            "timeLimit": 45,
            "roundGoal": 10,
            "target": target,
            "bomb": bomb,
            "filler": filler,
        },
    )


# 10 count games
for idx, (title, targets, fillers) in enumerate(count_sets, start=1):
    filename = f"count-{idx:02d}.html"
    add_game(
        {
            "title": title,
            "file": filename,
            "emoji": "🔍",
            "category": "观察",
            "difficulty": "轻松",
            "time": "2-5 分钟",
            "badge": "NEW",
            "desc": f"{title}：快速数出目标图案一共有几个。",
            "tags": ["计数", "观察", "短局"],
        },
        {
            "id": filename.replace(".html", ""),
            "mode": "count",
            "icon": "🔍",
            "category": "计数挑战",
            "title": title,
            "desc": "快速观察画面，再在备选项里选出正确数量。",
            "tips": ["答错会扣时间。", "越往后画面越复杂。", "很适合练快速扫视。"],
            "intro": "看清目标图案，再选出数量。",
            "startLabel": "开始计数",
            "statLabels": ["当前轮数", "得分", "剩余时间", "最佳轮数"],
            "timeLimit": 45,
            "targets": targets,
            "fillers": fillers,
        },
    )


assert len(generated_games) == 85, len(generated_games)


existing_games = [
    {
        "title": "2048 进阶版",
        "file": "2048.html",
        "emoji": "🔢",
        "category": "益智",
        "difficulty": "中等",
        "time": "5-15 分钟",
        "badge": "HOT",
        "desc": "这次重做了移动和合并动画，方块终于有滑动感了。",
        "tags": ["数字合成", "手感优化", "经典"]
    },
    {
        "title": "扫雷",
        "file": "minesweeper.html",
        "emoji": "💣",
        "category": "益智",
        "difficulty": "可选",
        "time": "5-20 分钟",
        "badge": "NEW",
        "desc": "第一下必定安全，支持右键插旗，经典脑力游戏回归。",
        "tags": ["推理", "经典", "耐玩"]
    },
    {
        "title": "霓虹贪吃蛇",
        "file": "snake.html",
        "emoji": "🐍",
        "category": "街机",
        "difficulty": "渐进",
        "time": "3-10 分钟",
        "badge": "经典常玩",
        "desc": "经典贪吃蛇加上霓虹风格，支持穿墙模式、暂停和移动端方向键。",
        "tags": ["街机", "成长", "复古"]
    },
    {
        "title": "方块大师",
        "file": "block-master.html",
        "emoji": "⚡",
        "category": "反应",
        "difficulty": "刺激",
        "time": "1-3 分钟",
        "badge": "短局爽玩",
        "desc": "限时点掉方块、叠连击、拿加时，适合快速来一局。",
        "tags": ["手速", "连击", "爽局"]
    },
    {
        "title": "打地鼠",
        "file": "whack-a-mole.html",
        "emoji": "🔨",
        "category": "反应",
        "difficulty": "轻快",
        "time": "1-3 分钟",
        "badge": "NEW",
        "desc": "地鼠冒头就敲，节奏很快，特别适合轻松解压。",
        "tags": ["反应", "解压", "手速"]
    },
    {
        "title": "反应速度测试",
        "file": "reaction-test.html",
        "emoji": "🫰",
        "category": "反应",
        "difficulty": "简单",
        "time": "1-2 分钟",
        "badge": "NEW",
        "desc": "等屏幕变绿的一瞬间点击，测测你的反应有多快。",
        "tags": ["测速", "短局", "挑战"]
    },
    {
        "title": "记忆翻翻乐",
        "file": "memory-match.html",
        "emoji": "🃏",
        "category": "记忆",
        "difficulty": "轻松",
        "time": "3-8 分钟",
        "badge": "休闲治愈",
        "desc": "翻牌配对，支持多个难度，适合想放松又想动脑的时候。",
        "tags": ["翻牌", "配对", "放松"]
    },
    {
        "title": "记忆音阵",
        "file": "simon.html",
        "emoji": "🎵",
        "category": "记忆",
        "difficulty": "渐进",
        "time": "2-6 分钟",
        "badge": "NEW",
        "desc": "看颜色闪烁顺序再复现，越往后越容易乱。",
        "tags": ["记忆", "顺序", "专注"]
    },
    {
        "title": "井字棋 AI",
        "file": "tic-tac-toe.html",
        "emoji": "⭕",
        "category": "策略",
        "difficulty": "可选",
        "time": "2-6 分钟",
        "badge": "AI 对战",
        "desc": "支持双人和 AI 模式，普通/大师两种难度。",
        "tags": ["策略", "AI 对战", "双人"]
    },
    {
        "title": "四子连珠",
        "file": "connect-four.html",
        "emoji": "🟡",
        "category": "策略",
        "difficulty": "中等",
        "time": "4-10 分钟",
        "badge": "NEW",
        "desc": "本地双人或对战简单 AI，先连成四子的人获胜。",
        "tags": ["棋盘", "对弈", "策略"]
    },
    {
        "title": "数字滑块拼图",
        "file": "sliding-puzzle.html",
        "emoji": "🧩",
        "category": "拼图",
        "difficulty": "中等",
        "time": "3-12 分钟",
        "badge": "NEW",
        "desc": "把 1 到 15 的数字恢复顺序，适合慢慢拼。",
        "tags": ["拼图", "耐心", "经典"]
    },
    {
        "title": "找色块",
        "file": "color-hunt.html",
        "emoji": "🎨",
        "category": "眼力",
        "difficulty": "渐进",
        "time": "2-5 分钟",
        "badge": "NEW",
        "desc": "在一堆相近颜色中找出那个稍微不一样的方块。",
        "tags": ["眼力", "闯关", "颜色"]
    },
    {
        "title": "打字挑战",
        "file": "typing-challenge.html",
        "emoji": "⌨️",
        "category": "文字",
        "difficulty": "轻松",
        "time": "2-6 分钟",
        "badge": "NEW",
        "desc": "给你一段文字，看看你能多快又多准地打完。",
        "tags": ["打字", "速度", "专注"]
    },
    {
        "title": "迷宫逃脱",
        "file": "maze-escape.html",
        "emoji": "🧭",
        "category": "冒险",
        "difficulty": "中等",
        "time": "3-8 分钟",
        "badge": "NEW",
        "desc": "每次都会生成新迷宫，用方向键从入口走到出口。",
        "tags": ["迷宫", "探索", "路线"]
    },
    {
        "title": "砖块弹球",
        "file": "breakout.html",
        "emoji": "🏓",
        "category": "街机",
        "difficulty": "渐进",
        "time": "3-8 分钟",
        "badge": "NEW",
        "desc": "接住小球、打碎砖块，经典街机玩法适合短局。",
        "tags": ["街机", "弹球", "反弹"]
    }
]

all_games = existing_games + generated_games
assert len(all_games) == 100, len(all_games)

experiments = [
    {
        "title": "玻璃感计算器",
        "file": "Calculator.html",
        "emoji": "🧮",
        "desc": "重新做过的计算器，支持键盘输入、括号、百分比和退格。",
        "badge": "实用小工具"
    },
    {
        "title": "表白小剧场",
        "file": "confess.html",
        "emoji": "💘",
        "desc": "一个轻松小彩蛋：点“愿意”会放爱心，不愿意按钮会先害羞躲一下。",
        "badge": "互动彩蛋"
    },
    {
        "title": "太极冥想",
        "file": "Taiji.html",
        "emoji": "☯️",
        "desc": "看着太极缓慢旋转，配合呼吸提示放空几十秒。",
        "badge": "治愈角落"
    }
]

fortunes = [
    "今天适合先玩一局手感重做的 2048，再去扫雷慢慢推。",
    "如果你只想两分钟解压，打地鼠或者反应速度测试都很合适。",
    "想要轻松一点？翻翻乐、找色块和太极都很适合今天。",
    "如果你想连续玩好几局，贪吃蛇和砖块弹球很容易上头。",
    "今天的隐藏加成是“专注力 +1”，试试迷宫逃脱或者打字挑战。",
    "如果你想直接沉进游戏库，不如先从首页随机抽一款。"
]


HOME_TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>趣味屋｜100 款小游戏游戏库</title>
  <meta name="description" content="趣味屋：现在已经收录 100 款小游戏，首页直接展示全部游戏，尽量少翻页就能找到想玩的。">
  <style>
    :root {{
      --bg: #07111f;
      --panel: rgba(10, 20, 36, 0.82);
      --panel-soft: rgba(255,255,255,0.05);
      --line: rgba(255,255,255,0.1);
      --text: #f6f7fb;
      --muted: #9fb0cb;
      --brand: #7c5cff;
      --brand-2: #2dd4bf;
      --accent: #ff8f5a;
      --shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
      --radius: 24px;
      --container: min(1280px, calc(100vw - 24px));
    }}

    * {{ box-sizing: border-box; }}
    html {{ scroll-behavior: smooth; }}
    body {{
      margin: 0;
      min-height: 100vh;
      font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at 15% 18%, rgba(124,92,255,0.28), transparent 24%),
        radial-gradient(circle at 84% 18%, rgba(45,212,191,0.2), transparent 28%),
        radial-gradient(circle at 78% 86%, rgba(255,143,90,0.16), transparent 30%),
        linear-gradient(180deg, #07101c 0%, #07111f 55%, #050b15 100%);
    }}

    a {{ color: inherit; text-decoration: none; }}
    button, input {{ font: inherit; }}
    .container {{ width: var(--container); margin: 0 auto; }}

    .topbar {{
      position: sticky;
      top: 0;
      z-index: 30;
      backdrop-filter: blur(14px);
      background: rgba(6, 12, 24, 0.72);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }}

    .nav {{
      min-height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }}

    .brand {{
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
    }}

    .brand-mark {{
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--brand), var(--brand-2));
      box-shadow: 0 10px 20px rgba(124,92,255,0.26);
      font-size: 1.25rem;
    }}

    .brand-copy strong {{ display: block; font-size: 1rem; }}
    .brand-copy span {{ display: block; font-size: 0.84rem; color: var(--muted); }}

    .nav-actions {{
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }}

    .button,
    .ghost-button,
    .chip {{
      border: 0;
      cursor: pointer;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    }}

    .button {{
      min-height: 44px;
      padding: 0 18px;
      border-radius: 14px;
      color: #fff;
      background: linear-gradient(135deg, var(--brand), #9d7cff);
      box-shadow: 0 12px 24px rgba(124,92,255,0.24);
      font-weight: 700;
    }}

    .ghost-button {{
      min-height: 44px;
      padding: 0 16px;
      border-radius: 14px;
      color: var(--text);
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
    }}

    .button:hover,
    .ghost-button:hover,
    .chip:hover {{ transform: translateY(-1px); }}

    .hero {{
      padding: 18px 0 12px;
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 14px;
    }}

    .hero-card,
    .fortune-card,
    .stat-card,
    .compact-card,
    .experiment-card,
    .recent-card {{
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }}

    .hero-card,
    .fortune-card,
    .recent-card {{ padding: 18px; }}

    .eyebrow {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      color: #dce7ff;
      font-size: 0.88rem;
    }}

    h1 {{
      margin: 14px 0 12px;
      font-size: clamp(2rem, 4vw, 3.35rem);
      line-height: 1.08;
    }}

    .hero p,
    .section-head p,
    .fortune-card p,
    .recent-card p,
    .compact-card p,
    .experiment-card p,
    .muted {{
      color: var(--muted);
      line-height: 1.75;
      margin: 0;
    }}

    .hero-actions {{
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 18px;
    }}

    .hero-metrics {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 18px;
    }}

    .metric {{
      padding: 14px;
      border-radius: 18px;
      background: rgba(255,255,255,0.05);
    }}

    .metric strong {{
      display: block;
      font-size: 1.55rem;
      margin-bottom: 6px;
    }}

    .fortune-card {{
      background: linear-gradient(135deg, rgba(124,92,255,0.18), rgba(45,212,191,0.08)), var(--panel);
      display: grid;
      gap: 14px;
    }}

    .fortune-text {{
      min-height: 4.2em;
      color: #eff5ff;
      line-height: 1.8;
    }}

    .section {{
      padding: 12px 0 10px;
    }}

    .section-head {{
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: end;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }}

    .section-title {{
      margin: 0;
      font-size: clamp(1.45rem, 2.6vw, 2.2rem);
    }}

    .filters-panel {{
      position: sticky;
      top: 84px;
      z-index: 12;
      padding: 10px;
      border-radius: 20px;
      background: rgba(8,16,28,0.86);
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
      box-shadow: var(--shadow);
      margin-bottom: 14px;
    }}

    .filters-top {{
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }}

    .search-box {{
      flex: 1 1 280px;
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 46px;
      padding: 0 14px;
      border-radius: 14px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
    }}
    .search-box input {{
      flex: 1;
      background: transparent;
      border: 0;
      color: var(--text);
      outline: none;
    }}
    .search-box input::placeholder {{ color: #8ea1c0; }}

    .filters-row {{
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }}

    .chip {{
      min-height: 38px;
      padding: 0 14px;
      border-radius: 999px;
      background: rgba(255,255,255,0.05);
      color: #e7edff;
      border: 1px solid rgba(255,255,255,0.08);
    }}

    .chip.active {{
      background: linear-gradient(135deg, rgba(124,92,255,0.24), rgba(45,212,191,0.22));
      border-color: rgba(146,255,240,0.36);
      color: #fff;
      box-shadow: 0 10px 24px rgba(45,212,191,0.12);
    }}

    .launcher-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
      gap: 10px;
    }}

    .launcher {{
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 20px;
      box-shadow: var(--shadow);
      padding: 12px 10px;
      min-height: 112px;
      display: grid;
      gap: 6px;
      transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
    }}

    .launcher p {{
      margin: 0;
      font-size: 0.8rem;
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }}

    .launcher:hover {{
      transform: translateY(-3px);
      border-color: rgba(146,255,240,0.34);
      box-shadow: 0 20px 34px rgba(0,0,0,0.32);
    }}

    .launcher-top {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }}

    .launcher-emoji {{
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      font-size: 1.2rem;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.1);
    }}

    .launcher-title {{
      font-weight: 700;
      line-height: 1.35;
      font-size: 0.9rem;
    }}

    .launcher-meta {{
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: auto;
    }}

    .pill,
    .badge {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      color: #eef5ff;
      font-size: 0.78rem;
      border: 1px solid rgba(255,255,255,0.08);
    }}
    .badge.hot {{
      background: rgba(255,95,120,0.16);
      color: #ffd4da;
      border-color: rgba(255,95,120,0.32);
    }}
    .badge.new {{
      background: rgba(45,212,191,0.16);
      color: #b9fff5;
      border-color: rgba(45,212,191,0.32);
    }}

    .compact-layout {{
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
      align-items: start;
    }}

    .compact-card {{
      padding: 18px;
      display: grid;
      gap: 12px;
    }}

    .recent-list {{
      display: grid;
      gap: 10px;
      margin-top: 12px;
    }}

    .recent-item {{
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 16px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.06);
    }}
    .recent-item strong {{ display: block; margin-bottom: 4px; }}
    .recent-item small {{ color: var(--muted); line-height: 1.6; }}

    .experiment-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }}

    .experiment-card {{
      padding: 16px;
      display: grid;
      gap: 10px;
      transition: transform 0.18s ease, border-color 0.18s ease;
    }}
    .experiment-card:hover {{
      transform: translateY(-3px);
      border-color: rgba(146,255,240,0.34);
    }}

    .empty-state {{
      padding: 26px;
      border-radius: 20px;
      border: 1px dashed rgba(255,255,255,0.16);
      background: rgba(255,255,255,0.04);
      text-align: center;
      display: none;
    }}

    .modal {{
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(3, 8, 18, 0.72);
      backdrop-filter: blur(12px);
      z-index: 40;
    }}
    .modal.active {{ display: flex; }}
    .modal-card {{
      width: min(520px, 100%);
      padding: 24px;
      border-radius: 28px;
      background: #0b1628;
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 28px 70px rgba(0,0,0,0.45);
    }}
    .modal-head {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 18px;
    }}
    .close-btn {{
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.05);
      color: #fff;
      cursor: pointer;
    }}
    .modal-game {{
      padding: 18px;
      border-radius: 22px;
      background: linear-gradient(135deg, rgba(124,92,255,0.16), rgba(45,212,191,0.12));
      border: 1px solid rgba(255,255,255,0.08);
      display: grid;
      gap: 12px;
      margin: 16px 0 22px;
    }}
    .modal-actions {{
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }}

    @media (max-width: 1080px) {{
      .hero,
      .compact-layout {{
        grid-template-columns: 1fr;
      }}
      .hero-metrics {{
        grid-template-columns: 1fr;
      }}
    }}

    @media (max-width: 720px) {{
      body {{ padding: 0 0 18px; }}
      .container {{ width: min(100vw - 18px, 1280px); }}
      .nav-actions {{ display: none; }}
      .hero {{ padding-top: 14px; }}
      .hero-card, .fortune-card, .recent-card, .compact-card, .modal-card {{ padding: 16px; }}
      .launcher-grid {{ grid-template-columns: repeat(auto-fill, minmax(108px, 1fr)); }}
      .filters-panel {{ top: 72px; }}
      .stats {{ grid-template-columns: repeat(2, 1fr); }}
    }}
  </style>
</head>
<body>
  <header class="topbar">
    <div class="container nav">
      <a class="brand" href="#top">
        <div class="brand-mark">🎪</div>
        <div class="brand-copy">
          <strong>趣味屋</strong>
          <span>100 款小游戏游戏库</span>
        </div>
      </a>
      <div class="nav-actions">
        <a class="ghost-button" href="../index.html">🏠 返回主页</a>
        <button class="button" id="randomPickBtn" type="button">🎲 随机来一款</button>
      </div>
    </div>
  </header>

  <main class="container">
    <section class="hero" id="top">
      <article class="hero-card">
        <div class="eyebrow">🎮 现在这里已经是真正的游戏库</div>
        <h1>趣味屋<br><span style="color:#92fff0;">100 款小游戏</span></h1>
        <p>你刚提到“返回后总要往下翻找游戏，不顺手”。所以这次首页直接改成了紧凑型游戏墙：所有游戏都在首页展示，搜索、分类、随机启动也都放到了最上面，尽量少翻就能找到想玩的。</p>
        <div class="hero-actions">
          <a class="button" href="#library">🚀 直接看全部游戏</a>
          <button class="ghost-button" id="fortuneBtn" type="button">🔮 抽一个推荐</button>
        </div>
        <div class="hero-metrics">
          <div class="metric"><strong id="gameCount">100</strong><span class="muted">小游戏总数</span></div>
          <div class="metric"><strong id="categoryCount">0</strong><span class="muted">玩法分类</span></div>
          <div class="metric"><strong>首页直达</strong><span class="muted">不用再一层层翻</span></div>
        </div>
      </article>
      <article class="fortune-card">
        <span class="pill">🔮 今日建议</span>
        <h3 style="margin:0;">不知道先玩哪个？</h3>
        <div class="fortune-text" id="fortuneText">点一下按钮，我来帮你抽今天的第一局。</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <button class="button" id="fortuneBtn2" type="button">抽一条建议</button>
          <button class="ghost-button" id="shuffleFilteredBtn" type="button">🎯 随机从当前筛选里挑</button>
        </div>
      </article>
    </section>

    <section class="section" id="library">
      <div class="section-head">
        <div>
          <div class="eyebrow">📚 游戏库总览</div>
          <h2 class="section-title">所有游戏都在这里</h2>
          <p>首页直接展示全部 100 款小游戏。你可以先筛分类，再用搜索缩小范围。</p>
        </div>
      </div>

      <div class="filters-panel">
        <div class="filters-top">
          <label class="search-box" for="searchInput">
            <span>🔎</span>
            <input id="searchInput" type="search" placeholder="搜索游戏名、标签或玩法，例如：扫雷、迷宫、打字、数学、找不同">
          </label>
          <button class="ghost-button" id="clearSearchBtn" type="button">清空搜索</button>
        </div>
        <div class="filters-row" id="categoryFilters"></div>
      </div>

      <div class="compact-layout">
        <div>
          <div class="launcher-grid" id="gameGrid"></div>
          <div class="empty-state" id="emptyState">
            <h3>没有找到匹配的游戏</h3>
            <p>换个关键词试试，或者用“随机来一款”。</p>
          </div>
        </div>

        <aside class="recent-card">
          <div class="eyebrow">🕒 最近玩过</div>
          <h3 style="margin:12px 0 8px;">返回后也能继续接着玩</h3>
          <p>你点开的游戏会自动记录在这里，方便以后直接回到常玩内容。</p>
          <div class="recent-list" id="recentList"></div>
        </aside>
      </div>
    </section>

    <section class="section" id="lab">
      <div class="section-head">
        <div>
          <div class="eyebrow">🧪 趣味实验</div>
          <h2 class="section-title">不是游戏，也挺适合顺手点开</h2>
        </div>
      </div>
      <div class="experiment-grid" id="experimentGrid"></div>
    </section>
  </main>

  <div class="modal" id="pickerModal" aria-hidden="true">
    <div class="modal-card">
      <div class="modal-head">
        <div>
          <div class="eyebrow">🎲 随机推荐</div>
          <h3 style="margin:12px 0 0;">这一局就玩它吧</h3>
        </div>
        <button class="close-btn" id="closeModalBtn" type="button" aria-label="关闭">✕</button>
      </div>
      <div class="modal-game" id="modalGame"></div>
      <div class="modal-actions">
        <a class="button" id="modalPlayBtn" href="#">🚀 立刻开玩</a>
        <button class="ghost-button" id="rerollBtn" type="button">🔄 再抽一款</button>
      </div>
    </div>
  </div>

  <script>
    const games = __GAMES__;
    const experiments = __EXPERIMENTS__;
    const fortunes = __FORTUNES__;

    const gameGrid = document.getElementById('gameGrid');
    const recentList = document.getElementById('recentList');
    const categoryFilters = document.getElementById('categoryFilters');
    const searchInput = document.getElementById('searchInput');
    const emptyState = document.getElementById('emptyState');
    const fortuneText = document.getElementById('fortuneText');
    const experimentGrid = document.getElementById('experimentGrid');
    const pickerModal = document.getElementById('pickerModal');
    const modalGame = document.getElementById('modalGame');
    const modalPlayBtn = document.getElementById('modalPlayBtn');
    let activeCategory = '全部';
    let currentRandomGame = null;

    function getRecentItems() {{
      try {{
        return JSON.parse(localStorage.getItem('funhome-recent') || '[]');
      }} catch {{
        return [];
      }}
    }}

    function trackVisit(item, type = 'game') {{
      const recent = getRecentItems().filter(record => record.file !== item.file);
      recent.unshift({{
        title: item.title,
        file: item.file,
        emoji: item.emoji,
        type,
        time: new Date().toLocaleString('zh-CN', {{ hour12: false }})
      }});
      localStorage.setItem('funhome-recent', JSON.stringify(recent.slice(0, 10)));
      renderRecent();
    }}

    function renderRecent() {{
      const items = getRecentItems();
      if (!items.length) {{
        recentList.innerHTML = `
          <div class="recent-item">
            <div>
              <strong>还没有记录</strong>
              <small>先点开一款游戏，下次回来就能直接在这里继续。</small>
            </div>
            <span class="pill">空空如也</span>
          </div>
        `;
        return;
      }}

      recentList.innerHTML = items.map(item => `
        <a class="recent-item" href="${{item.file}}" target="_blank" rel="noopener">
          <div>
            <strong>${{item.emoji}} ${{item.title}}</strong>
            <small>${{item.type === 'game' ? '最近玩过的游戏' : '最近打开的小实验'}} · ${{item.time}}</small>
          </div>
          <span class="pill">继续</span>
        </a>
      `).join('');
    }}

    function renderFilters() {{
      const categories = ['全部', ...new Set(games.map(game => game.category))];
      categoryFilters.innerHTML = categories.map(category => `
        <button class="chip ${{category === activeCategory ? 'active' : ''}}" type="button" data-category="${{category}}">
          ${{category}}
        </button>
      `).join('');

      categoryFilters.querySelectorAll('[data-category]').forEach(button => {{
        button.addEventListener('click', () => {{
          activeCategory = button.dataset.category;
          renderFilters();
          renderGames();
        }});
      }});

      document.getElementById('categoryCount').textContent = categories.length - 1;
    }}

    function getFilteredGames() {{
      const keyword = searchInput.value.trim().toLowerCase();
      return games.filter(game => {{
        const passCategory = activeCategory === '全部' || game.category === activeCategory;
        const haystack = [game.title, game.desc, game.category, game.difficulty, ...game.tags].join(' ').toLowerCase();
        const passSearch = !keyword || haystack.includes(keyword);
        return passCategory && passSearch;
      }});
    }}

    function badgeClass(badge) {{
      if (badge === 'NEW') return 'badge new';
      if (badge === 'HOT') return 'badge hot';
      return 'badge';
    }}

    function renderGames() {{
      const filtered = getFilteredGames();
      emptyState.style.display = filtered.length ? 'none' : 'block';
      gameGrid.innerHTML = filtered.map(game => `
        <a class="launcher" href="${{game.file}}" target="_blank" rel="noopener">
          <div class="launcher-top">
            <div class="launcher-emoji">${{game.emoji}}</div>
            <span class="${{badgeClass(game.badge)}}">${{game.badge}}</span>
          </div>
          <div class="launcher-title">${{game.title}}</div>
          <p>${{game.desc}}</p>
          <div class="launcher-meta">
            <span class="pill">${{game.category}}</span>
            <span class="pill">${{game.time}}</span>
          </div>
        </a>
      `).join('');

      gameGrid.querySelectorAll('.launcher').forEach((card, index) => {{
        card.addEventListener('click', () => trackVisit(filtered[index], 'game'));
      }});
    }}

    function renderExperiments() {{
      experimentGrid.innerHTML = experiments.map(item => `
        <a class="experiment-card" href="${{item.file}}" target="_blank" rel="noopener">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <div style="font-size:1.7rem;">${{item.emoji}}</div>
            <span class="pill">${{item.badge}}</span>
          </div>
          <h3 style="margin:0;">${{item.title}}</h3>
          <p>${{item.desc}}</p>
        </a>
      `).join('');
    }}

    function spinFortune() {{
      fortuneText.textContent = fortunes[Math.floor(Math.random() * fortunes.length)];
    }}

    function openRandomModal(pool) {{
      const source = pool.length ? pool : games;
      currentRandomGame = source[Math.floor(Math.random() * source.length)];
      modalGame.innerHTML = `
        <div style="font-size:2rem;">${{currentRandomGame.emoji}}</div>
        <div>
          <div class="pill">${{currentRandomGame.category}}</div>
          <h3 style="margin:14px 0 10px;">${{currentRandomGame.title}}</h3>
          <p style="margin:0; color: var(--muted); line-height: 1.8;">${{currentRandomGame.desc}}</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;">
            <span class="pill">${{currentRandomGame.time}}</span>
            <span class="pill">难度：${{currentRandomGame.difficulty}}</span>
          </div>
        </div>
      `;
      modalPlayBtn.href = currentRandomGame.file;
      pickerModal.classList.add('active');
      pickerModal.setAttribute('aria-hidden', 'false');
    }}

    function closeModal() {{
      pickerModal.classList.remove('active');
      pickerModal.setAttribute('aria-hidden', 'true');
    }}

    document.getElementById('fortuneBtn').addEventListener('click', spinFortune);
    document.getElementById('fortuneBtn2').addEventListener('click', spinFortune);
    document.getElementById('randomPickBtn').addEventListener('click', () => openRandomModal(games));
    document.getElementById('shuffleFilteredBtn').addEventListener('click', () => openRandomModal(getFilteredGames()));
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('rerollBtn').addEventListener('click', () => openRandomModal(getFilteredGames()));
    document.getElementById('clearSearchBtn').addEventListener('click', () => {{
      searchInput.value = '';
      renderGames();
    }});

    modalPlayBtn.addEventListener('click', () => {{
      if (currentRandomGame) trackVisit(currentRandomGame, 'game');
      closeModal();
    }});

    pickerModal.addEventListener('click', event => {{
      if (event.target === pickerModal) closeModal();
    }});

    document.addEventListener('keydown', event => {{
      if (event.key === 'Escape') closeModal();
    }});

    searchInput.addEventListener('input', renderGames);

    document.getElementById('gameCount').textContent = games.length;
    renderFilters();
    renderGames();
    renderExperiments();
    renderRecent();
    spinFortune();
  </script>
</body>
</html>
"""


home_template = HOME_TEMPLATE.replace("{{", "{").replace("}}", "}")
home_html = home_template.replace("__GAMES__", json.dumps(all_games, ensure_ascii=False))
home_html = home_html.replace("__EXPERIMENTS__", json.dumps(experiments, ensure_ascii=False))
home_html = home_html.replace("__FORTUNES__", json.dumps(fortunes, ensure_ascii=False))

write(ROOT / "microgames.css", COMMON_CSS + "\n")
write(ROOT / "microgames.js", COMMON_JS + "\n")
write(ROOT / "funhome.html", home_html)


RETURN_FIX = dedent(
    """
    .btn, .ghost-btn, .button, .ghost-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
    }
    """
).strip()


existing_pages_to_patch = [
    "2048.html",
    "block-master.html",
    "breakout.html",
    "Calculator.html",
    "color-hunt.html",
    "confess.html",
    "connect-four.html",
    "maze-escape.html",
    "memory-match.html",
    "minesweeper.html",
    "reaction-test.html",
    "simon.html",
    "sliding-puzzle.html",
    "snake.html",
    "Taiji.html",
    "tic-tac-toe.html",
    "typing-challenge.html",
    "whack-a-mole.html",
]

for filename in existing_pages_to_patch:
    path = ROOT / filename
    text = path.read_text(encoding="utf-8")
    if "white-space: nowrap;" in text:
        continue
    text = text.replace(
        '    a { color: inherit; text-decoration: none; }\n',
        '    a { color: inherit; text-decoration: none; }\n' + "\n".join(f"    {line}" if line else "" for line in RETURN_FIX.splitlines()) + "\n\n",
        1,
    )
    write(path, text)
