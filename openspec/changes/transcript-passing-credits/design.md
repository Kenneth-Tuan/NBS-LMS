## Context

成績單的資料來源是 `scoreApi.getScoreSheet(courseId)`，`useCreateTranscript.generateTranscript()` 會把每門課 `score_items` 中 `name === "總分"` 的分數彙整成 `selectedCoursesTranscript`：

```
{
  student_id,
  student_name,
  course_status: { [courseId]: boolean },   // 是否有修這門課
  [courseId]: number,                        // 該門課的總分
}
```

科別資訊則來自另一條路徑：`fetchAllStudents()` 取得 active 學生清單，`initAllStudentPdfForms()` 依 `student_id` 比對後填入 `studentPdfForms[studentId]`。

## Goals / Non-Goals

**Goals**

- 及格判斷成為學分計算的唯一依據，且門檻依科別而異。
- PDF 與 Excel 的總學分永遠一致（同一個計算函式）。
- 及格門檻未來要改成後端回傳或課程層級設定時，只有一個地方要動。

**Non-Goals**

- 多科別、查無科別的阻擋、PDF 版面調整、表格視覺標示 — 見 `proposal.md` 的 Non-Goals。

## Key Decision 1：科別代碼必須獨立保存

目前 `initAllStudentPdfForms()` 只保留中文標籤，科別代碼被丟棄：

```js
form.major = DEPARTMENTS_LABEL_MAP[user.departments[0]] || user.departments[0];
//           ^^^^^^^^^^^^^^^^^^^^^ key 在此消失
```

`exportToExcel(studentPdfForms)` 拿到的也只有這個 `form`，因此兩條路徑都無法查詢門檻。

**採用**：`form` 新增 `department` 欄位保存原始代碼，`major` 維持中文標籤供 PDF 顯示。

**否決**：建立 label → key 的反查表。以中文字串當查詢鍵，只要 `DEPARTMENTS_LABEL_MAP` 的文案調整就會靜默失效。

```
user.departments[0]
    │
    ├──▶ form.department = "master_of_divinity"   （計算用，新增）
    └──▶ form.major      = "道學碩士"              （顯示用，現有）
```

`createDefaultPdfForm()` 的 `department` 預設為 `""`；查無學生（例如已畢業、停用但仍在成績表中的學生）時維持 `""`，由 `getPassScore` 回退到預設 60。

## Key Decision 2：門檻對照表放在 `common.constant.js`

及格門檻與 `DEPARTMENT_OPTIONS`、`DEPARTMENTS_LABEL_MAP` 是同一組領域知識，放在一起可確保新增科別時三張表一起被看到，降低漏改的機率。

```js
const DEFAULT_PASS_SCORE = 60;

const DEPARTMENT_PASS_SCORE_MAP = Object.freeze({
  master_of_divinity:          70,
  master_of_christian_studies: 70,
  bachelor_of_theology:        60,
  lay_leadership_program:      60,
  pastoral_program:            60,
});
```

即使 60 分的科別與預設值相同，仍**明列**於表中：讓「這個科別的門檻是刻意的 60」與「查不到所以退回 60」在程式碼上可區分，日後調整才不會誤判。

**及格判定使用 `>=`**：門檻 70 分的學生考 70 分算及格。

## Key Decision 3：學分欄語意改為「實得學分」

不及格與無成績的課程都會列在成績單上，但「學分」欄一律顯示 `earnedCredit`：

| 情境 | 分數欄 | 學分欄 | 計入總學分 |
|---|---|---|---|
| 及格（`score >= passScore`） | 實際分數 | 課程學分 | ✅ |
| 不及格（`0 < score < passScore`） | 實際分數 | `0` | ❌ |
| 無成績（`score` 為 0/null/undefined） | `---` | `0` | ❌ |
| 未修課（`course_status === false`） | 不列入 PDF | — | ❌ |

**採用**：不及格與無成績一律 `0`。學分欄語意單一，欄位加總永遠等於總學分。

