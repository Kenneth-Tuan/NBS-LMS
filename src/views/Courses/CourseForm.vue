<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-lg u-p-6 u-shadow-md">
      <h1 class="u-text-2xl u-font-bold u-mb-6 u-c-blue">
        {{ isEdit ? "編輯課程" : "新增課程" }}
      </h1>

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
              <a-form-item
                :validate-status="
                  courseStore.courseForm.title.err ? 'error' : ''
                "
                :help="courseStore.courseForm.title.errMsg"
                :label="courseStore.courseForm.title.label"
              >
                <a-input
                  v-model:value="courseStore.courseForm.title.value"
                  placeholder="請輸入課程名稱"
                />
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <!-- <a-form-item
                :validate-status="
                  courseStore.courseForm.type.err ? 'error' : ''
                "
                :help="courseStore.courseForm.type.errMsg"
                :label="courseStore.courseForm.type.label"
              >
                <a-select
                  v-model:value="courseStore.courseForm.type.value"
                  placeholder="請選擇課程類型"
                >
                  <a-select-option
                    v-for="option in courseStore.courseForm.type.options"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </a-select-option>
                </a-select>
              </a-form-item> -->

              <a-form-item
                :validate-status="
                  courseStore.courseForm.tags.err ? 'error' : ''
                "
                :help="courseStore.courseForm.tags.errMsg"
                :label="courseStore.courseForm.tags.label"
              >
                <a-select
                  v-model:value="courseStore.courseForm.tags.value"
                  mode="multiple"
                  placeholder="請選擇課程標籤"
                >
                  <a-select-option
                    v-for="option in courseStore.courseForm.tags.options"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item
                :validate-status="
                  courseStore.courseForm.duration.err ? 'error' : ''
                "
                :help="courseStore.courseForm.duration.errMsg"
                :label="courseStore.courseForm.duration.label"
              >
                <a-input
                  v-model:value="courseStore.courseForm.duration.value"
                  placeholder="請輸入課程時長（例如：600 分鐘）"
                />
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item
                :validate-status="
                  courseStore.courseForm.instructor.err ? 'error' : ''
                "
                :help="courseStore.courseForm.instructor.errMsg"
                :label="courseStore.courseForm.instructor.label"
              >
                <a-input
                  v-model:value="courseStore.courseForm.instructor.value"
                  placeholder="請輸入授課教師姓名"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item
                :validate-status="
                  courseStore.courseForm.startDate.err ? 'error' : ''
                "
                :help="courseStore.courseForm.startDate.errMsg"
                :label="courseStore.courseForm.startDate.label"
              >
                <a-date-picker
                  v-model:value="startDate"
                  style="width: 100%"
                  :format="dateFormat"
                  @change="handleDateChange"
                />
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item
                :validate-status="
                  courseStore.courseForm.classType.err ? 'error' : ''
                "
                :help="courseStore.courseForm.classType.errMsg"
                :label="courseStore.courseForm.classType.label"
              >
                <a-select
                  v-model:value="courseStore.courseForm.classType.value"
                  placeholder="請選擇上課方式"
                >
                  <a-select-option
                    v-for="option in courseStore.courseForm.classType.options"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item
            :validate-status="courseStore.courseForm.image.err ? 'error' : ''"
            :help="courseStore.courseForm.image.errMsg"
            :label="courseStore.courseForm.image.label"
          >
            <!-- <a-input
              v-model:value="courseStore.courseForm.image.value"
              placeholder="請輸入課程封面圖片URL"
            /> -->

            <a-upload-dragger
              v-model:value="courseStore.courseForm.image.value"
              name="files"
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              list-type="picture"
            >
              <p class="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p class="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p class="ant-upload-hint">
                Support for a single or bulk upload.
              </p>
            </a-upload-dragger>
          </a-form-item>
        </div>

        <!-- 課程內容 -->
        <div class="u-mb-6">
          <h2 class="u-text-lg u-font-semibold u-mb-4">課程內容</h2>

          <a-form-item
            :validate-status="
              courseStore.courseForm.description.err ? 'error' : ''
            "
            :help="courseStore.courseForm.description.errMsg"
            :label="courseStore.courseForm.description.label"
          >
            <a-textarea
              v-model:value="courseStore.courseForm.description.value"
              :rows="4"
              placeholder="請輸入課程簡介"
            />
          </a-form-item>

          <a-form-item
            :validate-status="courseStore.courseForm.outline.err ? 'error' : ''"
            :help="courseStore.courseForm.outline.errMsg"
            :label="courseStore.courseForm.outline.label"
          >
            <WYSIWYG v-model:content="courseStore.courseForm.outline.value" />
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

<script setup>
import { ref, computed } from "vue";
import { useCourseStore } from "@/stores/course";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { useRouter } from "vue-router";

import WYSIWYG from "@/components/WYSIWYG.vue";

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false,
  },
  courseId: {
    type: [String, Number],
    default: null,
  },
});

const courseStore = useCourseStore();
const router = useRouter();
const loading = ref(false);
const dateFormat = "YYYY.MM.DD";

// 日期選擇器的值
const startDate = computed({
  get: () => {
    return courseStore.courseForm.startDate.value
      ? dayjs(courseStore.courseForm.startDate.value, dateFormat)
      : null;
  },
  set: (value) => {
    courseStore.courseForm.startDate.value = value
      ? value.format(dateFormat)
      : "";
  },
});

// 處理日期變更
const handleDateChange = (date, dateString) => {
  courseStore.courseForm.startDate.value = dateString;
};

// 提交表單
const handleSubmit = async () => {
  try {
    loading.value = true;
    await courseStore.submitForm();
    message.success(props.isEdit ? "課程更新成功" : "課程創建成功");
    router.push("/courses");
  } catch (error) {
    message.error(error.message || "提交失敗，請重試");
  } finally {
    loading.value = false;
  }
};

// 取消
const handleCancel = () => {
  courseStore.resetForm();
  router.push("/courses");
};
</script>
