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
    return baseApiHelper.delete(
      `/course-management/delete-one?course_id=${course_id}`
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

  deleteEnrollment(enrollment_id) {
    return baseApiHelper.delete(`/enrollment?enrollment_id=${enrollment_id}`);
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
      listSubmissions: (assignment_id) => {
        return baseApiHelper.get(
          `/assignment/teacher/list-submissions?assignment_id=${assignment_id}`
        );
      },
    };
  },

  getStudentList(course_id) {
    return baseApiHelper.get(`/student-list?course_id=${course_id}`);
  },

  get announcements() {
    return {
      /**
       * 取得所有公告
       * @param {string} course_id - 課程ID
       * @returns {Promise} 返回包含公告列表的響應
       * @example
       * // 響應格式:
       * // {
       * //   "data": {
       * //     "announcements": [
       * //       {
       * //         "id": "string",
       * //         "title": "string",
       * //         "content": "string",
       * //         "date": "2025-08-15T09:22:54.747Z"
       * //       }
       * //     ]
       * //   }
       * // }
       */
      list: (course_id) => {
        return baseApiHelper.get(
          `/course-announcement/list?course_id=${course_id}`
        );
      },

      /**
       * 新增一筆課堂公告
       * @param {string} course_id - 課程ID
       * @param {Object} params - 公告參數
       * @param {string} params.title - 公告標題
       * @param {string} params.content - 公告內容
       * @returns {Promise} 返回包含公告ID和創建日期的響應
       * @example
       * // 請求格式:
       * // {
       * //   "title": "string",
       * //   "content": "string"
       * // }
       * //
       * // 響應格式:
       * // {
       * //   "data": {
       * //     "announcement_id": "string",
       * //     "date": "2025-08-15T09:23:23.159Z"
       * //   }
       * // }
       *
       * @requires 限定角色: creator, admin, manager, teacher
       */
      create: (course_id, params) => {
        return baseApiHelper.post(
          `/course-announcement/create-one?course_id=${course_id}`,
          params
        );
      },

      /**
       * 更新公告(以replace的方式更新資料)
       * @param {string} announcement_id - 公告ID
       * @param {Object} params - 公告參數
       * @param {string} params.title - 公告標題
       * @param {string} params.content - 公告內容
       * @returns {Promise} 返回更新成功的消息
       * @example
       * // 請求格式:
       * // {
       * //   "title": "string",
       * //   "content": "string"
       * // }
       * //
       * // 響應格式:
       * // {
       * //   "msg": "string"
       * // }
       *
       * @requires 限定角色: creator, admin, manager, teacher
       */
      edit: (announcement_id, params) => {
        return baseApiHelper.put(
          `/course-announcement/replace-one?announcement_id=${announcement_id}`,
          params
        );
      },

      /**
       * 刪除一筆公告(真刪除)
       * @param {string} announcement_id - 公告ID
       * @returns {Promise} 返回刪除成功的消息
       * @example
       * // 響應格式:
       * // {
       * //   "msg": "string"
       * // }
       *
       * @requires 限定角色: creator, admin, manager, teacher
       */
      delete: (announcement_id) => {
        return baseApiHelper.delete(
          `/course-announcement/delete-one?announcement_id=${announcement_id}`
        );
      },

      /**
       * (學生)取得課堂公告的通知
       * @returns {Promise} 返回包含通知列表的響應
       * @example
       * // 響應格式:
       * // {
       * //   "data": {
       * //     "notifications": [
       * //       {
       * //         "course_id": "string"
       * //       }
       * //     ]
       * //   }
       * // }
       *
       * @requires 限定角色: student
       */
      getNotification: () => {
        return baseApiHelper.get(`/course-announcement/notifications`);
      },

      /**
       * (學生)已讀課堂公告
       * @param {string} course_id - 課程ID
       * @returns {Promise} 返回標記已讀成功的消息
       * @example
       * // 響應格式:
       * // {
       * //   "msg": "string"
       * // }
       *
       * @requires 限定角色: student
       */
      markAsRead: (course_id) => {
        return baseApiHelper.post(
          `/course-announcement/mark-as-read?course_id=${course_id}`
        );
      },
    };
  },
};
