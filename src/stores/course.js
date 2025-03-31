import { defineStore } from "pinia";
import { computed, reactive, ref, h } from "vue";
import dayjs from "dayjs";
import { saveCourse } from "@/mocks/domains/courses/model";

import { dummyCourseData } from "@/data/dummy";

export const useCourseStore = defineStore(
  "course",
  () => {
    const courseForm = reactive({
      title: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "課程名稱",
      },
      type: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "課程類型",
        options: [
          { label: "新課程", value: "新課程" },
          { label: "重開課程", value: "重開課程" },
          { label: "進階課程", value: "進階課程" },
        ],
      },
      tags: {
        value: [],
        err: false,
        errMsg: "",
        required: true,
        label: "課程標籤",
        options: [
          { label: "專題班", value: "專題班" },
          { label: "線上遠距課程", value: "線上遠距課程" },
          { label: "線上直播課程", value: "線上直播課程" },
          { label: "實踐課", value: "實踐課" },
          { label: "實習課", value: "實習課" },
          { label: "其他", value: "其他" },
        ],
      },
      duration: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "課程時長",
      },
      instructor: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "授課教師",
      },
      startDate: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        mask: "####.##.##",
        rules: [(val) => !!val && dayjs(val, "YYYY.MM.DD", true)],
        label: "開課日期",
      },
      classType: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "上課方式",
        options: [
          { label: "六日兩日全天專題班", value: "六日兩日全天專題班" },
          { label: "六日兩日下午專題班", value: "六日兩日下午專題班" },
          { label: "線上遠距課程", value: "線上遠距課程" },
        ],
      },
      description: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "課程簡介",
      },
      outline: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "課程大綱",
      },
      teacherInfo: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "教師資訊",
      },
      image: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "課程封面圖片",
      },
    });

    const courseList = ref([]);
    const loading = ref(false);
    const error = ref(null);

    /**
     * Reset all form fields to their initial empty state
     */
    const resetForm = () => {
      Object.keys(courseForm).forEach((key) => {
        courseForm[key].value = "";
        courseForm[key].err = false;
        courseForm[key].errMsg = "";
      });
    };

    /**
     * Submit the course form
     * @returns {Promise} A promise that resolves when the form is submitted
     */
    const submitForm = async () => {
      try {
        // Validate the form first
        const isValid = validateForm();
        if (!isValid) {
          throw new Error("表單驗證失敗");
        }

        // Prepare the course data
        const formData = {};
        Object.keys(courseForm).forEach((key) => {
          formData[key] = courseForm[key].value;
        });

        // Add default status
        formData.status = "待審核";

        // Save to session storage
        const savedCourse = await saveCourse(formData);

        // Reset the form after successful submission
        resetForm();

        return savedCourse;
      } catch (error) {
        console.error("Error submitting form:", error);
        throw error;
      }
    };

    /**
     * Validate the form fields
     * @returns {boolean} Whether the form is valid
     */
    const validateForm = () => {
      let isValid = true;

      // Check each required field
      Object.keys(courseForm).forEach((fieldName) => {
        const field = courseForm[fieldName];

        // Reset error status
        field.err = false;
        field.errMsg = "";

        // Check if required and empty
        if (field.required && !field.value) {
          field.err = true;
          field.errMsg = `${field.label}為必填欄位`;
          isValid = false;
        }

        // Check custom validation rules if provided
        if (field.rules && field.value) {
          for (const rule of field.rules) {
            const result = rule(field.value);
            if (!result) {
              field.err = true;
              field.errMsg = `${field.label}格式不正確`;
              isValid = false;
              break;
            }
          }
        }
      });

      return isValid;
    };

    /**
     * Fetch the course list from the API
     */
    const getCourseList = async () => {
      loading.value = true;
      error.value = null;

      try {
        // const response = await fetch("/courseList");
        // const data = await response.json();

        // if (data.success) {
        //   courseList.value.length = 0;
        //   const courses = data.data;
        //   courses.forEach((course) => {
        //     courseList.value.push(course);
        //   });
        // } else {
        //   error.value = data.message || "獲取課程列表失敗";
        //   throw new Error(error.value);
        // }

        courseList.value = dummyCourseData;
      } catch (err) {
        error.value = err.message || "獲取課程列表時發生錯誤";
        throw err;
      } finally {
        loading.value = false;
      }
    };

    /**
     * Update a course's status
     * @param {string} id - The course ID
     * @param {string} status - The new status
     * @param {Object} reviewData - Additional review data
     * @returns {Object} The updated course
     */
    const updateCourseStatus = async (id, status, reviewData = {}) => {
      try {
        loading.value = true;
        error.value = null;

        const response = await fetch("/updateCourseStatus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, status, reviewData }),
        });

        const data = await response.json();

        if (data.success) {
          // Update the course list
          await getCourseList();
          return data.data;
        } else {
          error.value = data.message || "更新課程狀態失敗";
          throw new Error(error.value);
        }
      } catch (err) {
        error.value = err.message || "更新課程狀態時發生錯誤";
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const courses = ref(dummyCourseData);

    const courseTableColumns = computed(() => [
      {
        title: "封面",
        dataIndex: "image",
        key: "image",
      },
      //   {
      //     title: "ID",
      //     dataIndex: "id",
      //     display: false,
      //     key: "id",
      //     sorter: (a, b) => a.id - b.id,
      //   },
      {
        title: "課程名稱",
        dataIndex: "title",
        key: "title",
        // ellipsis: true,
        // resizable: true
      },
      {
        title: "狀態",
        dataIndex: "status",
        key: "status",
        filters: [
          { text: "招生中", value: "招生中" },
          { text: "即將額滿", value: "即將額滿" },
        ],
        onFilter: (value, record) => record.status === value,
      },
      {
        title: "類型",
        dataIndex: "type",
        key: "type",
      },
      {
        title: "時數",
        dataIndex: "duration",
        key: "duration",
      },
      {
        title: "講師",
        dataIndex: "instructor",
        key: "instructor",
      },
      {
        title: "開課日期",
        dataIndex: "startDate",
        key: "startDate",
        sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
      },
      {
        title: "上課方式",
        dataIndex: "classType",
        key: "classType",
      },
    ]);

    const searchCourseCriteria = reactive({
      title: "",
    });

    const courseTablePagination = reactive({
      pageSize: 10,
      current: 1,
      pageSizeOptions: ["10", "20", "50"],
      total: dummyCourseData.length,
    });

    return {
      courseForm,
      courseList,
      loading,
      error,
      resetForm,
      submitForm,
      getCourseList,
      updateCourseStatus,
      courses,
      searchCourseCriteria,
      courseTableColumns,
      courseTablePagination,
    };
  },
  {
    persist: false,
  }
);
