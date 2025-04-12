<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-lg u-p-6 u-shadow-md">
      <!-- 頁面標題 -->
      <div class="u-flex u-justify-between u-items-center u-mb-6">
        <h1 class="u-text-2xl u-font-bold u-c-blue">限時選課</h1>
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
      <a-alert
        type="info"
        showIcon
        class="u-mb-6"
        message="選課須知"
        description="1. 限時選課僅開放指定時間內進行，請注意選課時間。 2. 選課有21學分的上限。 3. 部分課程有人數上限，先選先得。 4. 確認課程無時間衝突。"
      />

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

          <div class="u-mb-4 u-flex u-justify-between u-items-center">
            <div>
              <!-- 移除全選功能 -->
            </div>
            <!-- 移除批量選課按鈕 -->
          </div>

          <!-- 可選課程表格 -->
          <a-spin :spinning="loading">
            <a-table
              :dataSource="filteredAvailableCourses"
              :columns="availableCoursesColumns"
              rowKey="id"
              :pagination="{ pageSize: 10 }"
              size="middle"
            >
              <!-- 剩餘名額顯示 -->
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'remainingSlots'">
                  <span
                    :class="{
                      'u-text-red-500': record.remainingSlots < 5,
                      'u-font-bold': record.remainingSlots < 5,
                    }"
                  >
                    {{ record.remainingSlots }}/{{ record.enrollmentLimit }}
                  </span>
                </template>
                <template v-if="column.dataIndex === 'action'">
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
                  <a-tooltip
                    v-if="isCourseFull(record) && isSelectionPeriodActive"
                    title="課程已額滿"
                  >
                    <a-button class="u-ml-2" size="small" type="text">
                      <i class="fas fa-info-circle"></i>
                    </a-button>
                  </a-tooltip>
                  <a-tooltip
                    v-if="
                      hasCourseTimeConflict(record) && isSelectionPeriodActive
                    "
                    title="與已選課程時間衝突"
                  >
                    <a-button class="u-ml-2" size="small" type="text">
                      <i class="fas fa-info-circle"></i>
                    </a-button>
                  </a-tooltip>
                  <a-tooltip
                    v-if="
                      (hasReachedCreditLimit ||
                        willExceedCreditLimit(record)) &&
                      isSelectionPeriodActive
                    "
                    title="選課學分已達上限 (21學分)"
                  >
                    <a-button class="u-ml-2" size="small" type="text">
                      <i class="fas fa-info-circle"></i>
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
              rowKey="id"
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
              <div class="u-font-bold u-mb-2">
                {{ currentSemester }} 課表預覽
              </div>
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
                  <td class="time-column">{{ time.label }}</td>
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
                      :key="course.id"
                      class="course-cell"
                      :style="{ backgroundColor: getCourseColor(course.id) }"
                    >
                      {{ course.courseName }}
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

<script setup>
import { ref, reactive, computed, onMounted, h } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { RouterName } from "@/enums/appEnums";
import { courseDetails, formatCourseTime } from "@/data/courseData";

const router = useRouter();

// 定義updateParams函數 - 更新URL參數或保存狀態
const updateParams = (key, value) => {
  console.log(`Updating parameter: ${key}`, value);
  // 根據需求實現:
  // 1. 更新URL參數
  // 2. 存儲到localStorage
  // 3. 更新全局狀態
};

// 最大学分限制
const CREDIT_LIMIT = 21;

// 模擬資料
const currentSemester = "2023-秋季學期";
const selectionPeriod = "2023/08/15 09:00 - 2023/08/20 23:59";
const isSelectionPeriodActive = ref(true);
const loading = ref(false);
const activeTabKey = ref("available");

