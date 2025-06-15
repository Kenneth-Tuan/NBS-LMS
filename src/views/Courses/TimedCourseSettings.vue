<script setup>
import { reactive, onMounted, ref } from "vue";
import dayjs from "dayjs";
import { Divider } from "ant-design-vue";

import { dummyCourseData } from "@/data/dummy";
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

const onFinish = (values) => {
  console.log("Success:", values, formState);
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

onMounted(async () => {
  const courses = await courseService.fetchCoursesForEnrollment();

  selectableCourses.value = courses.map((course) => ({
    label: course.name,
    value: course.course_id,
  }));
});
</script>

<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-16px u-p24px u-shadow">
      <h1 class="u-text-24px u-font-bold u-mb16px u-c-blue">限時選課設定</h1>

      <Divider class="u-my8px" />

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
