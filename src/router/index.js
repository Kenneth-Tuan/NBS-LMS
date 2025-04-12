import { createWebHistory, createRouter } from "vue-router";

import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { RouterName } from "@/enums/appEnums";
import { useUserStore } from "@/stores/user";
import { UserRole } from "@/enums/appEnums";

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
    path: "/courses/create",
    name: RouterName.CourseCreate,
    component: () => import("@/views/Courses/CourseForm.vue"),
    meta: {
      title: "新增課程 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
      requiresAdmin: true,
    },
  },
  {
    path: "/courses/:id",
    name: RouterName.CourseDetail,
    component: () => import("@/views/CourseDetail/Index.vue"),
    meta: {
      title: "課程詳情 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
  },
  {
    path: "/courses/:id/review",
    name: RouterName.CourseReview,
    component: () => import("@/views/Courses/components/CourseReview.vue"),
    meta: {
      title: "課程審核 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
      requiresAdmin: true,
    },
  },
  {
    path: "/course-assignments",
    name: RouterName.CourseAssignments,
    component: () => import("@/views/Courses/CourseAndAssignments.vue"),
    meta: {
      title: "課程與作業 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
  },
  {
    path: "/internship-application",
    name: RouterName.InternshipApplication,
    component: () => import("@/views/Applications/InternshipApplication.vue"),
    meta: {
      title: "實習申請 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
  },
  {
    path: "/leave-application",
    name: RouterName.LeaveApplication,
    component: () => import("@/views/Applications/LeaveApplication.vue"),
    meta: {
      title: "請假申請 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
  },
  {
    path: "/subsidy-application",
    name: RouterName.SubsidyApplication,
    component: () => import("@/views/Applications/SubsidyApplication.vue"),
    meta: {
      title: "補助申請 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
  },
  {
    path: "/application-record",
    name: RouterName.ApplicationRecord,
    component: () => import("@/views/Applications/ApplicationRecord.vue"),
    meta: {
      title: "申請記錄 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
  },
  {
    path: "/course-record",
    name: RouterName.CourseRecord,
    component: () => import("@/views/Courses/CourseRecord.vue"),
    meta: {
      title: "修課紀錄 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
  },
  {
    path: "/grade-detail/:id",
    name: RouterName.GradeDetail,
    component: () => import("@/views/Courses/GradeDetail.vue"),
    meta: {
      title: "成績詳情 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
  },
  {
    path: "/timed-course-selection",
    name: RouterName.TimedCourseSelection,
    component: () => import("@/views/Courses/TimedCourseSelection.vue"),
    meta: {
      title: "限時選課 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
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
  document.title = to.meta.title || "拿撒勒人會神學院 選課系統";

  // 檢查是否需要管理員權限
  if (to.meta.requiresAdmin) {
    const { userProfile } = useUserStore();
    if (userProfile.userType !== UserRole.ADMIN) {
      next({ name: RouterName.CourseList });
      return;
    }
  }

  next();
});

export default router;
