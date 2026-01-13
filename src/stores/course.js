import { defineStore } from "pinia";
import { reactive, ref, computed } from "vue";
import { message } from "ant-design-vue";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

import { courseService } from "../services/course.service";
import courseApi from "../apis/course";

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
      code: "",
      prerequisite_course_codes: [],
      required_for_departments: [],
    });

    const loading = ref(false);

    const filters = reactive({
      keyword: "",
      teacher: "",
    });

    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 1,
      hideOnSinglePage: false,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "30", "40", "50"],
    });

    const courseInfos = reactive({
      courseList: [],
      teachers: [],
      prerequisites: [],
      prerequisite_course_codes: [],
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
      courseForm.code = "";
      courseForm.prerequisite_course_codes = [];
      courseForm.required_for_departments = [];
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

    const getCoursesHandler = async (_pagination = pagination, ordering) => {
      const DIRECTION_MAP = {
        ascend: "asc",
        descend: "desc",
      };

      const params = {
        paged_info: {
          page: _pagination.current,
          page_size: _pagination.pageSize,
        },
        ordering: {
          direction: DIRECTION_MAP[ordering?.order] ?? "asc",
          field: ordering?.field ?? "start_date",
        },
      };

      loading.value = true;
      try {
        const response = await courseApi.getCourses(params);
        courseInfos.courseList = response.data.data.courses;
        pagination.current = response.data.page;
        pagination.total = response.data.total_page * response.data.page_size;
        pagination.pageSize = response.data.page_size;
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    };

    const teacherOptions = computed(() => {
      const teachers = new Set();
      courseInfos.courseList.forEach((course) => {
        if (course.instructor_name) {
          teachers.add(course.instructor_name);
        }
      });
      return Array.from(teachers).sort();
    });

    const filteredCourseData = computed(() => {
      return courseInfos.courseList.filter((course) => {
        const nameMatch = course.name
          ? course.name.toLowerCase().includes(filters.keyword.toLowerCase())
          : true;
        const teacherMatch = filters.teacher
          ? course.instructor_name === filters.teacher
          : true;
        return nameMatch && teacherMatch;
      });
    });

    return {
      courseForm,
      loading,
      courseInfos,
      pagination,
      teacherOptions,
      filters,
      filteredCourseData,

      resetForm,
      createCourse,
      updateCourse,
      setCourseInfos,
      addWeeklySchedule,
      removeWeeklySchedule,
      getCourseHandler,
      getCoursesHandler,
    };
  },
  {
    persist: ["courseInfos"],
  }
);
