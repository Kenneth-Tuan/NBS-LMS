import {
  adminData,
  managerData,
  teacherData,
  studentData,
} from "@/mocks/domains/user/data";

export function generateUserprofile(token) {
  if (token === import.meta.env.VITE_ADMIN_PASSWORD_HASH) {
    return adminData;
  }

  if (token === import.meta.env.VITE_MANAGER_PASSWORD_HASH) {
    return managerData;
  }

  if (token === import.meta.env.VITE_TEACHER_PASSWORD_HASH) {
    return teacherData;
  }

  if (token === import.meta.env.VITE_STUDENT_PASSWORD_HASH) {
    return studentData;
  }

  return false;
}
