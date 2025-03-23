// router name enums
export enum RouterName {
  LandingPage = "LandingPage",
  Dashboard = "Dashboard",
  Course = "Course",
  NewCourse = "NewCourse",
  UpdateCourse = "UpdateCourse",
  CourseDetail = "CourseDetail",
}

// user role enums
export enum UserRole {
  Admin = "admin",
  Guest = "guest",
  Student = "student",
  Teacher = "teacher",
  Staff = "staff",
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
