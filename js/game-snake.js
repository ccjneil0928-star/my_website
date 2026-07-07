// ===== 貪吃蛇 =====
const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const startBtn = document.getElementById("startBtn");

const N = 20; // 20x20 格
const CELL = canvas.width / N;

let snake, dir, nextDir, food, score, timer, delay, running;
let best = Number(localStorage.getItem("snakeBest") || 0);
bestEl.textContent = best;

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * N),
      y: Math.floor(Math.random() * N),
    };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
}

function start() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  dir = { x: 1, y: 0 };
  nextDir = dir;
  score = 0;
  delay = 160;
  running = true;
  scoreEl.textContent = "0";
  startBtn.textContent = "重新開始";
  placeFood();
  clearInterval(timer);
  timer = setInterval(step, delay);
  draw();
}

function step() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (
    head.x < 0 || head.x >= N || head.y < 0 || head.y >= N ||
    snake.some((s) => s.x === head.x && s.y === head.y)
  ) {
    return gameOver();
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    if (score > best) {
      best = score;
      localStorage.setItem("snakeBest", best);
      bestEl.textContent = best;
    }
    if (delay > 70) {
      delay -= 4;
      clearInterval(timer);
      timer = setInterval(step, delay);
    }
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function gameOver() {
  running = false;
  clearInterval(timer);
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "bold 32px 'Microsoft JhengHei', sans-serif";
  ctx.fillText("遊戲結束", canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = "18px 'Microsoft JhengHei', sans-serif";
  ctx.fillText(`得分 ${score}.按「重新開始」再玩一次`, canvas.width / 2, canvas.height / 2 + 24);
}

function draw() {
  ctx.fillStyle = cssVar("--bg-alt");
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 食物
  ctx.fillStyle = "#e53e3e";
  ctx.beginPath();
  ctx.arc(
    food.x * CELL + CELL / 2,
    food.y * CELL + CELL / 2,
    CELL / 2 - 2, 0, Math.PI * 2
  );
  ctx.fill();

  // 蛇(頭部顏色較深)
  const accent = cssVar("--accent");
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? cssVar("--accent-hover") : accent;
    ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
  });
}

function setDir(x, y) {
  if (!running) return;
  if (x === -dir.x && y === -dir.y) return; // 不能直接回頭
  nextDir = { x, y };
}

// 鍵盤操作
document.addEventListener("keydown", (e) => {
  const map = {
    ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
  };
  const d = map[e.key];
  if (d) {
    if (e.key.startsWith("Arrow")) e.preventDefault();
    setDir(d[0], d[1]);
  }
});

// 手機滑動操作
let touchStart = null;
canvas.addEventListener("touchstart", (e) => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});
canvas.addEventListener("touchend", (e) => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
  if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
  else setDir(0, dy > 0 ? 1 : -1);
});

startBtn.addEventListener("click", start);

// 初始畫面
snake = [{ x: 10, y: 10 }];
food = { x: 14, y: 10 };
draw();