// 課程資料
const coursesData = reactive([
  {
    id: "COURSE101",
    courseName: "新約概論",
    category: "聖經研究",
    credits: 3,
    teacher: "王大明牧師",
    enrollmentLimit: 30,
    currentEnrollment: 18,
    remainingSlots: 12,
    timeSlots: [
      { day: "monday", slot: 1 },
      { day: "monday", slot: 2 },
    ],
    ...courseDetails["COURSE101"],
  },
  {
    id: "COURSE102",
    courseName: "舊約歷史書研究",
    category: "聖經研究",
    credits: 3,
    teacher: "李文清博士",
    enrollmentLimit: 25,
    currentEnrollment: 20,
    remainingSlots: 5,
    timeSlots: [
      { day: "tuesday", slot: 3 },
      { day: "tuesday", slot: 4 },
    ],
    ...courseDetails["COURSE102"],
  },
  {
    id: "COURSE201",
    courseName: "教會歷史導論",
    category: "教會歷史",
    credits: 3,
    teacher: "陳歷史教授",
    enrollmentLimit: 40,
    currentEnrollment: 25,
    remainingSlots: 15,
    timeSlots: [
      { day: "wednesday", slot: 1 },
      { day: "wednesday", slot: 2 },
    ],
    ...courseDetails["COURSE201"],
  },
  {
    id: "COURSE301",
    courseName: "講道學基礎",
    category: "實踐神學",
    credits: 2,
    teacher: "張牧師",
    enrollmentLimit: 20,
    currentEnrollment: 12,
    remainingSlots: 8,
    timeSlots: [
      { day: "thursday", slot: 5 },
      { day: "thursday", slot: 6 },
    ],
    ...courseDetails["COURSE301"],
  },
  {
    id: "COURSE401",
    courseName: "系統神學導論",
    category: "神學研究",
    credits: 3,
    teacher: "林博士",
    enrollmentLimit: 35,
    currentEnrollment: 30,
    remainingSlots: 5,
    timeSlots: [
      { day: "friday", slot: 3 },
      { day: "friday", slot: 4 },
    ],
    ...courseDetails["COURSE401"],
  },
  {
    id: "COURSE501",
    courseName: "教牧輔導",
    category: "實踐神學",
    credits: 3,
    teacher: "黃心理博士",
    enrollmentLimit: 15,
    currentEnrollment: 15,
    remainingSlots: 0,
    timeSlots: [
      { day: "monday", slot: 9 },
      { day: "monday", slot: 10 },
    ],
    ...courseDetails["COURSE501"],
  },
  {
    id: "COURSE601",
    courseName: "新約希臘文（初級）",
    category: "聖經語言",
    credits: 3,
    teacher: "吳語言教授",
    enrollmentLimit: 30,
    currentEnrollment: 25,
    remainingSlots: 5,
    timeSlots: [
      { day: "tuesday", slot: 1 },
      { day: "tuesday", slot: 2 },
    ],
    ...courseDetails["COURSE601"],
  },
  {
    id: "COURSE701",
    courseName: "宗教改革史",
    category: "教會歷史",
    credits: 3,
    teacher: "陳歷史教授",
    enrollmentLimit: 25,
    currentEnrollment: 15,
    remainingSlots: 10,
    timeSlots: [
      { day: "wednesday", slot: 11 },
      { day: "wednesday", slot: 12 },
    ],
    ...courseDetails["COURSE701"],
  },
  {
    id: "COURSE801",
    courseName: "基督徒靈命塑造",
    category: "靈修神學",
    credits: 2,
    teacher: "謝靈修牧師",
    enrollmentLimit: 40,
    currentEnrollment: 20,
    remainingSlots: 20,
    timeSlots: [
      { day: "thursday", slot: 9 },
      { day: "thursday", slot: 10 },
    ],
    ...courseDetails["COURSE801"],
  },
  {
    id: "COURSE901",
    courseName: "當代神學思潮",
    category: "神學研究",
    credits: 3,
    teacher: "林博士",
    enrollmentLimit: 20,
    currentEnrollment: 18,
    remainingSlots: 2,
    timeSlots: [
      { day: "friday", slot: 11 },
      { day: "friday", slot: 12 },
    ],
    ...courseDetails["COURSE901"],
  },
]);

// 已選課程
const selectedCourses = ref([]);

// 检查是否已达到学分上限
const totalSelectedCredits = computed(() => {
  return selectedCourses.value.reduce((total, course) => {
    return total + (course.credits || 0);
  }, 0);
});

