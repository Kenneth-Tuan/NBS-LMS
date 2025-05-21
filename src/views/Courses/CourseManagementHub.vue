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
import { UserRole } from "@/enums/appEnums"; // Assuming appEnums is in src/enums

// Mock AssignmentStatus, ideally this would come from a shared enum/store
const AssignmentStatus = {
  OPEN: "OPEN",
  SUBMITTED: "SUBMITTED",
  GRADED: "GRADED",
  CLOSED: "CLOSED",
  NOT_SUBMITTED: "NOT_SUBMITTED",
};

const route = useRoute();
const { userProfile } = useUserStore();

const currentCourseId = ref(route.params.id || "mock-course-1"); // Get course ID from route or use mock
const currentCourse = ref(null);
const loading = ref(false);

const isTeacher = computed(() => userProfile.userRole === UserRole.Teacher);

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
const assignments = ref([]);
const materials = ref([]);
const students = ref([]);
const grades = reactive({}); // { studentId: { assignmentId: score } }

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
  type: "file", // 'file' or 'link'
  url: "",
  file: null,
});

// --- Lifecycle Hooks ---
onMounted(() => {
  loadCourseData();
});

// --- Data Loading and Initialization ---
const loadCourseData = () => {
  loading.value = true;
  // Simulate API call
  setTimeout(() => {
    currentCourse.value = mockCourses.find(
      (c) => c.id === currentCourseId.value
    );
    if (!currentCourse.value) {
      message.error("找不到課程資料");
      currentCourse.value = { name: "未知課程" }; // Fallback
      loading.value = false;
      return;
    }

    // Mock data for the selected course
    announcements.value = [
      {
        id: uuidv4(),
        courseId: currentCourseId.value,
        title: "歡迎來到「" + currentCourse.value.name + "」",
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
        fileName: "",
      },
      {
        id: uuidv4(),
        courseId: currentCourseId.value,
        title: "主題報告：登山寶訓",
        description: "分析登山寶訓的核心教導及其現代應用。",
        dueDate: dayjs().add(14, "day").format("YYYY-MM-DD"),
        status: AssignmentStatus.OPEN,
        fileName: "",
      },
      {
        id: uuidv4(),
        courseId: "mock-course-2",
        title: "出埃及記分析",
        description: "分析出埃及記的結構與神學主題。",
        dueDate: dayjs().add(10, "day").format("YYYY-MM-DD"),
        status: AssignmentStatus.OPEN,
        fileName: "",
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
      {
        id: uuidv4(),
        courseId: currentCourseId.value,
        name: "參考網站：聖經資源網",
        type: "link",
        url: "https://example.com/bible-resources",
        uploadDate: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
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
      {
        id: "s004",
        courseId: "mock-course-2",
        name: "王小強",
        studentId: "ST2024004",
        email: "qiang@example.com",
      },
    ].filter((s) => s.courseId === currentCourseId.value);

    // Initialize grades structure
    students.value.forEach((student) => {
      grades[student.id] = {};
      assignments.value.forEach((assignment) => {
        // Mock some grades
        if (Math.random() > 0.5) {
          grades[student.id][assignment.id] =
            Math.floor(Math.random() * 40) + 60; // Score between 60-99
        } else {
          grades[student.id][assignment.id] = null; // Not graded or not submitted
        }
      });
    });

    loading.value = false;
  }, 500);
};

// --- Announcements ---
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

// --- Assignments ---
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
  if (!assignmentModal.title || !assignmentModal.dueDate) {
    message.error("請填寫作業標題和截止日期");
    return;
  }
  const newAssignmentData = {
    title: assignmentModal.title,
    description: assignmentModal.description,
    dueDate: dayjs(assignmentModal.dueDate).format("YYYY-MM-DD"),
    status: AssignmentStatus.OPEN, // Default status
    fileName: "", // Default
  };

  if (assignmentModal.isEdit) {
    const index = assignments.value.findIndex(
      (a) => a.id === assignmentModal.id
    );
    if (index !== -1) {
      assignments.value[index] = {
        ...assignments.value[index],
        ...newAssignmentData,
      };
      message.success("作業更新成功");
    }
  } else {
    assignments.value.push({
      id: uuidv4(),
      courseId: currentCourseId.value,
      ...newAssignmentData,
    });
    message.success("作業新增成功");
  }
  assignmentModal.visible = false;
  // Re-initialize grades for new assignment if needed
  if (!assignmentModal.isEdit) {
    const newAssignmentId = assignments.value[assignments.value.length - 1].id;
    students.value.forEach((student) => {
      if (!grades[student.id]) grades[student.id] = {};
      grades[student.id][newAssignmentId] = null;
    });
  }
};

const deleteAssignment = (assignId) => {
  assignments.value = assignments.value.filter((a) => a.id !== assignId);
  // Also remove grades associated with this assignment
  students.value.forEach((student) => {
    if (grades[student.id] && grades[student.id][assignId]) {
      delete grades[student.id][assignId];
    }
  });
  message.success("作業刪除成功");
};

// --- Gradebook ---
const gradebookColumns = computed(() => {
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
  const assignmentColumns = assignments.value.map((assign) => ({
    title: assign.title,
    dataIndex: ["grades", assign.id], // Path for Ant Table to find the grade
    key: assign.id,
    width: 150,
    customRender: ({ record, column }) => {
      // record is student, column.key is assignmentId
      const studentId = record.id;
      const assignmentId = column.key;
      return grades[studentId]?.[assignmentId];
    },
  }));
  return [...baseColumns, ...assignmentColumns];
});

const gradebookDataSource = computed(() => {
  return students.value.map((student) => ({
    ...student,
    key: student.id,
    grades: grades[student.id] || {}, // Ensure grades object exists for each student
  }));
});

const handleGradeChange = (studentId, assignmentId, event) => {
  const score = event.target.value ? parseInt(event.target.value, 10) : null;
  if (score !== null && (isNaN(score) || score < 0 || score > 100)) {
    message.error("請輸入 0-100 之間的有效分數");
    // Optionally revert the input value or clear it
    event.target.value = grades[studentId][assignmentId] || "";
    return;
  }
  if (!grades[studentId]) {
    grades[studentId] = {};
  }
  grades[studentId][assignmentId] = score;
  // Here you might want to debounce or save on blur/enter
  // message.success(`${students.value.find(s=>s.id === studentId)?.name} 的 ${assignments.value.find(a=>a.id === assignmentId)?.title} 成績已更新`);
};

// --- Course Materials ---
const getFileIcon = (fileType) => {
  const type = fileType?.toLowerCase();
  if (type === "pdf") return FilePdfOutlined;
  if (type === "doc" || type === "docx") return FileWordOutlined;
  if (type === "ppt" || type === "pptx") return FilePptOutlined;
  if (type === "xls" || type === "xlsx") return FileExcelOutlined;
  if (type === "zip" || type === "rar") return FileZipOutlined;
  return FileTextOutlined; // Default
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
  materialModal.file = null; // Cannot re-select file for edit, typically re-upload
  materialModal.visible = true;
};

const handleMaterialFileChange = (info) => {
  if (info.file.status === "done" || info.file.status === "uploading") {
    // Keep file if selected
    materialModal.file = info.file;
    if (!materialModal.name && info.file.name) {
      materialModal.name = info.file.name;
    }
  } else if (info.file.status === "error") {
    message.error(`${info.file.name} 文件上傳失敗。`);
    materialModal.file = null;
  }
};

const confirmMaterial = () => {
  if (!materialModal.name) {
    message.error("請填寫教材名稱");
    return;
  }
  if (materialModal.type === "link" && !materialModal.url) {
    message.error("請填寫連結網址");
    return;
  }
  if (
    materialModal.type === "file" &&
    !materialModal.isEdit &&
    !materialModal.file
  ) {
    message.error("請選擇要上傳的檔案");
    return;
  }

  // Simulate upload for file type if a new file is provided
  let fileUrl = materialModal.type === "link" ? materialModal.url : "#"; // Placeholder URL
  let fileType = null;
  if (materialModal.type === "file" && materialModal.file) {
    fileUrl = URL.createObjectURL(
      materialModal.file.originFileObj || materialModal.file
    ); // Mock URL
    fileType = materialModal.file.name.split(".").pop();
    // In a real app, you'd upload to a server here and get back a URL
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
      // If it was a file and no new file is uploaded, keep old URL and fileType
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

// --- Student Roster ---
const studentRosterColumns = [
  { title: "學生姓名", dataIndex: "name", key: "name" },
  { title: "學號", dataIndex: "studentId", key: "studentId" },
  { title: "Email", dataIndex: "email", key: "email" },
];

// --- Helper ---
const getStatusColor = (status) => {
  // Simplified version
  if (status === AssignmentStatus.OPEN) return "blue";
  if (status === AssignmentStatus.SUBMITTED) return "green";
  if (status === AssignmentStatus.GRADED) return "purple";
  if (status === AssignmentStatus.CLOSED) return "red";
  return "default";
};

const getStatusText = (status) => {
  // Simplified version
  if (status === AssignmentStatus.OPEN) return "進行中";
  if (status === AssignmentStatus.SUBMITTED) return "已繳交";
  if (status === AssignmentStatus.GRADED) return "已評分";
  if (status === AssignmentStatus.CLOSED) return "已關閉";
  return "未知";
};
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
                  v-if="isTeacher"
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
                    <template v-if="isTeacher" #actions>
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
                  v-if="isTeacher"
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
                        <div class="u-text-sm u-c-gray-600 u-mt-1">
                          {{ item.description }}
                        </div>
                      </template>
                    </a-list-item-meta>
                    <template #extra>
                      <a-tag :color="getStatusColor(item.status)">{{
                        getStatusText(item.status)
                      }}</a-tag>
                    </template>
                    <template v-if="isTeacher" #actions>
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
                      <!-- Placeholder for view submissions -->
                      <a-button type="link" size="small">查看繳交</a-button>
                    </template>
                    <div
                      v-if="!isTeacher && item.status === AssignmentStatus.OPEN"
                      class="u-mt-2"
                    >
                      <a-upload
                        :show-upload-list="false"
                        :before-upload="
                          () => {
                            message.info('學生作業上傳功能待實現');
                            return false;
                          }
                        "
                      >
                        <a-button type="primary" size="small"
                          >繳交作業</a-button
                        >
                      </a-upload>
                    </div>
                    <div
                      v-if="
                        !isTeacher && item.status === AssignmentStatus.SUBMITTED
                      "
                      class="u-mt-2 u-text-sm u-c-green-600"
                    >
                      已繳交: {{ item.fileName || "作業檔案.pdf" }}
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
              <div v-if="isTeacher">
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
                        v-if="isTeacher"
                        :value="value"
                        placeholder="-"
                        size="small"
                        style="width: 80px; text-align: center"
                        @change="
                          handleGradeChange(record.id, column.key, $event)
                        "
                      />
                      <span v-else>{{ value !== null ? value : "-" }}</span>
                    </template>
                  </template>
                </a-table>
              </div>
              <div v-else>
                <a-empty description="學生成績查詢功能待開發" />
                <!-- Student view of grades can be added here -->
              </div>
            </a-tab-pane>

            <!-- Course Materials Tab -->
            <a-tab-pane key="materials" tab="課程教材/內容">
              <div class="u-mb-4 u-flex u-justify-end">
                <a-button
                  v-if="isTeacher"
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
                    <template v-if="isTeacher" #actions>
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
                <a-empty description="暫無學生名單" />
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
    >
      <a-form layout="vertical">
        <a-form-item label="標題" required>
          <a-input v-model:value="announcementModal.title" />
        </a-form-item>
        <a-form-item label="內容" required>
          <a-textarea v-model:value="announcementModal.content" :rows="5" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Assignment Modal -->
    <a-modal
      v-model:visible="assignmentModal.visible"
      :title="assignmentModal.isEdit ? '編輯作業' : '新增作業'"
      @ok="confirmAssignment"
    >
      <a-form layout="vertical">
        <a-form-item label="作業標題" required>
          <a-input v-model:value="assignmentModal.title" />
        </a-form-item>
        <a-form-item label="作業描述">
          <a-textarea v-model:value="assignmentModal.description" :rows="4" />
        </a-form-item>
        <a-form-item label="截止日期" required>
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
    >
      <a-form layout="vertical">
        <a-form-item label="教材名稱" required>
          <a-input v-model:value="materialModal.name" />
        </a-form-item>
        <a-form-item label="類型">
          <a-radio-group v-model:value="materialModal.type">
            <a-radio value="file">檔案</a-radio>
            <a-radio value="link">外部連結</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          v-if="materialModal.type === 'link'"
          label="連結網址"
          required
        >
          <a-input
            v-model:value="materialModal.url"
            placeholder="https://example.com"
          />
        </a-form-item>
        <a-form-item
          v-if="materialModal.type === 'file'"
          label="選擇檔案"
          :required="!materialModal.isEdit"
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
/* Scoped styles can be added here if needed, but UnoCSS is preferred */
.u-whitespace-pre-line {
  white-space: pre-line;
}
</style>
