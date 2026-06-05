## Why

根據 TODO.md 的需求，目前系統缺乏請假單的完整自動化流程。學生需自行下載、填寫、請老師簽名後再交給教務處。為了提升效率並數位化，我們需要實作學生在系統填寫假單、系統自動套印制式表單，並整合線上審核流程，最終產生完整的 PDF 檔案。

## What Changes

- 新增制式請假單（.doc）的 PDF 範本並整合至系統。
- 擴充目前的請假申請表單（LeaveApplication.vue），加入產生假單所需的必要欄位（如請假節數等，視後端支援情況而定）。
- 實作請假單 PDF 的產生與套印邏輯（使用 pdf-lib），將學生填寫的資料與老師審核的結果套印在 PDF 上。
- 在申請紀錄中加入下載審核完畢假單的功能，讓學生能下載並自行轉交給教務處。

## Capabilities

### New Capabilities

- `leave-application-pdf`: 處理請假單的 PDF 範本載入、欄位對位與套印功能，並支援預覽與下載。

### Modified Capabilities

- `leave-application-form`: 擴充請假申請表單，包含所需欄位與相關 API 串接。
- `application-record`: 擴充申請紀錄列表，支援下載審核通過的請假單 PDF。

## Impact

- `src/views/Applications/LeaveApplication.vue`: 表單欄位調整。
- `src/stores/application.js`: 儲存新欄位與狀態。
- `src/schemas/leaveApplication.schema.js`: 表單驗證與欄位定義。
- `src/views/Applications/components/ApplicationList.vue`: 增加下載假單按鈕。
- 新增 PDF config 與 composable (仿照成績單功能)。
