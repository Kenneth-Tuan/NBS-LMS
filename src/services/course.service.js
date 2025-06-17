import courseApi from "@/apis/course";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";

import { useCourseStore } from "../stores/course";

const courseService = {
  getTeachers: async () => {
    const { courseInfos } = useCourseStore();
    // if (courseInfos.teachers.length > 0) return;

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
    // if (courseInfos.prerequisites.length > 0) return;

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

    const params = await courseService.getCourseFormParams(courseForm);

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

  getCourseFormParams: async (courseForm) => {
    try {
      const outline_files = await courseService.uploadFile(
        courseForm.outlineFile
      );

      const weekly_schedule = courseForm.weeklySchedule.map((schedule) => {
        delete schedule.id;
        return schedule;
      });

      return {
        name: courseForm.title,
        class_mode: courseForm.classMode,
        duration: courseForm.duration,
        credit: courseForm.credit,
        teacher_id: courseForm.instructor,
        start_date: courseForm.startDate,
        end_date: courseForm.endDate,
        enrollment_limit: courseForm.enrollmentLimit,
        weekly_schedule: weekly_schedule,
        prerequisite_course_ids: courseForm.prerequisites,
        description: courseForm.description,
        cover_image: null,
        outline_files: outline_files,
      };
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  uploadFile: async (data) => {
    console.log("uploadFile called with data:", data);
    const formData = new FormData();

    data.forEach((file) => {
      formData.append("files", file.originFileObj);
    });

    try {
      const response = await courseApi.uploadFile(formData);
      console.log("Upload response:", response);
      return response.data.data.upload_urls;
    } catch (error) {
      console.error("Upload error:", error);
      return [];
    }
  },

  // {
  //   "paged_info": {
  //     "page": 1
  //   },
  //   "ordering": {
  //     "direction": "asc 或是 desc",
  //     "field": "credit, start_date, end_date 或是 enrollment_limit"
  //   }
  // }

  getCourses: async () => {
    const params = {
      paged_info: {
        page: 1,
      },
      ordering: {
        direction: "asc",
        field: "credit",
      },
    };

    try {
      const response = await courseApi.getCourses(params);

      return response.data.data.courses;
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  getCourse: async (courseId) => {
    const params = {
      course_id: courseId,
    };

    try {
      const response = await courseApi.getOneCourse(params);
      return response.data.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  updateCourse: async (_courseForm) => {
    const courseStore = useCourseStore();
    const { courseForm } = courseStore;
    const { loading } = storeToRefs(courseStore);

    loading.value = true;

    const params = !!_courseForm
      ? _courseForm
      : await courseService.getCourseFormParams(courseForm);

    try {
      const response = await courseApi.updateCourse(params);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      loading.value = false;
    }
  },

  fetchCoursesForEnrollment: async () => {
    const params = {
      filter: {
        start_time: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSS+08:00"),
        end_time: dayjs()
          .add(1, "year")
          .format("YYYY-MM-DDTHH:mm:ss.SSS+08:00"),
      },
    };

    try {
      const response = await courseApi.getCoursesForEnrollment(params);
      return response.data.data.courses;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
};

export { courseService };
