<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { useRoute } from "vue-router";
import {
  FilePdfOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  FileTextOutlined,
  LinkOutlined,
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";

import { useUserStore } from "@/stores/user";
import { UserRole } from "@/enums/appEnums";

const AssignmentStatus = {
  OPEN: "OPEN",
  SUBMITTED: "SUBMITTED", // Student has submitted
  GRADED: "GRADED", // Teacher has graded
  CLOSED: "CLOSED", // Assignment is no longer open for submissions
  NOT_SUBMITTED: "NOT_SUBMITTED", // Student has not submitted (for student tracking)
};

const route = useRoute();
const { userProfile } = useUserStore();

const currentCourseId = ref(route.params.id || "mock-course-1");
const currentCourse = ref(null);
const loading = ref(false);

// --- Role Management ---
// Mock current student ID. In a real app, this would come from userProfile.id after login.
const currentUserStudentId = ref(userProfile.value?.id || "s001");
const isTeacherOrCreator = computed(
  () =>
    userProfile.userRole === UserRole.Teacher ||
    userProfile.userRole === UserRole.Creator
);
const isStudent = computed(() => userProfile.userRole === UserRole.Student);

// --- Mock Data ---
const mockCourses = [
  {
    id: "mock-course-1",
    name: "新約概論 (示範課程)",
    teacher: "王大明牧師",
    description: "這是一個示範課程的管理中心。",
  },
  {
    id: "mock-course-2",
    name: "舊約歷史書研究 (示範課程)",
    teacher: "李文清博士",
    description: "舊約研究的管理中心。",
  },
];

const announcements = ref([]);
const assignments = ref([]); // General assignment info
const materials = ref([]);
const students = ref([]); // Course student roster
const grades = reactive({}); // { studentId: { assignmentId: score } } - Teacher's gradebook data

// Student-specific submission tracking for the current student
const currentUserSubmissions = ref([]); // [{ assignmentId, status, fileName, grade }]

// --- Modals State ---
const announcementModal = reactive({
  visible: false,
  isEdit: false,
  id: null,
  title: "",
  content: "",
});

const assignmentModal = reactive({
  visible: false,
  isEdit: false,
  id: null,
  title: "",
  description: "",
  dueDate: null,
});

const materialModal = reactive({
  visible: false,
  isEdit: false,
  id: null,
  name: "",
  type: "file",
  url: "",
  file: null,
});

// --- Lifecycle Hooks ---
onMounted(() => {
  // Ensure userProfile is loaded if it's initially null/undefined from the store
  if (!userProfile.value && userProfile.fetchUserProfile) {
    // Assuming store has a fetch method
    userProfile.fetchUserProfile().then(() => {
      currentUserStudentId.value = userProfile.value?.id || "s001"; // Re-assign after fetch
      loadCourseData();
    });
  } else {
    loadCourseData();
  }
});

// --- Data Loading and Initialization ---
const loadCourseData = () => {
  loading.value = true;
  setTimeout(() => {
    currentCourse.value = mockCourses.find(
      (c) => c.id === currentCourseId.value
    );
    if (!currentCourse.value) {
      message.error("找不到課程資料");
      currentCourse.value = { name: "未知課程" };
      loading.value = false;
      return;
    }

    announcements.value = [
      {
        id: uuidv4(),
        courseId: currentCourseId.value,
        title: `歡迎來到「${currentCourse.value.name}」`,
        content: "請大家先閱讀課程大綱。",
        date: dayjs().subtract(2, "day").format("YYYY-MM-DD HH:mm"),
      },
      {
        id: uuidv4(),
        courseId: currentCourseId.value,
        title: "第一次作業已發布",
        content: "截止日期為下週末，請注意時間。",
        date: dayjs().subtract(1, "day").format("YYYY-MM-DD HH:mm"),
      },
    ].filter((a) => a.courseId === currentCourseId.value);

    assignments.value = [
      {
        id: uuidv4(),
        courseId: currentCourseId.value,
        title: "書卷背景研究",
        description: "選擇一卷書信，研究其歷史背景與寫作目的。",
        dueDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
        status: AssignmentStatus.OPEN,
      },
      {
        id: uuidv4(),
        courseId: currentCourseId.value,
        title: "主題報告：登山寶訓",
        description: "分析登山寶訓的核心教導及其現代應用。",
        dueDate: dayjs().add(14, "day").format("YYYY-MM-DD"),
        status: AssignmentStatus.OPEN,
      },
      {
        id: "old-assign-1",
        courseId: currentCourseId.value,
        title: "舊約歷史回顧",
        description: "回顧士師時期的主要事件。",
        dueDate: dayjs().subtract(5, "day").format("YYYY-MM-DD"),
        status: AssignmentStatus.CLOSED,
      },
    ].filter((a) => a.courseId === currentCourseId.value);

    materials.value = [
      {
        id: uuidv4(),
        courseId: currentCourseId.value,
        name: "課程大綱.pdf",
        type: "file",
        fileType: "pdf",
        url: "#",
        uploadDate: dayjs().subtract(3, "day").format("YYYY-MM-DD"),
      },
      {
        id: uuidv4(),
        courseId: currentCourseId.value,
        name: "第一週PPT.pptx",
        type: "file",
        fileType: "ppt",
        url: "#",
        uploadDate: dayjs().subtract(2, "day").format("YYYY-MM-DD"),
      },
    ].filter((m) => m.courseId === currentCourseId.value);

    students.value = [
      {
        id: "s001",
        courseId: currentCourseId.value,
        name: "張小明",
        studentId: "ST2024001",
        email: "ming@example.com",
      },
      {
        id: "s002",
        courseId: currentCourseId.value,
        name: "李大華",
        studentId: "ST2024002",
        email: "hua@example.com",
      },
      {
        id: "s003",
        courseId: currentCourseId.value,
        name: "陳美麗",
        studentId: "ST2024003",
        email: "mei@example.com",
      },
    ].filter((s) => s.courseId === currentCourseId.value);

    // Initialize grades structure for all students and assignments
    students.value.forEach((student) => {
      grades[student.id] = {};
      assignments.value.forEach((assignment) => {
        // Mock some grades for demo
        if (student.id === "s001" && assignment.id === "old-assign-1") {
          grades[student.id][assignment.id] = 88;
        } else if (
          Math.random() > 0.7 &&
          assignment.status === AssignmentStatus.CLOSED
        ) {
          grades[student.id][assignment.id] =
            Math.floor(Math.random() * 30) + 70;
        } else {
          grades[student.id][assignment.id] = null;
        }
      });
    });

    // Initialize currentUserSubmissions if the user is a student
    if (isStudent.value) {
      currentUserSubmissions.value = assignments.value.map((assign) => {
        const studentGrade = grades[currentUserStudentId.value]?.[assign.id];
        if (studentGrade !== null && studentGrade !== undefined) {
          return {
            assignmentId: assign.id,
            status: AssignmentStatus.GRADED,
            fileName: `student_${
              currentUserStudentId.value
            }_${assign.id.substring(0, 3)}.pdf`,
            grade: studentGrade,
          };
        }
        // Mock some submitted but not graded for OPEN assignments
        if (assign.status === AssignmentStatus.OPEN && Math.random() > 0.6) {
          return {
            assignmentId: assign.id,
            status: AssignmentStatus.SUBMITTED,
            fileName: `submitted_${
              currentUserStudentId.value
            }_${assign.id.substring(0, 3)}.docx`,
            grade: null,
          };
        }
        return {
          assignmentId: assign.id,
          status: AssignmentStatus.NOT_SUBMITTED,
          fileName: null,
          grade: null,
        };
      });
    }

    loading.value = false;
  }, 500);
};

// --- Helper ---
const getStatusText = (status) => {
  switch (status) {
    case AssignmentStatus.OPEN:
      return "進行中";
    case AssignmentStatus.SUBMITTED:
      return "已繳交";
    case AssignmentStatus.GRADED:
      return "已評分";
    case AssignmentStatus.CLOSED:
      return "已關閉";
    case AssignmentStatus.NOT_SUBMITTED:
      return "未繳交";
    default:
      return "未知";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case AssignmentStatus.OPEN:
      return "blue";
    case AssignmentStatus.SUBMITTED:
      return "green";
    case AssignmentStatus.GRADED:
      return "purple";
    case AssignmentStatus.CLOSED:
      return "red";
    case AssignmentStatus.NOT_SUBMITTED:
      return "orange";
    default:
      return "default";
  }
};

// --- Announcements (No changes for student view other than hiding controls) ---
const openAddAnnouncementModal = () => {
  announcementModal.isEdit = false;
  announcementModal.id = null;
  announcementModal.title = "";
  announcementModal.content = "";
  announcementModal.visible = true;
};
const openEditAnnouncementModal = (ann) => {
  announcementModal.isEdit = true;
  announcementModal.id = ann.id;
  announcementModal.title = ann.title;
  announcementModal.content = ann.content;
  announcementModal.visible = true;
};
const confirmAnnouncement = () => {
  if (!announcementModal.title || !announcementModal.content) {
    message.error("請填寫標題和內容");
    return;
  }
  if (announcementModal.isEdit) {
    const index = announcements.value.findIndex(
      (a) => a.id === announcementModal.id
    );
    if (index !== -1) {
      announcements.value[index] = {
        ...announcements.value[index],
        title: announcementModal.title,
        content: announcementModal.content,
      };
      message.success("公告更新成功");
    }
  } else {
    announcements.value.unshift({
      id: uuidv4(),
      courseId: currentCourseId.value,
      title: announcementModal.title,
      content: announcementModal.content,
      date: dayjs().format("YYYY-MM-DD HH:mm"),
    });
    message.success("公告新增成功");
  }
  announcementModal.visible = false;
};
const deleteAnnouncement = (annId) => {
  announcements.value = announcements.value.filter((a) => a.id !== annId);
  message.success("公告刪除成功");
};

// --- Assignments (Teacher/Creator controls + Student Submission Logic) ---
const openAddAssignmentModal = () => {
  assignmentModal.isEdit = false;
  assignmentModal.id = null;
  assignmentModal.title = "";
  assignmentModal.description = "";
  assignmentModal.dueDate = null;
  assignmentModal.visible = true;
};
const openEditAssignmentModal = (assign) => {
  assignmentModal.isEdit = true;
  assignmentModal.id = assign.id;
  assignmentModal.title = assign.title;
  assignmentModal.description = assign.description;
  assignmentModal.dueDate = dayjs(assign.dueDate);
  assignmentModal.visible = true;
};
const confirmAssignment = () => {
  // For Teacher/Creator
  if (!assignmentModal.title || !assignmentModal.dueDate) {
    message.error("請填寫作業標題和截止日期");
    return;
  }
  const assignmentData = {
    title: assignmentModal.title,
    description: assignmentModal.description,
    dueDate: dayjs(assignmentModal.dueDate).format("YYYY-MM-DD"),
    status: AssignmentStatus.OPEN, // New assignments are OPEN
  };

  if (assignmentModal.isEdit) {
    const index = assignments.value.findIndex(
      (a) => a.id === assignmentModal.id
    );
    if (index !== -1) {
      assignments.value[index] = {
        ...assignments.value[index],
        ...assignmentData,
      };
      message.success("作業更新成功");
    }
  } else {
    const newAssignment = {
      id: uuidv4(),
      courseId: currentCourseId.value,
      ...assignmentData,
    };
    assignments.value.push(newAssignment);
    // For new assignments, ensure all students have a grade entry (null) and students have a NOT_SUBMITTED entry
    students.value.forEach((student) => {
      if (!grades[student.id]) grades[student.id] = {};
      grades[student.id][newAssignment.id] = null;
    });
    if (isStudent.value) {
      // Though student can't create, this ensures data structure if roles change dynamically
      currentUserSubmissions.value.push({
        assignmentId: newAssignment.id,
        status: AssignmentStatus.NOT_SUBMITTED,
        fileName: null,
        grade: null,
      });
    } else {
      // If teacher adds an assignment, all students get a NOT_SUBMITTED status for it in their view if they were to switch
      // This part needs careful handling if we are aiming for a global student submission state.
      // For this component's mock, `currentUserSubmissions` is specific to the *viewing* student.
      // So, if a teacher adds an assignment, a student viewing this page later will have it initialized in loadCourseData.
    }
    message.success("作業新增成功");
  }
  assignmentModal.visible = false;
};
const deleteAssignment = (assignId) => {
  // For Teacher/Creator
  assignments.value = assignments.value.filter((a) => a.id !== assignId);
  students.value.forEach((student) => {
    if (grades[student.id] && grades[student.id][assignId] !== undefined) {
      delete grades[student.id][assignId];
    }
  });
  if (isStudent.value) {
    currentUserSubmissions.value = currentUserSubmissions.value.filter(
      (s) => s.assignmentId !== assignId
    );
  }
  message.success("作業刪除成功");
};

// --- Student Assignment Interaction ---
const getStudentSubmissionForAssignment = (assignmentId) => {
  if (!isStudent.value) return null;
  return currentUserSubmissions.value.find(
    (s) => s.assignmentId === assignmentId
  );
};

const handleStudentMockUpload = (assignment, file) => {
  const submission = currentUserSubmissions.value.find(
    (s) => s.assignmentId === assignment.id
  );
  if (submission) {
    submission.status = AssignmentStatus.SUBMITTED;
    submission.fileName = file.name;
    submission.grade = null; // Reset grade if re-submitting
    message.success(`作業 "${assignment.title}" 已成功模擬繳交: ${file.name}`);
  } else {
    // Should be initialized
    currentUserSubmissions.value.push({
      assignmentId: assignment.id,
      status: AssignmentStatus.SUBMITTED,
      fileName: file.name,
      grade: null,
    });
    message.success(
      `作業 "${assignment.title}" 已成功模擬繳交 (新紀錄): ${file.name}`
    );
  }
  return false; // Prevent Ant Design's default upload
};

const prepareResubmit = (assignment) => {
  const submission = currentUserSubmissions.value.find(
    (s) => s.assignmentId === assignment.id
  );
  if (
    submission &&
    submission.status !== AssignmentStatus.GRADED &&
    assignment.status === AssignmentStatus.OPEN
  ) {
    submission.status = AssignmentStatus.NOT_SUBMITTED; // Or a specific "READY_TO_RESUBMIT"
    submission.fileName = null;
    message.info(`請重新上傳作業 "${assignment.title}"`);
  } else {
    message.warn("此作業無法重新繳交。");
  }
};

// --- Gradebook (Teacher/Creator + Student View) ---
const gradebookColumns = computed(() => {
  // For Teacher/Creator
  const baseColumns = [
    {
      title: "學生姓名",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 120,
    },
    {
      title: "學號",
      dataIndex: "studentId",
      key: "studentId",
      fixed: "left",
      width: 120,
    },
  ];
  const assignmentCols = assignments.value.map((assign) => ({
    title: assign.title,
    dataIndex: ["grades", assign.id],
    key: assign.id,
    width: 150,
  }));
  return [...baseColumns, ...assignmentCols];
});

const gradebookDataSource = computed(() => {
  // For Teacher/Creator
  return students.value.map((student) => ({
    ...student,
    key: student.id,
    grades: grades[student.id] || {},
  }));
});

const handleGradeChange = (studentId, assignmentId, event) => {
  // For Teacher/Creator
  const score = event.target.value ? parseInt(event.target.value, 10) : null;
  if (score !== null && (isNaN(score) || score < 0 || score > 100)) {
    message.error("請輸入 0-100 之間的有效分數");
    event.target.value = grades[studentId][assignmentId] || "";
    return;
  }
  if (!grades[studentId]) grades[studentId] = {};
  grades[studentId][assignmentId] = score;

  // If student is viewing, update their submission status too
  if (currentUserStudentId.value === studentId) {
    const studentSubmission = currentUserSubmissions.value.find(
      (s) => s.assignmentId === assignmentId
    );
    if (studentSubmission) {
      studentSubmission.grade = score;
      studentSubmission.status =
        score !== null ? AssignmentStatus.GRADED : AssignmentStatus.SUBMITTED;
    }
  }
  // message.success("成績已更新"); // Can be noisy
};

// Student Gradebook View
const studentGradebookColumns = computed(() => [
  { title: "作業名稱", dataIndex: "title", key: "title", ellipsis: true },
  {
    title: "您的成績",
    dataIndex: "gradeDisplay",
    key: "grade",
    width: 120,
    align: "center",
  },
  {
    title: "狀態",
    dataIndex: "statusText",
    key: "status",
    width: 120,
    align: "center",
  },
]);

const studentGradebookDataSource = computed(() => {
  if (!isStudent.value) return [];
  return assignments.value.map((assign) => {
    const submission = currentUserSubmissions.value.find(
      (s) => s.assignmentId === assign.id
    );
    let gradeDisplay = "-";
    let statusText = getStatusText(AssignmentStatus.NOT_SUBMITTED); // Default if no submission entry

    if (submission) {
      statusText = getStatusText(submission.status);
      if (submission.status === AssignmentStatus.GRADED) {
        gradeDisplay =
          submission.grade !== null
            ? String(submission.grade)
            : "已評分 (無分數)";
      } else if (submission.status === AssignmentStatus.SUBMITTED) {
        gradeDisplay = "評改中";
      }
    } else if (assign.status === AssignmentStatus.CLOSED) {
      statusText = getStatusText(AssignmentStatus.CLOSED); // Assignment closed, student didn't submit
    }

    return {
      key: assign.id,
      title: assign.title,
      gradeDisplay,
      statusText,
    };
  });
});

// --- Course Materials (No changes for student view other than hiding controls) ---
const getFileIcon = (fileType) => {
  const type = fileType?.toLowerCase();
  if (type === "pdf") return FilePdfOutlined;
  if (type === "doc" || type === "docx") return FileWordOutlined;
  if (type === "ppt" || type === "pptx") return FilePptOutlined;
  return FileTextOutlined;
};
const openAddMaterialModal = () => {
  materialModal.isEdit = false;
  materialModal.id = null;
  materialModal.name = "";
  materialModal.type = "file";
  materialModal.url = "";
  materialModal.file = null;
  materialModal.visible = true;
};
const openEditMaterialModal = (material) => {
  materialModal.isEdit = true;
  materialModal.id = material.id;
  materialModal.name = material.name;
  materialModal.type = material.type;
  materialModal.url = material.type === "link" ? material.url : "";
  materialModal.file = null;
  materialModal.visible = true;
};
const handleMaterialFileChange = (info) => {
  if (info.file.status === "done" || info.file.status === "uploading") {
    materialModal.file = info.file;
    if (!materialModal.name && info.file.name)
      materialModal.name = info.file.name;
  } else if (info.file.status === "error") {
    message.error(`${info.file.name} 文件上傳失敗。`);
    materialModal.file = null;
  }
};
const confirmMaterial = () => {
  if (!materialModal.name) return message.error("請填寫教材名稱");
  if (materialModal.type === "link" && !materialModal.url)
    return message.error("請填寫連結網址");
  if (
    materialModal.type === "file" &&
    !materialModal.isEdit &&
    !materialModal.file
  )
    return message.error("請選擇要上傳的檔案");

  let fileUrl = materialModal.type === "link" ? materialModal.url : "#";
  let fileType = null;
  if (materialModal.type === "file" && materialModal.file) {
    fileUrl = URL.createObjectURL(
      materialModal.file.originFileObj || materialModal.file
    );
    fileType = materialModal.file.name.split(".").pop();
    message.info(`模擬上傳檔案: ${materialModal.file.name}`);
  }

  const newMaterialData = {
    name: materialModal.name,
    type: materialModal.type,
    url: fileUrl,
    uploadDate: dayjs().format("YYYY-MM-DD"),
    ...(materialModal.type === "file" && {
      fileType:
        fileType ||
        (materialModal.isEdit
          ? materials.value.find((m) => m.id === materialModal.id)?.fileType
          : null),
    }),
  };

  if (materialModal.isEdit) {
    const index = materials.value.findIndex((m) => m.id === materialModal.id);
    if (index !== -1) {
      if (materials.value[index].type === "file" && !materialModal.file) {
        newMaterialData.url = materials.value[index].url;
        newMaterialData.fileType = materials.value[index].fileType;
      }
      materials.value[index] = {
        ...materials.value[index],
        ...newMaterialData,
      };
      message.success("教材更新成功");
    }
  } else {
    materials.value.push({
      id: uuidv4(),
      courseId: currentCourseId.value,
      ...newMaterialData,
    });
    message.success("教材新增成功");
  }
  materialModal.visible = false;
};
const deleteMaterial = (materialId) => {
  materials.value = materials.value.filter((m) => m.id !== materialId);
  message.success("教材刪除成功");
};

// --- Student Roster (View only for all) ---
const studentRosterColumns = [
  { title: "學生姓名", dataIndex: "name", key: "name" },
  { title: "學號", dataIndex: "studentId", key: "studentId" },
  { title: "Email", dataIndex: "email", key: "email" },
];
</script>

<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-16px u-p-6 u-shadow-lg">
      <a-spin :spinning="loading">
        <div v-if="currentCourse">
          <h1 class="u-text-2xl u-font-bold u-mb-1 u-c-gray-700">
            課程管理中心
          </h1>
          <h2 class="u-text-xl u-font-semibold u-mb-4 u-c-blue-600">
            {{ currentCourse.name }}
          </h2>
          <p class="u-text-gray-600 u-mb-6">{{ currentCourse.description }}</p>

          <a-tabs default-active-key="announcements" type="card">
            <!-- Announcements Tab -->
            <a-tab-pane key="announcements" tab="公告/消息">
              <div class="u-mb-4 u-flex u-justify-end">
                <a-button
                  v-if="isTeacherOrCreator"
                  type="primary"
                  @click="openAddAnnouncementModal"
                >
                  <template #icon><PlusOutlined /></template> 新增公告
                </a-button>
              </div>
              <a-list
                item-layout="vertical"
                :data-source="announcements"
                :bordered="false"
              >
                <template #renderItem="{ item }">
                  <a-list-item
                    class="u-bg-gray-50 u-p-4 u-rounded-md u-mb-3 hover:u-shadow-md u-transition-shadow"
                  >
                    <a-list-item-meta>
                      <template #title>
                        <span class="u-text-lg u-font-semibold u-c-gray-800">{{
                          item.title
                        }}</span>
                      </template>
                      <template #description>
                        <span class="u-text-xs u-c-gray-500"
                          >發布於: {{ item.date }}</span
                        >
                      </template>
                    </a-list-item-meta>
                    <div class="u-mt-2 u-c-gray-700 u-whitespace-pre-line">
                      {{ item.content }}
                    </div>
                    <template v-if="isTeacherOrCreator" #actions>
                      <a-button
                        type="link"
                        size="small"
                        @click="openEditAnnouncementModal(item)"
                        >編輯</a-button
                      >
                      <a-popconfirm
                        title="確定刪除此公告嗎?"
                        @confirm="deleteAnnouncement(item.id)"
                      >
                        <a-button type="link" size="small" danger
                          >刪除</a-button
                        >
                      </a-popconfirm>
                    </template>
                  </a-list-item>
                </template>
                <template #empty>
                  <a-empty description="暫無公告" />
                </template>
              </a-list>
            </a-tab-pane>

            <!-- Assignments Tab -->
            <a-tab-pane key="assignments" tab="作業管理">
              <div class="u-mb-4 u-flex u-justify-end">
                <a-button
                  v-if="isTeacherOrCreator"
                  type="primary"
                  @click="openAddAssignmentModal"
                >
                  <template #icon><PlusOutlined /></template> 新增作業
                </a-button>
              </div>
              <a-list
                :data-source="assignments"
                item-layout="horizontal"
                :bordered="false"
              >
                <template #renderItem="{ item }">
                  <a-list-item
                    class="u-bg-gray-50 u-p-4 u-rounded-md u-mb-3 hover:u-shadow-md u-transition-shadow"
                  >
                    <a-list-item-meta>
                      <template #title>
                        <span class="u-text-lg u-font-semibold u-c-gray-800">{{
                          item.title
                        }}</span>
                      </template>
                      <template #description>
                        <div class="u-text-xs u-c-gray-500">
                          截止日期: {{ item.dueDate }}
                        </div>
                        <div
                          class="u-text-sm u-c-gray-600 u-mt-1 u-whitespace-pre-line"
                        >
                          {{ item.description }}
                        </div>
                      </template>
                    </a-list-item-meta>
                    <template #extra>
                      <a-tag :color="getStatusColor(item.status)"
                        >{{ getStatusText(item.status) }} (總體)</a-tag
                      >
                      <a-tag
                        v-if="
                          isStudent &&
                          getStudentSubmissionForAssignment(item.id)
                        "
                        :color="
                          getStatusColor(
                            getStudentSubmissionForAssignment(item.id).status
                          )
                        "
                        class="u-ml-1"
                      >
                        我:
                        {{
                          getStatusText(
                            getStudentSubmissionForAssignment(item.id).status
                          )
                        }}
                      </a-tag>
                    </template>

                    <!-- Teacher/Creator Actions -->
                    <template v-if="isTeacherOrCreator" #actions>
                      <a-button
                        type="link"
                        size="small"
                        @click="openEditAssignmentModal(item)"
                        >編輯</a-button
                      >
                      <a-popconfirm
                        title="確定刪除此作業嗎?"
                        @confirm="deleteAssignment(item.id)"
                      >
                        <a-button type="link" size="small" danger
                          >刪除</a-button
                        >
                      </a-popconfirm>
                      <a-button
                        type="link"
                        size="small"
                        @click="message.info('查看所有學生繳交狀況功能待實現')"
                        >查看繳交</a-button
                      >
                    </template>

                    <!-- Student Actions & Info -->
                    <div
                      v-if="isStudent"
                      class="u-mt-3 u-pt-2 u-border-t u-border-gray-200"
                    >
                      <template
                        v-if="getStudentSubmissionForAssignment(item.id)"
                      >
                        <div v-if="item.status === AssignmentStatus.OPEN">
                          <div
                            v-if="
                              getStudentSubmissionForAssignment(item.id)
                                .status === AssignmentStatus.SUBMITTED ||
                              getStudentSubmissionForAssignment(item.id)
                                .status === AssignmentStatus.GRADED
                            "
                            class="u-flex u-items-center u-gap-2"
                          >
                            <span class="u-text-sm u-c-green-600">
                              已繳交:
                              {{
                                getStudentSubmissionForAssignment(item.id)
                                  .fileName
                              }}
                              <span
                                v-if="
                                  getStudentSubmissionForAssignment(item.id)
                                    .status === AssignmentStatus.GRADED
                                "
                              >
                                (成績:
                                {{
                                  getStudentSubmissionForAssignment(item.id)
                                    .grade !== null
                                    ? getStudentSubmissionForAssignment(item.id)
                                        .grade
                                    : "N/A"
                                }})</span
                              >
                            </span>
                            <a-button
                              v-if="
                                getStudentSubmissionForAssignment(item.id)
                                  .status !== AssignmentStatus.GRADED
                              "
                              type="link"
                              size="small"
                              @click="() => prepareResubmit(item)"
                              >重新繳交</a-button
                            >
                          </div>
                          <a-upload
                            v-else
                            :show-upload-list="false"
                            :before-upload="
                              (file) => handleStudentMockUpload(item, file)
                            "
                          >
                            <a-button type="primary" size="small"
                              >繳交作業</a-button
                            >
                          </a-upload>
                        </div>
                        <div
                          v-else-if="
                            getStudentSubmissionForAssignment(item.id)
                              .status === AssignmentStatus.SUBMITTED ||
                            getStudentSubmissionForAssignment(item.id)
                              .status === AssignmentStatus.GRADED
                          "
                          class="u-text-sm"
                        >
                          已繳交:
                          {{
                            getStudentSubmissionForAssignment(item.id).fileName
                          }}
                          ({{
                            getStatusText(
                              getStudentSubmissionForAssignment(item.id).status
                            )
                          }})
                          <span
                            v-if="
                              getStudentSubmissionForAssignment(item.id)
                                .status === AssignmentStatus.GRADED
                            "
                          >
                            - 成績:
                            {{
                              getStudentSubmissionForAssignment(item.id)
                                .grade !== null
                                ? getStudentSubmissionForAssignment(item.id)
                                    .grade
                                : "N/A"
                            }}</span
                          >
                        </div>
                        <div
                          v-else-if="
                            getStudentSubmissionForAssignment(item.id)
                              .status === AssignmentStatus.NOT_SUBMITTED &&
                            item.status === AssignmentStatus.CLOSED
                          "
                          class="u-text-sm u-c-red-500"
                        >
                          作業已截止，您未繳交。
                        </div>
                        <div
                          v-else-if="
                            getStudentSubmissionForAssignment(item.id)
                              .status === AssignmentStatus.NOT_SUBMITTED
                          "
                          class="u-text-sm u-c-orange-500"
                        >
                          您尚未繳交此作業。
                        </div>
                      </template>
                      <div
                        v-else-if="item.status === AssignmentStatus.CLOSED"
                        class="u-text-sm u-c-red-500"
                      >
                        作業已截止
                      </div>
                      <div v-else class="u-text-sm u-c-gray-500">
                        作業狀態待確認
                      </div>
                      <!-- Should not happen with proper init -->
                    </div>
                  </a-list-item>
                </template>
                <template #empty>
                  <a-empty description="暫無作業" />
                </template>
              </a-list>
            </a-tab-pane>

            <!-- Gradebook Tab -->
            <a-tab-pane key="gradebook" tab="成績簿">
              <!-- Teacher/Creator Grade Input View -->
              <div v-if="isTeacherOrCreator">
                <p class="u-mb-4 u-text-sm u-c-gray-600">
                  在此輸入或編輯學生成績。分數範圍 0-100。
                </p>
                <a-table
                  :columns="gradebookColumns"
                  :data-source="gradebookDataSource"
                  bordered
                  size="small"
                  :scroll="{ x: gradebookColumns.length * 150 }"
                >
                  <template #bodyCell="{ column, record, value }">
                    <template
                      v-if="assignments.find((a) => a.id === column.key)"
                    >
                      <a-input
                        :value="value"
                        placeholder="-"
                        size="small"
                        style="width: 80px; text-align: center"
                        @change="
                          handleGradeChange(record.id, column.key, $event)
                        "
                      />
                    </template>
                  </template>
                </a-table>
                <a-empty
                  v-if="!students.length || !assignments.length"
                  description="沒有學生或作業來顯示成績簿。"
                  class="u-mt-4"
                />
              </div>

              <!-- Student Grade View -->
              <div v-if="isStudent">
                <h3 class="u-text-lg u-font-semibold u-mb-3 u-c-gray-700">
                  我的成績
                </h3>
                <a-table
                  :columns="studentGradebookColumns"
                  :data-source="studentGradebookDataSource"
                  bordered
                  size="small"
                  row-key="key"
                >
                  <template #bodyCell="{ column, text }">
                    <template v-if="column.key === 'grade'">
                      <span
                        :class="{
                          'u-c-gray-500': text === '評改中' || text === '-',
                        }"
                        >{{ text }}</span
                      >
                    </template>
                    <template v-else-if="column.key === 'status'">
                      <a-tag
                        :color="
                          getStatusColor(
                            assignments.find(
                              (a) =>
                                a.title ===
                                studentGradebookDataSource.find(
                                  (sds) => sds.statusText === text
                                )?.title
                            )?.status ||
                              getStudentSubmissionForAssignment(
                                studentGradebookDataSource.find(
                                  (sds) => sds.statusText === text
                                )?.key
                              )?.status
                          )
                        "
                      >
                        {{ text }}
                      </a-tag>
                    </template>
                  </template>
                </a-table>
                <a-empty
                  v-if="!studentGradebookDataSource.length"
                  description="暫無您的作業成績記錄。"
                  class="u-mt-4"
                />
              </div>
            </a-tab-pane>

            <!-- Course Materials Tab -->
            <a-tab-pane key="materials" tab="課程教材/內容">
              <div class="u-mb-4 u-flex u-justify-end">
                <a-button
                  v-if="isTeacherOrCreator"
                  type="primary"
                  @click="openAddMaterialModal"
                >
                  <template #icon><PlusOutlined /></template> 新增教材
                </a-button>
              </div>
              <a-list
                :data-source="materials"
                item-layout="horizontal"
                :bordered="false"
              >
                <template #renderItem="{ item }">
                  <a-list-item
                    class="u-bg-gray-50 u-p-3 u-rounded-md u-mb-2 hover:u-shadow-md u-transition-shadow"
                  >
                    <a-list-item-meta>
                      <template #avatar>
                        <a-avatar
                          shape="square"
                          :size="40"
                          class="u-bg-blue-100 u-flex u-items-center u-justify-center"
                        >
                          <component
                            :is="
                              item.type === 'link'
                                ? LinkOutlined
                                : getFileIcon(item.fileType)
                            "
                            class="u-text-blue-600 u-text-xl"
                          />
                        </a-avatar>
                      </template>
                      <template #title>
                        <a
                          :href="item.url"
                          target="_blank"
                          class="u-text-md u-font-semibold u-c-blue-600 hover:u-underline"
                          >{{ item.name }}</a
                        >
                      </template>
                      <template #description>
                        <span class="u-text-xs u-c-gray-500"
                          >上傳日期: {{ item.uploadDate }}
                          {{ item.type === "link" ? "(外部連結)" : "" }}</span
                        >
                      </template>
                    </a-list-item-meta>
                    <template v-if="isTeacherOrCreator" #actions>
                      <a-button
                        type="link"
                        size="small"
                        @click="openEditMaterialModal(item)"
                        >編輯</a-button
                      >
                      <a-popconfirm
                        title="確定刪除此教材嗎?"
                        @confirm="deleteMaterial(item.id)"
                      >
                        <a-button type="link" size="small" danger
                          >刪除</a-button
                        >
                      </a-popconfirm>
                    </template>
                  </a-list-item>
                </template>
                <template #empty>
                  <a-empty description="暫無課程教材" />
                </template>
              </a-list>
            </a-tab-pane>

            <!-- Student Roster Tab -->
            <a-tab-pane key="roster" tab="學生名單">
              <a-table
                :columns="studentRosterColumns"
                :data-source="students"
                row-key="id"
                size="small"
                :pagination="{ pageSize: 10 }"
              >
              </a-table>
              <template #empty>
                <!-- This should be part of a-table if data-source is empty -->
                <a-empty v-if="!students.length" description="暫無學生名單" />
              </template>
            </a-tab-pane>
          </a-tabs>
        </div>
        <div v-else-if="!loading && !currentCourse">
          <a-empty description="找不到指定的課程資料，或課程ID無效。" />
        </div>
      </a-spin>
    </div>

    <!-- Announcement Modal -->
    <a-modal
      v-model:visible="announcementModal.visible"
      :title="announcementModal.isEdit ? '編輯公告' : '新增公告'"
      @ok="confirmAnnouncement"
      okText="確認"
      cancelText="取消"
    >
      <a-form layout="vertical">
        <a-form-item
          label="標題"
          name="title"
          :rules="[{ required: true, message: '請輸入標題!' }]"
        >
          <a-input v-model:value="announcementModal.title" />
        </a-form-item>
        <a-form-item
          label="內容"
          name="content"
          :rules="[{ required: true, message: '請輸入內容!' }]"
        >
          <a-textarea v-model:value="announcementModal.content" :rows="5" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Assignment Modal -->
    <a-modal
      v-model:visible="assignmentModal.visible"
      :title="assignmentModal.isEdit ? '編輯作業' : '新增作業'"
      @ok="confirmAssignment"
      okText="確認"
      cancelText="取消"
    >
      <a-form layout="vertical">
        <a-form-item
          label="作業標題"
          name="title"
          :rules="[{ required: true, message: '請輸入作業標題!' }]"
        >
          <a-input v-model:value="assignmentModal.title" />
        </a-form-item>
        <a-form-item label="作業描述" name="description">
          <a-textarea v-model:value="assignmentModal.description" :rows="4" />
        </a-form-item>
        <a-form-item
          label="截止日期"
          name="dueDate"
          :rules="[{ required: true, message: '請選擇截止日期!' }]"
        >
          <a-date-picker
            v-model:value="assignmentModal.dueDate"
            format="YYYY-MM-DD"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Material Modal -->
    <a-modal
      v-model:visible="materialModal.visible"
      :title="materialModal.isEdit ? '編輯教材' : '新增教材'"
      @ok="confirmMaterial"
      okText="確認"
      cancelText="取消"
    >
      <a-form layout="vertical">
        <a-form-item
          label="教材名稱"
          name="name"
          :rules="[{ required: true, message: '請輸入教材名稱!' }]"
        >
          <a-input v-model:value="materialModal.name" />
        </a-form-item>
        <a-form-item label="類型" name="type">
          <a-radio-group v-model:value="materialModal.type">
            <a-radio value="file">檔案</a-radio>
            <a-radio value="link">外部連結</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          v-if="materialModal.type === 'link'"
          label="連結網址"
          name="url"
          :rules="[{ required: true, message: '請輸入連結網址!' }]"
        >
          <a-input
            v-model:value="materialModal.url"
            placeholder="https://example.com"
          />
        </a-form-item>
        <a-form-item
          v-if="materialModal.type === 'file'"
          label="選擇檔案"
          name="file"
          :rules="[{ required: !materialModal.isEdit, message: '請選擇檔案!' }]"
        >
          <a-upload
            :file-list="materialModal.file ? [materialModal.file] : []"
            :before-upload="() => false"
            @change="handleMaterialFileChange"
            :max-count="1"
          >
            <a-button> <UploadOutlined /> 點擊選擇檔案 </a-button>
          </a-upload>
          <p
            v-if="materialModal.isEdit && !materialModal.file"
            class="u-text-xs u-c-gray-500 u-mt-1"
          >
            若要更換檔案請重新上傳，否則將保留原檔案。
          </p>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.u-whitespace-pre-line {
  white-space: pre-line;
}
</style>
