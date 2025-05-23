# F002 - 課堂通知系統

**狀態:** 待開發  
**優先級:** 中  
**預計完成日期:** YYYY-MM-DD  
**負責人:** TBD

## 1. 功能概述

課堂通知系統允許教師和管理員發布與課程相關的通知和重要事項，確保學生及時了解課程變更、作業要求、考試安排等信息。系統支持多種通知類型、優先級設定以及閱讀狀態追蹤，提高學校資訊傳遞效率。

## 2. 需求規格

### 2.1 功能需求

- 支持不同角色發布和接收通知（管理員、教師、學生）
- 通知分類（一般通知、重要通知、緊急通知）
- 通知可設定閱讀期限
- 通知閱讀狀態追蹤
- 通知查詢和過濾功能
- 支持附件上傳
- 可設定通知範圍（全校、特定課程、特定班級、特定學生）
- 提供通知提醒機制
- 通知歷史記錄管理

### 2.2 相關需求文檔

- [TODO.md](./TODO.md) - "通知課堂注意事項"

## 3. 使用者故事

**作為** 教師，  
**我希望** 能夠向我的課堂學生發布重要通知，  
**以便** 及時傳達課程變更和重要事項。

**作為** 教師，  
**我希望** 能夠追蹤學生的通知閱讀狀態，  
**以便** 確認重要資訊已被所有學生接收。

**作為** 管理員，  
**我希望** 能夠發布全校性的通知，  
**以便** 傳達學校重要政策和活動資訊。

**作為** 學生，  
**我希望** 能夠接收所有與我相關的課程通知，  
**以便** 了解課程安排和要求的變更。

**作為** 學生，  
**我希望** 能夠對通知進行分類和過濾，  
**以便** 更有效地管理和回應不同重要程度的通知。

## 4. 流程設計

### 4.1 業務流程

#### 發布通知流程

1. 教師/管理員選擇"發布通知"功能
2. 系統確認用戶權限
3. 用戶選擇通知類型和優先級
4. 用戶選擇通知接收對象範圍
5. 用戶填寫通知內容和附件
6. 用戶設定閱讀期限和提醒選項
7. 系統發布通知並通知接收者

#### 閱讀通知流程

1. 學生登入系統
2. 系統顯示未讀通知數量和提醒
3. 學生點擊查看通知
4. 系統記錄閱讀狀態和時間
5. 學生可對通知進行標記或回復

### 4.2 使用流程

#### 發布者使用流程

1. 登入系統
2. 導航至"通知管理"頁面
3. 創建新通知或管理現有通知
4. 查看通知閱讀統計

#### 接收者使用流程

1. 登入系統
2. 查看"我的通知"區域
3. 過濾和排序通知列表
4. 閱讀通知內容
5. 下載附件（如有）
6. 標記通知或回復

### 4.3 狀態轉換

通知狀態轉換：

- 草稿 -> 已發布
- 已發布 -> 已撤回
- 未讀 -> 已讀
- 已讀 -> 已標記

## 5. 技術設計

### 5.1 架構設計

- 前端：Vue.js + Ant Design Vue 組件庫
- 後端：Appwrite 服務
- 資料存儲：Appwrite Database
- 文件存儲：Appwrite Storage（用於附件）
- 即時通知：考慮整合 WebSocket 或推送通知

### 5.2 數據模型

```javascript
// 通知模型
{
  id: String,           // 唯一識別碼
  title: String,        // 通知標題
  content: String,      // 通知內容
  type: Enum,           // 通知類型：GENERAL, IMPORTANT, URGENT
  creatorId: String,    // 創建者ID
  creatorRole: String,  // 創建者角色
  createdAt: Timestamp, // 創建時間
  expireAt: Timestamp,  // 閱讀期限
  attachments: Array,   // 附件列表
  scope: {              // 通知範圍
    type: Enum,         // 範圍類型：ALL, COURSE, CLASS, STUDENT
    targetIds: Array    // 目標ID列表
  },
  status: Enum          // 狀態：DRAFT, PUBLISHED, RECALLED
}

// 通知閱讀狀態模型
{
  id: String,           // 唯一識別碼
  notificationId: String, // 通知ID
  userId: String,       // 用戶ID
  readAt: Timestamp,    // 閱讀時間
  status: Enum,         // 狀態：UNREAD, READ, MARKED
  response: String      // 用戶回復（可選）
}
```

### 5.3 API 設計

#### 5.3.1 API 端點

