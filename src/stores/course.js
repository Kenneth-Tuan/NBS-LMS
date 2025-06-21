import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { message } from "ant-design-vue";
import { v4 as uuidv4 } from "uuid";

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
      title: "系統神學",
      classMode: "綫上",
      duration: 120,
      credit: 10,
      instructor: "",
      startDate: "",
      endDate: "",
      enrollmentLimit: 20,
      weeklySchedule: [
        {
          id: uuidv4(),
          week_day: "週一",
          start_time: "15:00",
          end_time: "17:00",
        },
      ],
      prerequisites: [],
      description: "系統神學是神學的一個分支，主要研究神的系統和神的計畫。",
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
      courseForm.duration = 1;
      courseForm.credit = 1;
      courseForm.instructor = "";
      courseForm.startDate = "";
      courseForm.endDate = "";
      courseForm.enrollmentLimit = 1;
      courseForm.weeklySchedule = [];
      courseForm.prerequisites = [];
      courseForm.description = "";
      courseForm.outlineFile = [];
      addWeeklySchedule();
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

    const getCourseHandler = async (courseId) => {
      try {
        const response = await courseService.getCourse(courseId);

        console.log("Course data:", response);

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
      populateForm,
      createCourse,
      updateCourseStatus,
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
