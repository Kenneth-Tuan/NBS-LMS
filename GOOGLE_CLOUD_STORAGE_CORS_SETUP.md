# Google Cloud Storage CORS 配置指南

## 問題描述

你的應用在測試環境（`https://nbs-lms.vercel.app`）中上傳文件時出現 `405 Method Not Allowed` 錯誤，這是因為 Google Cloud Storage 的 CORS 配置不允許來自代理服務器的請求。

## 解決方案

你需要為你的 Google Cloud Storage 存儲桶配置 CORS 策略，允許來自以下來源的請求：

### 允許的來源（Origins）
- `https://nbs-lms.vercel.app`（測試環境）
- `https://www.tntc-select.org.tw`（正式環境）
- `http://localhost:7001`（本地開發環境）
- `http://localhost:3000`（本地開發環境）
- `http://localhost:5173`（本地開發環境）

### 允許的 HTTP 方法
- `GET`（下載文件）
- `PUT`（上傳文件）
- `POST`（初始化上傳）
- `DELETE`（刪除文件）

### 允許的請求頭
- `Content-Type`
- `Authorization`
- `X-Goog-Content-Length-Range`

## 配置步驟

### 方法 1：使用 Google Cloud Console（推薦）

1. 打開 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇你的專案
3. 進入 **Cloud Storage** > **Buckets**
4. 點擊你的存儲桶名稱（例如：`campus-system-dev`）
5. 點擊 **Permissions** 標籤
6. 點擊 **CORS** 子標籤
7. 點擊 **Add** 按鈕
8. 添加以下 CORS 配置：

```json
[
  {
    "origin": [
      "https://nbs-lms.vercel.app",
      "https://www.tntc-select.org.tw",
      "http://localhost:7001",
      "http://localhost:3000",
      "http://localhost:5173"
    ],
    "method": ["GET", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
```

### 方法 2：使用 gsutil 命令行工具

如果你安裝了 Google Cloud SDK，可以使用以下命令：

```bash
gsutil cors set cors-config.json gs://your-bucket-name
```

其中 `cors-config.json` 文件內容為：

```json
[
  {
    "origin": [
      "https://nbs-lms.vercel.app",
      "https://www.tntc-select.org.tw",
      "http://localhost:7001",
      "http://localhost:3000",
      "http://localhost:5173"
    ],
    "method": ["GET", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
```

## 驗證配置

配置完成後，你可以測試上傳功能是否正常工作。如果問題仍然存在，請檢查：

1. **確認配置已生效**：Google Cloud Storage 的 CORS 配置可能需要幾分鐘時間生效
2. **檢查存儲桶名稱**：確保配置應用到正確的存儲桶
3. **檢查請求頭**：確保代理正確轉發了必要的請求頭

## 故障排除

如果問題仍然存在：

1. **檢查瀏覽器開發者工具**中的 Network 標籤，確認請求是否正確發送
2. **檢查 Google Cloud Storage 日誌**，查看是否有相關錯誤信息
3. **確認存儲桶的 IAM 權限**設置正確

## 安全性注意事項

- 只允許必要的來源（不要使用通配符 `*`）
- 只允許必要的 HTTP 方法
- 確保你的存儲桶有適當的訪問控制設置

配置完成後，你的測試環境應該能夠正常上傳文件了！
