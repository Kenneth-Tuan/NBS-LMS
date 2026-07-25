## ADDED Requirements

### Requirement: Department-Based Passing Score
系統 SHALL 依學生所屬科別決定該生的及格分數門檻。道學碩士（`master_of_divinity`）與基督教研究碩士（`master_of_christian_studies`）的門檻為 70 分，其餘科別為 60 分。

#### Scenario: 碩士科別學生
- **WHEN** 查詢科別為 `master_of_divinity` 或 `master_of_christian_studies` 的及格門檻
- **THEN** 回傳 70

#### Scenario: 其他科別學生
- **WHEN** 查詢科別為 `bachelor_of_theology`、`lay_leadership_program` 或 `pastoral_program` 的及格門檻
- **THEN** 回傳 60

#### Scenario: 查無科別
- **WHEN** 學生的科別代碼為空字串、`null`、`undefined`，或不存在於對照表中
- **THEN** 回傳預設門檻 60，且不產生錯誤或警告

### Requirement: Preserve Department Code In Transcript Form
成績單的學生表單狀態 SHALL 同時保存科別代碼與科別顯示標籤，代碼供及格門檻查詢使用，標籤供 PDF 顯示使用。

#### Scenario: 初始化找得到的學生
- **WHEN** 初始化學生的成績單表單且該生存在於學生清單中並具有至少一個科別
- **THEN** 表單的 `department` 欄位填入 `user.departments[0]` 的原始代碼
- **AND** 表單的 `major` 欄位填入該代碼對應的中文標籤

#### Scenario: 初始化找不到的學生
- **WHEN** 初始化學生的成績單表單但該生不存在於學生清單中，或其科別清單為空
- **THEN** 表單的 `department` 維持預設空字串
- **AND** 後續的及格判斷套用預設門檻 60

### Requirement: Single Course Evaluation
系統 SHALL 提供單一函式評估一位學生在一門課程的修課狀態、及格與否與實得學分，作為所有成績單顯示與計算的唯一判斷來源。

#### Scenario: 及格
- **WHEN** 學生有修該課程且總分大於 0 且總分大於或等於及格門檻
- **THEN** 評估結果的 `passed` 為 `true`
- **AND** `earnedCredit` 等於該課程的學分數

#### Scenario: 分數等於門檻
- **WHEN** 學生的總分恰好等於及格門檻
- **THEN** 評估結果的 `passed` 為 `true`

#### Scenario: 不及格
- **WHEN** 學生有修該課程且總分大於 0 但小於及格門檻
- **THEN** 評估結果的 `passed` 為 `false`
- **AND** `earnedCredit` 為 0

#### Scenario: 無成績
- **WHEN** 學生有修該課程但總分為 0、`null` 或不存在
- **THEN** 評估結果的 `hasScore` 為 `false`
- **AND** `passed` 為 `false`
- **AND** `earnedCredit` 為 0

#### Scenario: 未修課
- **WHEN** 該學生的 `course_status[courseId]` 為 `false`
- **THEN** 評估結果的 `enrolled` 為 `false`
- **AND** `earnedCredit` 為 0

### Requirement: Transfer Credits Parsing
系統 SHALL 以防禦性方式解析使用者自由輸入的轉入學分，任何無法解析為有限數值的輸入 MUST 視為 0。

#### Scenario: 有效數值
- **WHEN** 轉入學分輸入為 `"3"`
- **THEN** 解析結果為數值 `3`

#### Scenario: 空值或無效輸入
- **WHEN** 轉入學分輸入為空字串、`"-"`、`null`、`undefined` 或任何非數字字串
- **THEN** 解析結果為 `0`，且不產生錯誤

### Requirement: Transcript Summary Aggregation
系統 SHALL 提供單一彙總函式，回傳一位學生所有課程的評估結果與總學分，供 PDF 與 Excel 共用，確保兩者數值一致。

#### Scenario: 彙總總學分
- **WHEN** 對一位學生彙總其選取課程
- **THEN** 所得總學分等於所有課程 `earnedCredit` 的總和加上解析後的轉入學分

#### Scenario: 保留未修課資訊
- **WHEN** 彙總結果被回傳
- **THEN** 課程陣列包含所有選取課程（含 `enrolled` 為 `false` 者），由呼叫端自行決定是否過濾
