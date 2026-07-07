// ===== 共用:HTML 跳脫 =====
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ===== 讀書計畫表格(月份切換、欄位篩選、搜尋、今日標示)=====
function renderPlan(rootId, plan) {
  const root = document.getElementById(rootId);
  const today = new Date();
  const todayKey = (today.getMonth() + 1) * 100 + today.getDate();

  // 日期欄格式如「7/1 (三)」或「7/4-7/5」,轉成 月*100+日 比對今天
  function isToday(dateStr) {
    const keys = [...dateStr.matchAll(/(\d{1,2})\/(\d{1,2})/g)].map(
      (m) => Number(m[1]) * 100 + Number(m[2])
    );
    if (keys.length === 0) return false;
    if (keys.length === 1) return keys[0] === todayKey;
    return todayKey >= keys[0] && todayKey <= keys[keys.length - 1];
  }

  function findTodayMonth() {
    return plan.months.findIndex((mo) => mo.rows.some((r) => isToday(r[0])));
  }

  let monthIdx = Math.max(findTodayMonth(), 0);
  let colIdx = -1; // -1 = 顯示全部欄位
  let keyword = "";

  // --- 控制列 ---
  const controls = document.createElement("div");
  controls.className = "plan-controls";

  const tabs = document.createElement("div");
  tabs.className = "month-tabs";
  plan.months.forEach((mo, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = mo.name;
    b.addEventListener("click", () => {
      monthIdx = i;
      render();
    });
    tabs.appendChild(b);
  });

  const select = document.createElement("select");
  select.title = "欄位篩選";
  select.appendChild(new Option("全部欄位", "-1"));
  plan.months[0].headers.forEach((h, i) => {
    if (i > 0) select.appendChild(new Option(h, String(i)));
  });
  select.addEventListener("change", () => {
    colIdx = Number(select.value);
    render();
  });

  const search = document.createElement("input");
  search.type = "search";
  search.placeholder = "搜尋關鍵字,例如:數學";
  search.addEventListener("input", () => {
    keyword = search.value.trim();
    render();
  });

  const todayBtn = document.createElement("button");
  todayBtn.type = "button";
  todayBtn.className = "btn-today";
  todayBtn.textContent = "📍 今天";
  todayBtn.addEventListener("click", () => {
    const i = findTodayMonth();
    if (i < 0) {
      alert("今天不在這份計畫的日期範圍內");
      return;
    }
    monthIdx = i;
    colIdx = -1;
    select.value = "-1";
    keyword = "";
    search.value = "";
    render();
    const row = root.querySelector("tr.today");
    if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  controls.append(tabs, select, search, todayBtn);

  const wrap = document.createElement("div");
  wrap.className = "table-wrap";
  root.append(controls, wrap);

  function render() {
    tabs
      .querySelectorAll("button")
      .forEach((b, i) => b.classList.toggle("active", i === monthIdx));

    const mo = plan.months[monthIdx];
    const cols = colIdx === -1 ? mo.headers.map((_, i) => i) : [0, colIdx];

    let rows = mo.rows;
    if (keyword) {
      const kw = keyword.toLowerCase();
      rows = rows.filter((r) =>
        cols.some((c) => (r[c] || "").toLowerCase().includes(kw))
      );
    }

    if (rows.length === 0) {
      wrap.innerHTML = `<p class="no-result">${esc(
        mo.name
      )}找不到符合「${esc(keyword)}」的進度</p>`;
      return;
    }

    const thead = `<tr>${cols
      .map((c) => `<th>${esc(mo.headers[c])}</th>`)
      .join("")}</tr>`;
    const tbody = rows
      .map((r) => {
        const cls = [];
        if (isToday(r[0])) cls.push("today");
        if (r.some((c) => c.includes("週末休息"))) cls.push("weekend");
        return `<tr class="${cls.join(" ")}">${cols
          .map((c) => `<td>${esc(r[c] || "")}</td>`)
          .join("")}</tr>`;
      })
      .join("");
    wrap.innerHTML = `<table class="plan-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
  }

  render();
}

// ===== 靜態表格(教材核對表)=====
function renderSimpleTable(rootId, table) {
  if (!table) return;
  const root = document.getElementById(rootId);
  const thead = `<tr>${table.headers
    .map((h) => `<th>${esc(h)}</th>`)
    .join("")}</tr>`;
  const tbody = table.rows
    .map(
      (r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`
    )
    .join("");
  root.innerHTML = `<div class="table-wrap"><table class="plan-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
}
