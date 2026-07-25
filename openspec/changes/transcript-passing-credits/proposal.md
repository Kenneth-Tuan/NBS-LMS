## Why

目前成績單（PDF 與 Excel）在計算「所得總學分」時，唯一的條件是 `score > 0`，也就是「有沒有成績」，而**不是「及不及格」**。這代表一位總分只有 1 分的學生，仍會取得該門課的全額學分，成績單上的總學分是錯的。

同時，及格門檻在本校並非單一數值：道學碩士與基督教研究碩士為 **70 分**，其餘科別為 **60 分**。系統目前完全沒有及格分數的概念（`src/` 底下沒有任何 `pass_score` / 及格門檻相關的常數或 API 欄位）。

另外，「轉入學分」目前只是 PDF 上的一個獨立顯示欄位，並未納入總學分，導致總學分未反映學生實際持有的學分數。

最後，`score > 0` 這條規則重複實作在三個地方（PDF 預覽、Excel 匯出、預覽表格的儲存格），任一處修改都可能造成 PDF 與 Excel 的總學分不一致。

## What Changes

- 新增科別對應及格分數的常數對照表，並定義查無科別時的預設門檻（60 分）。
- 在 `studentPdfForms` 的表單狀態中新增 `department` 欄位（保存科別代碼），與現有的 `major`（中文顯示標籤）同源但用途不同。
- 將學分判斷邏輯由「有成績」改為「及格」：`score >= 該生科別的及格分數` 才計入學分。
- 不及格與無成績的課程**仍列在成績單上**，但 PDF 的「學分」欄顯示 `0`（欄位語意由「課程學分」改為「實得學分」）。PDF 版面不變。
- 將「轉入學分」納入「所得總學分」的計算；轉入學分欄位本身在 PDF 上維持獨立顯示。
- 把重複的三處判斷邏輯收斂為 `useCreateTranscript.js` 匯出的純函式，作為唯一的判斷來源。

## Capabilities

### New Capabilities

- `transcript-credit-calculation`: 集中處理成績單的及格判斷與學分計算，包含科別門檻查詢、單門課程評估、以及總學分彙總（含轉入學分）。

### Modified Capabilities

- `transcript-pdf`: 個人成績單 PDF 的學分欄位與總學分改為採用及格判斷結果。
- `transcript-excel-export`: Excel 匯出的所得總學分改為採用及格判斷結果，與 PDF 保持一致。

## Non-Goals

以下明確不在本次範圍內，避免範圍膨脹：

- **不處理多科別並存**。`user.departments` 雖為陣列，本次沿用既有行為只取 `[0]`。
- **不擋下查無科別的學生**，一律套用預設 60 分，不顯示警告。
- **不動 PDF 版面**。`useTranscriptPdf.js` 中被註解的「備註」欄位維持註解狀態，不用來標示「不及格」。
- **不在預覽表格加上不及格的視覺標示**（紅字、Tag 等）。
- 不新增及格門檻的後端欄位或管理介面；門檻先以前端常數維護。

## Impact

- `src/constant/common.constant.js`: 新增 `DEPARTMENT_PASS_SCORE_MAP` 與 `DEFAULT_PASS_SCORE`。
- `src/composables/useCreateTranscript.js`: 新增並匯出純函式 `getPassScore` / `evaluateCourse` / `parseTransferCredits` / `buildTranscriptSummary`；`exportToExcel` 改為消費這些函式。
- `src/views/Courses/Transcript.vue`: `createDefaultPdfForm` 新增 `department`；`initAllStudentPdfForms` 填入科別代碼；`handlePreviewPdf` 與 `transcriptColumns` 的 `customRender` 改為消費共用函式。
- `src/composables/useTranscriptPdf.js`: **不需修改**（版面與繪製邏輯不變，僅傳入的 `credits` / `totalCredits` 數值來源改變）。
