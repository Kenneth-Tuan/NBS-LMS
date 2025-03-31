export const UserRole = {
  ADMIN: 1,
  TEACHER: 2,
  STUDENT: 3,
};

export const RouterName = {
  LandingPage: "landing-page",
  Dashboard: "dashboard",
  NewCourse: "new-course",
  Course: "course",
  UpdateCourse: "update-course",
  CourseDetail: "course-detail",
  CourseList: "course-list",
  CourseCreate: "course-create",
  CourseReview: "course-review",
  InternshipApplication: "internship-application",
  LeaveApplication: "leave-application",
  SubsidyApplication: "subsidy-application",
  ApplicationRecord: "application-record",
  CourseRecord: "course-record",
  GradeDetail: "grade-detail",
};

export const MenuItems = [
  {
    key: "dashboard",
    label: "儀表板",
    icon: "fas fa-chart-line",
    route: { name: RouterName.Dashboard },
  },
  {
    key: "courses",
    label: "課程管理",
    icon: "fas fa-book",
    children: [
      {
        key: "course-list",
        label: "課程列表",
        route: { name: RouterName.CourseList },
      },
      {
        key: "course-create",
        label: "新增課程",
        route: { name: RouterName.CourseCreate },
        adminOnly: true,
      },
      {
        key: "course-record",
        label: "修課紀錄",
        route: { name: RouterName.CourseRecord },
      },
    ],
  },
  {
    key: "applications",
    label: "申請管理",
    icon: "fas fa-file-alt",
    children: [
      {
        key: "internship-application",
        label: "實習申請",
        route: { name: RouterName.InternshipApplication },
      },
      {
        key: "leave-application",
        label: "請假申請",
        route: { name: RouterName.LeaveApplication },
      },
      {
        key: "subsidy-application",
        label: "補助申請",
        route: { name: RouterName.SubsidyApplication },
      },
      {
        key: "application-record",
        label: "申請記錄",
        route: { name: RouterName.ApplicationRecord },
      },
    ],
  },
];
