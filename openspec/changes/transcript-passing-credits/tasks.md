## 1. 常數層：及格門檻對照表

- [x] 1.1 在 `src/constant/common.constant.js` 新增 `DEFAULT_PASS_SCORE = 60`，並新增 `DEPARTMENT_PASS_SCORE_MAP`（`master_of_divinity` 與 `master_of_christian_studies` 為 70，其餘三個科別明列為 60），一併加入 `export`。

## 2. 邏輯層：收斂為共用純函式

於 `src/composables/useCreateTranscript.js` 以 named export 新增下列純函式（置於 `useCreateTranscript` 之外，使 `Transcript.vue` 可直接引用而不需建立 composable 實例）：

- [x] 2.1 `getPassScore(department)`：查 `DEPARTMENT_PASS_SCORE_MAP`，查無則回傳 `DEFAULT_PASS_SCORE`。
- [x] 2.2 `parseTransferCredits(value)`：`Number(...)` 後以 `Number.isFinite` 檢查，非有限數值回傳 `0`。
- [x] 2.3 `evaluateCourse(student, course, passScore)`：回傳 `{ id, name, credit, score, enrolled, hasScore, passed, earnedCredit }`。`enrolled` 取自 `course_status`；`hasScore` 為 `score > 0`；`passed` 為 `enrolled && hasScore && score >= passScore`；`earnedCredit` 為 `passed ? credit : 0`。
  - **實作調整**：簽章由 `(student, courseDef, passScore)` 改為 `(student, course, passScore)`，`course` 為正規化的 `{ id, name, credit }`。原因是三個呼叫端拿到的課程物件形狀不同（Excel 已自行 map 成 `{id,name,credit}`，PDF／表格持有原始 `course_id`），且三者對「找不到課程定義」的 fallback 命名各異（Excel 退回 id、表格退回「未知課程」、PDF 直接略過）。由呼叫端負責正規化可完整保留各自既有行為。
- [x] 2.4 `buildTranscriptSummary(student, courseList, form)`：對每門課呼叫 `evaluateCourse`，回傳 `{ passScore, courses, earnedCredits, transferCredits, totalCredits }`。`courses` **包含未修課的課程**（帶 `enrolled: false`）；`totalCredits = earnedCredits + transferCredits`。

## 3. 表單狀態：保存科別代碼

- [x] 3.1 修改 `src/views/Courses/Transcript.vue` 的 `createDefaultPdfForm()`，新增 `department: ""`。
- [x] 3.2 修改 `initAllStudentPdfForms()`，在填入 `form.major` 的同時填入 `form.department = user.departments[0]`（原始代碼，不做 label 轉換）。

## 4. 消費端：三處改用共用函式

- [x] 4.1 `Transcript.vue` 的 `handlePreviewPdf()`：改用 `buildTranscriptSummary`，過濾 `enrolled === true` 後組出 `courses` 陣列，其中 `credits` 使用 `String(earnedCredit)`、`score` 使用 `hasScore ? String(score) : "---"`；`totalCredits` 使用彙總結果。移除原本的 `calculatedTotalCredits` 迴圈。
- [x] 4.2 `useCreateTranscript.js` 的 `exportToExcel()`：改用 `buildTranscriptSummary` 產生「所得總學分」；各課程欄位維持現有顯示規則（不過濾未修課，無成績顯示 `-`）；「轉入學分」欄位顯示規則不變。
- [x] 4.3 `Transcript.vue` 的 `transcriptColumns` `customRender`：改用 `evaluateCourse`，依 `enrolled` 回傳 `"未修課"`、依 `hasScore` 回傳 `"-"`，否則回傳分數。此改動同時修正原本「有修課但無成績時回傳 `undefined` 導致儲存格空白」的缺陷。
- [x] 4.4 確認 `src/composables/useTranscriptPdf.js` **未被修改**，PDF 版面與繪製欄位維持原狀。（`git status` 確認不在異動清單中）

## 5. 驗證

- [ ] 5.1 造出道學碩士（門檻 70）學生資料，確認 65 分的課程不計學分、學分欄顯示 `0`、課程仍列於 PDF 上；70 分的課程計入學分。
- [ ] 5.2 造出神學學士（門檻 60）學生資料，確認同樣 65 分的課程**計入**學分，驗證門檻確實隨科別變動。
- [ ] 5.3 驗證無科別的學生（不在 active 學生清單中）套用 60 分門檻且不報錯。
- [ ] 5.4 驗證轉入學分：分別輸入 `"3"`、`""`、`"-"`、`"abc"`，確認總學分分別為「及格學分 + 3 / +0 / +0 / +0」，且 PDF 上轉入學分欄位仍獨立顯示。
- [ ] 5.5 對同一位學生同時產生 PDF 與匯出 Excel，逐一比對「所得總學分」數值完全一致。
- [ ] 5.6 驗證預覽表格：未修課顯示 `"未修課"`、有修課但無成績顯示 `"-"`（非空白）、有成績顯示分數。
