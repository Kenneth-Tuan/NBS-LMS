import courseApi from "@/apis/course";
import { storeToRefs } from "pinia";

import { useCourseStore } from "../stores/course";

const courseService = {
  getTeachers: async () => {
    const { courseInfos } = useCourseStore();
    if (courseInfos.teachers.length > 0) return;

    try {
      const {
        data: {
          data: { teachers },
        },
      } = await courseApi.getTeachers();
      courseInfos.teachers = teachers.map((teacher) => ({
        label: teacher.name,
        value: teacher.id,
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  getPrerequisites: async () => {
    const { courseInfos } = useCourseStore();
    if (courseInfos.prerequisites.length > 0) return;

    try {
      const {
        data: {
          data: { courses },
        },
      } = await courseApi.getPrerequisites();
      courseInfos.prerequisites = courses.map((course) => ({
        label: course.name,
        value: course.id,
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  //   {
  //     "name": "資料結構與演算法",
  //     "class_mode": "上課方法",
  //     "duration": 60,
  //     "credit": 3,
  //     "teacher_id": "5f2d73c8e5b4a",
  //     "start_date": "2025-09-01",
  //     "end_date": "2026-01-15",
  //     "enrollment_limit": 60,
  //     "weekly_schedule": [
  //       {
  //         "week_day": "週一",
  //         "start_time": "15:00",
  //         "end_time": "17:00"
  //       }
  //     ],
  //     "prerequisite_course_ids": [],
  //     "description": "課程介紹內容",
  //     "cover_image": null,
  //     "outline_files": []
  //   }
  createCourse: async () => {
    const courseStore = useCourseStore();
    const { courseForm } = courseStore;
    const { loading } = storeToRefs(courseStore);

    loading.value = true;

    const params = getCourseFormParams(courseForm);
    try {
      const data = await courseApi.createCourse(params);
      return data;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      loading.value = false;
    }
  },

  getCourseFormParams: (courseForm) => {
    return {
      name: courseForm.title,
      class_mode: courseForm.classMode,
      duration: courseForm.duration,
      credit: courseForm.credit,
      teacher_id: courseForm.instructor,
      start_date: courseForm.startDate,
      end_date: courseForm.endDate,
      enrollment_limit: courseForm.enrollmentLimit,
      weekly_schedule: courseForm.weeklySchedule,
      prerequisite_course_ids: courseForm.prerequisites,
      description: courseForm.description,
      cover_image: null,
      outline_files: courseForm.outlineFile,
    };
  },

  uploadFile: async (data) => {
    console.log("uploadFile called with data:", data);
    const formData = new FormData();

    // 處理 Ant Design Upload 的 custom-request 格式
    if (data.file) {
      // 這是來自 Ant Design 的 custom-request
      formData.append("files", data.file);

      try {
        const response = await courseApi.uploadFile(formData);
        console.log("Upload response:", response);

        // 呼叫 Ant Design Upload 的 onSuccess 回調
        if (data.onSuccess) {
          data.onSuccess(response.data.data.upload_urls);
        }

        return response.data.data.upload_urls;
      } catch (error) {
        console.error("Upload error:", error);

        // 呼叫 Ant Design Upload 的 onError 回調
        if (data.onError) {
          data.onError(error);
        }

        return [];
      }
    } else {
      // 直接檔案上傳
      // 判斷 data 是單個檔案還是檔案陣列
      if (Array.isArray(data)) {
        // 多檔案上傳
        data.forEach((file) => {
          formData.append("files", file);
        });
      } else {
        // 單個檔案上傳
        formData.append("files", data);
      }

      try {
        const response = await courseApi.uploadFile(formData);
        console.log("Upload response:", response);
        return response.data.data.upload_urls;
      } catch (error) {
        console.error("Upload error:", error);
        return [];
      }
    }
  },
};

export { courseService };
