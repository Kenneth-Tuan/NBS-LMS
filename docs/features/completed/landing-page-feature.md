# F005 - 系統首頁功能

**狀態:** 已完成  
**優先級:** 高  
**預計完成日期:** 已完成  
**負責人:** 開發團隊

## 1. 功能概述

系統首頁是用戶進入 NBS-LMS 後的第一個頁面，提供重要的系統公告、最新消息和注意事項，同時作為整個系統的導航中心，讓使用者能夠快速訪問其他功能模塊。首頁設計適用於各種使用者角色，並根據角色權限顯示不同的管理選項。

## 2. 需求規格

### 2.1 功能需求

- 顯示系統最新消息，包含日期、內容和發布單位
- 提供課程公告區域，展示選課相關資訊
- 顯示系統注意事項，引導使用者正確使用系統
- 提供管理員編輯、新增和刪除公告的功能
- 自適應不同使用者角色，顯示相應的管理選項
- 提供主導航功能，快速訪問系統其他模塊
- 支持響應式設計，適配不同設備

### 2.2 相關需求文檔

- 首頁布局實現在 `src/views/Landing/Index.vue`
- 導航菜單配置在 `src/layouts/DefaultLayout.vue`
- 首頁布局規格在 `docs/specs/LandingPage_Layout.md`

## 3. 使用者故事

**作為** 所有系統使用者，  
**我希望** 能在首頁快速了解系統最新消息和重要公告，  
**以便** 即時獲取重要資訊，不錯過關鍵通知。

**作為** 學生，  
**我希望** 在首頁能清楚看到選課相關通知和課程資訊，  
**以便** 及時了解選課時間和重要事項。

**作為** 管理員，  
**我希望** 能夠直接在首頁編輯、新增或刪除公告，  
**以便** 及時更新系統資訊，維護系統內容的時效性。

## 4. 流程設計

### 4.1 業務流程

1. 使用者訪問系統 URL
2. 系統默認重定向到首頁
3. 首頁加載最新的公告和資訊
4. 根據使用者角色顯示相應的管理選項
5. 使用者可以從首頁導航到其他功能區域

### 4.2 使用流程

**一般使用者：**

1. 登入系統
2. 查看最新消息和課程公告
3. 透過左側導航選擇需要使用的功能
4. 點擊具體的公告查看詳情

**管理員：**

1. 登入系統（以管理員身份）
2. 點擊「新增消息」或「新增公告」按鈕
3. 填寫相關資訊並保存
4. 編輯或刪除現有的消息和公告

### 4.3 狀態轉換

- 未登入 -> 已登入：登入後可看到與角色相關的功能選項
- 只讀模式 -> 編輯模式：管理員點擊編輯按鈕後可修改內容
- 消息創建 -> 消息發布：管理員創建新消息並保存

## 5. 技術設計

### 5.1 架構設計

首頁功能基於 Vue 3 + Ant Design Vue 實現：

- 使用 Vue 3 組件系統構建頁面結構
- 使用 Ant Design Vue 提供 UI 組件
- 使用 Pinia 進行狀態管理
- 使用 Vue Router 處理路由導航
- 使用 UnoCSS 進行樣式處理

### 5.2 數據模型

```
// 最新消息數據模型
news: {
  key: String,        // 唯一標識
  date: String,       // 日期
  content: String,    // 內容
  publisher: String,  // 發布單位
}

// 公告數據模型
announcement: {
  key: String,        // 唯一標識
  title: String,      // 標題
  contents: Array,    // 內容條目列表
}

// 注意事項數據模型
notice: {
  key: String,        // 唯一標識
  title: String,      // 標題
  contents: Array,    // 內容條目列表
}
```

### 5.3 API 設計

#### 5.3.1 數據流

在目前的實現中，首頁數據主要來自前端靜態數據，未來可擴展為以下 API：

| 方法 | 路徑                 | 描述         | 參數                   | 返回值   |
| ---- | -------------------- | ------------ | ---------------------- | -------- |
| GET  | `/api/news`          | 獲取最新消息 | 無                     | 消息列表 |
| POST | `/api/news`          | 創建新消息   | 消息對象               | 創建結果 |
| PUT  | `/api/news/:id`      | 更新消息     | 消息 ID 和更新後的內容 | 更新結果 |
| GET  | `/api/announcements` | 獲取公告列表 | 無                     | 公告列表 |
| POST | `/api/announcements` | 創建新公告   | 公告對象               | 創建結果 |

