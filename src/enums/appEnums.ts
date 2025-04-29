import {
  HomeOutlined,
  MailOutlined,
  FormOutlined,
  ClockCircleFilled,
  TeamOutlined,
  BellOutlined,
} from "@ant-design/icons-vue";

// router name enums (using kebab-case strings consistent with router setup)
export enum RouterName {
  LandingPage = "landing-page",
  Dashboard = "dashboard",
  Course = "course",
  NewCourse = "new-course",
  UpdateCourse = "update-course",
  CourseDetail = "course-detail",
  CourseList = "course-list",
  CourseCreate = "course-create",
  CourseReview = "course-review",
  CourseAssignments = "course-assignments", // Added from JS
  InternshipApplication = "internship-application",
  LeaveApplication = "leave-application",
  SubsidyApplication = "subsidy-application",
  ApplicationRecord = "application-record",
  CourseRecord = "course-record", // Added from JS
  GradeDetail = "grade-detail", // Added from JS
  TimedCourseSelection = "timed-course-selection", // Added from JS
  CourseOverview = "course-overview", // Added New Overview Route
  AdminCourseDetail = "admin-course-detail", // NEW Admin Detail Route
  UserManagement = "user-management", // User Management Route
  Notifications = "notifications", // 新增通知頁面 Route
}

// user role enums
export enum UserRole {
  Admin = 1,
  Manager = 2,
  Teacher = 3, // Swapped Teacher/Student order for consistency if needed, keeping JS values
  Student = 4,
}

export enum CourseStatus {
  Draft = "draft",
  Published = "published",
  Closed = "closed",
}

export enum CourseCategory {
  Core = "core",
  Elective = "elective",
  Optional = "optional",
}

export enum CourseType {
  Lecture = "lecture",
  Seminar = "seminar",
  Workshop = "workshop",
}

export enum CourseLocation {
  Online = "online",
  Offline = "offline",
}

export enum operationType {
  Create = "create",
  Edit = "edit",
}

export const MenuItems = [
  {
    key: RouterName.LandingPage,
    icon: HomeOutlined,
    label: "首頁",
  },
  // {
  //   key: "dashboard",
  //   label: "儀表板",
  //   icon: DesktopOutlined,
  //   route: { name: RouterName.Dashboard },
  // },
  {
    key: "timed-course-selection",
    label: "限時選課",
    icon: ClockCircleFilled,
    route: { name: RouterName.TimedCourseSelection },
    highlight: true,
  },
  {
    key: "courses",
    label: "課程管理",
    icon: MailOutlined,
    children: [
      {
        key: RouterName.CourseOverview,
        label: "課程總覽",
        route: { name: RouterName.CourseOverview },
        roles: [UserRole.Admin, UserRole.Manager],
      },
      {
        key: "course-create",
        label: "新增課程",
        route: { name: RouterName.CourseCreate },
        roles: [UserRole.Admin, UserRole.Teacher, UserRole.Manager],
      },
      {
        key: "course-assignments",
        label: "課程與作業",
        route: { name: RouterName.CourseAssignments },
        roles: [UserRole.Teacher, UserRole.Student],
      },
      {
        key: "course-record",
        label: "修課紀錄",
        route: { name: RouterName.CourseRecord },
        roles: [UserRole.Student],
      },
    ],
  },
  {
    key: "applications",
    label: "申請管理",
    icon: FormOutlined,
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
  {
    key: "user-management",
    label: "用戶管理",
    icon: TeamOutlined,
    route: { name: RouterName.UserManagement },
    roles: [UserRole.Admin],
  },
  {
    key: "notifications",
    label: "通知中心",
    icon: BellOutlined,
    route: { name: RouterName.Notifications },
    highlight: false,
  },
];
