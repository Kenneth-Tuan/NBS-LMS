<script setup>
import { reactive, computed, onMounted, h, unref } from "vue";
import { message } from "ant-design-vue";
import { storeToRefs } from "pinia";

import { useEnrollmentStore } from "@/stores/enrollment.store";
import { useUserStore } from "@/stores/user";
import { UserRole } from "@/enums/appEnums";

const enrollmentStore = useEnrollmentStore();
const {
  coursesForEnrollment,
  selectedCourses,
  activeTabKey,
  loading,
  totalSelectedCredits,
} = storeToRefs(enrollmentStore);
const { fetchMyCourseData, selectCourse, dropCourse } = enrollmentStore;

const { userProfile } = useUserStore();

const filters = reactive({
  keyword: "",
  teacher: "",
});

const teacherOptions = computed(() => {
  const teachers = new Set();
  unref(coursesForEnrollment).forEach((course) => {
    if (course.teacher_name) teachers.add(course.teacher_name);
  });
  return Array.from(teachers).sort();
});

const filteredAvailableCourses = computed(() => {
  return unref(coursesForEnrollment).filter((course) => {
    const matchKeyword =
      !filters.keyword || course.course_name.includes(filters.keyword);
    const matchTeacher =
      !filters.teacher || course.teacher_name === filters.teacher;

    return matchKeyword && matchTeacher;
  });
});

const handleReset = () => {
  filters.keyword = "";
  filters.teacher = "";
};

const getCoursesInTimeSlot = (day, slot) => {
  // 將週幾對應轉換
  const dayMap = {
    monday: "週一",
    tuesday: "週二",
    wednesday: "週三",
    thursday: "週四",
    friday: "週五",
  };

  const weekDay = dayMap[day];
  if (!weekDay) return [];

  // 將時段轉換為時間範圍

  const slotTime = timeSlotMap[slot];
  if (!slotTime) return [];

  return selectedCourses.value.filter((course) => {
    if (!course.week_day || !course.start_time || !course.end_time)
      return false;

    return (
      course.week_day === weekDay &&
      course.start_time <= slotTime.start &&
      course.end_time >= slotTime.end
    );
  });
};

const getCourseColor = (courseId) => {
  const index = selectedCourses.value.findIndex(
    (c) => c.course_id === courseId
  );
  return courseColors[index % courseColors.length];
};

const isCourseDisabledToSelect = (course) => {
  return selectedCourses.value.some(
    (selectedCourse) => selectedCourse.course_id === course.course_id
  );
};

onMounted(async () => {
  if (userProfile.userRole === UserRole.Student) {
    try {
      await fetchMyCourseData();
    } catch (error) {}
  }
});
</script>