// 检查是否已达到学分上限
const hasReachedCreditLimit = computed(() => {
  return totalSelectedCredits.value >= CREDIT_LIMIT;
});

// 检查是否会超出学分上限
const willExceedCreditLimit = (course) => {
  const currentTotalCredits = selectedCourses.value.reduce(
    (total, selected) => total + selected.credits,
    0
  );
  return currentTotalCredits + course.credits > CREDIT_LIMIT;
};

// 剩余可选学分
const remainingCredits = computed(() => {
  return Math.max(0, CREDIT_LIMIT - totalSelectedCredits.value);
});

// 篩選條件
const filters = reactive({
  category: "",
  keyword: "",
  teacher: "",
});

// 課程類別
const categoryOptions = computed(() => {
  const categories = new Set();
  coursesData.forEach((course) => {
    categories.add(course.category);
  });
  return Array.from(categories).sort();
});

// 教師
const teacherOptions = computed(() => {
  const teachers = new Set();
  coursesData.forEach((course) => {
    teachers.add(course.teacher);
  });
  return Array.from(teachers).sort();
});

// 時間表
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

// 過濾後的可選課程
const filteredAvailableCourses = computed(() => {
  return coursesData.filter((course) => {
    const matchCategory =
      !filters.category || course.category === filters.category;
    const matchKeyword =
      !filters.keyword || course.courseName.includes(filters.keyword);
    const matchTeacher = !filters.teacher || course.teacher === filters.teacher;

    return matchCategory && matchKeyword && matchTeacher;
  });
});

// 可選課程表格列
const availableCoursesColumns = [
  {
    title: "課程編號",
    dataIndex: "id",
    key: "id",
    width: "10%",
  },
  {
    title: "課程名稱",
    dataIndex: "courseName",
    key: "courseName",
    width: "25%",
    customRender: ({ text, record }) => {
      return h(
        "a",
        {
          onClick: (e) => {
            e.stopPropagation();
            router.push({
              name: RouterName.CourseDetail,
              params: { id: record.id },
            });
          },
          style: "cursor: pointer; color: #1890ff;",
        },
        text
      );
    },
  },
  {
    title: "類別",
    dataIndex: "category",
    key: "category",
    width: "15%",
  },
  {
    title: "學分",
    dataIndex: "credits",
    key: "credits",
    width: "5%",
    align: "center",
  },
  {
    title: "教師",
    dataIndex: "teacher",
    key: "teacher",
    width: "15%",
  },
  {
    title: "剩餘名額",
    dataIndex: "remainingSlots",
    key: "remainingSlots",
    width: "15%",
    align: "center",
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    width: "15%",
    align: "center",
  },
];

// 課程顏色
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

// 搜尋課程
const handleSearch = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 300);
};

// 重置過濾條件
const handleReset = () => {
  filters.category = "";
  filters.keyword = "";
  filters.teacher = "";
  handleSearch();
};

// 確認課程是否額滿
const isCourseFull = (course) => {
  return course.remainingSlots <= 0;
};

// 確認是否與已選課程時間衝突
const hasCourseTimeConflict = (course) => {
  for (const selectedCourse of selectedCourses.value) {
    for (const timeSlot of course.timeSlots) {
      const conflict = selectedCourse.timeSlots.some(
        (st) => st.day === timeSlot.day && st.slot === timeSlot.slot
      );
      if (conflict) return true;
    }
  }
  return false;
};

