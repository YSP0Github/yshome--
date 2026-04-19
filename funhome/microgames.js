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
