// ===== 井字棋 =====
const board = document.getElementById("board");
const statusEl = document.getElementById("status");
const xWinsEl = document.getElementById("xWins");
const oWinsEl = document.getElementById("oWins");
const drawsEl = document.getElementById("draws");
const modeTabs = document.getElementById("modeTabs");

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];
const MARK = { X: "❌", O: "⭕" };

let cells, turn, over, mode = "2p";
let tally = { X: 0, O: 0, draw: 0 };

function newGame() {
  cells = Array(9).fill("");
  turn = "X";
  over = false;
  statusEl.textContent = "輪到 ❌";
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.addEventListener("click", () => play(i));
    board.appendChild(b);
  }
}

function play(i) {
  if (over || cells[i]) return;
  place(i);
  // 電腦模式:輪到 O 且遊戲未結束時,電腦出手
  if (!over && mode === "ai" && turn === "O") {
    setTimeout(() => place(aiPick()), 300);
  }
}

function place(i) {
  cells[i] = turn;
  board.children[i].textContent = MARK[turn];

  const line = LINES.find((l) => l.every((j) => cells[j] === turn));
  if (line) {
    over = true;
    line.forEach((j) => board.children[j].classList.add("win"));
    statusEl.textContent = `${MARK[turn]} 獲勝!🎉`;
    tally[turn]++;
    updateTally();
    return;
  }
  if (cells.every((c) => c)) {
    over = true;
    statusEl.textContent = "平手!";
    tally.draw++;
    updateTally();
    return;
  }
  turn = turn === "X" ? "O" : "X";
  statusEl.textContent =
    mode === "ai" && turn === "O" ? "🤖 電腦思考中…" : `輪到 ${MARK[turn]}`;
}

// 電腦策略:能贏就贏 → 擋對手 → 搶中間 → 搶角落 → 隨機
function aiPick() {
  const empty = cells
    .map((v, i) => (v ? -1 : i))
    .filter((i) => i >= 0);

  for (const me of ["O", "X"]) {
    for (const i of empty) {
      cells[i] = me;
      const wins = LINES.some((l) => l.every((j) => cells[j] === me));
      cells[i] = "";
      if (wins) return i;
    }
  }
  if (!cells[4]) return 4;
  const corners = [0, 2, 6, 8].filter((i) => !cells[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return empty[Math.floor(Math.random() * empty.length)];
}

function updateTally() {
  xWinsEl.textContent = tally.X;
  oWinsEl.textContent = tally.O;
  drawsEl.textContent = tally.draw;
}

modeTabs.querySelectorAll("button").forEach((b) => {
  b.addEventListener("click", () => {
    mode = b.dataset.mode;
    modeTabs
      .querySelectorAll("button")
      .forEach((x) => x.classList.toggle("active", x === b));
    tally = { X: 0, O: 0, draw: 0 };
    updateTally();
    newGame();
  });
});

document.getElementById("restart").addEventListener("click", newGame);
newGame();
