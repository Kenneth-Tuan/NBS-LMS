# 環境配置說明

## 🎯 環境檢測邏輯

系統現在使用智能環境檢測，能夠根據以下優先順序自動識別環境：

1. **環境變數**（最高優先級）
   - `DEPLOY_ENV=test` → 測試環境
   - `DEPLOY_ENV=production` → 正式環境
   - `VERCEL_ENV=production` → 正式環境（Vercel 自動設置）

2. **URL 檢測**（中等優先級）
   - 包含 `nbs-lms.vercel.app` → 測試環境
   - 包含 `tntc-select.org.tw` → 正式環境

3. **Mode 參數**（備用方案）
   - `--mode test` → 測試環境
   - `--mode production` → 正式環境

4. **默認環境**
   - 本地開發環境 (`localhost`)

## 🚀 使用方式

### 本地開發
```bash
# 開發環境（默認）
yarn dev

# 明確指定測試環境模式（如果需要）
yarn dev:test

# 明確指定正式環境模式（如果需要）
yarn dev:prod
```

### 部署環境

#### Vercel 部署（推薦）
系統會自動檢測 Vercel 環境變數：
- **Dev Branch** → 自動設為測試環境 (`nbs-lms.vercel.app`)
- **Main Branch** → 自動設為正式環境 (`www.tntc-select.org.tw`)

#### 手動環境變數設置
如果需要明確指定環境，建立 `.env.local` 文件：

```bash
# .env.local
DEPLOY_ENV=test
```

或

```bash
# .env.local
DEPLOY_ENV=production
```

## 🔧 環境對應表

| 環境 | 識別方式 | URL | 用途 |
|------|----------|-----|------|
| 開發環境 | `DEPLOY_ENV=development` 或本地開發 | `http://localhost:7001` | 本地開發測試 |
| 測試環境 | `DEPLOY_ENV=test` 或 URL 包含 `nbs-lms.vercel.app` | `https://nbs-lms.vercel.app` | Dev Branch 部署 |
| 正式環境 | `DEPLOY_ENV=production` 或 URL 包含 `tntc-select.org.tw` | `https://www.tntc-select.org.tw` | Main Branch 部署 |

## ⚙️ 部署建議

### Vercel 配置
在 Vercel Dashboard 中為每個環境設置環境變數：

**測試環境（Dev Branch）：**
- Environment Variables: `DEPLOY_ENV=test`

**正式環境（Main Branch）：**
- Environment Variables: `DEPLOY_ENV=production`

這樣系統就能自動識別環境並應用正確的配置了！

## 🎉 優點

- **自動檢測**：無需手動切換配置
- **靈活性**：支援多種環境指定方式
- **可靠性**：多層備用機制確保正確識別環境
- **維護性**：集中管理環境配置邏輯
