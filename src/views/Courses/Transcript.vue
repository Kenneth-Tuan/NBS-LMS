<script setup>
import { onMounted, ref, computed } from "vue";
import {
  Table as ATable,
  RangePicker as ARangePicker,
  Button as AButton,
  Divider as ADivider,
  Tag as ATag,
} from "ant-design-vue";
import dayjs from "dayjs";

import useCreateTranscript from "@/composables/useCreateTranscript";

const {
  getAllCourses,
  generateTranscript,
  exportToExcel,
  dateRange,
  selectedCourses,
  selectedCoursesTranscript,
  filteredCourses,
  loading,
} = useCreateTranscript();

// Course Selection Table Configuration
const courseColumns = [
  {
    title: "課程名稱",
    dataIndex: "name",
    key: "name",
    width: 200,
  },
  {
    title: "授課老師",
    dataIndex: "teacher",
    key: "teacher",
    width: 120,
    customRender: ({ text, record }) =>
      record.instructor_name || record.teacher || "未指定",
  },
  {
    title: "開課日期",
    dataIndex: "start_date",
    key: "start_date",
    width: 120,
    customRender: ({ text }) => (text ? dayjs(text).format("YYYY-MM-DD") : "-"),
  },
  {
    title: "結束日期",
    dataIndex: "end_date",
    key: "end_date",
    width: 120,
    customRender: ({ text }) => (text ? dayjs(text).format("YYYY-MM-DD") : "-"),
  },
];

const rowSelection = computed(() => ({
  selectedRowKeys: selectedCourses.value,
  onChange: (selectedRowKeys) => {
    selectedCourses.value = selectedRowKeys;
  },
}));

// Transcript Table Configuration
const transcriptColumns = computed(() => {
  const baseColumns = [
    {
      title: "學生姓名",
      dataIndex: "student_name",
      key: "student_name",
      width: 150,
      fixed: "left",
    },
  ];

  // Dynamic columns based on selected courses that end up in the transcript
  // We can use selectedCourses to look up names
  // But strictly, we should look at what keys are in selectedCoursesTranscript or use selectedCourses ref map

  if (selectedCourses.value.length === 0) return baseColumns;

  // Map selected course IDs to columns
  const courseCols = selectedCourses.value.map((courseId) => {
    // Find course name from filteredCourses (which is a subset of allCourses usually, but better to rely on what we have)
    // Actually useCreateTranscript should probably expose allCourses if we need robust lookup,
    // but filteredCourses contains what we can select.
    // Let's try to find in filteredCourses.
    const course = filteredCourses.value.find((c) => c.course_id === courseId);
    const courseName = course ? course.name : "未知課程";

    return {
      title: courseName,
      dataIndex: courseId,
      key: courseId,
      width: 150,
      customRender: ({ text }) => {
        // text is the score.
        // Requirement: if no score or <= 0, show N/A
        // Transcript logic in composable sets it.
        // Let's just render text.
        // logic in composable: "score !== undefined && score !== null && score > 0" check is done during export.
        // The `selectedCoursesTranscript` has raw scores values if found.
        // Display requirement: "如果學生沒有修這門課或是總分不是大於0的話就顯示 N/A"
        if (text === undefined || text === null || text <= 0) {
          return "-";
        }
        return text;
      },
    };
  });

  return [...baseColumns, ...courseCols];
});

onMounted(() => {
  getAllCourses().then(() => {
    // Select all by default as per requirement?
    // "table 的第一個 column 為 checkbox，默認為全選"
    // Note: If we do this, we should select ALL courses initially after fetch.
    selectedCourses.value = filteredCourses.value.map((c) => c.course_id);
  });
});

// Watch for filter changes to re-select all?
// "默認為全選" usually means when the list updates, we might want to select all.
// But if user manually deselects, we shouldn't overwrite.
// Let's stick to initial load select all for now, or maybe when filteredCourses changes significantly?
// Let's simpler approach first: Select all on mount.
// If valid requirement to auto-select on filter change, we can add watcher.
// Requirement says "默認為全選", implies initial state.
</script>

<template>
  <div
    class="u-w-full u-bg-white u-rounded-16px u-p-6 u-shadow-lg u-overflow-x-hidden"
  >
    <h1 class="u-text-2xl u-font-bold u-mb-4 u-c-gray-700">成績單生成</h1>

    <ADivider class="u-my-4" />

    <!-- Date Filter -->
    <div class="u-mb-4 u-flex u-items-center u-gap-4">
      <span class="u-font-medium u-text-gray-700">選擇日期範圍：</span>
      <ARangePicker v-model:value="dateRange" />
      <span class="u-text-sm u-text-gray-500"
        >（選擇完日期後，下方將顯示符合時間範圍內的課程）</span
      >
    </div>

    <!-- Course List -->
    <div class="u-mb-6 u-w-full">
      <h2 class="u-text-lg u-font-bold u-mb-2 u-c-gray-700">課程列表</h2>

      <div
        v-if="!dateRange || dateRange.length === 0"
        class="u-text-center u-p-8 u-bg-gray-50 u-rounded-xl u-border-dashed u-border-2 u-border-gray-200 u-w-full"
      >
        <div class="u-text-lg u-font-medium u-c-gray-600 u-mb-2">
          尚未選擇日期範圍
        </div>
        <p class="u-text-sm u-c-gray-500">
          請先於上方選擇學期或課程的時間範圍，系統將自動列出符合條件的課程。
        </p>
      </div>

      <ATable
        v-else
        :columns="courseColumns"
        :data-source="filteredCourses"
        :row-selection="rowSelection"
        row-key="course_id"
        :pagination="{ pageSize: 1000, hideOnSinglePage: true }"
        :scroll="{ y: 400 }"
        size="small"
        bordered
      />
    </div>

    <!-- Actions -->
    <div class="u-flex u-justify-center u-mb-6">
      <AButton
        type="primary"
        size="large"
        @click="generateTranscript"
        :loading="loading"
      >
        生成成績單
      </AButton>
    </div>

    <!-- Transcript Result -->
    <div v-if="selectedCoursesTranscript.length > 0" class="u-mb-6 u-w-full">
      <div class="u-flex u-justify-between u-items-center u-mb-2">
        <h2 class="u-text-lg u-font-bold u-c-gray-700">成績單預覽</h2>
        <AButton type="primary" ghost @click="exportToExcel">
          匯出 Excel
        </AButton>
      </div>

      <!-- Wrapper to constrain table width -->

      <ATable
        :columns="transcriptColumns"
        :data-source="selectedCoursesTranscript"
        row-key="student_id"
        bordered
        :pagination="false"
        :scroll="{ x: 'max-content' }"
        class="u-max-w-full"
      />
    </div>
  </div>
</template>

<style scoped>
/* Reuse styles or add specific overrides if needed */
</style>
