import { defineStore } from "pinia";
import { computed, reactive, ref, h } from "vue";
import dayjs from "dayjs";
import { saveCourse } from "@/mocks/domains/courses/model";
import { message } from "ant-design-vue";
import { UserRole } from "@/enums/appEnums";
import { useUserStore } from "@/stores/user";

import { dummyCourseData } from "@/data/dummy";

// Assignment status
export const AssignmentStatus = {
  OPEN: "open",
  SUBMITTED: "submitted",
  GRADED: "graded",
  CLOSED: "closed",
  NOT_SUBMITTED: "not_submitted",
};

// Methods for assignment handling
export const handleFileSubmission = async (
  file,
  courseId,
  assignmentId,
  userId
) => {
  try {
    // This would be an API call in production
    console.log(
      `Uploading file ${file.name} for course ${courseId}, assignment ${assignmentId}`
    );

    // Mock a successful upload
    return {
      success: true,
      fileUrl: URL.createObjectURL(file),
      fileName: file.name,
      fileType: file.type.includes("pdf") ? "pdf" : "docx",
    };
  } catch (error) {
    console.error("File upload error:", error);
    message.error("檔案上傳失敗，請稍後再試");
    return { success: false };
  }
};

export const getSubmissionsByAssignment = async (courseId, assignmentId) => {
  try {
    // This would be an API call in production
    console.log(
      `Fetching submissions for course ${courseId}, assignment ${assignmentId}`
    );

    // Return mock data
    return [
      {
        id: "s1",
        assignmentId,
        courseId,
        studentId: "ST20240001",
        studentName: "張小明",
        status: "submitted",
        submitTime: "2024-04-08 14:30",
        file: {
          name: "作業研究.pdf",
          url: "#",
          type: "pdf",
        },
      },
      // Additional mock submissions can be added here
    ];
  } catch (error) {
    console.error("Fetch submissions error:", error);
    message.error("獲取提交資料失敗，請稍後再試");
    return [];
  }
};

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
      classMode: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "上課方式",
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
      weekday: {
        value: [],
        err: false,
        errMsg: "",
        required: true,
        label: "上課日",
        options: [
          { label: "週一", value: "mon" },
          { label: "週二", value: "tue" },
          { label: "週三", value: "wed" },
          { label: "週四", value: "thu" },
          { label: "週五", value: "fri" },
          { label: "週六", value: "sat" },
          { label: "週日", value: "sun" },
        ],
      },
      classTime: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "上課時段",
        rules: [
          (val) =>
            !val ||
            /^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(
              val
            ),
        ],
      },
      description: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "課程簡介",
      },
      outlineFile: {
        value: [],
        err: false,
        errMsg: "",
        required: true,
        label: "課程大綱附件",
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
        required: false,
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
        if (key === "outlineFile" || key === "weekday") {
          courseForm[key].value = [];
        } else {
          courseForm[key].value = "";
        }
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
        if (field.required) {
          if (fieldName === "outlineFile") {
            if (!field.value || field.value.length === 0) {
              field.err = true;
              field.errMsg = `${field.label}為必填欄位`;
              isValid = false;
            }
          } else if (fieldName === "weekday") {
            if (!field.value || field.value.length === 0) {
              field.err = true;
              field.errMsg = `${field.label}為必填欄位`;
              isValid = false;
            }
          } else if (!field.value) {
            field.err = true;
            field.errMsg = `${field.label}為必填欄位`;
            isValid = false;
          }
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
      {
        title: "課程名稱",
        dataIndex: "title",
        key: "title",
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
        dataIndex: "classMode",
        key: "classMode",
      },
      {
        title: "上課日",
        dataIndex: "weekday",
        key: "weekday",
        customRender: ({ value }) => {
          if (!value || !Array.isArray(value) || value.length === 0) return "-";

          const weekdayMap = {
            mon: "週一",
            tue: "週二",
            wed: "週三",
            thu: "週四",
            fri: "週五",
            sat: "週六",
            sun: "週日",
          };

          return value.map((day) => weekdayMap[day] || day).join(", ");
        },
      },
      {
        title: "上課時段",
        dataIndex: "classTime",
        key: "classTime",
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
