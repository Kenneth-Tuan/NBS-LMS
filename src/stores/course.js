import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { message } from "ant-design-vue";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

import { courseService } from "../services/course.service";

// Assignment status
export const AssignmentStatus = {
  OPEN: "open",
  SUBMITTED: "submitted",
  GRADED: "graded",
  CLOSED: "closed",
  NOT_SUBMITTED: "not_submitted",
};

export const useCourseStore = defineStore(
  "course",
  () => {
    const courseForm = reactive({
      course_id: "",
      title: "",
      classMode: "",
      duration: 120,
      credit: 1,
      instructor: "",
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: dayjs().add(1, "month").format("YYYY-MM-DD"),
      enrollmentLimit: 5,
      weeklySchedule: [
        {
          id: uuidv4(),
          week_day: "週一",
          start_time: "15:00",
          end_time: "17:00",
        },
      ],
      prerequisites: [],
      description: "-",
      outlineFile: [],
    });

    const loading = ref(false);

    const courseInfos = reactive({
      courseList: [],
      teachers: [],
      prerequisites: [],
      weekDays: [
        { label: "週一", value: "週一" },
        { label: "週二", value: "週二" },
        { label: "週三", value: "週三" },
        { label: "週四", value: "週四" },
        { label: "週五", value: "週五" },
        { label: "週六", value: "週六" },
        { label: "週日", value: "週日" },
      ],
    });

    const resetForm = () => {
      courseForm.title = "";
      courseForm.classMode = "";
      courseForm.duration = 120;
      courseForm.credit = 1;
      courseForm.instructor = "";
      courseForm.startDate = dayjs().format("YYYY-MM-DD");
      courseForm.endDate = dayjs().add(1, "month").format("YYYY-MM-DD");
      courseForm.enrollmentLimit = 5;
      courseForm.weeklySchedule = [];
      courseForm.prerequisites = [];
      courseForm.description = "-";
      courseForm.outlineFile = [];
      addWeeklySchedule();
    };

    const createCourse = async () => {
      try {
        loading.value = true;

        const response = await courseService.createCourse();

        if (response.status !== 200) {
          throw error;
        } else {
          await courseService.getTeachers();
          await courseService.getPrerequisites();
          resetForm();
          message.success("課程已成功建立");
        }
      } catch (error) {
        message.error("課程建立失敗，請稍後再試");
        throw error;
      } finally {
        loading.value = false;
      }
    };

    const updateCourse = async () => {
      try {
        loading.value = true;

        await courseService.updateCourse();

        message.success("課程已成功更新");
      } catch (error) {
        message.error("課程更新失敗，請稍後再試");
        throw error;
      } finally {
        loading.value = false;
      }
    };

    const setCourseInfos = (column, value) => {
      if (column === "teachers") {
        courseInfos.teachers = value;
      } else if (column === "prerequisites") {
        courseInfos.prerequisites = value;
      }
    };

    const addWeeklySchedule = () => {
      courseForm.weeklySchedule.push({
        id: uuidv4(),
        week_day: "",
        start_time: "",
        end_time: "",
      });
    };

    const removeWeeklySchedule = (index) => {
      courseForm.weeklySchedule.splice(index, 1);
    };

    const getCourseHandler = async (courseId) => {
      try {
        const response = await courseService.getCourse(courseId);
        courseForm.course_id = courseId;

        Object.keys(courseForm).forEach((key) => {
          if (response.hasOwnProperty(key)) {
            courseForm[key] = response[key];
          }
        });
      } catch (error) {
        console.error(error);
      }
    };

    return {
      courseForm,
      loading,
      courseInfos,

      resetForm,
      createCourse,
      updateCourse,
      setCourseInfos,
      addWeeklySchedule,
      removeWeeklySchedule,
      getCourseHandler,
    };
  },
  {
    persist: ["courseInfos"],
  }
);
