// ===== 2048 =====
const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");

const themeSelect = document.getElementById("themeSelect");
const aiRealtimeToggle = document.getElementById("aiRealtimeToggle");
const getHintBtn = document.getElementById("getHintBtn");
const aiHintCard = document.getElementById("aiHintCard");
const aiHintContent = document.getElementById("aiHintContent");

let grid, score, over, reached2048;
let best = Number(localStorage.getItem("2048Best") || 0);
let mergedGrid = Array.from({ length: 4 }, () => [false, false, false, false]);
let newTilePos = null;

function newGame() {
  grid = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
  score = 0;
  over = false;
  reached2048 = false;
  statusEl.textContent = "";
  
  // 重設動畫標記
  mergedGrid = Array.from({ length: 4 }, () => [false, false, false, false]);
  newTilePos = null;

  addTile();
  addTile();
  render();
}

function addTile() {
  const empty = [];
  grid.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v === 0) empty.push([r, c]);
    })
  );
  if (empty.length === 0) {
    newTilePos = null;
    return;
  }
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  newTilePos = [r, c];
}

// 壓縮並合併一列，並記錄合併狀態與得分
function slideWithMergeInfo(row) {
  const nums = row.filter((v) => v !== 0);
  const out = [];
  const merged = [];
  let scoreAdded = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      const val = nums[i] * 2;
      out.push(val);
      merged.push(true);
      scoreAdded += val;
      i++;
    } else {
      out.push(nums[i]);
      merged.push(false);
    }
  }
  while (out.length < 4) {
    out.push(0);
    merged.push(false);
  }
  return { out, merged, scoreAdded };
}

function move(dirKey) {
  if (over) return;
  const before = JSON.stringify(grid);

  // 重設合併標記
  mergedGrid = Array.from({ length: 4 }, () => [false, false, false, false]);
  let scoreAdded = 0;

  if (dirKey === "left" || dirKey === "right") {
    for (let r = 0; r < 4; r++) {
      const row = grid[r];
      const reversed = dirKey === "right" ? [...row].reverse() : row;
      const res = slideWithMergeInfo(reversed);
      grid[r] = dirKey === "right" ? res.out.reverse() : res.out;
      mergedGrid[r] = dirKey === "right" ? res.merged.reverse() : res.merged;
      scoreAdded += res.scoreAdded;
    }
  } else {
    for (let c = 0; c < 4; c++) {
      const col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
      const reversed = dirKey === "down" ? col.reverse() : col;
      const res = slideWithMergeInfo(reversed);
      const finalCol = dirKey === "down" ? res.out.reverse() : res.out;
      const finalMerged = dirKey === "down" ? res.merged.reverse() : res.merged;
      for (let r = 0; r < 4; r++) {
        grid[r][c] = finalCol[r];
        mergedGrid[r][c] = finalMerged[r];
      }
      scoreAdded += res.scoreAdded;
    }
  }

  if (JSON.stringify(grid) === before) return; // 沒有變動就不新增數字

  score += scoreAdded;
  if (scoreAdded > 0 && !reached2048) {
    for (let r = 0; r < 4; r++) {
      if (grid[r].includes(2048)) reached2048 = true;
    }
  }

  addTile();
  if (score > best) {
    best = score;
    localStorage.setItem("2048Best", best);
  }
  render();

  if (reached2048 && !statusEl.textContent) {
    statusEl.textContent = "🎉 達成 2048! 可以繼續挑戰更高分";
  }
  if (isGameOver()) {
    over = true;
    statusEl.textContent = `遊戲結束! 得分 ${score}，按「重新開始」再玩一次`;
    updateHintDisplay();
  }
}

function isGameOver() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return false;
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
}

function render() {
  scoreEl.textContent = score;
  bestEl.textContent = best;
  
  let html = "";
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = grid[r][c];
      if (v === 0) {
        html += `<div class="tile"></div>`;
      } else {
        const isNew = newTilePos && newTilePos[0] === r && newTilePos[1] === c;
        const isMerged = mergedGrid && mergedGrid[r][c];
        const extraClass = (isNew ? " tile-new" : "") + (isMerged ? " tile-merged" : "");
        html += `<div class="tile tile-${v <= 2048 ? v : "big"}${extraClass}">${v}</div>`;
      }
    }
  }
  board.innerHTML = html;
  
  // 更新 AI 智慧提示
  updateHintDisplay();
  
  // 清除單次動畫標記
  mergedGrid = Array.from({ length: 4 }, () => [false, false, false, false]);
  newTilePos = null;
}

