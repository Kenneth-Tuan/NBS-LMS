// router name enums
export enum RouterName {
  LandingPage = "LandingPage",
  Dashboard = "Dashboard",
  Course = "Course",
  NewCourse = "NewCourse",
  UpdateCourse = "UpdateCourse",
  CourseDetail = "CourseDetail",
  CourseList = "CourseList",
  CourseCreate = "CourseCreate",
  CourseReview = "CourseReview",
  InternshipApplication = "InternshipApplication",
  LeaveApplication = "LeaveApplication",
  SubsidyApplication = "SubsidyApplication",
  ApplicationRecord = "ApplicationRecord",
}

// user role enums
export enum UserRole {
  Admin = 1,
  Manager = 2,
  Student = 4,
  Teacher = 3,
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
