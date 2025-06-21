import { baseApiHelper, fileApiHelper } from "@/utils/axios";

export default {
  getTeachers() {
    return baseApiHelper.get("/course-management/teachers");
  },

  getPrerequisites() {
    return baseApiHelper.get("/course-management/prerequisites");
  },

  createCourse(params) {
    return baseApiHelper.post("/course-management/create-one", params);
  },

  uploadFile(formData) {
    return fileApiHelper.post("/upload", formData);
  },

  getCourses(params) {
    return baseApiHelper.post(`/course-management/get-list`, params);
  },

  getOneCourse(params) {
    return baseApiHelper.post(`/course-management/get-one`, params);
  },

  updateCourse(params) {
    const { course_id, ...rest } = params;
    return baseApiHelper.patch(
      `/course-management/replace-one?course_id=${course_id}`,
      rest
    );
  },

  getCoursesForEnrollmentSettings(params) {
    return baseApiHelper.post(`/enrollment/get-course`, params);
  },

  getCoursesForEnrollment() {
    return baseApiHelper.get(`/enrollment`);
  },

  createEnrollment(params) {
    return baseApiHelper.post(`/enrollment/create-one`, params);
  },
};