// ===== AI 提示演算 =====

function simulateSlide(row) {
  const nums = row.filter((v) => v !== 0);
  const out = [];
  let scoreAdded = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      const val = nums[i] * 2;
      out.push(val);
      scoreAdded += val;
      i++;
    } else {
      out.push(nums[i]);
    }
  }
  while (out.length < 4) out.push(0);
  return { out, scoreAdded };
}

function simulateMove(currentGrid, dirKey) {
  let tempGrid = currentGrid.map(row => [...row]);
  let scoreAdded = 0;
  
  if (dirKey === "left" || dirKey === "right") {
    tempGrid = tempGrid.map((row) => {
      const r = dirKey === "right" ? [...row].reverse() : row;
      const res = simulateSlide(r);
      scoreAdded += res.scoreAdded;
      return dirKey === "right" ? res.out.reverse() : res.out;
    });
  } else {
    for (let c = 0; c < 4; c++) {
      let col = [tempGrid[0][c], tempGrid[1][c], tempGrid[2][c], tempGrid[3][c]];
      if (dirKey === "down") col.reverse();
      const res = simulateSlide(col);
      scoreAdded += res.scoreAdded;
      if (dirKey === "down") res.out.reverse();
      for (let r = 0; r < 4; r++) tempGrid[r][c] = res.out[r];
    }
  }
  
  return { grid: tempGrid, scoreAdded };
}

function evaluateGrid(g) {
  // 四個角落的蛇行權重矩陣
  const patterns = [
    // 左上角落
    [
      [10000, 5000, 2000, 1000],
      [100,   200,  500,  800],
      [80,    50,   20,   10],
      [1,     2,    5,    8]
    ],
    // 右上角落
    [
      [1000,  2000, 5000, 10000],
      [800,   500,  200,  100],
      [10,    20,   50,   80],
      [8,     5,    2,    1]
    ],
    // 左下角落
    [
      [1,     2,    5,    8],
      [80,    50,   20,   10],
      [100,   200,  500,  800],
      [10000, 5000, 2000, 1000]
    ],
    // 右下角落
    [
      [8,     5,    2,    1],
      [10,    20,   50,   80],
      [800,   500,  200,  100],
      [1000,  2000, 5000, 10000]
    ]
  ];
  
  // 找出目前最符合的角落配置
  let bestPatternIdx = 0;
  let maxPatternMatch = -Infinity;
  patterns.forEach((pattern, idx) => {
    let matchValue = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        matchValue += g[r][c] * pattern[r][c];
      }
    }
    if (matchValue > maxPatternMatch) {
      maxPatternMatch = matchValue;
      bestPatternIdx = idx;
    }
  });
  
  const chosenPattern = patterns[bestPatternIdx];
  
  // 1. 角落對齊分數
  let patternScore = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      patternScore += g[r][c] * chosenPattern[r][c];
    }
  }
  
  // 2. 空格獎勵
  let emptyCells = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (g[r][c] === 0) emptyCells++;
    }
  }
  const emptyScore = emptyCells * 25000;
  
  // 3. 相鄰平滑度處罰 (以對數計算)
  let smoothness = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (g[r][c] !== 0) {
        const val = Math.log2(g[r][c]);
        if (c < 3 && g[r][c + 1] !== 0) {
          smoothness -= Math.abs(val - Math.log2(g[r][c + 1]));
        }
        if (r < 3 && g[r + 1][c] !== 0) {
          smoothness -= Math.abs(val - Math.log2(g[r + 1][c]));
        }
      }
    }
  }
  const smoothnessScore = smoothness * 2000;
  
  // 4. 單調性分數
  let monotonicity = 0;
  for (let r = 0; r < 4; r++) {
    let inc = 0, dec = 0;
    for (let c = 0; c < 3; c++) {
      if (g[r][c] > g[r][c+1]) dec += (Math.log2(g[r][c]) - Math.log2(g[r][c+1]));
      else if (g[r][c] < g[r][c+1]) inc += (Math.log2(g[r][c+1]) - Math.log2(g[r][c]));
    }
    monotonicity -= Math.min(inc, dec);
  }
  for (let c = 0; c < 4; c++) {
    let inc = 0, dec = 0;
    for (let r = 0; r < 3; r++) {
      if (g[r][c] > g[r+1][c]) dec += (Math.log2(g[r][c]) - Math.log2(g[r+1][c]));
      else if (g[r][c] < g[r+1][c]) inc += (Math.log2(g[r+1][c]) - Math.log2(g[r][c]));
    }
    monotonicity -= Math.min(inc, dec);
  }
  const monoScore = monotonicity * 3000;
  
  return patternScore + emptyScore + smoothnessScore + monoScore;
}

