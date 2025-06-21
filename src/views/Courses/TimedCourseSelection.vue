<script setup>
import { ref, reactive, computed, onMounted, h } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";

import { RouterName } from "@/enums/appEnums";
import { courseService } from "@/services/course.service";

const router = useRouter();

const CREDIT_LIMIT = 21;

const selectionPeriod = `${dayjs().format("YYYY/MM/DD HH:mm:ss")} - ${dayjs()
  .add(14, "day")
  .format("YYYY/MM/DD HH:mm:ss")}`;
const isSelectionPeriodActive = ref(true);
const loading = ref(false);
const activeTabKey = ref("available");

const coursesData = reactive([]);

const selectedCourses = ref([]);

const totalSelectedCredits = computed(() => {
  return selectedCourses.value.reduce((total, course) => {
    return total + (course.credit || 0);
  }, 0);
});

const hasReachedCreditLimit = computed(() => {
  return totalSelectedCredits.value >= CREDIT_LIMIT;
});

const willExceedCreditLimit = (course) => {
  const currentTotalCredits = selectedCourses.value.reduce(
    (total, selected) => total + selected.credit,
    0
  );
  return currentTotalCredits + course.credit > CREDIT_LIMIT;
};

const remainingCredits = computed(() => {
  return Math.max(0, CREDIT_LIMIT - totalSelectedCredits.value);
});

const filters = reactive({
  category: "",
  keyword: "",
  teacher: "",
});

const categoryOptions = computed(() => {
  const categories = new Set();
  coursesData.forEach((course) => {
    if (course.category) categories.add(course.category);
  });
  return Array.from(categories).sort();
});

const teacherOptions = computed(() => {
  const teachers = new Set();
  coursesData.forEach((course) => {
    if (course.teacher_name) teachers.add(course.teacher_name);
  });
  return Array.from(teachers).sort();
});

const timeSlots = [
  { slot: 1, label: "第1節 08:00-08:50" },
  { slot: 2, label: "第2節 09:00-09:50" },
  { slot: 3, label: "第3節 10:10-11:00" },
  { slot: 4, label: "第4節 11:10-12:00" },
  { slot: 5, label: "第5節 13:10-14:00" },
  { slot: 6, label: "第6節 14:10-15:00" },
  { slot: 7, label: "第7節 15:10-16:00" },
  { slot: 8, label: "第8節 16:10-17:00" },
  { slot: 9, label: "第9節 18:00-18:50" },
  { slot: 10, label: "第10節 19:00-19:50" },
  { slot: 11, label: "第11節 20:00-20:50" },
  { slot: 12, label: "第12節 21:00-21:50" },
];

const filteredAvailableCourses = computed(() => {
  return coursesData.filter((course) => {
    const matchCategory =
      !filters.category || course.category === filters.category;
    const matchKeyword =
      !filters.keyword || course.course_name.includes(filters.keyword);
    const matchTeacher =
      !filters.teacher || course.teacher_name === filters.teacher;

    return matchCategory && matchKeyword && matchTeacher;
  });
});

const availableCoursesColumns = [
  {
    title: "課程名稱",
    dataIndex: "course_name",
    key: "course_name",
    width: "25%",
    customRender: ({ text, record }) => {
      return h(
        "a",
        {
          onClick: (e) => {
            // e.stopPropagation();
            // router.push({
            //   name: RouterName.CourseDetail,
            //   params: { id: record.course_id },
            // });
          },
          style: "cursor: pointer; color: #1890ff;",
        },
        text
      );
    },
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
    customRender: ({ record }) => {
      // 格式化週課表時間
      if (record.weekly_schedule && record.weekly_schedule.length > 0) {
        return record.weekly_schedule
          .map(
            (schedule) =>
              `${schedule.week_day} ${schedule.start_time}-${schedule.end_time}`
          )
          .join(", ");
      }
      return "-";
    },
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

const handleSearch = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 300);
};

const handleReset = () => {
  filters.category = "";
  filters.keyword = "";
  filters.teacher = "";
  handleSearch();
};

const isCourseFull = (course) => {
  return course.enrollment_count >= course.enrollment_limit;
};

