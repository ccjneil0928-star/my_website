// ===== 2048 =====
const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");

let grid, score, over, reached2048;
let best = Number(localStorage.getItem("2048Best") || 0);

function newGame() {
  grid = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
  score = 0;
  over = false;
  reached2048 = false;
  statusEl.textContent = "";
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
  if (empty.length === 0) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

// 向左壓縮並合併一列,回傳新列與是否有變動
function slide(row) {
  const nums = row.filter((v) => v !== 0);
  const out = [];
  for (let i = 0; i < nums.length; i++) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      const merged = nums[i] * 2;
      out.push(merged);
      score += merged;
      if (merged === 2048) reached2048 = true;
      i++;
    } else {
      out.push(nums[i]);
    }
  }
  while (out.length < 4) out.push(0);
  return out;
}

function move(dirKey) {
  if (over) return;
  const before = JSON.stringify(grid);

  if (dirKey === "left" || dirKey === "right") {
    grid = grid.map((row) => {
      const r = dirKey === "right" ? [...row].reverse() : row;
      const slid = slide(r);
      return dirKey === "right" ? slid.reverse() : slid;
    });
  } else {
    for (let c = 0; c < 4; c++) {
      let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
      if (dirKey === "down") col.reverse();
      col = slide(col);
      if (dirKey === "down") col.reverse();
      for (let r = 0; r < 4; r++) grid[r][c] = col[r];
    }
  }

  if (JSON.stringify(grid) === before) return; // 沒有變動就不新增數字

  addTile();
  if (score > best) {
    best = score;
    localStorage.setItem("2048Best", best);
  }
  render();

  if (reached2048 && !statusEl.textContent) {
    statusEl.textContent = "🎉 達成 2048!可以繼續挑戰更高分";
  }
  if (isGameOver()) {
    over = true;
    statusEl.textContent = `遊戲結束!得分 ${score},按「重新開始」再玩一次`;
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
  board.innerHTML = grid
    .flat()
    .map((v) =>
      v === 0
        ? `<div class="tile"></div>`
        : `<div class="tile tile-${v <= 2048 ? v : "big"}">${v}</div>`
    )
    .join("");
}

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