// 選課
const handleSelectCourse = async (course) => {
  try {
    if (loading.value) return;

    // 检查是否已选择该课程
    if (selectedCourses.value.some((item) => item.id === course.id)) {
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

    // 检查是否已经选择了该课程
    if (selectedCourses.value.some((item) => item.id === course.id)) {
      message.error("You have already selected this course");
      return;
    }

    // 添加课程
    selectedCourses.value.push(course);

    // 更新剩余名额
    const index = coursesData.findIndex((c) => c.id === course.id);
    if (index !== -1) {
      coursesData[index].remainingSlots--;
      coursesData[index].currentEnrollment++;
    }

    message.success(`Course selected successfully: ${course.courseName}`);
    // 自动切换到已选课程页面
    activeTabKey.value = "selected";
  } catch (error) {
    message.error("選課時發生錯誤，請稍後再試");
  } finally {
    loading.value = false;
  }
};

// 退選
const handleRemoveCourse = (course) => {
  // 從已選課程中移除
  selectedCourses.value = selectedCourses.value.filter(
    (c) => c.id !== course.id
  );

  // 恢復名額
  const index = coursesData.findIndex((c) => c.id === course.id);
  if (index !== -1) {
    coursesData[index].remainingSlots++;
    coursesData[index].currentEnrollment--;
  }

  message.success(`已退選 ${course.courseName}`);
};

// 確認送出選課
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

// 獲取特定時間段的課程
const getCoursesInTimeSlot = (day, slot) => {
  return selectedCourses.value.filter((course) =>
    course.timeSlots.some((ts) => ts.day === day && ts.slot === slot)
  );
};

// 獲取課程顏色
const getCourseColor = (courseId) => {
  const index = selectedCourses.value.findIndex((c) => c.id === courseId);
  return courseColors[index % courseColors.length];
};

// 已選課程表格列
const selectedCoursesColumns = [
  {
    title: "課程編號",
    dataIndex: "id",
    key: "id",
    width: "10%",
  },
  {
    title: "課程名稱",
    dataIndex: "courseName",
    key: "courseName",
    width: "25%",
    customRender: ({ text, record }) => {
      return h(
        "a",
        {
          onClick: (e) => {
            e.stopPropagation();
            router.push({
              name: RouterName.CourseDetail,
              params: { id: record.id },
            });
          },
          style: "cursor: pointer; color: #1890ff;",
        },
        text
      );
    },
  },
  {
    title: "類別",
    dataIndex: "category",
    key: "category",
    width: "15%",
  },
  {
    title: "學分",
    dataIndex: "credits",
    key: "credits",
    width: "10%",
    align: "center",
  },
  {
    title: "教師",
    dataIndex: "teacher",
    key: "teacher",
    width: "15%",
  },
  {
    title: "上課時間",
    dataIndex: "timeDisplay",
    key: "timeDisplay",
    width: "15%",
    customRender: ({ record }) => {
      return formatCourseTime(record);
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    width: "10%",
    align: "center",
  },
];

// 初始化
onMounted(() => {
  handleSearch();
});
</script>

<style scoped>
.u-p-4 {
  padding: 1rem;
}
.u-p-6 {
  padding: 1.5rem;
}
.u-p-10 {
  padding: 2.5rem;
}
.u-w-full {
  width: 100%;
}
.u-bg-white {
  background-color: white;
}
.u-bg-gray-50 {
  background-color: #f9fafb;
}
.u-rounded-lg {
  border-radius: 0.5rem;
}
.u-shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.u-text-2xl {
  font-size: 1.5rem;
}
.u-text-lg {
  font-size: 1.125rem;
}
.u-text-sm {
  font-size: 0.875rem;
}
.u-text-xs {
  font-size: 0.75rem;
}
.u-font-bold {
  font-weight: bold;
}
.u-text-red-500 {
  color: #f56c6c;
}
.u-text-blue-500 {
  color: #1890ff;
}
.u-text-gray-500 {
  color: #6b7280;
}
.u-mb-2 {
  margin-bottom: 0.5rem;
}
.u-mb-4 {
  margin-bottom: 1rem;
}
.u-mb-6 {
  margin-bottom: 1.5rem;
}
.u-mr-2 {
  margin-right: 0.5rem;
}
.u-ml-1 {
  margin-left: 0.25rem;
}
.u-ml-2 {
  margin-left: 0.5rem;
}
.u-c-blue {
  color: #1890ff;
}
.u-flex {
  display: flex;
}
.u-items-center {
  align-items: center;
}
.u-justify-between {
  justify-content: space-between;
}
.u-flex-wrap {
  flex-wrap: wrap;
}
.u-gap-4 {
  gap: 1rem;
}
.u-text-center {
  text-align: center;
}
.u-overflow-auto {
  overflow: auto;
}

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
