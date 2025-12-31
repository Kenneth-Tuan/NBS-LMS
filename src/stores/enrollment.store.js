import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { message } from "ant-design-vue";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

import courseApi from "@/apis/course";
import { useUserStore } from "@/stores/user";

export const useEnrollmentStore = defineStore(
  "enrollment",
  () => {
    const loading = ref(false);
    const coursesForEnrollment = ref([]);
    const hasEnrollment = computed(() => {
      return coursesForEnrollment.value.length > 0;
    });

    const selectedCourses = ref([]);
    const totalSelectedCredits = computed(() =>
      selectedCourses.value.reduce(
        (acc, course) => acc + Number(course.credit),
        0
      )
    );

    const activeTabKey = ref("available");

    const fetchCoursesForEnrollment = async () => {
      loading.value = true;

      try {
        const {
          data: {
            data: { courses },
          },
        } = await courseApi.getCoursesForEnrollment();

        coursesForEnrollment.value = courses;
      } catch (error) {
        console.error(error);
        message.error("無法載入課程資料");
      } finally {
        loading.value = false;
      }
    };

    const fetchMyCourseData = async () => {
      loading.value = true;

      try {
        const {
          data: {
            data: { slots },
          },
        } = await courseApi.myCourseSchedule();

        selectedCourses.value = [...slots];
      } catch (error) {
        console.error("Failed to fetch my courses:", error);
        message.error("無法載入我的課程資料");
      } finally {
        loading.value = false;
      }
    };

    const selectCourse = async (course_id) => {
      try {
        if (loading.value) {
          message.error("正在處理中，請稍後再試");
          return;
        }

        loading.value = true;

        const {
          data: {
            data: {
              results: [result],
            },
          },
        } = await courseApi.pickCourse({ course_ids: [course_id] });
        const { message: errorMessage, success } = result;

        if (success) {
          fetchMyCourseData();
          fetchCoursesForEnrollment();
          activeTabKey.value = "selected";
        } else {
          message.error(errorMessage);
        }
      } catch (error) {
        console.error(error);
        const {
          response: {
            data: { msg },
          },
        } = error;
        message.error(msg || "選課時發生錯誤，請稍後再試");
      } finally {
        loading.value = false;
      }
    };

    const dropCourse = async (course_id) => {
      loading.value = true;

      try {
        const {
          data: { data: result },
        } = await courseApi.dropCourse({ course_id });
        const { message: msg, success } = result;

        if (success) {
          fetchMyCourseData();
          fetchCoursesForEnrollment();
          activeTabKey.value = "available";
          message.success(msg);
        } else {
          message.error(msg);
        }

        fetchMyCourseData();
        fetchCoursesForEnrollment();
      } catch (error) {
        console.error("Failed to drop course:", error);
        message.error("退選時發生錯誤，請稍後再試");
      } finally {
        loading.value = false;
      }
    };

    const autoPickCoursesByDepartment = async () => {
      const userStore = useUserStore();
      const { userProfile } = userStore;

      if (
        !userProfile.departments ||
        (Array.isArray(userProfile.departments) &&
          userProfile.departments.length === 0)
      )
        return;

      try {
        coursesForEnrollment.value.forEach(async (course) => {
          try {
            const { required_for_departments, course_id } = course;
            if (
              required_for_departments.some((department) =>
                userProfile.departments.includes(department)
              ) &&
              !selectedCourses.value.some(
                (selectedCourse) => selectedCourse.course_id === course_id
              )
            ) {
              await selectCourse(course.course_id);
            }
          } catch (error) {
            throw error;
          }
        });
      } catch (error) {
        console.error(error);
        message.error("自動選課時發生錯誤，請稍後再試");
      } finally {
        loading.value = false;
      }
    };

    return {
      coursesForEnrollment,
      hasEnrollment,
      selectedCourses,
      activeTabKey,
      loading,
      totalSelectedCredits,

      fetchCoursesForEnrollment,
      fetchMyCourseData,
      selectCourse,
      dropCourse,
      autoPickCoursesByDepartment,
    };
  },
  {
    persist: [""],
  }
);
