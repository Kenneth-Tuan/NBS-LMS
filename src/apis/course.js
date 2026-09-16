import axios from "axios";
import { storeToRefs } from "pinia";

import { baseApiHelper, fileApiHelper } from "@/utils/axios";
import { UserRole } from "@/enums/appEnums";
import { useMiscStore } from "@/stores/misc.store";

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

  /**
   * 上傳檔案（v3：sign → GCS PUT → confirm 後才拿可存檔網址）
   * @param {string} fileName
   * @param {string} contentType
   * @param {{ originFileObj?: Blob|File }|Blob|File} file
   * @returns {Promise<string>} confirm 後的 url（可寫入 DB）
   */
  async uploadFile(fileName, contentType, file) {
    const miscStore = useMiscStore();
    const { globalLoading } = storeToRefs(miscStore);

    globalLoading.value = true;
    try {
      const {
        data: { data: signData },
      } = await baseApiHelper.post("/upload/v3/sign", {
        file_name: fileName,
        content_type: contentType,
      });

      // 後端文件是 snake_case；若實際回 camelCase 也相容
      const objectName = signData?.object_name ?? signData?.objectName;
      const uploadUrl = signData?.upload_url ?? signData?.uploadUrl;

      if (!uploadUrl || !objectName) {
        throw new Error(
          "取得上傳網址失敗（缺少 upload_url / object_name），請確認 /upload/v3/sign 回應",
        );
      }

      const rawFile = file?.originFileObj ?? file;
      if (!(rawFile instanceof Blob)) {
        throw new Error("找不到可上傳的檔案內容，請重新選擇檔案");
      }

      // PUT 目標是 storage.googleapis.com，不是 API domain
      await axios.put(uploadUrl, rawFile, {
        headers: {
          "Content-Type": contentType,
        },
      });

      const {
        data: { data: confirmData },
      } = await baseApiHelper.post("/upload/v3/confirm", {
        object_name: objectName,
      });

      const url = confirmData?.url;
      if (!url) {
        throw new Error("上傳確認失敗，未取得檔案網址");
      }

      return url;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      globalLoading.value = false;
    }
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

  updateEnrollment(enrollment_id, params) {
    //     {
    //   "course_ids": [
    //     "6433ab4a-89d6-43e3-a19c-62d1b59f885d",
    //     "f49a88e3-6110-431f-bef1-dfa7de8be471"
    //   ],
    //   "start_time": "2025-04-01T09:00:00.000+08:00",
    //   "end_time": "2025-08-01T21:00:00.000+08:00",
    //   "credit_limit": 21
    // }
    return baseApiHelper.patch(
      `/enrollment/replace-one?enrollment_id=${enrollment_id}`,
      params
    );
  },

  pickCourse(params) {
    return baseApiHelper.post(`/enrollment/pick-course`, params);
  },

  dropCourse(params) {
    return baseApiHelper.post(`/enrollment/drop-course`, params);
  },

  /**
   * 標記／取消單一學生的旁聽狀態（admin / manager / creator）
   * @param {string} course_id
   * @param {string} student_id
   * @param {boolean} is_audit
   */
  patchEnrollmentAudit(course_id, student_id, is_audit) {
    return baseApiHelper.patch(
      `/enrollment/audit?course_id=${course_id}&student_id=${student_id}`,
      { is_audit },
    );
  },

  /**
   * 批次標記／取消旁聽（admin / manager / creator）
   * @param {string} course_id
   * @param {string[]} student_ids
   * @param {boolean} is_audit
   */
  patchEnrollmentAuditBatch(course_id, student_ids, is_audit) {
    return baseApiHelper.patch(
      `/enrollment/audit/batch?course_id=${course_id}`,
      { student_ids, is_audit },
    );
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
