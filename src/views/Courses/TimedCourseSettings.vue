<script setup>
import { reactive, onMounted, ref, computed } from "vue";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

import { Divider, message, Table } from "ant-design-vue";

import { timeCourseSettingsSchema } from "@/schemas/timeCourseSettings.schema";
import { courseService } from "@/services/course.service";
import courseApi from "@/apis/course";

const initialFormState = {
  ["selectable-courses"]: [],
  ["range-time-picker"]: [
    dayjs().add(5, "minute").format("YYYY-MM-DD HH:mm:ss"),
    dayjs().add(14, "day").format("YYYY-MM-DD HH:mm:ss"),
  ],
  ["courses-credit"]: 21,
  ["enrollment_id"]: null,
};

const formState = reactive({ ...initialFormState });

const selectableCourses = ref([]);
const enrollmentStatusData = ref([]);

const isEnrollmentStatusSectionDisplayed = computed(() => {
  return enrollmentStatusData.value.length > 0;
});

const isModalOpen = ref(false);
const modalOperation = ref(null);

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

    const filteredEnrollments = data.enrollments.filter(
      (enrollment) =>
        // dayjs(enrollment.end_time).isAfter(dayjs())
        true
    );

    enrollmentStatusData.value = [...filteredEnrollments];
  } catch (error) {
    console.error("載入選課狀態失敗:", error);
    message.error("載入選課狀態失敗");
  }
};

const handleDelete = async (enrollment_id) => {
  try {
    const result = await courseApi.deleteEnrollment(enrollment_id);

    if (result.status === 200) {
      message.success("刪除選課設定成功");
      await loadEnrollmentStatus();
    } else {
      message.error("刪除選課設定失敗");
    }
  } catch (error) {
    console.error("刪除選課設定失敗:", error);
    message.error("刪除選課設定失敗");
  }
};

const handleAddEnrollment = async () => {
  isModalOpen.value = true;
  modalOperation.value = "add";
  resetForm();
};

const handleEdit = async (enrollment) => {
  const { courses, credit_limit, start_time, end_time, enrollment_id } =
    enrollment;

  formState["selectable-courses"] = courses.map((course) => course.course_id);
  formState["range-time-picker"] = [dayjs(start_time), dayjs(end_time)];
  formState["courses-credit"] = credit_limit;
  formState["enrollment_id"] = enrollment_id;

  isModalOpen.value = true;
  modalOperation.value = "edit";
};

const handleModalOk = async () => {
  const result = validation();
  if (!result) return;

  try {
    const {
      "selectable-courses": courseIds,
      "courses-credit": creditLimit,
      enrollment_id: enrollment_id,
      "range-time-picker": [startTime, endTime],
    } = formState;

    let response = null;

    if (modalOperation.value === "add") {
      const createResponse = await courseService.createEnrollment(
        courseIds,
        dayjs(startTime).format(),
        dayjs(endTime).format(),
        creditLimit
      );

      response = createResponse;
    } else {
      const updateResponse = await courseService.updateEnrollment(
        enrollment_id,
        courseIds,
        dayjs(startTime).format(),
        dayjs(endTime).format(),
        creditLimit
      );

      response = updateResponse;
    }

    if (response.result) {
      message.success(response.msg);
      await loadEnrollmentStatus();
      isModalOpen.value = false;
      modalOperation.value = null;
    } else message.error(response.msg);
  } catch (error) {
    console.error(error);
  } finally {
  }
};

const handleModalCancel = async () => {
  isModalOpen.value = false;
  modalOperation.value = null;
};

function resetForm() {
  formState["selectable-courses"] = initialFormState["selectable-courses"];
  formState["range-time-picker"] = initialFormState["range-time-picker"];
  formState["courses-credit"] = initialFormState["courses-credit"];
  formState["enrollment_id"] = initialFormState["enrollment_id"];
}

