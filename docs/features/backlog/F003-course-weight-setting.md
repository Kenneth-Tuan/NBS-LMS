# F003 - 課程權重設定

**狀態:** 待開發  
**優先級:** 中  
**預計完成日期:** YYYY-MM-DD  
**負責人:** TBD

## 1. 功能概述

課程權重設定功能允許教師和管理員為課程中的不同評分項目（如作業、考試、出勤等）設定權重比例，系統將根據設定的權重計算學生的最終成績。此功能提供靈活的評分策略，確保成績評定公平、透明，並反映不同評量方式的重要性。

## 2. 需求規格

### 2.1 功能需求

- 支持多種評分項目設定（如作業、小考、期中考、期末考、出勤等）
- 可設置每個評分項目的權重百分比
- 權重總和必須為 100%
- 可針對不同課程設置不同的權重方案
- 支持權重模板的保存和重用
- 提供權重調整歷史記錄
- 可視化權重分配
- 根據權重自動計算最終成績
- 學生可查看課程權重設定

### 2.2 相關需求文檔

- [TODO.md](./TODO.md) - "課程的權重設定"
- [Cource_Spec.md](../../specs/Cource_Spec.md) - 課程規格說明

## 3. 使用者故事

**作為** 教師，  
**我希望** 能夠為我的課程設置不同評分項目的權重，  
**以便** 根據課程特性制定合適的評分策略。

**作為** 教師，  
**我希望** 能夠保存常用的權重設定為模板，  
**以便** 在不同班級或學期間快速套用相同的評分標準。

**作為** 管理員，  
**我希望** 能夠查看和管理所有課程的權重設定，  
**以便** 確保評分標準的一致性和合理性。

**作為** 學生，  
**我希望** 能夠清楚地了解課程的評分權重，  
**以便** 合理分配學習時間和關注重點。

## 4. 流程設計

### 4.1 業務流程

#### 建立課程權重流程

1. 教師/管理員進入課程管理頁面
2. 選擇特定課程的「權重設定」功能
3. 系統顯示權重設定表單
4. 用戶添加評分項目並設置百分比
5. 系統驗證權重總和是否為 100%
6. 用戶確認並保存權重設定
7. 系統更新課程權重信息

#### 套用權重模板流程

1. 用戶點選「套用模板」
2. 系統顯示可用的權重模板
3. 用戶選擇模板
4. 系統自動填入模板的權重設定
5. 用戶可進行必要的調整
6. 用戶確認並保存

### 4.2 使用流程

#### 教師使用流程

1. 教師登入系統
2. 導航至課程管理頁面
3. 選擇需要設定權重的課程
4. 進入「權重設定」部分
5. 設置各評分項目及其權重
6. 保存設置並選擇性創建模板
7. 查看權重視覺化呈現

#### 學生使用流程

1. 學生登入系統
2. 查看已選課程列表
3. 選擇特定課程
4. 查看課程評分權重區塊
5. 了解各項目在最終成績中的比重

### 4.3 狀態轉換

權重設定狀態：

- 草稿 -> 已發布
- 已發布 -> 已修改
- 已發布/已修改 -> 已封存（學期結束）

## 5. 技術設計

### 5.1 架構設計

- 前端：Vue.js + Ant Design Vue 組件庫，使用可視化圖表庫（如 ECharts）
- 後端：Appwrite 服務
- 資料存儲：Appwrite Database

### 5.2 數據模型

```javascript
// 課程權重模型
{
  id: String,              // 唯一識別碼
  courseId: String,        // 關聯課程ID
  creatorId: String,       // 創建者ID
  createdAt: Timestamp,    // 創建時間
  updatedAt: Timestamp,    // 更新時間
  status: Enum,            // 狀態：DRAFT, PUBLISHED, ARCHIVED
  weightItems: [           // 權重項目列表
    {
      id: String,          // 項目ID
      name: String,        // 項目名稱（如「期中考」）
      description: String, // 項目描述
      percentage: Number,  // 百分比（0-100）
      evaluationType: Enum // 評估類型：ASSIGNMENT, QUIZ, MIDTERM, FINAL, ATTENDANCE, OTHER
    }
  ],
  versionNumber: Number,   // 版本號
  previousVersionId: String, // 前一版本ID（用於歷史追踪）
  isTemplate: Boolean,     // 是否為模板
  templateName: String     // 模板名稱（如果是模板）
}

// 課程模型擴展（部分字段）
{
  // 現有課程字段...
  activeWeightSettingId: String, // 當前啟用的權重設定ID
  weightSettingHistory: Array     // 權重設定歷史記錄ID列表
}
```

### 5.3 API 設計

#### 5.3.1 API 端點

