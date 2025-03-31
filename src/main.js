import { createApp, markRaw } from "vue";
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import "virtual:uno.css";
import "uno.css";
import "virtual:unocss-devtools";
import VueCookies from "vue-cookies";
import { worker } from "./mocks/browser";

if (import.meta.env.MODE === "dev" && false) {
  worker.start({
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });
}

const app = createApp(App);

app.use(Antd);

const pinia = createPinia();
pinia.use(({ store }) => {
  store.router = markRaw(router);
});
pinia.use(
  createPersistedState({
    storage: sessionStorage,
  })
);
app.use(pinia);

app.use(router);

app.use(VueCookies);

app.component("QuillEditor", QuillEditor);

app.mount("#NBS-LMS");
