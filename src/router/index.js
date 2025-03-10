import { createWebHistory, createRouter } from "vue-router";

import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { RouterName } from "@/enums/appEnums";

const routes = [
  {
    path: "/",
    redirect: "/landing-page",
  },
  {
    path: "/landing-page",
    name: RouterName.LandingPage,
    component: () => import("@/views/Landing/Index.vue"),
    meta: {
      title: "首頁 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
  },
  {
    path: "/dashboard",
    name: RouterName.Dashboard,
    component: () => import("@/views/Dashboard/Index.vue"),
    meta: {
      title: "儀表板 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
  },
  {
    path: "/course/:operation(create|edit)/:id?",
    beforeEnter: [removeIdInCreateFlow],
    name: RouterName.Course,
    meta: {
      title: "課程 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
    component: () => import("@/components/Course/Index.vue"),
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

function removeIdInCreateFlow(to, from, next) {
  const { operation, id } = to.params;

  // Regex pattern to validate alphanumeric ID
  const alphanumericPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/;

  if (operation === "create" && !!id) {
    router.push({ path: "/course/create" });
  } else if (operation === "edit" && (!id || !alphanumericPattern.test(id))) {
    router.push({ path: "/course/create" });
  } else {
    next();
  }
}
