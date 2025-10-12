import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

export default ({ mode }) => {
  // 智能環境檢測函數
  const detectEnvironment = (mode) => {
    // 優先檢查環境變數（適用於部署環境）
    const deployEnv =
      process.env.DEPLOY_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV;

    // 檢查部署 URL（適用於瀏覽器環境）
    const currentUrl =
      typeof window !== "undefined" ? window.location.origin : null;

    // 環境優先級：明確指定的環境變數 > URL檢測 > mode參數 > 默認本地開發

    // 1. 檢查環境變數
    if (deployEnv === "test" || deployEnv === "staging") {
      return "test";
    }
    if (deployEnv === "production" || deployEnv === "prod") {
      return "production";
    }

    // 2. 檢查當前 URL（適用於瀏覽器環境）
    if (currentUrl) {
      if (currentUrl.includes("nbs-lms.vercel.app")) {
        return "test";
      }
      if (currentUrl.includes("tntc-select.org.tw")) {
        return "production";
      }
    }

    // 3. 回退到 mode 參數
    if (mode === "test") {
      return "test";
    }
    if (mode === "production") {
      return "production";
    }

    // 4. 默認本地開發環境
    return "development";
  };

  // 根據環境動態配置服務器設置
  const getEnvironmentConfig = (environment) => {
    if (environment === "development") {
      return {
        origin: "http://localhost:7001",
        cors: {
          origin: [
            "http://localhost:7001",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:7001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
          ],
          credentials: true,
        },
      };
    } else if (environment === "test") {
      return {
        origin: "https://nbs-lms.vercel.app",
        cors: {
          origin: ["https://nbs-lms.vercel.app"],
          credentials: true,
        },
      };
    } else if (environment === "production") {
      return {
        origin: "https://www.tntc-select.org.tw",
        cors: {
          origin: ["https://www.tntc-select.org.tw"],
          credentials: true,
        },
      };
    }

    // 默認回退到開發環境配置
    return {
      origin: "http://localhost:7001",
      cors: {
        origin: ["http://localhost:7001"],
        credentials: true,
      },
    };
  };

  const currentEnv = detectEnvironment(mode);
  const envConfig = getEnvironmentConfig(currentEnv);

  return defineConfig({
    base: mode === "production" ? "/NBS-LMS/" : "/",
    server: {
      port: 7001,
      cors: envConfig.cors,
      origin: envConfig.origin,
      proxy: {
        // 代理 Google Cloud Storage 上傳請求來解決 CORS 問題
        "^/proxy/storage": {
          target: "https://storage.googleapis.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxy\/storage/, ""),
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.log("代理錯誤:", err);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.log("發送請求到目標:", req.method, req.url);

              // 確保轉發重要的請求頭
              if (req.headers["content-type"]) {
                proxyReq.setHeader("Content-Type", req.headers["content-type"]);
              }

              // 轉發授權相關的頭部（如果有的話）
              if (req.headers["authorization"]) {
                proxyReq.setHeader(
                  "Authorization",
                  req.headers["authorization"]
                );
              }

              // 設置 Origin 頭部來模擬來自正確的域名
              if (currentEnv === "test") {
                proxyReq.setHeader("Origin", "https://nbs-lms.vercel.app");
              } else if (currentEnv === "production") {
                proxyReq.setHeader("Origin", "https://www.tntc-select.org.tw");
              }
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.log("收到目標響應:", proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
    plugins: [vue(), UnoCSS()],
    resolve: {
      alias: [
        {
          find: "@",
          replacement: fileURLToPath(new URL("./src", import.meta.url)),
        },
      ],
    },
    build: {
      assetsInlineLimit: 0,
      outDir: "output",
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            let extType = assetInfo.name.split(".").at(1);
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              extType = "img";
            }
            return `assets/${extType}/[name]-[hash][extname]`;
          },

          chunkFileNames: (chunkInfo) => {
            return `assets/js/[name]-[hash].js`;
          },

          entryFileNames: (chunkInfo) => {
            return `assets/js/[name]-[hash].js`;
          },
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "src/styles/global.scss";`,
        },
      },
    },
    define: {
      "process.env": {},
    },
  });
};