function getBestMove() {
  const directions = ["up", "down", "left", "right"];
  let bestDir = null;
  let bestScore = -Infinity;
  let reasons = {};
  
  const currentGridStr = JSON.stringify(grid);
  
  directions.forEach(dir => {
    const sim = simulateMove(grid, dir);
    if (JSON.stringify(sim.grid) === currentGridStr) {
      return; // 無效移動
    }
    
    const val = evaluateGrid(sim.grid);
    if (val > bestScore) {
      bestScore = val;
      bestDir = dir;
    }
    
    let emptyCount = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (sim.grid[r][c] === 0) emptyCount++;
      }
    }
    
    reasons[dir] = {
      emptyCount,
      merges: sim.scoreAdded > 0,
      scoreAdded: sim.scoreAdded
    };
  });
  
  return { dir: bestDir, score: bestScore, reasons };
}

function updateHintDisplay(manualTrigger = false) {
  if (!aiRealtimeToggle.checked && !manualTrigger) {
    aiHintContent.innerHTML = `勾選「即時提示」或點擊「單次提示」以獲得最佳移動建議。`;
    aiHintCard.classList.remove("highlight");
    return;
  }
  
  if (over) {
    aiHintContent.innerHTML = `遊戲已結束，點擊「重新開始」再來一局吧！`;
    aiHintCard.classList.remove("highlight");
    return;
  }
  
  const result = getBestMove();
  if (!result.dir) {
    aiHintContent.innerHTML = `無路可走！遊戲即將結束。`;
    aiHintCard.classList.remove("highlight");
    return;
  }
  
  if (manualTrigger) {
    aiHintCard.classList.add("highlight");
    setTimeout(() => {
      aiHintCard.classList.remove("highlight");
    }, 500);
  }
  
  const dirNames = {
    up: "⬆️ 上",
    down: "⬇️ 下",
    left: "⬅️ 左",
    right: "➡️ 右"
  };
  
  const dirName = dirNames[result.dir];
  const info = result.reasons[result.dir];
  
  let reasonText = "";
  if (info.merges && info.scoreAdded > 0) {
    reasonText = `此移動可合併數字方塊，獲得額外 <span class="accent">${info.scoreAdded}</span> 分，並有效整理版面。`;
  } else {
    let curEmpty = 0;
    grid.forEach(row => row.forEach(v => { if (v === 0) curEmpty++; }));
    if (info.emptyCount > curEmpty) {
      reasonText = `此移動能釋放空間，將空格數量提升至 <span class="accent">${info.emptyCount}</span> 個，降低卡死風險。`;
    } else {
      reasonText = `此移動能保持最大數字穩居角落，維持棋盤的單調順序，方便後續合併。`;
    }
  }
  
  aiHintContent.innerHTML = `AI 推薦移動方向為 <span class="hint-direction">${dirName}</span>。<br>${reasonText}`;
}

// 監聽控制項
themeSelect.addEventListener("change", (e) => {
  const chosenTheme = e.target.value;
  board.setAttribute("data-game-theme", chosenTheme);
  localStorage.setItem("2048Theme", chosenTheme);
});

aiRealtimeToggle.addEventListener("change", () => {
  localStorage.setItem("2048AiRealtime", aiRealtimeToggle.checked);
  updateHintDisplay();
});

document.getElementById("getHintBtn").addEventListener("click", () => {
  updateHintDisplay(true);
});

// 初始化載入玩家設定
const savedGameTheme = localStorage.getItem("2048Theme") || "classic";
themeSelect.value = savedGameTheme;
board.setAttribute("data-game-theme", savedGameTheme);

const savedRealtime = localStorage.getItem("2048AiRealtime") === "true";
aiRealtimeToggle.checked = savedRealtime;

// 鍵盤操作
document.addEventListener("keydown", (e) => {
  const map = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  };
  if (map[e.key]) {
    e.preventDefault();
    move(map[e.key]);
  }
});

// 手機滑動操作
let touchStart = null;
board.addEventListener("touchstart", (e) => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});
board.addEventListener("touchend", (e) => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
  if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
  else move(dy > 0 ? "down" : "up");
});

document.getElementById("restart").addEventListener("click", newGame);
newGame();