const hasCourseTimeConflict = (course) => {
  for (const selectedCourse of selectedCourses.value) {
    if (!selectedCourse.weekly_schedule || !course.weekly_schedule) continue;

    for (const newSchedule of course.weekly_schedule) {
      for (const existingSchedule of selectedCourse.weekly_schedule) {
        if (newSchedule.week_day === existingSchedule.week_day) {
          // 檢查時間是否重疊
          const newStart = newSchedule.start_time;
          const newEnd = newSchedule.end_time;
          const existingStart = existingSchedule.start_time;
          const existingEnd = existingSchedule.end_time;

          if (
            (newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

const handleSelectCourse = async (course) => {
  try {
    if (loading.value) return;

    // 检查是否已选择该课程
    if (
      selectedCourses.value.some((item) => item.course_id === course.course_id)
    ) {
      message.warning("該課程已被選擇");
      return;
    }

    // 检查是否超出学分上限
    if (willExceedCreditLimit(course)) {
      message.warning(`選課失敗：總學分不能超過${CREDIT_LIMIT}學分`);
      return;
    }

    loading.value = true;

    // 检查是否有时间冲突
    if (hasCourseTimeConflict(course)) {
      message.error(
        "This course has a time conflict with your selected courses"
      );
      return;
    }

    // 添加课程
    selectedCourses.value.push(course);

    // 更新剩余名额
    const index = coursesData.findIndex(
      (c) => c.course_id === course.course_id
    );
    if (index !== -1) {
      coursesData[index].enrollment_count++;
    }

    message.success(`Course selected successfully: ${course.course_name}`);
    // 自动切换到已选课程页面
    activeTabKey.value = "selected";
  } catch (error) {
    message.error("選課時發生錯誤，請稍後再試");
  } finally {
    loading.value = false;
  }
};

const handleRemoveCourse = (course) => {
  // 從已選課程中移除
  selectedCourses.value = selectedCourses.value.filter(
    (c) => c.course_id !== course.course_id
  );

  // 恢復名額
  const index = coursesData.findIndex((c) => c.course_id === course.course_id);
  if (index !== -1) {
    coursesData[index].enrollment_count--;
  }

  message.success(`已退選 ${course.course_name}`);
};

const handleSubmitSelection = () => {
  if (selectedCourses.value.length === 0) {
    message.warning("您尚未選擇任何課程");
    return;
  }

  // 這裡模擬送出選課
  message.loading({ content: "處理中...", key: "submitSelection" });

  setTimeout(() => {
    message.success({
      content:
        "選課成功！您已成功選修 " + selectedCourses.value.length + " 門課程",
      key: "submitSelection",
      duration: 3,
    });
  }, 1500);
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
  const timeSlotMap = {
    1: { start: "08:00", end: "08:50" },
    2: { start: "09:00", end: "09:50" },
    3: { start: "10:10", end: "11:00" },
    4: { start: "11:10", end: "12:00" },
    5: { start: "13:10", end: "14:00" },
    6: { start: "14:10", end: "15:00" },
    7: { start: "15:10", end: "16:00" },
    8: { start: "16:10", end: "17:00" },
    9: { start: "18:00", end: "18:50" },
    10: { start: "19:00", end: "19:50" },
    11: { start: "20:00", end: "20:50" },
    12: { start: "21:00", end: "21:50" },
  };

  const slotTime = timeSlotMap[slot];
  if (!slotTime) return [];

  return selectedCourses.value.filter((course) => {
    if (!course.weekly_schedule) return false;

    return course.weekly_schedule.some(
      (schedule) =>
        schedule.week_day === weekDay &&
        schedule.start_time <= slotTime.start &&
        schedule.end_time >= slotTime.end
    );
  });
};

const getCourseColor = (courseId) => {
  const index = selectedCourses.value.findIndex(
    (c) => c.course_id === courseId
  );
  return courseColors[index % courseColors.length];
};

const selectedCoursesColumns = [
  {
    title: "課程名稱",
    dataIndex: "course_name",
    key: "course_name",
    width: "25%",
    customRender: ({ text, record }) => {
      return h(
        "a",
        {
          onClick: (e) => {
            // e.stopPropagation();
            // router.push({
            //   name: RouterName.CourseDetail,
            //   params: { id: record.course_id },
            // });
          },
          style: "cursor: pointer; color: #1890ff;",
        },
        text
      );
    },
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
    customRender: ({ record }) => {
      // 格式化週課表時間
      if (record.weekly_schedule && record.weekly_schedule.length > 0) {
        return record.weekly_schedule
          .map(
            (schedule) =>
              `${schedule.week_day} ${schedule.start_time}-${schedule.end_time}`
          )
          .join(", ");
      }
      return "-";
    },
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

const tooltipTitle = (record) => {
  if (isCourseFull(record) && isSelectionPeriodActive) {
    return "課程已額滿";
  }
  if (hasCourseTimeConflict(record) && isSelectionPeriodActive) {
    return "與已選課程時間衝突";
  }
  if (
    (hasReachedCreditLimit || willExceedCreditLimit(record)) &&
    isSelectionPeriodActive
  ) {
    return "選課學分已達上限 (21學分)";
  }
  return "";
};

onMounted(async () => {
  handleSearch();
  try {
    const courses = await courseService.fetchCoursesForEnrollment();
    console.log(courses);

    // 將 API 回傳的資料填入 coursesData
    coursesData.length = 0; // 清空陣列
    coursesData.push(...courses);
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    message.error("無法載入課程資料");
  }
});
</script>

<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-16px u-p24px u-shadow">
      <!-- 頁面標題 -->
      <div class="u-flex u-justify-between u-items-center u-mb16px">
        <h1 class="u-text-24px u-font-bold u-c-blue">限時選課</h1>

        <div class="u-flex u-items-center">
          <span class="u-mr-2 u-font-bold u-text-red-500">選課開放時間：</span>
          <a-tag color="red">
            <span class="u-font-bold">{{ selectionPeriod }}</span>
          </a-tag>
          <a-tag color="green" v-if="isSelectionPeriodActive" class="u-ml-2">
            <span class="u-font-bold">選課進行中</span>
          </a-tag>
          <a-tag color="default" v-else class="u-ml-2">
            <span class="u-font-bold">選課未開放</span>
          </a-tag>
        </div>
      </div>

      <!-- 選課說明 -->
      <!-- <a-alert
        type="info"
        showIcon
        class="u-mb-6"
        message="選課須知"
        description="1. 限時選課僅開放指定時間內進行，請注意選課時間。 2. 選課有21學分的上限。 3. 部分課程有人數上限，先選先得。 4. 確認課程無時間衝突。"
      /> -->

      <!-- 分頁標籤 -->
      <a-tabs v-model:activeKey="activeTabKey" class="u-mb-6">
        <a-tab-pane key="available" tab="可選課程">
          <!-- 搜尋區塊 -->
          <div class="u-mb-6 u-bg-gray-50 u-p-4 u-rounded-lg">
            <a-form layout="inline" class="u-flex u-flex-wrap u-gap-4">
              <a-form-item label="課程類別">
                <a-select
                  v-model:value="filters.category"
                  style="width: 180px"
                  placeholder="選擇類別"
                  allow-clear
                >
                  <a-select-option
                    v-for="category in categoryOptions"
                    :key="category"
                    :value="category"
                  >
                    {{ category }}
                  </a-select-option>
                </a-select>
              </a-form-item>

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
                <a-button type="primary" @click="handleSearch">查詢</a-button>
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
              size="middle"
            >
              <!-- 剩餘名額顯示 -->
              <template #bodyCell="{ column, record }">
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
                  <a-tooltip :title="tooltipTitle(record)">
                    <a-button
                      type="primary"
                      size="small"
                      @click="handleSelectCourse(record)"
                      :disabled="
                        !isSelectionPeriodActive ||
                        isCourseFull(record) ||
                        hasCourseTimeConflict(record) ||
                        hasReachedCreditLimit ||
                        willExceedCreditLimit(record)
                      "
                    >
                      選課
                    </a-button>
                  </a-tooltip>
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
                  <span class="u-ml-1">/ 21</span>
                </div>
                <a-button
                  type="primary"
                  @click="handleSubmitSelection"
                  :disabled="
                    !isSelectionPeriodActive || selectedCourses.length === 0
                  "
                >
                  確認送出選課
                </a-button>
              </div>
            </div>

            <a-table
              :dataSource="selectedCourses"
              :columns="selectedCoursesColumns"
              rowKey="course_id"
              :pagination="false"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'action'">
                  <a-button
                    danger
                    size="small"
                    @click="handleRemoveCourse(record)"
                    :disabled="!isSelectionPeriodActive"
                  >
                    退選
                  </a-button>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <a-tab-pane key="schedule" tab="課表預覽">
          <!-- 週課表預覽 -->
          <div class="u-overflow-auto">
            <div class="u-bg-gray-50 u-p-4 u-rounded-lg u-mb-4">
              <div class="u-font-bold u-mb-2">課表預覽</div>
              <div class="u-text-sm u-text-gray-500">
                僅顯示您已選的課程，可用來確認是否有時間衝突
              </div>
            </div>

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
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

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
