<script setup>
import { reactive, onMounted, ref, computed } from "vue";
import dayjs from "dayjs";
import { Divider, message, Table } from "ant-design-vue";

import { timeCourseSettingsSchema } from "@/schemas/timeCourseSettings.schema";
import { courseService } from "@/services/course.service";

const formState = reactive({
  ["selectable-courses"]: [],
  ["range-time-picker"]: [
    dayjs().format("YYYY-MM-DD HH:mm:ss"),
    dayjs().add(14, "day").format("YYYY-MM-DD HH:mm:ss"),
  ],
  ["courses-credit"]: 21,
});

const selectableCourses = ref([]);
const enrollmentStatusData = ref([]);

const isEnrollmentStatusSectionDisplayed = computed(() => {
  return enrollmentStatusData.value.length > 0;
});

// 表格欄位定義
const columns = [
  {
    title: "選課設定編號",
    key: "enrollment_id",
    dataIndex: "enrollment_id",
  },
  {
    title: "課程",
    key: "courses",
    dataIndex: "courses",
    customRender: ({ text, record, index, column }) => {
      return record.courses.map((course) => course.name).join("、");
    },
  },
  {
    title: "選課開始/結束時間",
    key: "timeRange",
    dataIndex: "timeRange",
    customRender: ({ text, record, index, column }) => {
      const startTime = dayjs(record.start_time).format("YYYY-MM-DD HH:mm");
      const endTime = dayjs(record.end_time).format("YYYY-MM-DD HH:mm");
      return `${startTime} / ${endTime}`;
    },
  },
  {
    title: "該學期學分上限",
    key: "creditLimit",
    dataIndex: "creditLimit",
    customRender: ({ text, record, index, column }) => {
      return `${record.credit_limit} 學分`;
    },
  },
];

const onFinish = async (values) => {
  try {
    const {
      "selectable-courses": courseIds,
      "range-time-picker": timeRange,
      "courses-credit": creditLimit,
    } = values;
    const [startTime, endTime] = timeRange;

    if (dayjs(startTime).isBefore(dayjs())) {
      message.error("選課開始時間不能小於今天");
      return;
    }

    if (dayjs(endTime).isBefore(dayjs(startTime))) {
      message.error("選課結束時間不能小於選課開始時間");
      return;
    }

    if (creditLimit < 1) {
      message.error("該學期學分上限不能小於1");
      return;
    }

    if (courseIds.length < 1) {
      message.error("可選課程最少需要1門");
      return;
    }

    const result = await courseService.createEnrollment(
      courseIds,
      dayjs(startTime).format(),
      dayjs(endTime).format(),
      creditLimit
    );

    if (result.result) {
      message.success(result.msg);
      // 重新載入選課狀態資料
      await loadEnrollmentStatus();
    } else {
      message.error(result.msg);
    }
  } catch (error) {
    console.error(error);
  }
};

const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

const filterOption = (input, option) => {
  // Check if option.label exists and is a string before calling toLowerCase
  return (
    option.label &&
    typeof option.label === "string" &&
    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
  );
};

// 載入選課狀態資料
const loadEnrollmentStatus = async () => {
  try {
    const data = await courseService.getEnrollmentStatus();

    const filteredEnrollments = data.enrollments.filter((enrollment) =>
      dayjs(enrollment.end_time).isAfter(dayjs())
    );

    enrollmentStatusData.value = [...filteredEnrollments];
  } catch (error) {
    console.error("載入選課狀態失敗:", error);
    message.error("載入選課狀態失敗");
  }
};

onMounted(async () => {
  const courses = await courseService.fetchCoursesForEnrollmentSettings();
  selectableCourses.value = courses.map((course) => ({
    label: course.name,
    value: course.course_id,
  }));

  // 載入選課狀態資料
  await loadEnrollmentStatus();
});
</script>

<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-16px u-p24px u-shadow">
      <h1 class="u-text-24px u-font-bold u-mb16px u-c-blue">限時選課設定</h1>

      <Divider class="u-my16px" />

      <template v-if="isEnrollmentStatusSectionDisplayed">
        <!-- 現有選課狀態表格 -->
        <div class="u-mb24px">
          <h2 class="u-text-18px u-font-semibold u-mb16px u-c-blue">
            現有選課設定
          </h2>
          <Table
            :columns="columns"
            :data-source="enrollmentStatusData"
            :pagination="false"
            :row-key="(record) => record.enrollment_id"
            size="middle"
          />
        </div>

        <Divider class="u-my16px" />
      </template>

      <!-- 新增選課設定表單 -->
      <h2 class="u-text-18px u-font-semibold u-mb16px u-c-blue">
        新增選課設定
      </h2>
      <a-form
        :model="formState"
        name="timed-course-settings"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item
              v-bind="timeCourseSettingsSchema.selectableCourses"
              name="selectable-courses"
            >
              <a-select
                v-model:value="formState['selectable-courses']"
                mode="multiple"
                placeholder="選擇可選課程 (可多選)"
                :options="selectableCourses"
                allow-clear
                :filter-option="filterOption"
              >
                <!-- Optional: Customize tag rendering -->
                <template #tagRender="{ value, closable, onClose, label }">
                  <a-tag
                    :closable="closable"
                    @close="onClose"
                    style="margin-right: 3px"
                    >{{ label }}</a-tag
                  >
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              name="range-time-picker"
              v-bind="timeCourseSettingsSchema.rangeTime"
            >
              <a-range-picker
                v-model:value="formState['range-time-picker']"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              name="courses-credit"
              v-bind="timeCourseSettingsSchema.coursesCredit"
            >
              <a-input-number
                v-model:value="formState['courses-credit']"
                :min="1"
                :max="999"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item>
              <a-button type="primary" html-type="submit">確認</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
  </div>
</template>

<style scoped></style>