**否決**：只有不及格歸 0、無成績仍顯示課程學分。這會讓學分欄同時承載「課程權重」與「實得學分」兩種語意，日後難以維護。

代價是成績單上看不到未及格課程原本的學分權重 — 已確認可接受。

## Key Decision 4：轉入學分納入總學分

```
totalCredits = Σ earnedCredit  +  transferCredits
```

「轉入學分」欄位在 PDF 上**仍獨立顯示**，供閱讀者對照；總學分則包含它。

`form.transferCredits` 是自由輸入的 `AInput`（預設字串 `"0"`），實際值可能是 `""`、`"-"`、非數字字串。因此需要防禦性解析：

```js
parseTransferCredits(value) → Number.isFinite(n) ? n : 0
```

- `"3"` → `3`
- `""` → `0`（`Number("")` 為 0）
- `"-"` / `"abc"` → `NaN` → `0`

Excel 的「轉入學分」欄位維持現有顯示規則（`"-"` 視為空字串），僅「所得總學分」改為包含轉入學分。

## Key Decision 5：收斂的分層

三個消費端的需求不同 — 表格是「單一儲存格」，PDF 與 Excel 是「整份彙總」— 因此拆成兩層：

```
  common.constant.js
    DEPARTMENT_PASS_SCORE_MAP / DEFAULT_PASS_SCORE
              │
              ▼
  useCreateTranscript.js（純函式，named export）
  ┌────────────────────────────────────────────────┐
  │  getPassScore(department) → number              │
  │                                                 │
  │  evaluateCourse(student, courseDef, passScore)  │  ← 單門課，唯一判斷點
  │    → { courseId, name, credit, score,           │
  │        enrolled, hasScore, passed,              │
  │        earnedCredit }                           │
  │                                                 │
  │  parseTransferCredits(value) → number           │
  │                                                 │
  │  buildTranscriptSummary(student, courseDefs,    │  ← 彙總，內部呼叫 evaluateCourse
  │                         form)                   │
  │    → { courses[], earnedCredits,                │
  │        transferCredits, totalCredits }          │
  └───┬──────────────┬───────────────────┬──────────┘
      │              │                   │
      ▼              ▼                   ▼
  handlePreviewPdf  exportToExcel   transcriptColumns
   （彙總）          （彙總）         customRender（單格）
```

`buildTranscriptSummary` 回傳的 `courses` 陣列**包含所有課程**（含 `enrolled === false` 者），由各消費端自行過濾。這是刻意保留現有的行為差異：

- PDF 過濾掉未修課的課程（不列在課表中）。
- Excel **不過濾**，未修課的欄位顯示 `"-"`（維持現況）。
- 表格顯示 `"未修課"`。

## Risks / Trade-offs

- **門檻寫死在前端**：科別調整或校方改變及格標準時需要改 code 並重新部署。以目前規模可接受；`getPassScore` 已隔離此查詢，日後換成 API 來源時只需改動該函式。
- **查無科別靜默套用 60**：70 分制的學生若因非 active 狀態而查不到科別，會以較寬鬆的門檻計算，且沒有任何提示。已確認接受此風險。此情境的成因是 `fetchAllStudents()` 以 `status: "active"` 篩選，而 `generateTranscript()` 的學生來自成績表、不篩狀態。

## 附帶修正

現有 `transcriptColumns` 的 `customRender`（`Transcript.vue`）有一處判斷缺陷：

```js
if (record.course_status[courseId] === true && record[courseId] <= 0) {
  return "-";
}
return text;
```

當學生有修課但完全沒有成績時，`record[courseId]` 為 `undefined`，`undefined <= 0` 為 `false`，會落到 `return text` 而回傳 `undefined`，儲存格呈現**空白**而非預期的 `"-"`。改用 `evaluateCourse` 的 `hasScore` 判斷後此缺陷自然消除，不需額外處理。
