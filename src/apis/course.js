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
};
