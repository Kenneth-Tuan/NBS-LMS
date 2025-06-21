<script setup>
import { ref, onMounted, onBeforeMount, h, computed } from "vue";
import { message } from "ant-design-vue";

import { useRouter, useRoute } from "vue-router";
import { Divider } from "ant-design-vue";
import {
  InboxOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons-vue";

import { useCourseStore } from "@/stores/course";
import { courseSchema } from "@/schemas/course.schema";
import { courseService } from "@/services/course.service";
import { RouterName } from "@/enums/appEnums";

const route = useRoute();
const isEdit = computed(() => {
  return route.name === RouterName.UpdateCourse;
});

const courseId = computed(() => {
  return route.params.id;
});

const courseStore = useCourseStore();
const router = useRouter();
const loading = ref(false);
const formRef = ref(null);

// 上傳課程大綱前檢查
const beforeOutlineUpload = (file) => {
  console.log("beforeOutlineUpload called with file:", file);
  // Check file type
  const isPDF = file.type === "application/pdf";
  const isExcel =
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel";

  if (!isPDF && !isExcel) {
    message.error("僅支援 PDF 或 Excel 檔案!");
    return false;
  }

  // Check file size
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    message.error("檔案大小不能超過 10MB!");
    return false;
  }

  console.log("File validation passed, returning true");
  return true;
};

// 取消
const handleCancel = () => {
  courseStore.resetForm();
  router.go(-1);
};

// Add filterOption function for prerequisite select
const filterOption = (input, option) => {
  // Check if option.label exists and is a string before calling toLowerCase
  return (
    option.label &&
    typeof option.label === "string" &&
    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
  );
};

const handleFileChange = () => {
  courseStore.courseForm.outlineFile = courseStore.courseForm.outlineFile.map(
    (file) => ({ ...file, status: "done" })
  );
};

onBeforeMount(() => {
  courseService.getTeachers();
  courseService.getPrerequisites();
});

// Fetch and populate data on mount if editing
onMounted(async () => {
  if (isEdit.value && courseId.value) {
    const courseData = await courseStore.getCourseHandler(courseId.value);
  }
});
</script>

