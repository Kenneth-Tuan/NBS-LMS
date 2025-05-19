<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  Tag as ATag,
  Table as ATable,
  Space as ASpace,
  Button as AButton,
  Divider,
} from "ant-design-vue";
import dayjs from "dayjs";

import { dummyCourseData } from "@/data/dummy";
import { RouterName, UserRole } from "@/enums/appEnums";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const loading = ref(false);
const userStore = useUserStore();
// Revert to using only dummyCourseData
const courseData = ref(dummyCourseData);

// Updated columns: removed old status, added new one
const columns = ref([
  {
    title: "課程名稱",
    dataIndex: "title",
    key: "title",
    ellipsis: true,
  },
  {
    title: "授課教師",
    dataIndex: "instructor",
    key: "instructor",
    width: 120,
  },
  {
    title: "開課日期",
    dataIndex: "startDate",
    key: "startDate",
    width: 120,
    sorter: (a, b) =>
      dayjs(a.startDate, "YYYY.MM.DD").valueOf() -
      dayjs(b.startDate, "YYYY.MM.DD").valueOf(),
  },
  {
    title: "結課日期",
    dataIndex: "endDate",
    key: "endDate",
    width: 120,
  },
  {
    title: "狀態",
    key: "calculatedStatus", // Use a different key for the calculated status
    width: 100,
  },
  {
    title: "操作",
    key: "actions",
    width: 180,
    fixed: "right",
  },
]);

// Function to determine course status based on dates
const getCourseStatus = (startDate, endDate) => {
  const now = dayjs();
  const start = dayjs(startDate, "YYYY.MM.DD");
  const end = dayjs(endDate, "YYYY.MM.DD");

  if (!start.isValid() || !end.isValid()) {
    return { text: "日期無效", color: "red" };
  }

  if (now.isBefore(start)) {
    return { text: "尚未開課", color: "cyan" };
  } else if (now.isAfter(end)) {
    return { text: "已結業", color: "blue" };
  } else {
    return { text: "正在進行", color: "green" };
  }
};

// Update goToCourseDetail target
const goToCourseDetail = (id) => {
  // Navigate to the NEW Admin Course Detail page
  router.push({ name: RouterName.AdminCourseDetail, params: { id } });
};

const goToEditCourse = (id) => {
  // Navigation is correct, population happens in CourseForm
  router.push({ name: RouterName.UpdateCourse, params: { id } });
};

const title = computed(() => {
  switch (userStore.userProfile.userRole) {
    case UserRole.Creator:
    case UserRole.Admin:
    case UserRole.Manager:
      return "課程總覽";
    case UserRole.Teacher:
      return "開課記錄";
    case UserRole.Student:
      return "修課記錄";
    default:
      return "課程列表";
  }
});

onMounted(() => {
  // Optional: Sort data initially by start date if desired
  // courseData.value.sort((a, b) => dayjs(a.startDate, 'YYYY.MM.DD').valueOf() - dayjs(b.startDate, 'YYYY.MM.DD').valueOf());
});
</script>

<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-16px u-p24px u-shadow">
      <h1 class="u-text-24px u-font-bold u-mb2 u-c-blue">{{ title }}</h1>

      <Divider class="u-my8px" />

      <!-- Add filtering options if needed -->
      <!-- <div class="u-mb-4">
        Filters...
      </div> -->

      <a-table
        :columns="columns"
        :data-source="courseData"
        row-key="id"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        bordered
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <!-- Use calculated status -->
          <template v-if="column.key === 'calculatedStatus'">
            <a-tag
              :color="getCourseStatus(record.startDate, record.endDate).color"
            >
              {{ getCourseStatus(record.startDate, record.endDate).text }}
            </a-tag>
          </template>

          <!-- Actions Column -->
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button
                type="link"
                size="small"
                @click="goToCourseDetail(record.id)"
              >
                查看詳情
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="goToEditCourse(record.id)"
              >
                編輯
              </a-button>
              <!-- Add Delete button with confirmation if needed -->
              <!-- <a-popconfirm title="確定刪除此課程?" @confirm="deleteCourse(record.id)">
                <a-button type="link" danger size="small">刪除</a-button>
              </a-popconfirm> -->
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles if needed */
</style>
