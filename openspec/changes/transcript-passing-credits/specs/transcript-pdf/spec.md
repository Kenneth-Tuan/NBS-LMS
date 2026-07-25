## MODIFIED Requirements

### Requirement: Transcript Credit Column Shows Earned Credits
個人成績單 PDF 的「學分」欄 SHALL 顯示該門課程的**實得學分**，而非課程本身的學分權重。未及格與無成績的課程 MUST 顯示 `0`。

先前行為：學分欄一律顯示課程的學分數，與總學分的加總不符。

#### Scenario: 及格課程
- **WHEN** 產生 PDF 且某門課程及格
- **THEN** 該列的學分欄顯示該課程的學分數
- **AND** 分數欄顯示實際總分

#### Scenario: 不及格課程
- **WHEN** 產生 PDF 且某門課程的總分低於該生科別的及格門檻
- **THEN** 該列仍出現在課程表中
- **AND** 學分欄顯示 `0`
- **AND** 分數欄顯示實際總分

#### Scenario: 無成績課程
- **WHEN** 產生 PDF 且某門課程沒有總分
- **THEN** 該列仍出現在課程表中
- **AND** 學分欄顯示 `0`
- **AND** 分數欄顯示 `---`

#### Scenario: 未修課程
- **WHEN** 學生未修某門選取的課程
- **THEN** 該列不出現在 PDF 的課程表中

### Requirement: Total Credits Reflects Passing And Transfer Credits
個人成績單 PDF 的「所得總學分」SHALL 等於所有及格課程的學分總和加上轉入學分。

先前行為：總學分僅計入總分大於 0 的課程（不論及格與否），且未包含轉入學分。

#### Scenario: 混合及格與不及格
- **WHEN** 學生修習多門課程，部分及格、部分不及格
- **THEN** 總學分僅累加及格課程的學分

#### Scenario: 含轉入學分
- **WHEN** 學生的轉入學分為有效數值
- **THEN** 總學分等於及格課程學分總和加上該轉入學分
- **AND** 轉入學分欄位仍獨立顯示於 PDF 上

#### Scenario: 科別決定門檻
- **WHEN** 兩位學生在同一門課同樣取得 65 分，一位屬道學碩士、一位屬神學學士
- **THEN** 道學碩士學生的該門課不計入總學分
- **AND** 神學學士學生的該門課計入總學分

### Requirement: PDF Layout Unchanged
本次變更 MUST NOT 修改 PDF 的版面配置、欄位座標或繪製欄位的數量。

#### Scenario: 備註欄維持停用
- **WHEN** 產生 PDF
- **THEN** 課程列的「備註」欄維持未繪製狀態，不用於標示不及格
