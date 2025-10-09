import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

export default ({ mode }) => {
  return defineConfig({
    base: "/",
    server: {
      port: 7001,
      cors: true,
      origin: `http://localhost:7001`,
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
              console.log("發送請求到目標:", req.method, req.url, req.body);
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