| 方法   | 路徑                                 | 描述         | 參數                             | 返回值         |
| ------ | ------------------------------------ | ------------ | -------------------------------- | -------------- |
| GET    | `/api/notifications`                 | 獲取通知列表 | scope, type, status, page, limit | 通知列表、總數 |
| GET    | `/api/notifications/:id`             | 獲取單個通知 | id                               | 通知詳情       |
| POST   | `/api/notifications`                 | 創建通知     | 通知數據                         | 創建結果       |
| PUT    | `/api/notifications/:id`             | 更新通知     | id, 更新數據                     | 更新結果       |
| DELETE | `/api/notifications/:id`             | 撤回通知     | id                               | 撤回結果       |
| POST   | `/api/notifications/:id/attachments` | 上傳附件     | id, 文件                         | 上傳結果       |
| GET    | `/api/notifications/:id/read-status` | 獲取閱讀狀態 | id                               | 閱讀統計       |
| POST   | `/api/notifications/:id/read`        | 標記為已讀   | id, userId                       | 標記結果       |
| POST   | `/api/notifications/:id/response`    | 回復通知     | id, userId, response             | 回復結果       |

#### 5.3.2 數據流

1. 發布者創建通知
2. 通知存儲到數據庫
3. 系統自動生成接收者的閱讀狀態記錄
4. 接收者查詢和閱讀通知
5. 系統更新閱讀狀態
6. 發布者查詢閱讀統計

### 5.4 依賴關係

- 依賴用戶系統（用於權限控制和用戶識別）
- 依賴課程管理系統（用於課程範圍通知）
- 依賴文件存儲系統（用於附件管理）

## 6. UI/UX 設計

### 6.1 頁面設計

#### 主要頁面：

1. 通知管理頁（發布者視角）
2. 新增/編輯通知頁
3. 通知閱讀統計頁
4. 我的通知頁（接收者視角）
5. 通知詳情頁

### 6.2 交互設計

#### 通知管理頁：

- 條件搜索區域
- 通知列表表格（包含標題、類型、發布時間、閱讀狀態統計）
- 每行操作按鈕（編輯、撤回、查看統計）

#### 我的通知頁：

- 標簽分類（全部、未讀、已讀、已標記）
- 通知卡片列表（顯示標題、發布者、時間、優先級標記）
- 未讀通知突出顯示
- 點擊卡片查看詳情

### 6.3 頁面元素

#### 通知卡片元素：

- 通知標題
- 通知類型標籤（顏色區分）
- 發布時間/閱讀期限
- 發布者信息
- 閱讀狀態標記
- 快速操作按鈕

## 7. 測試計劃

### 7.1 測試策略

- 功能測試：確保各項功能正常工作
- 權限測試：確保不同角色的權限控制正確
- 性能測試：測試大量通知情況下的系統表現
- 用戶體驗測試：測試交互流程的順暢度
- 兼容性測試：測試不同設備和瀏覽器的兼容性

### 7.2 測試案例

| 測試 ID | 測試描述         | 測試步驟                                                  | 期望結果                     | 前置條件               |
| ------- | ---------------- | --------------------------------------------------------- | ---------------------------- | ---------------------- |
| TC001   | 教師發布課堂通知 | 1. 以教師身份登入<br>2. 創建通知並選擇課程<br>3. 發布通知 | 通知成功發布給相關學生       | 具有教師權限和相關課程 |
| TC002   | 學生查看通知     | 1. 以學生身份登入<br>2. 查看通知列表<br>3. 點擊通知       | 通知標記為已讀且顯示完整內容 | 有相關通知             |
| TC003   | 附件上傳和下載   | 1. 上傳附件<br>2. 從通知中下載附件                        | 附件上傳和下載成功           | 系統支持文件功能       |
| TC004   | 通知閱讀統計     | 發布通知後查看閱讀統計                                    | 顯示正確的閱讀人數和比例     | 已發布通知且有人閱讀   |

## 8. 開發計劃

### 8.1 工作拆分

| 任務              | 估算時間 | 負責人 |
| ----------------- | -------- | ------ |
| 數據模型設計      | 1 天     | TBD    |
| 通知管理 API 開發 | 2 天     | TBD    |
| 閱讀狀態 API 開發 | 1 天     | TBD    |
| 通知管理前端頁面  | 2 天     | TBD    |
| 我的通知前端頁面  | 2 天     | TBD    |
| 附件上傳與管理    | 1 天     | TBD    |
| 通知統計功能      | 1 天     | TBD    |
| 測試與修復        | 2 天     | TBD    |

### 8.2 里程碑

| 日期       | 里程碑             |
| ---------- | ------------------ |
| YYYY-MM-DD | 完成通知基礎功能   |
| YYYY-MM-DD | 完成閱讀追蹤功能   |
| YYYY-MM-DD | 完成附件和統計功能 |

## 9. 狀態追蹤

### 9.1 開發進度

待開始

### 9.2 問題記錄

| 日期 | 問題描述 | 狀態 | 解決方案 |
| ---- | -------- | ---- | -------- |
| -    | -        | -    | -        |

## 10. 備註

- 考慮將來整合電子郵件或手機推送通知
- 可能需要優化大量通知情況下的加載性能
- 考慮設置通知自動過期機制
