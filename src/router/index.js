import { createWebHistory, createRouter } from "vue-router";

import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { RouterName } from "@/enums/appEnums";

const routes = [
  {
    path: "/NBS-LMS",
    name: RouterName.LandingPage,
    component: () => import("@/views/Landing/Index.vue"),
    meta: {
      title: "首頁 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
  },
  {
    path: "/NBS-LMS/dashboard",
    name: RouterName.Dashboard,
    component: () => import("@/views/Dashboard/Index.vue"),
    meta: {
      title: "儀表板 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
  },
  {
    path: "/NBS-LMS",
    redirect: "/NBS-LMS",
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
