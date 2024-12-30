import { createWebHistory, createRouter } from "vue-router";
import DefaultLayout from "@/layouts/DefaultLayout.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登入 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
  },
  {
    path: "/",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory("/"),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash)
      return {
        top: 108,
        el: to.hash,
        behavior: "smooth",
      };
    else return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  // 更新頁面標題
  document.title = "拿撒勒人會神學院 選課系統";
  next();
});

export default router;
