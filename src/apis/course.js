import { baseApiHelper, fileApiHelper } from "@/utils/axios";

import { UserRole } from "@/enums/appEnums";

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

  downloadFile(link) {
    return fileApiHelper.get("/download?link=" + link);
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

  deleteCourse(course_id) {
    return baseApiHelper.delete(`/course-management/delete-one?course_id=${course_id}`);
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

  pickCourse(params) {
    return baseApiHelper.post(`/enrollment/pick-course`, params);
  },

  dropCourse(params) {
    return baseApiHelper.post(`/enrollment/drop-course`, params);
  },

  myCourseSchedule() {
    return baseApiHelper.get(`/enrollment/my-schedule`);
  },

  getEnrollmentStatus() {
    return baseApiHelper.get(`/enrollment/list`);
  },

  get getCurrentTermCourses() {
    return {
      [UserRole.Teacher]: () => {
        return baseApiHelper.get(`/course-management/teacher/get-current-term`);
      },
      [UserRole.Student]: () => {
        return baseApiHelper.get(`/course-management/student/get-current-term`);
      },
    };
  },

  get assignments() {
    return {
      create: (params) => {
        const { course_id, ...rest } = params;
        return baseApiHelper.post(
          `/assignment/create-one?course_id=${course_id}`,
          rest
        );
      },
      edit: (params) => {
        const { assignment_id, ...rest } = params;
        return baseApiHelper.post(
          `/assignment/edit-one?assignment_id=${assignment_id}`,
          rest
        );
      },
      delete: (params) => {
        const { assignment_id, ...rest } = params;
        return baseApiHelper.delete(
          `/assignment/delete-one?assignment_id=${assignment_id}`,
          rest
        );
      },
      list: (course_id) => {
        return baseApiHelper.get(`/assignment/list?course_id=${course_id}`);
      },
      submit: (params) => {
        const { assignment_id, ...rest } = params;
        return baseApiHelper.put(
          `/assignment/submit?assignment_id=${assignment_id}`,
          rest
        );
      },
      listByCourse: (course_id) => {
        return baseApiHelper.get(
          `/assignment/student/list-by-course?course_id=${course_id}`
        );
      },
    };
  },

  getStudentList(course_id) {
    return baseApiHelper.get(`/student-list?course_id=${course_id}`);
  },

  get announcements() {
    return {
      list: (course_id) => {
        return baseApiHelper.get(`/course-announcement/list?course_id=${course_id}`);
      },
      create: (course_id, params) => {
        return baseApiHelper.post(`/course-announcement/create-one?course_id=${course_id}`, params);
      },
      edit: (course_id, params) => {
        return baseApiHelper.put(`/course-announcement/replace-one?course_id=${course_id}`, params);
      },
      delete: (course_id) => {
        return baseApiHelper.delete(`/course-announcement/delete-one?course_id=${course_id}`);
      },
      getNotification: () => {
        return baseApiHelper.get(`/course-announcement/notifications`);
      },
      markAsRead: (course_id) => {
        return baseApiHelper.post(`/course-announcement/mark-as-read?course_id=${course_id}`);
      },
    };
  },
};