<template>
  <div class="u-w-full u-bg-white u-rounded-16px u-p24px u-shadow">
    <!-- 頁面標題 -->
    <div class="u-flex u-justify-between u-items-center u-mb16px">
      <h1 class="u-text-24px u-font-bold u-c-blue">限時選課</h1>

      <div class="u-flex u-items-center">
        <a-tag color="green" v-if="true" class="u-ml-2">
          <span class="u-font-bold">選課進行中</span>
        </a-tag>
      </div>
    </div>

    <!-- 分頁標籤 -->
    <a-tabs v-model:activeKey="activeTabKey" class="u-mb-6">
      <a-tab-pane key="available" tab="可選課程">
        <!-- 搜尋區塊 -->
        <div class="u-mb-6 u-bg-gray-50 u-p-4 u-rounded-lg">
          <a-form layout="inline" class="u-flex u-flex-wrap u-gap-4">
            <a-form-item label="課程名稱">
              <a-input
                v-model:value="filters.keyword"
                placeholder="輸入課程名稱關鍵字"
                style="width: 200px"
                allow-clear
              />
            </a-form-item>

            <a-form-item label="教師">
              <a-select
                v-model:value="filters.teacher"
                style="width: 180px"
                placeholder="選擇教師"
                allow-clear
              >
                <a-select-option
                  v-for="teacher in teacherOptions"
                  :key="teacher"
                  :value="teacher"
                >
                  {{ teacher }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item>
              <!-- <a-button type="primary" @click="handleSearch">查詢</a-button> -->
              <a-button class="u-ml-2" @click="handleReset">重置</a-button>
            </a-form-item>
          </a-form>
        </div>

        <!-- 可選課程表格 -->
        <a-spin :spinning="loading">
          <a-table
            :dataSource="filteredAvailableCourses"
            :columns="availableCoursesColumns"
            rowKey="course_id"
            :pagination="{ pageSize: 10 }"
            size="large"
            class="u-w-full u-overflow-x-auto"
          >
            <!-- 剩餘名額顯示 -->
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'course_name'">
                <span class="u-font-bold u-text-blue-500 u-text-nowrap">{{
                  record.course_name
                }}</span>
              </template>

              <template v-if="column.dataIndex === 'code'">
                <span v-if="record.code" class="u-text-nowrap">{{
                  record.code
                }}</span>
                <span v-else>-</span>
              </template>

              <template v-if="column.dataIndex === 'teacher_name'">
                <span class="u-text-nowrap">{{ record.teacher_name }}</span>
              </template>

              <template v-if="column.dataIndex === 'timeDisplay'">
                <a-tag
                  v-for="schedule in record.weekly_schedule"
                  :key="schedule.course_id"
                  color="green"
                  class="u-text-18px"
                  >{{ schedule.week_day }} {{ schedule.start_time }}-{{
                    schedule.end_time
                  }}</a-tag
                >
              </template>

              <template v-if="column.dataIndex === 'enrollment_count'">
                <span
                  :class="{
                    'u-text-red-500':
                      record.enrollment_limit - record.enrollment_count < 5,
                    'u-font-bold':
                      record.enrollment_limit - record.enrollment_count < 5,
                  }"
                >
                  {{ record.enrollment_count }}/{{ record.enrollment_limit }}
                </span>
              </template>
              <template v-if="column.dataIndex === 'action'">
                <a-button
                  type="primary"
                  size="small"
                  @click="selectCourse(record.course_id)"
                  :disabled="isCourseDisabledToSelect(record)"
                >
                  選課
                </a-button>
              </template>
            </template>
          </a-table>
        </a-spin>
      </a-tab-pane>

      <a-tab-pane key="selected" tab="已選課程">
        <!-- 已選課程清單 -->
        <div v-if="selectedCourses.length === 0" class="u-text-center u-p-10">
          <a-empty description="尚未選擇任何課程" />
        </div>

        <div v-else>
          <div class="u-bg-gray-50 u-p-4 u-rounded-lg u-mb-4">
            <div class="u-flex u-justify-between u-items-center">
              <div>
                <span class="u-font-bold">已選課程：</span>
                <span class="u-text-blue-500 u-font-bold">{{
                  selectedCourses.length
                }}</span>
                <span class="u-ml-2 u-font-bold">總學分：</span>
                <span
                  class="u-text-blue-500 u-font-bold"
                  :class="{ 'u-text-red-500': hasReachedCreditLimit }"
                  >{{ totalSelectedCredits }}</span
                >
                <!-- <span class="u-ml-1">/ 21</span> -->
              </div>
            </div>
          </div>

          <a-table
            :dataSource="selectedCourses"
            :columns="selectedCoursesColumns"
            rowKey="course_id"
            :pagination="false"
            size="middle"
            class="u-mb-4 u-w-full u-overflow-x-auto"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'course_name'">
                <span class="u-font-bold u-text-blue-500 u-text-nowrap">{{
                  record.course_name
                }}</span>
              </template>

              <template v-if="column.dataIndex === 'timeDisplay'">
                <span
                  v-if="record.week_day && record.start_time && record.end_time"
                  class="u-text-nowrap"
                >
                  {{ record.week_day }} {{ record.start_time }}-{{
                    record.end_time
                  }}
                </span>
                <span v-else>-</span>
              </template>

              <template v-if="column.dataIndex === 'code'">
                <span v-if="record.code" class="u-text-nowrap">{{
                  record.code
                }}</span>
                <span v-else>-</span>
              </template>

              <template v-if="column.dataIndex === 'teacher_name'">
                <span v-if="record.teacher_name" class="u-text-nowrap">{{
                  record.teacher_name
                }}</span>
                <span v-else>-</span>
              </template>

              <template v-if="column.dataIndex === 'action'">
                <a-button
                  danger
                  size="small"
                  @click="dropCourse(record.course_id)"
                >
                  退選
                </a-button>
              </template>
            </template>
          </a-table>

          <div class="u-w-full u-overflow-x-auto">
            <table class="timetable">
              <thead>
                <tr>
                  <th class="time-column"></th>
                  <th>星期一</th>
                  <th>星期二</th>
                  <th>星期三</th>
                  <th>星期四</th>
                  <th>星期五</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="time in timeSlots" :key="time.slot">
                  <td class="time-column u-text-nowrap">{{ time.label }}</td>
                  <td
                    v-for="day in [
                      'monday',
                      'tuesday',
                      'wednesday',
                      'thursday',
                      'friday',
                    ]"
                    :key="day"
                  >
                    <div
                      v-for="course in getCoursesInTimeSlot(day, time.slot)"
                      :key="course.course_id"
                      class="course-cell"
                      :style="{
                        backgroundColor: getCourseColor(course.course_id),
                      }"
                    >
                      {{ course.course_name }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
const timeSlots = [
  { slot: 1, label: "第1節 08:00-08:50" },
  { slot: 2, label: "第2節 09:00-09:50" },
  { slot: 3, label: "第3節 10:00-10:50" },
  { slot: 4, label: "第4節 11:00-11:50" },
  { slot: 5, label: "第5節 13:00-13:50" },
  { slot: 6, label: "第6節 14:00-14:50" },
  { slot: 7, label: "第7節 15:00-15:50" },
  { slot: 8, label: "第8節 16:00-16:50" },
  { slot: 9, label: "第9節 18:00-18:50" },
  { slot: 10, label: "第10節 19:00-19:50" },
  { slot: 11, label: "第11節 20:00-20:50" },
  { slot: 12, label: "第12節 21:00-21:50" },
];

const timeSlotMap = {
  1: { start: "08:00", end: "08:50" },
  2: { start: "09:00", end: "09:50" },
  3: { start: "10:00", end: "10:50" },
  4: { start: "11:00", end: "11:50" },
  5: { start: "13:00", end: "13:50" },
  6: { start: "14:00", end: "14:50" },
  7: { start: "15:00", end: "15:50" },
  8: { start: "16:00", end: "16:50" },
  9: { start: "18:00", end: "18:50" },
  10: { start: "19:00", end: "19:50" },
  11: { start: "20:00", end: "20:50" },
  12: { start: "21:00", end: "21:50" },
};

const selectedCoursesColumns = [
  {
    title: "課程名稱",
    dataIndex: "course_name",
    key: "course_name",
    width: "25%",
  },
  {
    title: "課程編號",
    dataIndex: "code",
    key: "code",
    width: "15%",
  },
  {
    title: "教師",
    dataIndex: "teacher_name",
    key: "teacher_name",
    width: "15%",
  },
  {
    title: "上課時間",
    dataIndex: "timeDisplay",
    key: "timeDisplay",
    width: "15%",
  },
  {
    title: "學分",
    dataIndex: "credit",
    key: "credit",
    width: "10%",
    align: "center",
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    width: "10%",
    align: "center",
  },
];

const availableCoursesColumns = [
  {
    title: "課程名稱",
    dataIndex: "course_name",
    key: "course_name",
    width: "25%",
  },
  {
    title: "課程編號",
    dataIndex: "code",
    key: "code",
    width: "15%",
  },
  {
    title: "教師",
    dataIndex: "teacher_name",
    key: "teacher_name",
    width: "15%",
  },
  {
    title: "上課時間",
    dataIndex: "timeDisplay",
    key: "timeDisplay",
    width: "15%",
  },
  {
    title: "學分",
    dataIndex: "credit",
    key: "credit",
    width: "5%",
    align: "center",
  },
  {
    title: "報名情況",
    dataIndex: "enrollment_count",
    key: "enrollment_count",
    width: "15%",
    align: "center",
    customRender: ({ record }) => {
      const remaining = record.enrollment_limit - record.enrollment_count;
      return `${remaining}/${record.enrollment_limit}`;
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    width: "5%",
    align: "center",
  },
];

const courseColors = [
  "#e6f7ff", // 淺藍
  "#f6ffed", // 淺綠
  "#fff7e6", // 淺橙
  "#fcf4ff", // 淺紫
  "#fff1f0", // 淺紅
  "#e6fffb", // 青綠
  "#f9f0ff", // 薰衣草
  "#fffbe6", // 淺黃
];
</script>

<style scoped>
/* 課表樣式 */
.timetable {
  width: 100%;
  border-collapse: collapse;
}

.timetable th,
.timetable td {
  border: 1px solid #ddd;
  padding: 8px;
  min-width: 100px;
  height: 60px;
  vertical-align: top;
}

.timetable th {
  background-color: #f0f2f5;
  text-align: center;
  font-weight: bold;
}

.time-column {
  width: 130px;
  background-color: #f0f2f5;
  font-weight: bold;
  font-size: 0.75rem;
}

.course-cell {
  padding: 4px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-bottom: 2px;
  word-break: break-word;
}

/* 表格行悬停效果 */
:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f0f7ff !important;
}
</style>
