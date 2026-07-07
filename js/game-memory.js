// ===== 記憶翻牌 =====
const EMOJIS = ["🐶", "🐱", "🦊", "🐼", "🐸", "🦁", "🐵", "🐰"];
const board = document.getElementById("board");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");

let deck, first, lock, matched, moves, seconds, timer;
let best = Number(localStorage.getItem("memoryBest") || 0);

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function newGame() {
  deck = shuffle([...EMOJIS, ...EMOJIS]);
  first = null;
  lock = false;
  matched = 0;
  moves = 0;
  seconds = 0;
  clearInterval(timer);
  timer = null;
  movesEl.textContent = "0";
  timeEl.textContent = "0";
  bestEl.textContent = best || "—";
  statusEl.textContent = "";

  board.innerHTML = "";
  deck.forEach((emoji, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.emoji = emoji;
    b.addEventListener("click", () => flip(b));
    board.appendChild(b);
  });
}

function flip(card) {
  if (lock || card.classList.contains("open") || card.classList.contains("matched")) return;

  // 第一次翻牌才開始計時
  if (!timer) {
    timer = setInterval(() => {
      seconds++;
      timeEl.textContent = seconds;
    }, 1000);
  }

  card.classList.add("open");
  card.textContent = card.dataset.emoji;

  if (!first) {
    first = card;
    return;
  }

  moves++;
  movesEl.textContent = moves;

  if (first.dataset.emoji === card.dataset.emoji) {
    first.classList.replace("open", "matched");
    card.classList.replace("open", "matched");
    first = null;
    matched++;
    if (matched === EMOJIS.length) win();
  } else {
    lock = true;
    const a = first;
    first = null;
    setTimeout(() => {
      a.classList.remove("open");
      a.textContent = "";
      card.classList.remove("open");
      card.textContent = "";
      lock = false;
    }, 800);
  }
}

function win() {
  clearInterval(timer);
  let msg = `🎉 完成!用了 ${moves} 步、${seconds} 秒`;
  if (!best || moves < best) {
    best = moves;
    localStorage.setItem("memoryBest", best);
    bestEl.textContent = best;
    msg += ",刷新最佳紀錄!";
  }
  statusEl.textContent = msg;
}

document.getElementById("restart").addEventListener("click", newGame);
newGame();
