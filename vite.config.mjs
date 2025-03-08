import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  console.log(process.env.VITE_BASE_URL, "mode: ", mode);
  const { VITE_BASE_URL } = process.env;

  return defineConfig({
    base: VITE_BASE_URL,
    server: {
      port: 7001,
      cors: true,
      origin: `http://localhost:7001`,
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
      outDir: "output",
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            // console.log(assetInfo)
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
