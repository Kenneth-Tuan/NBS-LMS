<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { message } from "ant-design-vue";
import { DownloadOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";

import courseApi from "@/apis/course";
import { useUserStore } from "@/stores/user";
import { UserRole } from "@/enums/appEnums";
import { DEPARTMENTS_LABEL_MAP } from "@/constant/common.constant";
import { getApiErrorMessage } from "@/utils/axios/utils";

const props = defineProps({
  isStudent: {
    type: Boolean,
    required: true,
  },
  courseInfo: {
    type: Object,
    required: true,
  },
});

const route = useRoute();
const { userProfile } = useUserStore();

const course_id = ref(route.params.id);

const students = ref([]);
const exportLoading = ref(false);
const auditLoading = ref(false);
const selectedStudentIds = ref([]);

const canMarkAudit = computed(() => {
  const role = userProfile?.userRole;
  return (
    role === UserRole.Creator ||
    role === UserRole.Admin ||
    role === UserRole.Manager
  );
});

const canViewAudit = computed(() => !props.isStudent);

const formatDepartments = (departments) => {
  if (!departments || departments.length === 0) return "-";
  return departments
    .map((dep) => DEPARTMENTS_LABEL_MAP[dep] || dep)
    .join("、");
};

const studentRosterColumns = computed(() => {
  const columns = [
    { title: "學生姓名", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "科別", dataIndex: "departments", key: "departments" },
  ];

  if (canViewAudit.value) {
    columns.push({ title: "旁聽", dataIndex: "is_audit", key: "is_audit" });
  }

  return columns;
});

const rowSelection = computed(() => {
  if (!canMarkAudit.value) return undefined;
  return {
    selectedRowKeys: selectedStudentIds.value,
    onChange: (keys) => {
      selectedStudentIds.value = keys;
    },
  };
});

async function fetchStudents() {
  try {
    const { data } = await courseApi.getStudentList(course_id.value);
    students.value = [...(data.data.students || [])];
  } catch (error) {
    console.error("getStudentList error", error);
    message.error(getApiErrorMessage(error, "載入學生名單失敗"));
  }
}

onMounted(fetchStudents);

const escapeCsvValue = (value) => {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const getCsvCellValue = (student, dataIndex) => {
  if (dataIndex === "departments") {
    return formatDepartments(student.departments);
  }
  if (dataIndex === "is_audit") {
    return student.is_audit === true ? "旁聽" : "";
  }
  return student[dataIndex] ?? "";
};

// 將學生資料轉換為 CSV 格式
const exportStudentsAsCsv = (studentList, courseInfo) => {
  if (!studentList || !Array.isArray(studentList) || studentList.length === 0) {
    return "";
  }

  const courseInfoRows = [
    ["課程資訊"],
    ["課程名稱", courseInfo.title || ""],
    ["授課教師", courseInfo.teacher_name || ""],
    ["上課方式", courseInfo.classMode || ""],
    [
      "上課時間",
      courseInfo.weeklySchedule
        ?.map(
          (schedule) =>
            `${schedule.week_day} ${schedule.start_time}-${schedule.end_time}`,
        )
        .join(", ") || "",
    ],
    [""],
  ];

  const columns = studentRosterColumns.value;
  const headers = columns.map((column) => column.title);
  const dataIndexes = columns.map((column) => column.dataIndex);

  const studentRows = [
    ["學生名單"],
    headers.join(","),
    ...studentList.map((student) =>
      dataIndexes
        .map((dataIndex) => escapeCsvValue(getCsvCellValue(student, dataIndex)))
        .join(","),
    ),
  ];

  const allRows = [
    ...courseInfoRows.map((row) => row.join(",")),
    ...studentRows,
  ];

  return "\uFEFF" + allRows.join("\n");
};

async function exportStudentRoster() {
  exportLoading.value = true;
  try {
    const csvContent = exportStudentsAsCsv(students.value, props.courseInfo);

    const url = window.URL.createObjectURL(new Blob([csvContent]));
    const link = document.createElement("a");
    link.href = url;

    const courseTitle = props.courseInfo.title;
    const currentYear = dayjs().year();
    const currentTerm =
      dayjs(props.courseInfo.startDate).month() > 6 ? "一" : "二";
    const tearcherName = props.courseInfo.teacher_name;

    link.setAttribute(
      "download",
      `${courseTitle}-${tearcherName}_${currentYear}學年第${currentTerm}學期學生名單.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    message.error("導出學生名單失敗");
    console.error("Failed to export student roster:", error);
  } finally {
    exportLoading.value = false;
  }
}

async function handleBatchAudit(is_audit) {
  if (selectedStudentIds.value.length === 0) {
    message.warning("請先勾選學生");
    return;
  }

  auditLoading.value = true;
  try {
    const {
      data: {
        data: { updated_count, not_enrolled_student_ids },
      },
    } = await courseApi.patchEnrollmentAuditBatch(
      course_id.value,
      selectedStudentIds.value,
      is_audit,
    );

    message.success(
      is_audit
        ? `已標記 ${updated_count ?? 0} 位學生為旁聽`
        : `已取消 ${updated_count ?? 0} 位學生的旁聽標記`,
    );

    if (not_enrolled_student_ids?.length) {
      message.warning(
        `以下學生未修習此課程，已略過：${not_enrolled_student_ids.join("、")}`,
      );
    }

    selectedStudentIds.value = [];
    await fetchStudents();
  } catch (error) {
    console.error("patchEnrollmentAuditBatch error", error);
    message.error(getApiErrorMessage(error, "更新旁聽標記失敗"));
  } finally {
    auditLoading.value = false;
  }
}
</script>

<template>
  <div>
    <div class="u-mb-4 u-flex u-justify-end u-gap-2 u-flex-wrap">
      <template v-if="canMarkAudit">
        <a-button
          :disabled="selectedStudentIds.length === 0"
          :loading="auditLoading"
          @click="handleBatchAudit(true)"
        >
          標記為旁聽
        </a-button>
        <a-button
          :disabled="selectedStudentIds.length === 0"
          :loading="auditLoading"
          @click="handleBatchAudit(false)"
        >
          取消旁聽
        </a-button>
      </template>
      <a-button
        v-if="!isStudent"
        type="primary"
        :loading="exportLoading"
        @click="exportStudentRoster"
      >
        <template #icon><DownloadOutlined /></template>
        導出學生名單
      </a-button>
    </div>

    <a-table
      :columns="studentRosterColumns"
      :data-source="students"
      :row-selection="rowSelection"
      row-key="student_id"
      size="small"
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'departments'">
          <div
            v-if="record.departments?.length"
            class="u-flex u-flex-wrap u-gap-1"
          >
            <a-tag
              v-for="department in record.departments"
              :key="department"
            >
              {{ DEPARTMENTS_LABEL_MAP[department] || department }}
            </a-tag>
          </div>
          <span v-else>-</span>
        </template>
        <template v-else-if="column.key === 'is_audit'">
          <a-tag v-if="record.is_audit === true" color="orange">旁聽</a-tag>
        </template>
      </template>
    </a-table>
  </div>
</template>
