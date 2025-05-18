import { createWebHistory, createRouter } from "vue-router";

import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { RouterName, UserRole } from "@/enums/appEnums";
import { useUserStore } from "@/stores/user";

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
    props: { isEdit: false },
    meta: {
      title: "新增課程 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
      roles: [UserRole.Creator, UserRole.Admin],
    },
  },
  {
    path: "/courses/:id/edit",
    name: RouterName.UpdateCourse,
    component: () => import("@/views/Courses/CourseForm.vue"),
    props: (route) => ({ isEdit: true, courseId: route.params.id }),
    meta: {
      title: "編輯課程 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
      roles: [UserRole.Creator, UserRole.Admin],
    },
  },
  {
    path: "/courses/:id",
    name: RouterName.CourseDetail,
    component: () => import("@/views/Courses/CourseDetail.vue"),
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
      roles: [UserRole.Creator, UserRole.Admin],
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
      roles: [UserRole.Student, UserRole.Creator],
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
  {
    path: "/timed-course-settings",
    name: RouterName.TimedCourseSettings,
    component: () => import("@/views/Courses/TimedCourseSettings.vue"),
    meta: {
      title: "限時選課設定 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
    },
  },
  {
    path: "/course-overview",
    name: RouterName.CourseOverview,
    component: () => import("@/views/Courses/CourseOverview.vue"),
    meta: {
      title: "課程總覽 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
      roles: [UserRole.Creator, UserRole.Admin],
    },
  },
  {
    path: "/admin/courses/:id",
    name: RouterName.AdminCourseDetail,
    component: () => import("@/views/Admin/AdminCourseDetail.vue"),
    props: true,
    meta: {
      title: "(管理)課程詳情 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
      roles: [UserRole.Creator, UserRole.Admin],
    },
  },
  {
    path: "/admin/users",
    name: RouterName.UserManagement,
    component: () => import("@/views/Admin/UserManagement.vue"),
    meta: {
      title: "使用者管理 - 拿撒勒人會神學院 選課系統",
      layout: DefaultLayout,
      roles: [UserRole.Creator, UserRole.Admin],
    },
  },
  {
    path: "/notifications",
    name: RouterName.Notifications,
    component: () => import("@/views/Notifications/NotificationsView.vue"),
    meta: {
      title: "通知中心 - 拿撒勒人會神學院 選課系統",
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

  // Consolidated Role Check
  // if (
  //   to.meta.roles &&
  //   Array.isArray(to.meta.roles) &&
  //   to.meta.roles.length > 0
  // ) {
  //   const userStore = useUserStore();
  //   const userRole = userStore.userProfile.userRole;

  //   // Check if user has one of the required roles
  //   if (!to.meta.roles.includes(userRole)) {
  //     console.warn(
  //       `Access denied: Route ${String(
  //         to.name
  //       )} requires roles ${to.meta.roles.join(
  //         ","
  //       )}, but user has role ${userRole}.`
  //     );
  //     // Redirect to landing page or a suitable default page
  //     next({ name: RouterName.LandingPage });
  //     return; // Important to return after calling next() with a new route
  //   }
  // }

  // If no roles specified or user has the required role, proceed
  next();
});

export default router;
