<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import {
  PlusOutlined,
  UploadOutlined,
  FileOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import { assignmentService, courseService } from "@/services/course.service";

// Props
const props = defineProps({
  currentCourseId: {
    type: String,
    required: true,
  },
  isTeacherOrCreator: {
    type: Boolean,
    default: false,
  },
  isStudent: {
    type: Boolean,
    default: false,
  },
  currentUserStudentId: {
    type: String,
    default: "",
  },
  assignments: {
    type: Array,
    default: () => [],
  },
  students: {
    type: Array,
    default: () => [],
  },
  grades: {
    type: Object,
    default: () => ({}),
  },
  currentUserSubmissions: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(["update"]);

// Assignment Status Constants
const AssignmentStatus = {
  OPEN: "OPEN",
  SUBMITTED: "SUBMITTED",
  GRADED: "GRADED",
  CLOSED: "CLOSED",
  NOT_SUBMITTED: "NOT_SUBMITTED",
};

// Local state for assignments
const localAssignments = ref([]);
const localGrades = reactive({ ...props.grades });
const localCurrentUserSubmissions = ref([]);
const loading = ref(false);

// Watch for prop changes
watch(
  () => props.assignments,
  (newVal) => {
    localAssignments.value = [...newVal];
  }
);
watch(
  () => props.grades,
  (newVal) => {
    Object.assign(localGrades, newVal);
  }
);
watch(
  () => props.currentUserSubmissions,
  (newVal) => {
    localCurrentUserSubmissions.value = [...newVal];
  }
);

// Assignment Modal State
const assignmentModal = reactive({
  visible: false,
  isEdit: false,
  id: null,
  title: "",
  description: "",
  dueDate: null,
});

// Add form reference and rules
const assignmentFormRef = ref();
const assignmentFormRules = {
  title: [{ required: true, message: "請輸入作業標題!", trigger: "blur" }],
  dueDate: [{ required: true, message: "請選擇截止日期!", trigger: "change" }],
};

// --- Submission Detail Modal ---
const submissionDetailModal = reactive({
  visible: false,
  assignmentTitle: "",
  submissions: [],
});

const submissionTableColumns = [
  { title: "學生姓名", dataIndex: "studentName", key: "studentName" },
  { title: "學號", dataIndex: "studentId", key: "studentId" },
  { title: "繳交狀態", dataIndex: "statusText", key: "status" },
  { title: "繳交內容", dataIndex: "files", key: "files" },
];

// --- Helper Functions ---
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

// --- Fetch Assignments ---
const fetchAssignments = async () => {
  loading.value = true;
  try {
    let assignments = [];

    if (props.isTeacherOrCreator) {
      // 老師使用 list API
      const response = await assignmentService.list(props.currentCourseId);
      assignments = response.assignments || [];

      // 轉換資料格式
      localAssignments.value = assignments.map((assignment) => ({
        id: assignment.id,
        courseId: props.currentCourseId,
        title: assignment.title,
        description: assignment.description,
        dueDate: dayjs(assignment.expDate).format("YYYY-MM-DD"),
        status: AssignmentStatus.OPEN, // 預設狀態
      }));
    } else if (props.isStudent) {
      // 學生使用 listByCourse API
      const response = await assignmentService.listByCourse(
        props.currentCourseId
      );
      assignments = response.assignments || [];

      // 轉換資料格式並設定繳交狀態
      localAssignments.value = assignments.map((assignment) => ({
        id: assignment.assignment_id,
        courseId: props.currentCourseId,
        title: assignment.title,
        description: assignment.description,
        dueDate: dayjs(assignment.exp_date).format("YYYY-MM-DD"),
        status: AssignmentStatus.OPEN,
      }));

      // 更新學生的繳交狀態
      localCurrentUserSubmissions.value = assignments.map((assignment) => ({
        assignmentId: assignment.assignment_id,
        status: assignment.is_submitted
          ? AssignmentStatus.SUBMITTED
          : AssignmentStatus.NOT_SUBMITTED,
        files: assignment.submitted_files || [],
        grade: null,
      }));
    }

    emit("update", {
      assignments: localAssignments.value,
      currentUserSubmissions: localCurrentUserSubmissions.value,
    });
  } catch (error) {
    console.error("Failed to fetch assignments:", error);
    message.error("無法載入作業列表");
  } finally {
    loading.value = false;
  }
};

// --- Assignment Management Functions ---
const openAddAssignmentModal = () => {
  assignmentModal.isEdit = false;
  assignmentModal.id = null;
  assignmentModal.title = "";
  assignmentModal.description = "";
  assignmentModal.dueDate = null;
  assignmentModal.visible = true;

  // Clear form validation
  setTimeout(() => {
    assignmentFormRef.value?.clearValidate();
  }, 0);
};

const openEditAssignmentModal = (assign) => {
  assignmentModal.isEdit = true;
  assignmentModal.id = assign.id;
  assignmentModal.title = assign.title;
  assignmentModal.description = assign.description;
  assignmentModal.dueDate = dayjs(assign.dueDate);
  assignmentModal.visible = true;

  // Clear form validation
  setTimeout(() => {
    assignmentFormRef.value?.clearValidate();
  }, 0);
};

const confirmAssignment = async () => {
  // Validate form before submission
  try {
    await assignmentFormRef.value.validateFields();
  } catch (error) {
    console.log("Validation failed:", error);
    return;
  }

  if (!assignmentModal.title || !assignmentModal.dueDate) {
    message.error("請填寫作業標題和截止日期");
    return;
  }

  loading.value = true;
  try {
    const assignmentData = {
      title: assignmentModal.title,
      description: assignmentModal.description,
      exp_date: dayjs(assignmentModal.dueDate).format(
        "YYYY-MM-DDTHH:mm:ss.SSS+08:00"
      ),
    };

    if (assignmentModal.isEdit) {
      // 編輯作業
      await assignmentService.edit({
        assignment_id: assignmentModal.id,
        ...assignmentData,
      });
      message.success("作業更新成功");
    } else {
      // 新增作業
      await assignmentService.create({
        course_id: props.currentCourseId,
        ...assignmentData,
      });
      message.success("作業新增成功");
    }

    // 重新載入作業列表
    await fetchAssignments();
    assignmentModal.visible = false;

    // Reset form
    assignmentFormRef.value.resetFields();
  } catch (error) {
    console.error("Failed to save assignment:", error);
    message.error(assignmentModal.isEdit ? "作業更新失敗" : "作業新增失敗");
  } finally {
    loading.value = false;
  }
};

const deleteAssignment = async (assignId) => {
  loading.value = true;
  try {
    await assignmentService.delete({ assignment_id: assignId });
    message.success("作業刪除成功");

    // 重新載入作業列表
    await fetchAssignments();
  } catch (error) {
    console.error("Failed to delete assignment:", error);
    message.error("作業刪除失敗");
  } finally {
    loading.value = false;
  }
};

// --- Student Assignment Functions ---
const getStudentSubmissionForAssignment = (assignmentId) => {
  if (!props.isStudent) return null;
  return localCurrentUserSubmissions.value.find(
    (s) => s.assignmentId === assignmentId
  );
};

const handleStudentMockUpload = async (assignment, file) => {
  loading.value = true;
  try {
    // 先上傳檔案
    const formData = new FormData();
    formData.append("files", file);

    const uploadResponse = await courseService.uploadFile([
      { originFileObj: file },
    ]);
    const uploadedFiles = uploadResponse.map((url) => ({
      file_name: file.name,
      url: url,
    }));

    // 提交作業
    await assignmentService.submit({
      assignment_id: assignment.id,
      files: uploadedFiles,
    });

    message.success(`作業 "${assignment.title}" 已成功繳交`);

    // 重新載入作業列表
    await fetchAssignments();
  } catch (error) {
    console.error("Failed to submit assignment:", error);
    message.error("作業繳交失敗");
  } finally {
    loading.value = false;
  }

  return false; // Prevent default upload
};

const deleteSubmittedFile = async (assignment, fileToDelete) => {
  // API 不支援刪除單一檔案，需要重新提交整個作業
  const submission = localCurrentUserSubmissions.value.find(
    (s) => s.assignmentId === assignment.id
  );

  if (submission && submission.files) {
    loading.value = true;
    try {
      // 過濾掉要刪除的檔案
      const remainingFiles = submission.files.filter(
        (f) =>
          f.file_name !== fileToDelete.file_name || f.url !== fileToDelete.url
      );

      // 重新提交作業
      await assignmentService.submit({
        assignment_id: assignment.id,
        files: remainingFiles,
      });

      message.success(`檔案 "${fileToDelete.file_name}" 已刪除`);

      // 重新載入作業列表
      await fetchAssignments();
    } catch (error) {
      console.error("Failed to delete file:", error);
      message.error("檔案刪除失敗");
    } finally {
      loading.value = false;
    }
  }
};

const openSubmissionDetailModal = (assignment) => {
  submissionDetailModal.assignmentTitle = `"${assignment.title}" 的繳交狀況`;

  // 這裡需要實際的 API 來取得所有學生的繳交狀況
  // 目前先使用 mock data
  const mockSubmissions = props.students.map((student) => {
    const grade = localGrades[student.id]?.[assignment.id];
    let status, files;

    // Create varied mock data
    const randomChoice = Math.random();
    if (grade !== null && grade !== undefined) {
      status = AssignmentStatus.GRADED;
      files = [{ file_name: `submission_${student.id.slice(0, 4)}.pdf` }];
    } else if (randomChoice > 0.6) {
      status = AssignmentStatus.SUBMITTED;
      files = [{ file_name: `submission_${student.id.slice(0, 4)}.docx` }];
    } else {
      status = AssignmentStatus.NOT_SUBMITTED;
      files = [];
    }

    return {
      key: student.id,
      studentName: student.name,
      studentId: student.id,
      status: status,
      statusText: getStatusText(status),
      statusColor: getStatusColor(status),
      files: files,
    };
  });

  submissionDetailModal.submissions = mockSubmissions;
  submissionDetailModal.visible = true;
};

// Load assignments on mount
onMounted(() => {
  fetchAssignments();
});
</script>

<template>
  <div>
    <!-- Assignment List Header -->
    <div class="u-mb-4 u-flex u-justify-end">
      <a-button
        v-if="isTeacherOrCreator"
        type="primary"
        @click="openAddAssignmentModal"
        :loading="loading"
      >
        <template #icon><PlusOutlined /></template> 新增作業
      </a-button>
    </div>

    <!-- Assignment List -->
    <a-spin :spinning="loading">
      <a-list
        :data-source="localAssignments"
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

            <!-- Status Tags -->
            <template #extra>
              <div
                v-if="isStudent && getStudentSubmissionForAssignment(item.id)"
                class="u-flex u-items-center u-gap-4"
              >
                <div class="u-flex u-flex-col u-items-end u-gap-1">
                  <template
                    v-if="
                      getStudentSubmissionForAssignment(item.id).files?.length >
                      0
                    "
                  >
                    <!-- List of submitted files -->
                    <div
                      v-for="file in getStudentSubmissionForAssignment(item.id)
                        .files"
                      :key="file.url"
                      class="u-flex u-items-center u-gap-1"
                    >
                      <span class="u-text-sm u-c-gray-600">{{
                        file.file_name
                      }}</span>
                      <a-button
                        v-if="
                          getStudentSubmissionForAssignment(item.id).status !==
                            'GRADED' && item.status === 'OPEN'
                        "
                        type="text"
                        danger
                        size="small"
                        @click="() => deleteSubmittedFile(item, file)"
                        :loading="loading"
                      >
                        <template #icon><DeleteOutlined /></template>
                      </a-button>
                    </div>
                  </template>

                  <!-- Upload Button -->
                  <div
                    v-if="
                      item.status === 'OPEN' &&
                      getStudentSubmissionForAssignment(item.id)?.status !==
                        'GRADED'
                    "
                  >
                    <a-upload
                      :show-upload-list="false"
                      :before-upload="
                        (file) => handleStudentMockUpload(item, file)
                      "
                      :disabled="loading"
                    >
                      <a-button
                        size="small"
                        :type="'primary'"
                        :loading="loading"
                      >
                        <UploadOutlined />
                        {{
                          getStudentSubmissionForAssignment(item.id)?.files
                            ?.length > 0
                            ? "新增檔案"
                            : "繳交作業"
                        }}
                      </a-button>
                    </a-upload>
                  </div>
                </div>

                <!-- Status Tag -->
                <a-tag
                  :color="
                    getStatusColor(
                      getStudentSubmissionForAssignment(item.id).status
                    )
                  "
                >
                  {{
                    getStatusText(
                      getStudentSubmissionForAssignment(item.id).status
                    )
                  }}
                </a-tag>
              </div>
              <div v-else-if="!isStudent">
                <a-tag :color="getStatusColor(item.status)">
                  {{ getStatusText(item.status) }}
                </a-tag>
              </div>
            </template>

            <!-- Teacher/Creator Actions -->
            <template v-if="isTeacherOrCreator" #actions>
              <a-button
                type="link"
                size="small"
                @click="openEditAssignmentModal(item)"
                :disabled="loading"
              >
                編輯
              </a-button>
              <a-popconfirm
                title="確定刪除此作業嗎?"
                @confirm="deleteAssignment(item.id)"
                :disabled="loading"
              >
                <a-button type="link" size="small" danger :disabled="loading"
                  >刪除</a-button
                >
              </a-popconfirm>
              <a-button
                type="link"
                size="small"
                @click="openSubmissionDetailModal(item)"
                :disabled="loading"
              >
                查看繳交狀況
              </a-button>
            </template>

            <!-- Student Actions & Info -->
            <div v-if="isStudent" class="u-border-t u-border-gray-200" />
          </a-list-item>
        </template>
        <template #empty>
          <a-empty description="暫無作業" />
        </template>
      </a-list>
    </a-spin>

    <!-- Assignment Modal -->
    <a-modal
      v-model:visible="assignmentModal.visible"
      :title="assignmentModal.isEdit ? '編輯作業' : '新增作業'"
      @ok="confirmAssignment"
      okText="確認"
      cancelText="取消"
      :confirmLoading="loading"
      @cancel="() => assignmentFormRef?.clearValidate()"
    >
      <a-form
        layout="vertical"
        ref="assignmentFormRef"
        :model="assignmentModal"
        :rules="assignmentFormRules"
      >
        <a-form-item
          label="作業標題"
          name="title"
          :rules="assignmentFormRules.title"
        >
          <a-input v-model:value="assignmentModal.title" />
        </a-form-item>
        <a-form-item label="作業描述" name="description">
          <a-textarea v-model:value="assignmentModal.description" :rows="4" />
        </a-form-item>
        <a-form-item
          label="截止日期"
          name="dueDate"
          :rules="assignmentFormRules.dueDate"
        >
          <a-date-picker
            v-model:value="assignmentModal.dueDate"
            format="YYYY-MM-DD"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Submission Detail Modal -->
    <a-modal
      v-model:visible="submissionDetailModal.visible"
      :title="submissionDetailModal.assignmentTitle"
      :footer="null"
      width="70%"
    >
      <a-table
        :columns="submissionTableColumns"
        :data-source="submissionDetailModal.submissions"
        row-key="key"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.statusColor">{{ record.statusText }}</a-tag>
          </template>
          <template v-else-if="column.key === 'files'">
            <div v-if="record.files && record.files.length > 0">
              <div
                v-for="file in record.files"
                :key="file.url || file.file_name"
              >
                <FileOutlined /> {{ file.file_name }}
              </div>
            </div>
            <span v-else>--</span>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<style scoped>
.u-whitespace-pre-line {
  white-space: pre-line;
}
</style>
