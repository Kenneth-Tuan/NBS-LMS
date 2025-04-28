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
        required: false,
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
      credit: {
        value: null,
        err: false,
        errMsg: "",
        required: true,
        label: "學分數",
        rules: [
          (val) =>
            val === null || (typeof val === "number" && val > 0 && val <= 10),
        ],
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
      enrollmentLimit: {
        value: null,
        err: false,
        errMsg: "",
        required: true,
        label: "選課人數上限",
        rules: [
          (val) =>
            val === null || (typeof val === "number" && val >= 1 && val <= 999),
        ],
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
      prerequisites: {
        value: [],
        err: false,
        errMsg: "",
        required: false,
        label: "先修課程",
        options: [],
      },
      outlineFile: {
        value: [],
        err: false,
        errMsg: "",
        required: false,
        label: "課程大綱附件",
      },
      teacherInfo: {
        value: "",
        err: false,
        errMsg: "",
        required: false,
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

    const populatePrerequisiteOptions = () => {
      courseForm.prerequisites.options = dummyCourseData.map((course) => ({
        label: course.title,
        value: course.id,
      }));
    };

    const resetForm = () => {
      Object.keys(courseForm).forEach((key) => {
        const field = courseForm[key];
        if (
          key === "outlineFile" ||
          key === "weekday" ||
          key === "prerequisites"
        ) {
          field.value = [];
        } else if (key === "enrollmentLimit" || key === "credit") {
          field.value = null;
        } else {
          field.value = "";
        }
        field.err = false;
        field.errMsg = "";
      });
      populatePrerequisiteOptions();
    };

    const populateForm = (courseData) => {
      if (!courseData) {
        console.error("Cannot populate form: courseData is null or undefined.");
        message.error("無法加載課程資料進行編輯");
        return;
      }
      console.log("Populating form with:", courseData);
      populatePrerequisiteOptions();
      courseForm.prerequisites.options =
        courseForm.prerequisites.options.filter(
          (option) => option.value !== courseData.id
        );
      Object.keys(courseForm).forEach((key) => {
        if (courseData.hasOwnProperty(key)) {
          if (key === "weekday" || key === "prerequisites") {
            courseForm[key].value = Array.isArray(courseData[key])
              ? [...courseData[key]]
              : [];
          } else if (key === "enrollmentLimit" || key === "credit") {
            courseForm[key].value =
              typeof courseData[key] === "number" ? courseData[key] : null;
          } else if (key === "startDate") {
            courseForm[key].value = courseData[key] || "";
          } else if (key === "classTime") {
            courseForm[key].value = courseData[key] || "";
          } else if (key === "outlineFile") {
            courseForm[key].value = [];
          } else if (key === "image") {
            courseForm[key].value = courseData[key] || "";
          } else {
            courseForm[key].value = courseData[key];
          }
        } else {
          if (
            key !== "outlineFile" &&
            key !== "weekday" &&
            key !== "prerequisites"
          ) {
            courseForm[key].value = "";
          }
        }
        courseForm[key].err = false;
        courseForm[key].errMsg = "";
      });
      console.log("Form populated:", courseForm);
    };

    const submitForm = async () => {
      try {
        const isValid = validateForm();
        if (!isValid) {
          throw new Error("表單驗證失敗");
        }
        const formData = {};
        Object.keys(courseForm).forEach((key) => {
          if (key !== "prerequisites" || !courseForm[key].options) {
            formData[key] = courseForm[key].value;
          } else {
            formData[key] = courseForm[key].value;
          }
        });
        formData.status = "待審核";
        const savedCourse = await saveCourse(formData);
        resetForm();
        return savedCourse;
      } catch (error) {
        console.error("Error submitting form:", error);
        throw error;
      }
    };

    const validateForm = () => {
      let isValid = true;
      console.log("Validating form...");
      Object.keys(courseForm).forEach((fieldName) => {
        const field = courseForm[fieldName];
        field.err = false;
        field.errMsg = "";

        if (field.required) {
          let isEmpty = false;
          if (Array.isArray(field.value)) {
            isEmpty = field.value.length === 0;
          } else if (typeof field.value === "number") {
            isEmpty = field.value === null || field.value === undefined;
          } else {
            isEmpty = !field.value;
          }
          if (isEmpty) {
            field.err = true;
            field.errMsg = `${field.label}為必填欄位`;
            console.error(field.errMsg);
            isValid = false;
          }
        }

        if (
          field.rules &&
          field.value !== null &&
          field.value !== undefined &&
          (!Array.isArray(field.value) || field.value.length > 0)
        ) {
          for (const rule of field.rules) {
            if (!rule(field.value)) {
              field.err = true;
              if (fieldName === "enrollmentLimit") {
                field.errMsg = `${field.label}必須介於 1 到 999 之間`;
              } else if (fieldName === "credit") {
                field.errMsg = `${field.label}必須介於 1 到 10 之間`;
              } else {
                field.errMsg = `${field.label}格式不正確`;
              }
              console.error(field.errMsg);
              isValid = false;
              break;
            }
          }
        }
      });
      if (!isValid) {
        console.error("Form validation failed.");
      }
      return isValid;
    };

    const getCourseList = async () => {
      loading.value = true;
      error.value = null;

      try {
        courseList.value = dummyCourseData;
      } catch (err) {
        error.value = err.message || "獲取課程列表時發生錯誤";
        throw err;
      } finally {
        loading.value = false;
      }
    };

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

    populatePrerequisiteOptions();

    return {
      courseForm,
      courseList,
      loading,
      error,
      resetForm,
      populateForm,
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
