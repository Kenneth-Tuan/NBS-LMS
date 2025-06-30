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
  FileTextOutlined,
  LinkOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons-vue";

import { useUserStore } from "@/stores/user";
import { UserRole } from "@/enums/appEnums";
import { dummyCourseData } from "@/data/dummy";
import { courseService } from "@/services/course.service";
import CourseAssignments from "./CourseAssignments.vue";

const AssignmentStatus = {
  OPEN: "OPEN",
  SUBMITTED: "SUBMITTED", // Student has submitted
  GRADED: "GRADED", // Teacher has graded
  CLOSED: "CLOSED", // Assignment is no longer open for submissions
  NOT_SUBMITTED: "NOT_SUBMITTED", // Student has not submitted (for student tracking)
};

const route = useRoute();
const { userProfile } = useUserStore();

const currentCourseId = ref(route.params.id);
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
// const mockCourses = [
//   {
//     id: "mock-course-1",
//     name: "新約概論 (示範課程)",
//     teacher: "王大明牧師",
//     description: "這是一個示範課程的管理中心。",
//   },
//   {
//     id: "mock-course-2",
//     name: "舊約歷史書研究 (示範課程)",
//     teacher: "李文清博士",
//     description: "舊約研究的管理中心。",
//   },
// ];

const announcements = ref([]);
const assignments = ref([]);
const materials = ref([]);
const students = ref([]); // Course student roster
const grades = reactive({}); // { studentId: { assignmentId: score } } - Teacher's gradebook data

// Student-specific submission tracking for the current student
const currentUserSubmissions = ref([]); // [{ assignmentId, status, fileName, grade }]

// === Helper: API -> Local Mapping ===
function mapApiCourseToLocal(apiCourse) {
  if (!apiCourse) return {};

  // --- outline_files -> materials_hub ---
  const materials_hub = (apiCourse.outline_files || []).map((url) => {
    const filename = url.split("/").pop() || "檔案";
    const fileTypeMatch = filename.split(".").pop();
    return {
      id: uuidv4(),
      name: filename,
      type: "file",
      fileType: fileTypeMatch,
      url,
      uploadDate: dayjs().format("YYYY-MM-DD"), // 無日期資訊，暫以今天
    };
  });

  return {
    name: apiCourse.title,
    teacher: apiCourse.teacher_name,
    teacher_id: apiCourse.instructor,
    description: apiCourse.description,
    class_mode: apiCourse.class_mode,
    duration: apiCourse.duration,
    credit: apiCourse.credit,
    start_date: apiCourse.startDate,
    end_date: apiCourse.endDate,
    enrollment_limit: apiCourse.enrollmentLimit,
    weekly_schedule: apiCourse.weeklySchedule,
    prerequisite_course_ids: apiCourse.prerequisites,
    cover_image: apiCourse.cover_image,
    outline_files: apiCourse.outlineFile,
    ...(materials_hub.length && { materials_hub }),
  };
}

// --- Modals State ---
const announcementModal = reactive({
  visible: false,
  isEdit: false,
  id: null,
  title: "",
  content: "",
});

const materialModal = reactive({
  visible: false,
  isEdit: false,
  id: null,
  name: "",
  file: null,
  fileUrls: [],
});

// --- Lifecycle Hooks ---
onMounted(async () => {
  // After local dummy data is loaded, try to fetch real course data from API
  try {
    const apiCourse = await courseService.getCourse(currentCourseId.value);
    const mappedData = mapApiCourseToLocal(apiCourse);

    console.log("mappedData", mappedData, apiCourse);
    if (Object.keys(mappedData).length) {
      // Merge API data into the currently displayed course (derived from dummy) so that
      // already-implemented features (e.g. announcements) continue to work.
      if (currentCourse.value) {
        currentCourse.value = { ...currentCourse.value, ...mappedData };
      } else {
        // Edge case: dummy not found, create minimal course from API
        currentCourse.value = { ...mappedData };
      }

      if (mappedData.materials_hub) {
        // 避免重複加入同名 URL
        const existingUrls = new Set(materials.value.map((m) => m.url));
        const merged = mappedData.materials_hub.filter(
          (m) => !existingUrls.has(m.url)
        );
        if (merged.length) {
          materials.value = [...materials.value, ...merged];
        }
      }
    }
  } catch (err) {
    // Keep silent failure – fall back to dummy data
    console.error(
      "[CourseManagementHub] Failed to fetch course data from API:",
      err
    );
  }
});

