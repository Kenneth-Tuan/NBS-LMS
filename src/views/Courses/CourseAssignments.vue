<script setup>
import { ref, reactive, computed, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import {
  PlusOutlined,
  UploadOutlined,
  FileOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";

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
const emit = defineEmits([
  "update:assignments",
  "update:grades",
  "update:currentUserSubmissions",
]);

// Assignment Status Constants
const AssignmentStatus = {
  OPEN: "OPEN",
  SUBMITTED: "SUBMITTED",
  GRADED: "GRADED",
  CLOSED: "CLOSED",
  NOT_SUBMITTED: "NOT_SUBMITTED",
};

// Local state for assignments
const localAssignments = ref([...props.assignments]);
const localGrades = reactive({ ...props.grades });
const localCurrentUserSubmissions = ref([...props.currentUserSubmissions]);

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

// --- Assignment Management Functions ---
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

  const assignmentData = {
    title: assignmentModal.title,
    description: assignmentModal.description,
    dueDate: dayjs(assignmentModal.dueDate).format("YYYY-MM-DD"),
    status: AssignmentStatus.OPEN,
  };

  if (assignmentModal.isEdit) {
    const index = localAssignments.value.findIndex(
      (a) => a.id === assignmentModal.id
    );
    if (index !== -1) {
      localAssignments.value[index] = {
        ...localAssignments.value[index],
        ...assignmentData,
      };
      message.success("作業更新成功");
    }
  } else {
    const newAssignment = {
      id: uuidv4(),
      courseId: props.currentCourseId,
      ...assignmentData,
    };
    localAssignments.value.push(newAssignment);

    // Initialize grades for all students
    props.students.forEach((student) => {
      if (!localGrades[student.id]) localGrades[student.id] = {};
      localGrades[student.id][newAssignment.id] = null;
    });

    // Initialize submission status for current student
    if (props.isStudent) {
      localCurrentUserSubmissions.value.push({
        assignmentId: newAssignment.id,
        status: AssignmentStatus.NOT_SUBMITTED,
        files: [],
        grade: null,
      });
    }

    message.success("作業新增成功");
  }

  // Emit updates
  emit("update:assignments", localAssignments.value);
  emit("update:grades", localGrades);
  emit("update:currentUserSubmissions", localCurrentUserSubmissions.value);

  assignmentModal.visible = false;
};

const deleteAssignment = (assignId) => {
  localAssignments.value = localAssignments.value.filter(
    (a) => a.id !== assignId
  );

  // Remove grades for this assignment
  props.students.forEach((student) => {
    if (
      localGrades[student.id] &&
      localGrades[student.id][assignId] !== undefined
    ) {
      delete localGrades[student.id][assignId];
    }
  });

  // Remove submission records for current student
  if (props.isStudent) {
    localCurrentUserSubmissions.value =
      localCurrentUserSubmissions.value.filter(
        (s) => s.assignmentId !== assignId
      );
  }

  // Emit updates
  emit("update:assignments", localAssignments.value);
  emit("update:grades", localGrades);
  emit("update:currentUserSubmissions", localCurrentUserSubmissions.value);

  message.success("作業刪除成功");
};

// --- Student Assignment Functions ---
const getStudentSubmissionForAssignment = (assignmentId) => {
  if (!props.isStudent) return null;
  return localCurrentUserSubmissions.value.find(
    (s) => s.assignmentId === assignmentId
  );
};

const handleStudentMockUpload = (assignment, file) => {
  const submission = localCurrentUserSubmissions.value.find(
    (s) => s.assignmentId === assignment.id
  );

  if (submission) {
    if (!submission.files) {
      submission.files = [];
    }
    submission.files.push({ id: uuidv4(), name: file.name });
    submission.status = AssignmentStatus.SUBMITTED;
    submission.grade = null;
    message.success(`檔案 "${file.name}" 已成功上傳`);
  } else {
    localCurrentUserSubmissions.value.push({
      assignmentId: assignment.id,
      status: AssignmentStatus.SUBMITTED,
      files: [{ id: uuidv4(), name: file.name }],
      grade: null,
    });
    message.success(`作業 "${assignment.title}" 已成功模擬繳交: ${file.name}`);
  }

  emit("update:currentUserSubmissions", localCurrentUserSubmissions.value);
  return false; // Prevent default upload
};

const deleteSubmittedFile = (assignment, fileToDelete) => {
  const submission = localCurrentUserSubmissions.value.find(
    (s) => s.assignmentId === assignment.id
  );

  if (submission && submission.files) {
    submission.files = submission.files.filter((f) => f.id !== fileToDelete.id);

    if (submission.files.length === 0) {
      submission.status = AssignmentStatus.NOT_SUBMITTED;
    }

    emit("update:currentUserSubmissions", localCurrentUserSubmissions.value);
    message.success(`檔案 "${fileToDelete.name}" 已刪除`);
  }
};

const openSubmissionDetailModal = (assignment) => {
  submissionDetailModal.assignmentTitle = `"${assignment.title}" 的繳交狀況`;

  // Mocking submission data for all students for this demo
  const mockSubmissions = props.students.map((student) => {
    const grade = localGrades[student.id]?.[assignment.id];
    let status, files;

    // Create varied mock data
    const randomChoice = Math.random();
    if (grade !== null && grade !== undefined) {
      status = AssignmentStatus.GRADED;
      files = [
        { id: uuidv4(), name: `submission_${student.id.slice(0, 4)}.pdf` },
      ];
    } else if (randomChoice > 0.6) {
      status = AssignmentStatus.SUBMITTED;
      files = [
        { id: uuidv4(), name: `submission_${student.id.slice(0, 4)}.docx` },
      ];
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
</script>

<template>
  <div>
    <!-- Assignment List Header -->
    <div class="u-mb-4 u-flex u-justify-end">
      <a-button
        v-if="isTeacherOrCreator"
        type="primary"
        @click="openAddAssignmentModal"
      >
        <template #icon><PlusOutlined /></template> 新增作業
      </a-button>
    </div>

    <!-- Assignment List -->
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
              <div class="u-text-sm u-c-gray-600 u-mt-1 u-whitespace-pre-line">
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
                    getStudentSubmissionForAssignment(item.id).files?.length > 0
                  "
                >
                  <!-- List of submitted files -->
                  <div
                    v-for="file in getStudentSubmissionForAssignment(item.id)
                      .files"
                    :key="file.id"
                    class="u-flex u-items-center u-gap-1"
                  >
                    <span class="u-text-sm u-c-gray-600">{{ file.name }}</span>
                    <a-button
                      v-if="
                        getStudentSubmissionForAssignment(item.id).status !==
                          'GRADED' && item.status === 'OPEN'
                      "
                      type="text"
                      danger
                      size="small"
                      @click="() => deleteSubmittedFile(item, file)"
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
                  >
                    <a-button size="small" :type="'primary'">
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
            >
              編輯
            </a-button>
            <a-popconfirm
              title="確定刪除此作業嗎?"
              @confirm="deleteAssignment(item.id)"
            >
              <a-button type="link" size="small" danger>刪除</a-button>
            </a-popconfirm>
            <a-button
              type="link"
              size="small"
              @click="openSubmissionDetailModal(item)"
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
              <div v-for="file in record.files" :key="file.id">
                <FileOutlined /> {{ file.name }}
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
