import { createApp, markRaw } from "vue";
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";

import "./style.css";
import App from "./App.vue";

const app = createApp(App);

app.use(i18n);

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

app.mount("#NBS-LMS");
