<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-lg u-p-6 u-shadow-md">
      <div class="u-flex u-justify-between u-items-center u-mb-4">
        <h1 class="u-text-2xl u-font-bold u-c-blue">
          課程詳情 (管理): {{ course?.title || "Loading..." }}
        </h1>
        <a-button @click="goBack">返回總覽</a-button>
      </div>
      <a-spin :spinning="loading">
        <h2 class="u-text-xl u-font-semibold u-mb-3">學生列表</h2>
        <a-table
          :columns="studentColumns"
          :data-source="enrolledStudents"
          row-key="studentId"
          size="small"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <!-- Overall Grade -->
            <template v-if="column.key === 'overallGrade'">
              <span>{{ record.overallGrade || "-" }}</span>
            </template>

            <!-- Assignments Status -->
            <template v-else-if="column.key === 'assignments'">
              <a-space direction="vertical" align="start" :size="2">
                <div
                  v-for="assignment in courseAssignments"
                  :key="assignment.assignmentId"
                >
                  <span class="u-font-semibold"
                    >{{ assignment.assignmentName }}:
                  </span>
                  <a-tag
                    :color="
                      getAssignmentStatusColor(
                        record.assignmentSubmissions[assignment.assignmentId]
                          ?.status
                      )
                    "
                  >
                    {{
                      getAssignmentStatusText(
                        record.assignmentSubmissions[assignment.assignmentId]
                          ?.status
                      )
                    }}
                  </a-tag>
                  <span
                    v-if="
                      record.assignmentSubmissions[assignment.assignmentId]
                        ?.grade
                    "
                    class="u-ml-1"
                  >
                    (分數:
                    {{
                      record.assignmentSubmissions[assignment.assignmentId]
                        ?.grade
                    }})
                  </span>
                </div>
              </a-space>
            </template>

            <!-- Attendance Status -->
            <template v-else-if="column.key === 'attendance'">
              <span v-if="record.attendance">
                {{ record.attendance.attended }} /
                {{ record.attendance.total }} ({{
                  calculateAttendancePercentage(record.attendance)
                }}%)
              </span>
              <span v-else>-</span>
            </template>

            <!-- Actions -->
            <template v-else-if="column.key === 'actions'">
              <a-button type="link" size="small">查看學生</a-button>
              <!-- Add other actions like edit grade -->
            </template>
          </template>
        </a-table>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { dummyCourseData } from "@/data/dummy"; // Basic course info
// Need dummy data for students, assignments specific to *this* course
import {
  Table as ATable,
  Tag as ATag,
  Spin as ASpin,
  Button as AButton,
  Space as ASpace,
} from "ant-design-vue";
import { RouterName } from "@/enums/appEnums";

// Define possible assignment statuses (could be moved to enums)
const ASSIGNMENT_STATUS = {
  SUBMITTED: "submitted",
  NOT_SUBMITTED: "not_submitted",
  GRADED: "graded",
  LATE: "late",
};

const props = defineProps({
  id: {
    // Received from router props: true
    type: [String, Number],
    required: true,
  },
});

const router = useRouter();
const route = useRoute();
const loading = ref(false);

// --- Mock Data (Replace with API calls) ---
const course = ref(null);
const enrolledStudents = ref([]); // Holds the combined student data
const courseAssignments = ref([]); // Holds assignment definitions for the course

// Define columns for the single student table
const studentColumns = ref([
  {
    title: "學號",
    dataIndex: "studentId",
    key: "studentId",
    width: 100,
    fixed: "left",
  },
  {
    title: "姓名",
    dataIndex: "studentName",
    key: "studentName",
    width: 120,
    fixed: "left",
  },
  {
    title: "總成績",
    dataIndex: "overallGrade",
    key: "overallGrade",
    width: 80,
  },
  { title: "作業情況", key: "assignments" }, // Custom rendered column
  { title: "出席情況", key: "attendance", width: 130 }, // Custom rendered column
  { title: "操作", key: "actions", width: 100, fixed: "right" },
]);

