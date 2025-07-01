<script setup>
import { computed, reactive } from "vue";
import { message } from "ant-design-vue";

// Props
const props = defineProps({
  isTeacherOrCreator: {
    type: Boolean,
    default: false,
  },
  isStudent: {
    type: Boolean,
    default: false,
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
  currentUserStudentId: {
    type: String,
    default: "",
  },
});

// Emits
const emit = defineEmits(["update:grades"]);

// Local state
const localGrades = reactive({ ...props.grades });

// Watch for prop changes
import { watch } from "vue";
watch(
  () => props.grades,
  (newVal) => {
    Object.assign(localGrades, newVal);
  },
  { deep: true }
);

// Helper functions
const getStatusText = (status) => {
  switch (status) {
    case "OPEN":
      return "進行中";
    case "SUBMITTED":
      return "已繳交";
    case "GRADED":
      return "已評分";
    case "CLOSED":
      return "已關閉";
    case "NOT_SUBMITTED":
      return "未繳交";
    default:
      return "未知";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "OPEN":
      return "blue";
    case "SUBMITTED":
      return "green";
    case "GRADED":
      return "purple";
    case "CLOSED":
      return "red";
    case "NOT_SUBMITTED":
      return "orange";
    default:
      return "default";
  }
};

// Teacher/Creator Gradebook Columns
const gradebookColumns = computed(() => {
  const baseColumns = [
    {
      title: "學生姓名",
      dataIndex: "name",
      key: "name",
      fixed: "left",
    },
  ];
  const assignmentCols = props.assignments.map((assign) => ({
    title: assign.title,
    dataIndex: ["grades", assign.id],
    key: assign.id,
  }));
  return [...baseColumns, ...assignmentCols];
});

const gradebookDataSource = computed(() => {
  return props.students.map((student) => ({
    ...student,
    key: student.id,
    grades: localGrades[student.id] || {},
  }));
});

// Student Gradebook Columns
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
  if (!props.isStudent) return [];
  return props.assignments.map((assign) => {
    const submission = props.currentUserSubmissions.find(
      (s) => s.assignmentId === assign.id
    );
    let gradeDisplay = "-";
    let statusText = getStatusText("NOT_SUBMITTED");

    if (submission) {
      statusText = getStatusText(submission.status);
      if (submission.status === "GRADED") {
        gradeDisplay =
          submission.grade !== null
            ? String(submission.grade)
            : "已評分 (無分數)";
      } else if (submission.status === "SUBMITTED") {
        gradeDisplay = "評改中";
      }
    } else if (assign.status === "CLOSED") {
      statusText = getStatusText("CLOSED");
    }

    return {
      key: assign.id,
      title: assign.title,
      gradeDisplay,
      statusText,
      statusColor: getStatusColor(
        submission?.status ||
          (assign.status === "CLOSED" ? "CLOSED" : "NOT_SUBMITTED")
      ),
    };
  });
});

// Methods
const handleGradeChange = (studentId, assignmentId, event) => {
  const score = event.target.value ? parseInt(event.target.value, 10) : null;
  if (score !== null && (isNaN(score) || score < 0 || score > 100)) {
    message.error("請輸入 0-100 之間的有效分數");
    event.target.value = localGrades[studentId]?.[assignmentId] || "";
    return;
  }

  if (!localGrades[studentId]) localGrades[studentId] = {};
  localGrades[studentId][assignmentId] = score;

  emit("update:grades", { ...localGrades });
};
</script>

<template>
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
    >
      <template #bodyCell="{ column, record, value }">
        <template v-if="assignments.find((a) => a.id === column.key)">
          <a-input
            :value="value"
            placeholder="-"
            size="small"
            style="width: 80px; text-align: center"
            @change="handleGradeChange(record.id, column.key, $event)"
          />
        </template>
      </template>
    </a-table>
  </div>

  <!-- Student Grade View -->
  <div v-if="isStudent">
    <h3 class="u-text-lg u-font-semibold u-mb-3 u-c-gray-700">我的成績</h3>
    <a-table
      :columns="studentGradebookColumns"
      :data-source="studentGradebookDataSource"
      bordered
      size="small"
      row-key="key"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'grade'">
          <span
            :class="{
              'u-c-gray-500':
                record.gradeDisplay === '評改中' || record.gradeDisplay === '-',
            }"
            >{{ record.gradeDisplay }}</span
          >
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.statusColor">
            {{ record.statusText }}
          </a-tag>
        </template>
      </template>
    </a-table>
  </div>
</template>
