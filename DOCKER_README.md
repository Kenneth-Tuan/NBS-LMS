# Docker 開發環境設定指南

本指南將協助您使用 Docker 在本地開發 NBS-LMS (拿撒勒神學院學習管理系統)。

## 前置需求

- Docker Desktop (Windows/Mac) 或 Docker Engine (Linux)
- Docker Compose V2
- 至少 4GB 可用 RAM
- 至少 10GB 可用磁碟空間

## 快速開始

### 1. 啟動開發環境

```bash
# 從專案根目錄執行
docker-compose up --build
```

第一次執行會需要一些時間來下載映像並安裝依賴。

### 2. 訪問應用程式

開發伺服器啟動後，您可以通過以下方式訪問：

- **應用程式**: http://localhost:7001
- **健康檢查**: http://localhost:7001 (應返回 HTML 頁面)

### 3. 停止開發環境

```bash
# 在另一個終端視窗中執行
docker-compose down
```

## 開發工作流程

### 熱重載 (Hot Reload)

Docker 環境已配置為支援 Vite 的熱重載功能。當您修改源碼時，應用程式會自動重新載入而無需重新啟動容器。

### 檔案監控

- 源碼變更會自動同步到容器內
- `node_modules` 被排除掛載以避免衝突
- 依賴安裝在容器內部以確保一致性

### 除錯模式

如果需要查看詳細的建置日誌：

```bash
# 以除錯模式啟動
docker-compose up --build --verbose
```

## 環境配置

### 環境變數

目前配置的環境變數：

```bash
NODE_ENV=development
VITE_APP_IS_MOCK=true  # 啟用 API 模擬
```

### 自訂配置

如果需要新增環境變數，請編輯 `docker-compose.yml`：

```yaml
environment:
  - NODE_ENV=development
  - VITE_APP_IS_MOCK=true
  - VITE_CUSTOM_VAR=your_value
```

## 容器管理

### 查看容器狀態

```bash
docker-compose ps
```

### 查看日誌

```bash
# 查看所有服務日誌
docker-compose logs

# 查看特定服務日誌
docker-compose logs nbs-lms

# 即時查看日誌
docker-compose logs -f nbs-lms
```

### 進入容器

```bash
docker-compose exec nbs-lms sh
```

### 重新建置容器

```bash
# 強制重新建置 (適用於 Dockerfile 變更)
docker-compose up --build --force-recreate

# 只重新建置特定服務
docker-compose up --build nbs-lms
```

## 疑難排解

### 常見問題

#### 1. 連接埠 7001 已被佔用

```bash
# 檢查哪個程序佔用連接埠
netstat -ano | findstr :7001  # Windows
lsof -i :7001                 # macOS/Linux

# 修改 docker-compose.yml 中的連接埠映射
ports:
  - "7002:7001"  # 使用不同外部連接埠
```

#### 2. 熱重載無效

確保您的編輯器沒有干擾檔案監控。某些 IDE 可能會鎖定檔案。

#### 3. 建置失敗

```bash
# 清除 Docker 快取
docker system prune -a

# 重新建置
docker-compose up --build --no-cache
```

#### 4. 記憶體不足

增加 Docker Desktop 的記憶體限制至至少 4GB。

### 健康檢查

容器包含健康檢查功能。如果應用程式啟動失敗，健康檢查會標記容器為不健康：

```bash
docker-compose ps  # 查看健康狀態
```

## 效能優化

### 建置快取

- `package.json` 和 `yarn.lock` 會被快取以加速重新建置
- 使用 `.dockerignore` 排除不必要的檔案

### 開發效能

- 使用 Alpine Linux 基礎映像以減少映像大小
- 非 root 使用者執行以提升安全性
- 優化的健康檢查間隔

## 本地 Appwrite (可選)

如果您想要在本機運行 Appwrite 而不是使用雲端版本，請取消註釋 `docker-compose.yml` 中的 Appwrite 服務：

```yaml
# 取消註釋以下區塊
appwrite:
  image: appwrite/appwrite:latest
  # ... 其他配置
```

然後更新 `src/appwrite.js` 中的端點：

```javascript
client.setEndpoint("http://localhost/v1")  // 本機 Appwrite
```

## 生產部署

此 Docker 配置僅適用於開發環境。生產部署請參考：

- [Vercel 部署指南](vercel.json)
- 生產建置：`yarn build`

## 支援

如果遇到問題，請檢查：

1. Docker Desktop 是否正常運行
2. 防火牆是否阻擋連接埠 7001
3. 系統是否有足夠的記憶體和磁碟空間
4. 日誌中是否有錯誤訊息

更多資訊請參考專案的 [主要 README](README.md)。