| 方法   | 路徑                                             | 描述             | 參數                   | 返回值       |
| ------ | ------------------------------------------------ | ---------------- | ---------------------- | ------------ |
| GET    | `/api/courses/:courseId/weight-settings`         | 獲取課程權重設定 | courseId               | 權重設定詳情 |
| POST   | `/api/courses/:courseId/weight-settings`         | 創建課程權重設定 | courseId, 權重數據     | 創建結果     |
| PUT    | `/api/courses/:courseId/weight-settings/:id`     | 更新權重設定     | courseId, id, 更新數據 | 更新結果     |
| DELETE | `/api/courses/:courseId/weight-settings/:id`     | 刪除權重設定     | courseId, id           | 刪除結果     |
| GET    | `/api/weight-templates`                          | 獲取權重模板列表 | creatorId              | 模板列表     |
| POST   | `/api/weight-templates`                          | 創建權重模板     | 模板數據               | 創建結果     |
| GET    | `/api/courses/:courseId/weight-settings/history` | 獲取權重設定歷史 | courseId               | 歷史記錄     |

#### 5.3.2 數據流

1. 教師創建/更新課程權重設定
2. 數據保存到 Appwrite 數據庫
3. 系統更新課程模型中的權重設定引用
4. 學生查詢課程時，加載關聯的權重設定
5. 系統根據權重設定和學生成績計算最終分數

### 5.4 依賴關係

- 依賴課程管理模塊
- 依賴用戶權限系統
- 依賴成績管理系統（用於最終成績計算）

## 6. UI/UX 設計

### 6.1 頁面設計

#### 主要頁面：

1. 課程權重設定頁面（教師視角）
2. 權重模板管理頁面
3. 權重設定歷史記錄頁面
4. 課程權重顯示頁面（學生視角）

### 6.2 交互設計

#### 權重設定頁面：

- 評分項目添加/刪除按鈕
- 權重百分比滑塊/輸入框
- 即時總計顯示（確保總和為 100%）
- 權重視覺化圖表（如餅圖）
- 保存為模板選項
- 套用模板按鈕

#### 模板管理頁面：

- 模板列表
- 預覽模板內容功能
- 編輯/刪除模板操作

### 6.3 頁面元素

#### 權重設定表單元素：

- 評分項目輸入欄
- 百分比調整控件
- 項目描述文本區域
- 總計百分比顯示
- 權重分配視覺化圖表

## 7. 測試計劃

### 7.1 測試策略

- 功能測試：確保權重設定正確保存和應用
- 邏輯測試：確保權重總和驗證有效
- 權限測試：確保只有授權用戶能修改權重
- 整合測試：確保權重設定與成績計算正確整合
- 用戶體驗測試：測試交互流程的易用性

### 7.2 測試案例

| 測試 ID | 測試描述     | 測試步驟                                          | 期望結果                 | 前置條件           |
| ------- | ------------ | ------------------------------------------------- | ------------------------ | ------------------ |
| TC001   | 創建權重設定 | 1. 添加多個評分項目<br>2. 設置權重<br>3. 保存設定 | 成功保存且顯示視覺化結果 | 課程已創建         |
| TC002   | 權重總和驗證 | 設置權重總和不為 100%                             | 顯示錯誤提示，阻止保存   | 權重設定表單開啟   |
| TC003   | 套用權重模板 | 選擇已有模板並套用                                | 表單自動填入模板數據     | 已有模板存在       |
| TC004   | 權重計算     | 根據權重和個別成績計算最終分數                    | 計算結果符合預期         | 已有權重設定和成績 |

## 8. 開發計劃

### 8.1 工作拆分

| 任務             | 估算時間 | 負責人 |
| ---------------- | -------- | ------ |
| 數據模型設計     | 1 天     | TBD    |
| API 開發         | 2 天     | TBD    |
| 權重設定 UI 開發 | 2 天     | TBD    |
| 視覺化圖表整合   | 1 天     | TBD    |
| 模板功能開發     | 1 天     | TBD    |
| 權重計算邏輯     | 1 天     | TBD    |
| 測試與修復       | 2 天     | TBD    |

### 8.2 里程碑

| 日期       | 里程碑               |
| ---------- | -------------------- |
| YYYY-MM-DD | 完成基本權重設定功能 |
| YYYY-MM-DD | 完成模板和視覺化功能 |
| YYYY-MM-DD | 完成與成績計算的整合 |

## 9. 狀態追蹤

### 9.1 開發進度

待開始

### 9.2 問題記錄

| 日期 | 問題描述 | 狀態 | 解決方案 |
| ---- | -------- | ---- | -------- |
| -    | -        | -    | -        |

## 10. 備註

- 考慮增加權重設定變更通知功能
- 探索多階層權重設定的可能性（如作業類別再細分）
- 考慮提供學期間權重調整的政策和限制
