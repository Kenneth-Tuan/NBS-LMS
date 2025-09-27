<script setup>
import { ref, reactive, computed, onMounted, h, unref } from "vue";
import { message } from "ant-design-vue";
import dayjs from "dayjs";

import { courseService } from "@/services/course.service";

const CREDIT_LIMIT = 21;

const selectionPeriod = `${dayjs().format("YYYY/MM/DD HH:mm:ss")} - ${dayjs()
  .add(14, "day")
  .format("YYYY/MM/DD HH:mm:ss")}`;
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

const filters = reactive({
  keyword: "",
  teacher: "",
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

const filteredAvailableCourses = computed(() => {
  return coursesData.filter((course) => {
    const matchKeyword =
      !filters.keyword || course.course_name.includes(filters.keyword);
    const matchTeacher =
      !filters.teacher || course.teacher_name === filters.teacher;

    return matchKeyword && matchTeacher;
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
  filters.keyword = "";
  filters.teacher = "";
  handleSearch();
};

const isCourseFull = (course) => {
  return course.enrollment_count >= course.enrollment_limit;
};

const hasCourseTimeConflict = (course) => {
  // 將時間字串轉換為分鐘數，方便比較
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // 檢查兩個時間段是否有重疊
  const hasOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
  };

  // 檢查新課程是否與任何已選課程有時間衝突
  for (const selectedCourse of selectedCourses.value) {
    // 確保已選課程有必要的時間資料
    if (
      !selectedCourse.week_day ||
      !selectedCourse.start_time ||
      !selectedCourse.end_time
    )
      continue;

    // 新課程可能有 weekly_schedule 陣列
    if (course.weekly_schedule && course.weekly_schedule.length > 0) {
      for (const newSchedule of course.weekly_schedule) {
        // 只有在同一天才需要檢查時間衝突
        if (newSchedule.week_day === selectedCourse.week_day) {
          // 將時間轉換為分鐘數
          const newStart = timeToMinutes(newSchedule.start_time);
          const newEnd = timeToMinutes(newSchedule.end_time);
          const existingStart = timeToMinutes(selectedCourse.start_time);
          const existingEnd = timeToMinutes(selectedCourse.end_time);

          // 檢查是否有時間重疊
          if (hasOverlap(newStart, newEnd, existingStart, existingEnd)) {
            return true;
          }
        }
      }
    } else if (course.week_day && course.start_time && course.end_time) {
      // 新課程也可能直接有時間屬性
      if (course.week_day === selectedCourse.week_day) {
        const newStart = timeToMinutes(course.start_time);
        const newEnd = timeToMinutes(course.end_time);
        const existingStart = timeToMinutes(selectedCourse.start_time);
        const existingEnd = timeToMinutes(selectedCourse.end_time);

        if (hasOverlap(newStart, newEnd, existingStart, existingEnd)) {
          return true;
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

    await courseService.pickCourse([course.course_id]);
    fetchMyCourseData();
    fetchCourseData();

    message.success(`已選擇 ${course.course_name}`);
    // 自动切换到已选课程页面
    activeTabKey.value = "selected";
  } catch (error) {
    message.error("選課時發生錯誤，請稍後再試");
  } finally {
    loading.value = false;
  }
};

const handleRemoveCourse = async (course) => {
  try {
    loading.value = true;

    await courseService.dropCourse(course.course_id);
    fetchMyCourseData();
    fetchCourseData();

    message.success(`已退選 ${course.course_name}`);
  } catch (error) {
    console.error("Failed to drop course:", error);
    message.error("退選時發生錯誤，請稍後再試");
  } finally {
    loading.value = false;
  }
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
      if (record.week_day && record.start_time && record.end_time) {
        return `${record.week_day} ${record.start_time}-${record.end_time}`;
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
  if (
    selectedCourses.value.some(
      (selectedCourse) => selectedCourse.course_id === record.course_id
    )
  )
    return "該課程已被選擇";

  if (isCourseFull(record)) return "課程已額滿";

  if (hasCourseTimeConflict(record)) return "與已選課程時間衝突";

  if (unref(hasReachedCreditLimit)) return "選課學分已達上限 (21學分)";

  return "";
};

const isCourseDisabledToSelect = (course) => {
  return (
    isCourseFull(course) ||
    hasCourseTimeConflict(course) ||
    unref(hasReachedCreditLimit) ||
    selectedCourses.value.some(
      (selectedCourse) => selectedCourse.course_id === course.course_id
    )
  );
};

async function fetchCourseData() {
  try {
    const courses = await courseService.fetchCoursesForEnrollment();
    coursesData.length = 0; // 清空陣列
    coursesData.push(...courses);
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    message.error("無法載入課程資料");
  }
}

async function fetchMyCourseData() {
  try {
    const { slots } = await courseService.getMyCourseSchedule();

    selectedCourses.value = [...slots];
  } catch (error) {
    console.error("Failed to fetch my courses:", error);
    message.error("無法載入我的課程資料");
  }
}

onMounted(async () => {
  handleSearch();
  try {
    await fetchCourseData();
    await fetchMyCourseData();
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
          <!-- <span class="u-mr-2 u-font-bold u-text-red-500">選課開放時間：</span>
          <a-tag color="red">
            <span class="u-font-bold">{{ selectionPeriod }}</span>
          </a-tag> -->
          <a-tag color="green" v-if="true" class="u-ml-2">
            <span class="u-font-bold">選課進行中</span>
          </a-tag>
          <!-- <a-tag color="default" v-else class="u-ml-2">
            <span class="u-font-bold">選課未開放</span>
          </a-tag> -->
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
                      :disabled="isCourseDisabledToSelect(record)"
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
                <!-- <a-button
                  type="primary"
                  @click="handleSubmitSelection"
                  :disabled="selectedCourses.length === 0"
                >
                  確認送出選課
                </a-button> -->
              </div>
            </div>

            <a-table
              :dataSource="selectedCourses"
              :columns="selectedCoursesColumns"
              rowKey="course_id"
              :pagination="false"
              size="middle"
              class="u-mb-4"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'action'">
                  <a-button
                    danger
                    size="small"
                    @click="handleRemoveCourse(record)"
                  >
                    退選
                  </a-button>
                </template>
              </template>
            </a-table>

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
