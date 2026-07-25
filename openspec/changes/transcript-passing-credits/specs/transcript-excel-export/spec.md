## MODIFIED Requirements

### Requirement: Excel Total Credits Matches PDF
Excel 匯出的「所得總學分」SHALL 使用與 PDF 相同的計算函式，兩者對同一位學生 MUST 產生完全相同的數值。

先前行為：Excel 與 PDF 各自實作 `score > 0` 的判斷邏輯，任一處修改都可能造成兩者不一致。

#### Scenario: 同一學生兩種輸出一致
- **WHEN** 對同一位學生同時產生 PDF 與匯出 Excel
- **THEN** 兩者的所得總學分數值相同

#### Scenario: 僅計入及格課程與轉入學分
- **WHEN** 匯出 Excel
- **THEN** 每位學生的所得總學分等於其及格課程學分總和加上解析後的轉入學分

### Requirement: Excel Course Columns Unchanged
Excel 各課程欄位的顯示規則 SHALL 維持現有行為，本次變更僅影響總學分欄。

#### Scenario: 有成績
- **WHEN** 學生在某課程的總分大於 0
- **THEN** 該課程欄顯示實際分數，不論及格與否

#### Scenario: 無成績或未修課
- **WHEN** 學生在某課程沒有大於 0 的總分
- **THEN** 該課程欄顯示 `-`

#### Scenario: 轉入學分欄
- **WHEN** 匯出 Excel
- **THEN** 「轉入學分」欄維持現有顯示規則（值為 `-` 時顯示為空字串）
