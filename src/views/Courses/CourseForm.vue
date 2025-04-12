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
              <a-form-item
                :validate-status="
                  courseStore.courseForm.classMode.err ? 'error' : ''
                "
                :help="courseStore.courseForm.classMode.errMsg"
                :label="courseStore.courseForm.classMode.label"
              >
                <a-input
                  v-model:value="courseStore.courseForm.classMode.value"
                  placeholder="請輸入上課方式"
                />
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
                  courseStore.courseForm.weekday.err ? 'error' : ''
                "
                :help="courseStore.courseForm.weekday.errMsg"
                :label="courseStore.courseForm.weekday.label"
              >
                <a-select
                  v-model:value="courseStore.courseForm.weekday.value"
                  mode="multiple"
                  style="width: 100%"
                  placeholder="請選擇上課日"
                >
                  <a-select-option
                    v-for="option in courseStore.courseForm.weekday.options"
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
            <a-col :span="24">
              <a-form-item
                :validate-status="
                  courseStore.courseForm.classTime.err ? 'error' : ''
                "
                :help="courseStore.courseForm.classTime.errMsg"
                :label="courseStore.courseForm.classTime.label"
              >
                <a-time-range-picker
                  v-model:value="classTimeRange"
                  style="width: 100%"
                  format="HH:mm"
                  @change="handleTimeRangeChange"
                  :placeholder="['開始時間', '結束時間']"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item
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
            :validate-status="
              courseStore.courseForm.outlineFile.err ? 'error' : ''
            "
            :help="courseStore.courseForm.outlineFile.errMsg"
            :label="courseStore.courseForm.outlineFile.label"
          >
            <a-upload-dragger
              v-model:file-list="courseStore.courseForm.outlineFile.value"
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

<script setup>
import { ref, computed } from "vue";
import { useCourseStore } from "@/stores/course";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { useRouter } from "vue-router";
import { InboxOutlined } from "@ant-design/icons-vue";

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

// 時間範圍選擇器的值
const classTimeRange = computed({
  get: () => {
    if (!courseStore.courseForm.classTime.value) return null;

    // 如果時間範圍已經以 HH:mm-HH:mm 格式存儲
    const timeMatch = courseStore.courseForm.classTime.value.match(
      /(\d{2}:\d{2})-(\d{2}:\d{2})/
    );
    if (timeMatch) {
      const [_, startTime, endTime] = timeMatch;
      return [dayjs(`2000-01-01 ${startTime}`), dayjs(`2000-01-01 ${endTime}`)];
    }

    // 處理舊格式或單一時間值
    return null;
  },
  set: (value) => {
    courseStore.courseForm.classTime.value =
      value && value[0] && value[1]
        ? `${value[0].format("HH:mm")}-${value[1].format("HH:mm")}`
        : "";
  },
});

// 處理日期變更
const handleDateChange = (date, dateString) => {
  courseStore.courseForm.startDate.value = dateString;
};

// 處理時間範圍變更
const handleTimeRangeChange = (value) => {
  if (value && value[0] && value[1]) {
    courseStore.courseForm.classTime.value = `${value[0].format(
      "HH:mm"
    )}-${value[1].format("HH:mm")}`;
  } else {
    courseStore.courseForm.classTime.value = "";
  }
};

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
