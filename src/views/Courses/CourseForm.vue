<script setup>
import { ref, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { useRouter } from "vue-router";
import { InboxOutlined } from "@ant-design/icons-vue";
import { InputGroup as AInputGroup, Divider } from "ant-design-vue";

import { useCourseStore } from "@/stores/course";
import { dummyCourseData } from "@/data/dummy"; // Import dummy data for lookup
import { RouterName } from "../../enums/appEnums";
import { courseSchema } from "@/schemas/course.schema";

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false,
  },
  courseId: {
    type: Number,
    default: null,
  },
});

const courseStore = useCourseStore();
const router = useRouter();
const loading = ref(false);

// 上傳課程大綱前檢查
const beforeOutlineUpload = (file) => {
  const isPDF = file.type === "application/pdf";
  const isExcel =
    file.type === "application/vnd.ms-excel" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  if (!isPDF && !isExcel) {
    message.error("只能上傳 PDF 或 Excel 檔案！");
    return false;
  }

  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    message.error("檔案必須小於 10MB！");
    return false;
  }

  return true;
};

// 提交表單
const handleSubmit = async () => {
  try {
    loading.value = true;
    await courseStore.submitForm();
    message.success(props.isEdit ? "課程更新成功" : "課程創建成功");
    router.push({ name: RouterName.CourseOverview });
  } catch (error) {
    message.error(error.message || "提交失敗，請重試");
  } finally {
    loading.value = false;
  }
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

// Fetch and populate data on mount if editing
onMounted(() => {
  if (props.isEdit && props.courseId) {
    console.log("Edit mode detected, course ID:", props.courseId);
    // Find the course data (using dummy data for now)
    const courseToEdit = dummyCourseData.find(
      (c) => c.id === Number(props.courseId)
    );
    if (courseToEdit) {
      courseStore.populateForm(courseToEdit); // Call the store action
    } else {
      message.error(`找不到 ID 為 ${props.courseId} 的課程資料`);
      // Optionally redirect back or handle error
      router.push("/course-overview");
    }
  } else {
    // If in create mode, ensure form is reset
    courseStore.resetForm();
  }
});
</script>

<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-lg u-p-6 u-shadow-md">
      <h1 class="u-text-2xl u-font-bold u-mb-6 u-c-blue">
        {{ isEdit ? "編輯課程" : "新增課程" }}
      </h1>

      <Divider class="u-my8px" />

      <a-form
        :model="courseStore.courseForm"
        layout="vertical"
        @finish="handleSubmit"
      >
        <!-- 基本信息 -->
        <div class="u-mb-6">
          <h2 class="u-text-lg u-font-semibold u-mb-4">基本信息</h2>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item v-bind="courseSchema.title" name="title">
                <a-input
                  v-model:value="courseStore.courseForm.title"
                  placeholder="請輸入課程名稱"
                />
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item v-bind="courseSchema.classMode" name="classMode">
                <a-input
                  v-model:value="courseStore.courseForm.classMode"
                  placeholder="請輸入上課方式"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item v-bind="courseSchema.credit" name="credit">
                <a-input-number
                  v-model:value="courseStore.courseForm.credit"
                  placeholder="1-10學分"
                  :min="1"
                  :max="999"
                  class="u-w-full"
                />
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item v-bind="courseSchema.instructor" name="instructor">
                <a-input
                  v-model:value="courseStore.courseForm.instructor"
                  placeholder="請輸入授課教師姓名"
                />
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
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item v-bind="courseSchema.endDate" name="endDate">
                <a-date-picker
                  v-model:value="courseStore.courseForm.endDate"
                  :format="courseSchema.endDate.mask"
                  class="u-w-full"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item v-bind="courseSchema.weekday" name="weekday">
                <a-select
                  v-model:value="courseStore.courseForm.weekday"
                  placeholder="請選擇上課日"
                >
                  <a-select-option
                    v-for="option in courseSchema.weekday.options"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item v-bind="courseSchema.classTime" name="classTime">
                <a-time-range-picker
                  v-model:value="courseStore.courseForm.classTime"
                  format="HH:mm"
                  value-format="HH:mm"
                  :placeholder="['開始時間', '結束時間']"
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
                  placeholder="1-999人"
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
                  placeholder="選擇先修課程 (可多選)"
                  :options="courseSchema.prerequisites.options"
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
              placeholder="請輸入課程簡介"
            />
          </a-form-item>

          <a-form-item v-bind="courseSchema.outlineFile" name="outlineFile">
            <a-upload-dragger
              v-model:file-list="courseStore.courseForm.outlineFile"
              name="file"
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              :before-upload="beforeOutlineUpload"
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
