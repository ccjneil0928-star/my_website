# 將兩份讀書計畫 Excel 轉成 js/plan-data.js,供計畫頁面讀取
# 用法:py gen_plan_data.py(Excel 更新後重跑一次即可)
import json
import re

import openpyxl


def clean(v):
    return "" if v is None else str(v).strip()


def load_plan(path):
    """回傳 (months, extra):月份工作表清單與非月份工作表(如教材核對表)"""
    wb = openpyxl.load_workbook(path, data_only=True)
    months = []
    extra = None
    for ws in wb.worksheets:
        title = ws.title.strip()
        rows = []
        for row in ws.iter_rows():
            cells = [clean(c.value) for c in row]
            if any(cells):
                rows.append(cells)
        if len(rows) < 2:
            continue
        header = rows[0]
        ncol = len(header)
        while ncol > 0 and not header[ncol - 1]:
            ncol -= 1
        # 去掉標題裡的圖片檔名註記,如「國文進度 (弟弟_國文.jpg)」
        header = [re.sub(r"\s*\([^()]*\.jpg\)", "", h) for h in header[:ncol]]
        data = [(r + [""] * ncol)[:ncol] for r in rows[1:]]
        sheet = {"name": title, "headers": header, "rows": data}
        if "月" in title:
            months.append(sheet)
        else:
            extra = sheet
    return months, extra


brother_months, _ = load_plan("弟弟暑假讀書計畫.xlsx")
sister_months, sister_extra = load_plan("姐姐暑假讀書計畫_L版.xlsx")

plans = {
    "brother": {
        "title": "弟弟的國三暑假讀書計畫",
        "period": "2026 年 7 月~8 月",
        "months": brother_months,
    },
    "sister": {
        "title": "姐姐的高三學測讀書計畫",
        "period": "2026 年 7 月~12 月",
        "months": sister_months,
        "materials": sister_extra,
    },
}

with open("js/plan-data.js", "w", encoding="utf-8") as f:
    f.write("// 此檔由 gen_plan_data.py 自動產生,請勿手動編輯\n")
    f.write("window.PLANS = ")
    f.write(json.dumps(plans, ensure_ascii=False))
    f.write(";\n")

for key, p in plans.items():
    total = sum(len(m["rows"]) for m in p["months"])
    print(f"{key}: {len(p['months'])} 個月份工作表,共 {total} 列")
print("已寫入 js/plan-data.js")