// --- Helper Functions ---
const goBack = () => {
  router.push({ name: RouterName.CourseOverview });
};

const getAssignmentStatusText = (status) => {
  switch (status) {
    case ASSIGNMENT_STATUS.SUBMITTED:
      return "已繳交";
    case ASSIGNMENT_STATUS.GRADED:
      return "已評分";
    case ASSIGNMENT_STATUS.LATE:
      return "遲交";
    case ASSIGNMENT_STATUS.NOT_SUBMITTED:
    default:
      return "未繳交";
  }
};

const getAssignmentStatusColor = (status) => {
  switch (status) {
    case ASSIGNMENT_STATUS.SUBMITTED:
      return "processing";
    case ASSIGNMENT_STATUS.GRADED:
      return "success";
    case ASSIGNMENT_STATUS.LATE:
      return "warning";
    case ASSIGNMENT_STATUS.NOT_SUBMITTED:
    default:
      return "error";
  }
};

const calculateAttendancePercentage = (attendance) => {
  if (!attendance || !attendance.total || attendance.total === 0) return 0;
  return ((attendance.attended / attendance.total) * 100).toFixed(0);
};

// Fetch data on mount
onMounted(() => {
  loading.value = true;
  console.log("Fetching details for course ID:", props.id);
  // --- Mock Data Loading ---
  course.value = dummyCourseData.find((c) => c.id === Number(props.id));

  // Mock assignment definitions for this course
  courseAssignments.value = [
    { assignmentId: "A1", assignmentName: "作業一", deadline: "2024-03-15" },
    { assignmentId: "A2", assignmentName: "期中報告", deadline: "2024-04-20" },
    { assignmentId: "A3", assignmentName: "作業二", deadline: "2024-05-10" },
  ];

  // Generate mock enrolled student data with integrated details
  enrolledStudents.value = [
    {
      studentId: "S001",
      studentName: "Alice",
      overallGrade: "A",
      assignmentSubmissions: {
        A1: { status: ASSIGNMENT_STATUS.GRADED, grade: 92 },
        A2: { status: ASSIGNMENT_STATUS.SUBMITTED, grade: null },
        A3: { status: ASSIGNMENT_STATUS.NOT_SUBMITTED, grade: null },
      },
      attendance: { attended: 11, total: 12 },
    },
    {
      studentId: "S002",
      studentName: "Bob",
      overallGrade: "B+",
      assignmentSubmissions: {
        A1: { status: ASSIGNMENT_STATUS.GRADED, grade: 88 },
        A2: { status: ASSIGNMENT_STATUS.LATE, grade: 75 }, // Example: Late submission, graded
        A3: { status: ASSIGNMENT_STATUS.SUBMITTED, grade: null },
      },
      attendance: { attended: 10, total: 12 },
    },
    {
      studentId: "S003",
      studentName: "Charlie",
      overallGrade: null, // Grade not finalized
      assignmentSubmissions: {
        A1: { status: ASSIGNMENT_STATUS.NOT_SUBMITTED, grade: null },
        A2: { status: ASSIGNMENT_STATUS.NOT_SUBMITTED, grade: null },
        A3: { status: ASSIGNMENT_STATUS.NOT_SUBMITTED, grade: null },
      },
      attendance: { attended: 8, total: 12 },
    },
    {
      studentId: "S004",
      studentName: "Diana",
      overallGrade: "A-",
      assignmentSubmissions: {
        A1: { status: ASSIGNMENT_STATUS.GRADED, grade: 95 },
        A2: { status: ASSIGNMENT_STATUS.GRADED, grade: 85 },
        A3: { status: ASSIGNMENT_STATUS.GRADED, grade: 90 },
      },
      attendance: { attended: 12, total: 12 },
    },
  ];

  loading.value = false;
  // --- End Mock Data Loading ---
});
</script>

<style scoped>
/* Add styles if needed */
</style>
