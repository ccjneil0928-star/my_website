# my_website — 個人網頁專案

## 專案概況
- 靜態個人網頁(純 HTML/CSS/JS,無框架、無建置工具)
- 擁有者:Neil Chen(neilcj_chen@foxlinkimage.com)
- 語言:回覆請使用繁體中文

## 檔案結構
- `index.html` — 單頁式網頁:主視覺、關於我、技能、作品、聯絡五個區塊
- `family.html` — 家庭專區:四位成員卡片(爸爸、媽媽、姐姐、弟弟)
- `plan-sister.html` — 姐姐(高三)學測讀書計畫,2026 年 7~12 月;月曆式計畫外,還會列出 Excel 裡所有「非月份」工作表(教材核對表、各科單元進度表等),各自可收合、可關鍵字搜尋
- `plan-brother.html` — 弟弟(國三)暑假讀書計畫,2026 年 7~8 月
- `games.html` — 小遊戲專區首頁;四款遊戲:`game-memory.html`(記憶翻牌)、`game-snake.html`(貪吃蛇)、`game-2048.html`(2048)、`game-tictactoe.html`(井字棋),邏輯分別在 `js/game-*.js`,支援鍵盤與觸控,最佳紀錄存 localStorage
- `js/theme.js` — 深淺色主題切換,家庭專區/計畫頁/遊戲頁共用(index.html 用的是 script.js 內建的版本)
- `css/style.css` — 樣式,使用 CSS 變數支援深淺色主題(`[data-theme="dark"]`)
- `js/script.js` — index.html 的互動效果:粒子背景(canvas)、打字機效果、深色模式切換(localStorage)、捲動淡入(IntersectionObserver)、捲動進度條
- `js/plan.js` — 計畫頁共用:主題切換、計畫表格渲染(月份切換、欄位篩選、搜尋、今日標示)
- `js/plan-data.js` — 由 `gen_plan_data.py` 自動產生的計畫資料,勿手動編輯
- `gen_plan_data.py` — 讀取專案根目錄的兩份讀書計畫 Excel,產生 `js/plan-data.js`;Excel 更新後執行 `py gen_plan_data.py` 重新產生。工作表名稱含「月」歸類為 `months`(月曆式),其餘全部歸類為 `extras`(各科單元進度表等,依 Excel 內順序全部保留)
- 來源 Excel(`*.xlsx`)已列入 `.gitignore`,只存在本機,不上傳公開 repo

## 部署狀態(2026-07-07 完成)
- GitHub repo:https://github.com/ccjneil0928-star/my_website(帳號 ccjneil0928-star)
- 已開啟 GitHub Pages:Deploy from a branch,`main` / `(root)`
- 正式網址:https://ccjneil0928-star.github.io/my_website/
- 更新流程:`git add .` → `git commit -m "..."` → `git push`,push 後 GitHub 自動重新部署(1-2 分鐘)

## 待補內容(佔位文字)
- 「關於我」的自我介紹
- 三張作品卡片的實際專案內容

## 環境備註
- Windows 11,終端機為 PowerShell
- Python 用 `py` 指令(官方版 3.12);`python` 指令會指到 MSYS2 的舊版,不要用
- Node.js v24 / npm 11 可用
- 使用者偏好自己在終端機執行指令,給指令即可,不要代為執行