<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-16px u-p24px u-shadow">
      <div class="u-flex u-justify-between u-items-center u-mb16px">
        <h1 class="u-text-24px u-font-bold u-mb0 u-c-blue">
          {{ isEdit ? "編輯課程" : "新增課程" }}
        </h1>

        <a-button size="small" @click="courseStore.resetForm">重置</a-button>
      </div>

      <Divider class="u-my8px" />

      <a-form
        ref="formRef"
        :model="courseStore.courseForm"
        layout="vertical"
        @finish="courseStore.createCourse"
      >
        <!-- 基本信息 -->
        <div class="u-mb-6">
          <h2 class="u-text-lg u-font-semibold u-mb-4">基本信息</h2>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item v-bind="courseSchema.title" name="title">
                <a-input
                  v-model:value="courseStore.courseForm.title"
                  :placeholder="courseSchema.title.placeholder"
                />
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item v-bind="courseSchema.classMode" name="classMode">
                <a-input
                  v-model:value="courseStore.courseForm.classMode"
                  :placeholder="courseSchema.classMode.placeholder"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item v-bind="courseSchema.instructor" name="instructor">
                <a-select
                  v-model:value="courseStore.courseForm.instructor"
                  :placeholder="courseSchema.instructor.placeholder"
                  :options="courseStore.courseInfos.teachers"
                  allow-clear
                  class="u-w-full"
                  :filter-option="filterOption"
                  show-search
                >
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :span="6">
              <a-form-item v-bind="courseSchema.credit" name="credit">
                <a-input-number
                  v-model:value="courseStore.courseForm.credit"
                  :placeholder="courseSchema.credit.placeholder"
                  :min="1"
                  :max="999"
                  class="u-w-full"
                />
              </a-form-item>
            </a-col>

            <a-col :span="6">
              <a-form-item v-bind="courseSchema.duration" name="duration">
                <a-input-number
                  v-model:value="courseStore.courseForm.duration"
                  :placeholder="courseSchema.duration.placeholder"
                  :min="1"
                  :max="999"
                  class="u-w-full"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item
                v-bind="courseSchema.enrollmentLimit"
                name="enrollmentLimit"
              >
                <a-input-number
                  v-model:value="courseStore.courseForm.enrollmentLimit"
                  :placeholder="courseSchema.enrollmentLimit.placeholder"
                  :min="1"
                  :max="999"
                  class="u-w-full"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                v-bind="courseSchema.prerequisites"
                name="prerequisites"
              >
                <a-select
                  v-model:value="courseStore.courseForm.prerequisites"
                  mode="multiple"
                  :placeholder="courseSchema.prerequisites.placeholder"
                  :options="courseStore.courseInfos.prerequisites"
                  allow-clear
                  class="u-w-full"
                  :filter-option="filterOption"
                >
                  <!-- Optional: Customize tag rendering -->
                  <template #tagRender="{ label, closable, onClose }">
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
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item v-bind="courseSchema.startDate" name="startDate">
                <a-date-picker
                  v-model:value="courseStore.courseForm.startDate"
                  :format="courseSchema.startDate.mask"
                  class="u-w-full"
                  :placeholder="courseSchema.startDate.placeholder"
                  :value-format="courseSchema.startDate.mask"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item v-bind="courseSchema.endDate" name="endDate">
                <a-date-picker
                  v-model:value="courseStore.courseForm.endDate"
                  :format="courseSchema.endDate.mask"
                  class="u-w-full"
                  :placeholder="courseSchema.endDate.placeholder"
                  :value-format="courseSchema.endDate.mask"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <template
              v-for="(schedule, index) in courseStore.courseForm.weeklySchedule"
              :key="schedule.id"
              class="u-flex u-mb8px u-h40px"
              align="baseline"
            >
              <a-col :span="12">
                <a-form-item
                  v-bind="courseSchema.week_day"
                  :name="['weeklySchedule', index, 'week_day']"
                  :label="`第${index + 1}個${courseSchema.week_day.label}`"
                >
                  <a-select
                    v-model:value="schedule.week_day"
                    :placeholder="courseSchema.week_day.placeholder"
                    :options="courseStore.courseInfos.weekDays"
                  >
                  </a-select>
                </a-form-item>
              </a-col>

              <a-col :span="6">
                <a-form-item
                  :name="['weeklySchedule', index, 'start_time']"
                  v-bind="courseSchema.start_time"
                >
                  <a-time-picker
                    v-model:value="schedule.start_time"
                    format="HH:mm"
                    value-format="HH:mm"
                    class="u-w-full"
                  />
                </a-form-item>
              </a-col>

              <a-col :span="5">
                <a-form-item
                  :name="['weeklySchedule', index, 'end_time']"
                  v-bind="courseSchema.end_time"
                >
                  <a-time-picker
                    v-model:value="schedule.end_time"
                    format="HH:mm"
                    value-format="HH:mm"
                    class="u-w-full"
                  />
                </a-form-item>
              </a-col>

              <a-col :span="1">
                <a-form-item label=" ">
                  <div class="u-flex u-items-center u-justify-center">
                    <a-tooltip title="刪除">
                      <a-button
                        type="dashed"
                        shape="circle"
                        :icon="h(MinusOutlined)"
                        :disabled="
                          courseStore.courseForm.weeklySchedule.length === 1
                        "
                        @click="courseStore.removeWeeklySchedule(index)"
                      />
                    </a-tooltip>
                  </div>
                </a-form-item>
              </a-col>
            </template>
          </a-row>

          <a-row>
            <a-col :span="12">
              <div class="u-flex u-items-center u-justify-start">
                <a-button
                  type="dashed"
                  :icon="h(PlusOutlined)"
                  :disabled="courseStore.courseForm.weeklySchedule.length >= 7"
                  @click="courseStore.addWeeklySchedule"
                >
                  <span> 新增上課日 </span>
                </a-button>
              </div>
            </a-col>
          </a-row>
          <!-- END NEW -->

          <!-- <a-form-item
            :validate-status="courseStore.courseForm.image.err ? 'error' : ''"
            :help="courseStore.courseForm.image.errMsg"
            :label="courseStore.courseForm.image.label"
          >
            <a-upload-dragger
              v-model:value="courseStore.courseForm.image.value"
              name="files"
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              list-type="picture"
            >
              <p class="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p class="ant-upload-text">點擊或拖曳圖片至此上傳（選填）</p>
              <p class="ant-upload-hint">支援 JPG、PNG 等常見圖片格式</p>
            </a-upload-dragger>
          </a-form-item> -->
        </div>

        <!-- 課程內容 -->
        <div class="u-mb-6">
          <h2 class="u-text-lg u-font-semibold u-mb-4">課程內容</h2>

          <a-form-item v-bind="courseSchema.description" name="description">
            <a-textarea
              v-model:value="courseStore.courseForm.description"
              :rows="4"
              :placeholder="courseSchema.description.placeholder"
            />
          </a-form-item>

          <a-form-item v-bind="courseSchema.outlineFile" name="outlineFile">
            <a-upload-dragger
              v-model:file-list="courseStore.courseForm.outlineFile"
              @change="handleFileChange"
              :custom-request="() => {}"
              :before-upload="beforeOutlineUpload"
              :placeholder="courseSchema.outlineFile.placeholder"
            >
              <p class="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p class="ant-upload-text">點擊或拖曳檔案至此上傳課程大綱</p>
              <p class="ant-upload-hint">
                僅支援 PDF 或 Excel 檔案，單個檔案大小不超過 10MB
              </p>
            </a-upload-dragger>
          </a-form-item>
        </div>

        <!-- 提交按鈕 -->
        <div class="u-flex u-justify-end u-gap-4">
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" html-type="submit" :loading="loading">
            {{ isEdit ? "更新課程" : "創建課程" }}
          </a-button>
        </div>
      </a-form>
    </div>
  </div>
</template>