#### 5.3.2 數據流

1. 頁面初始化時，從本地數據源加載公告和消息
2. 管理員編輯資訊後，更新本地數據狀態
3. 用戶角色信息從 UserStore 獲取，決定是否顯示管理選項

### 5.4 依賴關係

- 依賴 `src/data/dummy.js` 提供初始數據
- 依賴 `src/stores/user.js` 獲取使用者角色信息
- 依賴 Ant Design Vue 提供 UI 組件
- 依賴 Vue Router 實現導航功能
- 依賴 UnoCSS 實現樣式

## 6. UI/UX 設計

### 6.1 頁面設計

- 佈局為兩列式設計，左右結構明確
- 頁面頂部為系統名稱和導航
- 中部區域分為兩大板塊：「最新消息」和「課程公告」
- 右側區域為「注意事項」
- 管理員角色可見編輯按鈕

### 6.2 交互設計

- 導航菜單支持點擊跳轉
- 管理員可以通過點擊操作按鈕進行編輯和刪除
- 新增消息或公告時彈出模態對話框
- 表單驗證提供即時反饋
- 操作成功後顯示提示消息

### 6.3 頁面元素

- 最新消息表格，包含日期、內容和發布單位欄位
- 課程公告列表，展示標題和內容項目
- 注意事項列表，包含標題和詳細說明
- 管理員可見的「新增」按鈕
- 編輯和刪除操作按鈕
- 模態對話框用於編輯內容

## 7. 測試計劃

### 7.1 測試策略

- 單元測試：驗證各組件的渲染和功能
- 整合測試：驗證頁面整體功能和布局
- 用戶測試：確保不同角色能夠正確使用頁面功能
- 響應式測試：確保在不同設備上的適配性

### 7.2 測試案例

| 測試 ID | 測試描述         | 測試步驟                                     | 期望結果                       | 前置條件           |
| ------- | ---------------- | -------------------------------------------- | ------------------------------ | ------------------ |
| TC001   | 首頁載入測試     | 1. 訪問系統首頁<br>2. 觀察頁面載入情況       | 頁面正確載入所有元素和資訊     | 系統正常運行       |
| TC002   | 管理員功能測試   | 1. 以管理員身份登入<br>2. 查看頁面管理選項   | 管理員可見編輯、新增和刪除按鈕 | 管理員帳號可用     |
| TC003   | 消息新增功能測試 | 1. 點擊「新增消息」<br>2. 填寫資訊並保存     | 新消息成功添加到列表中         | 已以管理員身份登入 |
| TC004   | 消息編輯功能測試 | 1. 點擊現有消息的編輯按鈕<br>2. 修改後保存   | 消息內容成功更新               | 已以管理員身份登入 |
| TC005   | 響應式布局測試   | 1. 在不同寬度的設備上訪問首頁<br>2. 觀察佈局 | 頁面布局自適應不同屏幕尺寸     | 系統正常運行       |

## 8. 開發計劃

### 8.1 工作拆分

| 任務               | 估算時間 | 負責人   |
| ------------------ | -------- | -------- |
| 首頁布局設計       | 已完成   | 開發團隊 |
| 最新消息模塊實現   | 已完成   | 開發團隊 |
| 課程公告模塊實現   | 已完成   | 開發團隊 |
| 注意事項模塊實現   | 已完成   | 開發團隊 |
| 管理員編輯功能實現 | 已完成   | 開發團隊 |
| 導航菜單集成       | 已完成   | 開發團隊 |
| 響應式布局調整     | 已完成   | 開發團隊 |
| 測試和優化         | 已完成   | 開發團隊 |

### 8.2 里程碑

| 日期   | 里程碑               |
| ------ | -------------------- |
| 已完成 | 完成首頁基本布局     |
| 已完成 | 完成資訊展示功能     |
| 已完成 | 完成管理員編輯功能   |
| 已完成 | 完成響應式布局和優化 |

## 9. 狀態追蹤

### 9.1 開發進度

首頁功能已完成並整合到系統中。

### 9.2 問題記錄

| 日期 | 問題描述 | 狀態 | 解決方案 |
| ---- | -------- | ---- | -------- |
| -    | -        | -    | -        |

## 10. 備註

- 首頁目前使用靜態數據作為示範內容，未來將集成後端 API
- 首頁的編輯功能目前僅在前端實現，實際環境需連接數據庫
- 首頁設計考慮了不同角色的訪問需求，提供了差異化的功能展示
