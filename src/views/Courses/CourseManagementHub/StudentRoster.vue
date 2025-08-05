<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { message } from "ant-design-vue";
import { DownloadOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";

import courseApi from "@/apis/course";

const props = defineProps({
  courseInfo: {
    type: Object,
    required: true,
  },
}); 

const route = useRoute();

const course_id = ref(route.params.id);

const students = ref([]);
const exportLoading = ref(false);

onMounted(async () => {
  try {
    const {data} = await courseApi.getStudentList(course_id.value);
    students.value = [...data.data.students];
  } catch (error) {
    console.error("getStudentList error", error);
  }
});

// Columns
const studentRosterColumns = [
  { title: "學生姓名", dataIndex: "name", key: "name" },
  { title: "Email", dataIndex: "email", key: "email" },
];

// 將學生資料轉換為 CSV 格式
const exportStudentsAsCsv = (students, courseInfo) => {
  if (!students || !Array.isArray(students) || students.length === 0) {
    return "";
  }

  // 準備課程基本資訊
  const courseInfoRows = [
    ["課程資訊"],
    ["課程名稱", courseInfo.title || ""],
    ["授課教師", courseInfo.teacher_name || ""],
    ["上課方式", courseInfo.classMode || ""],
    ["上課時間", courseInfo.weeklySchedule?.map(schedule => 
      `${schedule.week_day} ${schedule.start_time}-${schedule.end_time}`
    ).join(", ") || ""],
    [""], // 空行分隔
  ];

  // 使用 studentRosterColumns 的 title 作為 header，並確保順序
  const headers = studentRosterColumns.map(column => column.title);
  const dataIndexes = studentRosterColumns.map(column => column.dataIndex);

  // 學生資料行
  const studentRows = [
    ["學生名單"],
    headers.join(","),
    ...students.map((student) =>
      dataIndexes.map(dataIndex => {
        const value = student[dataIndex] || "";
        // 如果值包含逗號、引號或換行符，則用引號包圍並轉義內部引號
        if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    ),
  ];

  // 合併課程資訊和學生資料
  const allRows = [
    ...courseInfoRows.map(row => row.join(",")),
    ...studentRows,
  ];

  return allRows.join("\n");
};

async function exportStudentRoster() {
  exportLoading.value = true;
  try {
    // 調用 API 獲取 CSV 資料
    const csvContent = exportStudentsAsCsv(students.value, props.courseInfo);
    
    // 創建下載連結
    const url = window.URL.createObjectURL(new Blob([csvContent]));
    const link = document.createElement("a");
    link.href = url;
    
    const courseTitle = props.courseInfo.title;
    const currentYear = dayjs().year();
    const currentTerm = dayjs(props.courseInfo.startDate).month() > 6 ? "一" : "二";
    const tearcherName = props.courseInfo.teacher_name;
    
    link.setAttribute(
      "download",
      `${courseTitle}-${tearcherName}_${currentYear}學年第${currentTerm}學期學生名單.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // 清理 blob URL
  } catch (error) {
    message.error("導出學生名單失敗");
    console.error("Failed to export student roster:", error);
  } finally {
    exportLoading.value = false;
  }
}
</script>

<template>
  <div>
    <div class="u-mb-4 u-flex u-justify-end">
      <a-button 
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
      row-key="name"
      size="small"
      :pagination="false"  
    >
    </a-table>
  </div>
</template>
