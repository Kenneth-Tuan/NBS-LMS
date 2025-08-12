import {
  HomeOutlined,
  MailOutlined,
  FormOutlined,
  ClockCircleFilled,
  TeamOutlined,
  BellOutlined,
} from "@ant-design/icons-vue";

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
  CourseAssignments = "course-assignments",
  CurrentCourses = "current-courses",
  CourseManagementHub = "course-management-hub",
  InternshipApplication = "internship-application",
  LeaveApplication = "leave-application",
  SubsidyApplication = "subsidy-application",
  ApplicationRecord = "application-record",
  CourseRecord = "course-record",
  GradeDetail = "grade-detail",
  TimedCourseSelection = "timed-course-selection",
  TimedCourseSettings = "timed-course-settings",
  CourseOverview = "course-overview",
  AdminCourseDetail = "admin-course-detail",
  UserManagement = "user-management",
  Notifications = "notifications",
}

// user role enums
export enum UserRole {
  Creator = "creator",
  Admin = "admin",
  Manager = "manager",
  Teacher = "teacher",
  Student = "student",
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

export enum UserStatus {
  Active = "active",
  Inactive = "inactive",
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
    roles: [UserRole.Creator, UserRole.Student],
    highlight: false,
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
        roles: [UserRole.Creator, UserRole.Admin, UserRole.Manager,UserRole.Teacher,UserRole.Student],
      },
      {
        key: "course-create",
        label: "新增課程",
        route: { name: RouterName.CourseCreate },
        roles: [UserRole.Creator, UserRole.Admin, UserRole.Manager],
      },
      {
        key: "current-courses",
        label: "本期課程",
        route: { name: RouterName.CurrentCourses },
        roles: [UserRole.Creator, UserRole.Teacher, UserRole.Student],
      },
      // {
      //   key: "course-record",
      //   label: "修課紀錄",
      //   route: { name: RouterName.CourseRecord },
      //   roles: [
      //     UserRole.Creator,
      //     UserRole.Manager,
      //     UserRole.Teacher,
      //     UserRole.Student,
      //   ],
      // },
      {
        key: RouterName.TimedCourseSettings,
        label: "限時選課設定",
        route: { name: RouterName.TimedCourseSettings },
        roles: [UserRole.Creator, UserRole.Admin, UserRole.Manager],
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
        roles: [UserRole.Creator, UserRole.Student],
      },
      {
        key: "leave-application",
        label: "請假申請",
        route: { name: RouterName.LeaveApplication },
        roles: [UserRole.Creator, UserRole.Student],
      },
      {
        key: "subsidy-application",
        label: "補助申請",
        route: { name: RouterName.SubsidyApplication },
        roles: [UserRole.Creator, UserRole.Student],
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
    roles: [UserRole.Creator, UserRole.Admin],
  },
  {
    key: "notifications",
    label: "通知中心",
    icon: BellOutlined,
    route: { name: RouterName.Notifications },
    roles: [UserRole.Creator, UserRole.Admin],
    highlight: false,
  },
];

export enum ApplicationType {
  Internship = "internship",
  Leave = "leave",
  Subsidy = "subsidy",
  Other = "other",
}

export enum ApplicationStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}