// get course api response demo
// {
//     "teacher_name": "王曉明",
//     "name": "基督門徒與領袖的養成與操練",
//     "class_mode": "同步視訊",
//     "duration": 1,
//     "credit": 2,
//     "teacher_id": "20dddeab-1bea-4370-b75f-e68041adcade",
//     "start_date": "2025-09-10T08:00:00",
//     "end_date": "2026-02-18T08:00:00",
//     "enrollment_limit": 50,
//     "weekly_schedule": [
//         {
//             "week_day": "週三",
//             "start_time": "19:00",
//             "end_time": "21:00"
//         }
//     ],
//     "prerequisite_course_ids": [],
//     "description": "從教牧書信看耶穌的門徒訓練",
//     "cover_image": null,
//     "outline_files": [
//         "gs://campus-system-dev/uploads/2025-05/229912aa-656f-4f1a-aabd-c868e8e1c1d5_教牧書信.pdf"
//     ]
// }

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

// --- Assignments (Handled by CourseAssignments component) ---
// Helper method needed for gradebook
const getStudentSubmissionForAssignment = (assignmentId) => {
  if (!isStudent.value) return null;
  return currentUserSubmissions.value.find(
    (s) => s.assignmentId === assignmentId
  );
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
  materialModal.file = null;
  materialModal.visible = true;
};
const openEditMaterialModal = (material) => {
  materialModal.isEdit = true;
  materialModal.id = material.id;
  materialModal.name = material.name;
  materialModal.file = null;
  materialModal.visible = true;
};
const handleMaterialFileChange = async (info) => {
  if (info.fileList.length > 0) {
    materialModal.fileUrls = await courseService.uploadFile(info.fileList);
  }
};

const confirmMaterial = async (info) => {
  if (!materialModal.isEdit && !materialModal.file)
    return message.error("請選擇要上傳的檔案");

  currentCourse.value.outline_files = currentCourse.value.outline_files.concat(
    materialModal.fileUrls
  );

  const params = {
    course_id: currentCourseId.value,
    ...currentCourse.value,
  };

  delete params.materials_hub;
  delete params.teacher;

  const result = await courseService.updateCourse(params);

  if (materialModal.isEdit && result) {
    message.success("教材更新成功");
  } else if (!materialModal.isEdit && result) {
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
  { title: "Email", dataIndex: "email", key: "email" },
];

// Helper to get a status tag for the header - can be more sophisticated
const getCourseStatusTag = (course) => {
  if (!course || !course.start_date || !course.end_date) return "未知";
  const now = dayjs();
  const start = dayjs(course.start_date);
  const end = dayjs(course.end_date);
  if (now.isBefore(start)) return "尚未開始";
  if (now.isAfter(end)) return "已結束";
  return "進行中";
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
              <CourseAssignments
                :current-course-id="currentCourseId"
                :is-teacher-or-creator="isTeacherOrCreator"
                :is-student="isStudent"
                :current-user-student-id="currentUserStudentId"
                :assignments="assignments"
                :students="students"
                :grades="grades"
                :current-user-submissions="currentUserSubmissions"
                @update:assignments="assignments = $event"
                @update:grades="Object.assign(grades, $event)"
                @update:currentUserSubmissions="currentUserSubmissions = $event"
              />
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
                          :href="item.name"
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

    <!-- Material Modal -->
    <a-modal
      v-model:visible="materialModal.visible"
      :title="materialModal.isEdit ? '編輯教材' : '新增教材'"
      @ok="confirmMaterial"
      okText="確認"
      cancelText="取消"
    >
      <a-form layout="vertical">
        <!-- <a-form-item
          label="教材名稱"
          name="name"
          :rules="[{ required: true, message: '請輸入教材名稱!' }]"
        >
          <a-input v-model:value="materialModal.name" />
        </a-form-item> -->
        <a-form-item label="選擇檔案" name="file">
          <a-upload
            v-model:file-list="materialModal.file"
            @change="handleMaterialFileChange"
            :custom-request="() => {}"
            :before-upload="() => false"
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
