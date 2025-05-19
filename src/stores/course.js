import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { message } from "ant-design-vue";
import { v4 as uuidv4 } from "uuid";

import { saveCourse } from "@/mocks/domains/courses/model";
import { courseService } from "../services/course.service";

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
      title: "",
      classMode: "",
      duration: 1,
      credit: 1,
      instructor: "",
      startDate: "",
      endDate: "",
      enrollmentLimit: 1,
      weeklySchedule: [
        {
          id: uuidv4(),
          week_day: "週一",
          start_time: "15:00",
          end_time: "17:00",
        },
      ],
      prerequisites: [],
      description: "",
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
      // Object.keys(courseForm).forEach((key) => {
      //   if (
      //     key === "outlineFile" ||
      //     key === "weekday" ||
      //     key === "prerequisites"
      //   ) {
      //     courseForm[key] = [];
      //   } else if (key === "enrollmentLimit" || key === "credit") {
      //     courseForm[key] = null;
      //   } else {
      //     courseForm[key] = "";
      //   }
      // });
    };

    const populateForm = (courseData) => {
      // if (!courseData) {
      //   console.error("Cannot populate form: courseData is null or undefined.");
      //   message.error("無法加載課程資料進行編輯");
      //   return;
      // }
      // console.log("Populating form with:", courseData);
      // courseForm.prerequisites.options =
      //   courseForm.prerequisites.options.filter(
      //     (option) => option.value !== courseData.id
      //   );
      // Object.keys(courseForm).forEach((key) => {
      //   if (courseData.hasOwnProperty(key)) {
      //     if (key === "weekday" || key === "prerequisites") {
      //       courseForm[key].value = Array.isArray(courseData[key])
      //         ? [...courseData[key]]
      //         : [];
      //     } else if (key === "enrollmentLimit" || key === "credit") {
      //       courseForm[key].value =
      //         typeof courseData[key] === "number" ? courseData[key] : null;
      //     } else if (key === "startDate") {
      //       courseForm[key].value = courseData[key] || "";
      //     } else if (key === "classTime") {
      //       courseForm[key].value = courseData[key] || "";
      //     } else if (key === "outlineFile") {
      //       courseForm[key].value = [];
      //     } else if (key === "image") {
      //       courseForm[key].value = courseData[key] || "";
      //     } else {
      //       courseForm[key].value = courseData[key];
      //     }
      //   } else {
      //     if (
      //       key !== "outlineFile" &&
      //       key !== "weekday" &&
      //       key !== "prerequisites"
      //     ) {
      //       courseForm[key].value = "";
      //     }
      //   }
      //   courseForm[key].err = false;
      //   courseForm[key].errMsg = "";
      // });
      // console.log("Form populated:", courseForm);
    };

    const submitForm = async () => {
      try {
        loading.value = true;

        courseForm.outlineFile = await courseService.uploadFile(
          courseForm.outlineFile
        );

        await courseService.createCourse(courseForm);
      } catch (error) {
        console.error("Error submitting form:", error);
        throw error;
      } finally {
        loading.value = false;
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

    const updateCourseStatus = async (id, status, reviewData = {}) => {
      try {
        loading.value = true;

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
          throw new Error();
        }
      } catch (err) {
        throw err;
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

    return {
      courseForm,
      loading,
      courseInfos,

      resetForm,
      populateForm,
      submitForm,
      updateCourseStatus,
      setCourseInfos,
      addWeeklySchedule,
      removeWeeklySchedule,
    };
  },
  {
    persist: ["courseInfos"],
  }
);