function validation() {
  const {
    "selectable-courses": courseIds,
    "courses-credit": creditLimit,
    enrollment_id: enrollment_id,
    "range-time-picker": [startTime, endTime],
  } = formState;

  const timeRangeOfEnrollmentList = enrollmentStatusData.value.map(
    (enrollment) => {
      return {
        start_time: dayjs(enrollment.start_time),
        end_time: dayjs(enrollment.end_time),
      };
    }
  );

  const isTimeRangeOverlapping = timeRangeOfEnrollmentList.some(
    (enrollment) => {
      return (
        dayjs(startTime).isBetween(
          enrollment.start_time,
          enrollment.end_time,
          null,
          "[]"
        ) ||
        dayjs(endTime).isBetween(
          enrollment.start_time,
          enrollment.end_time,
          null,
          "[]"
        )
      );
    }
  );

  if (isTimeRangeOverlapping && modalOperation.value === "add") {
    message.error("選課時間不能與現有選課設定重疊");
    return false;
  }

  if (dayjs(startTime).isBefore(dayjs())) {
    message.error("選課開始時間不能小於今天");
    return false;
  }

  if (dayjs(endTime).isBefore(dayjs(startTime))) {
    message.error("選課結束時間不能小於選課開始時間");
    return false;
  }

  if (creditLimit < 1) {
    message.error("該學期學分上限不能小於1");
    return false;
  }

  if (courseIds.length < 1) {
    message.error("可選課程最少需要1門");
    return false;
  }

  return true;
}

onMounted(async () => {
  resetForm();

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
      <div class="u-flex u-justify-between u-items-center">
        <h1 class="u-text-24px u-font-bold u-m0 u-c-blue">限時選課設定</h1>
        <a-button type="primary" size="large" @click="handleAddEnrollment">
          <span class="u-text-lg u-font-semibold"> 新增選課設定 </span>
        </a-button>
      </div>

      <Divider class="u-my16px" />

      <template v-if="isEnrollmentStatusSectionDisplayed">
        <!-- 現有選課狀態表格 -->

        <Table
          :columns="columns"
          :data-source="enrollmentStatusData"
          :pagination="false"
          :row-key="(record) => record.enrollment_id"
          size="large"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'timeRange'">
              <div class="u-mb8px u-text-nowrap">
                <span class="u-mr8px">從</span
                ><a-tag color="blue" class="u-text-18px">{{
                  dayjs(record.start_time).format("YYYY-MM-DD HH:mm")
                }}</a-tag>
              </div>

              <div class="u-text-nowrap">
                <span class="u-mr8px">到</span
                ><a-tag color="blue" class="u-text-18px">{{
                  dayjs(record.end_time).format("YYYY-MM-DD HH:mm")
                }}</a-tag>
              </div>
            </template>

            <template v-if="column.key === 'action'">
              <a-popconfirm
                title="所有相關的選課資料將會被刪除，確定要刪除此選課設定嗎？"
                ok-text="確定"
                cancel-text="取消"
                @confirm="handleDelete(record.enrollment_id)"
                placement="topLeft"
              >
                <a-button type="link" danger size="large">刪除</a-button>
              </a-popconfirm>

              <a-button type="link" size="large" @click="handleEdit(record)">
                編輯
              </a-button>
            </template>
          </template>
        </Table>
      </template>

      <a-empty v-else>
        <template #description>
          <span class="u-c-secondary u-text-lg">暫無選課設定, 請先</span>
          <a-button
            size="small"
            type="link"
            class="u-p0! u-text-lg"
            @click="handleAddEnrollment"
          >
            <span class="u-text-lg"> 新增選課設定 </span>
          </a-button>
        </template>
      </a-empty>
    </div>
  </div>

  <a-modal
    v-model:open="isModalOpen"
    @ok="handleModalOk"
    @cancel="handleModalCancel"
  >
    <h2 class="u-text-18px u-font-semibold u-mb16px u-c-blue">
      {{ modalOperation === "add" ? "新增選課設定" : "編輯選課設定" }}
    </h2>
    <a-form :model="formState" name="timed-course-settings" layout="vertical">
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
              size="large"
            >
              <!-- Optional: Customize tag rendering -->
              <template #tagRender="{ value, closable, onClose, label }">
                <a-tag
                  :closable="closable"
                  @close="onClose"
                  class="u-mr3px u-text-lg"
                >
                  {{ label }}
                </a-tag>
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
              size="large"
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
              size="large"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <template #footer>
      <a-button size="large" @click="handleModalCancel">取消</a-button>
      <a-button type="primary" size="large" @click="handleModalOk">
        確認
      </a-button>
    </template>
  </a-modal>
</template>

<script>
// 表格欄位定義
const columns = [
  // {
  //   title: "選課設定編號",
  //   key: "enrollment_id",
  //   dataIndex: "enrollment_id",
  // },
  {
    title: "選課開始/結束時間",
    key: "timeRange",
    dataIndex: "timeRange",
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
    title: "該學期學分上限",
    key: "creditLimit",
    dataIndex: "creditLimit",
    customRender: ({ text, record, index, column }) => {
      return `${record.credit_limit} 學分`;
    },
  },
  {
    title: "操作",
    key: "action",
    dataIndex: "action",
    width: 50,
    align: "center",
  },
];
</script>

<style scoped></style>
