<script setup>
import { ref, onMounted } from "vue";
import { UploadOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";

import { useApplicationStore } from "@/stores/application";
import ApplicantInfo from "@/components/ApplicantInfo.vue";
import { leaveApplicationSchema } from "@/schemas/leaveApplication.schema";
import applicationApi from "@/apis/application";
import { useFileUpload } from "@/composables/useFileUpload";
import { useFileDownload } from "@/composables/useFileDownload";
import { RouterName } from "@/enums/appEnums";

const router = useRouter();

const applicationStore = useApplicationStore();
const { leaveApplicationForm, resetLeaveForm, submitLeaveForm } =
  applicationStore;

const { uploading, processFileList } = useFileUpload();
const { downloading, downloadAndOpen } = useFileDownload();

// 表單 Ref
const leaveFormRef = ref(null);

// file upload handled by useFileUpload composable
const handlePreview = async (file) => {
  await downloadAndOpen(file);
};

const customRequest = async () =>
  await processFileList(leaveApplicationForm.attachments);

// 狀態變量
const submitting = ref(false);
const successVisible = ref(false);

// 提交表單（a-form finish 事件觸發）
const handleSubmit = async () => {
  try {
    submitting.value = true;
    await submitLeaveForm();
    successVisible.value = true;
  } catch (error) {
    message.error(error.message || "表單提交失敗，請檢查填寫內容");
  } finally {
    submitting.value = false;
  }
};

// 失敗回傳
const handleFinishFailed = (errorInfo) => {
  console.log("leave form failed:", errorInfo);
};

// 重置表單
const handleReset = () => {
  resetLeaveForm();
  leaveFormRef.value.clearValidate();
};

// 成功提示框確認
const handleSuccessOk = () => {
  successVisible.value = false;
  handleReset();
  router.push({ name: RouterName.ApplicationRecord });
};

// 下拉搜尋（選填）
const filterOption = (input, option) => {
  return (
    option.label &&
    typeof option.label === "string" &&
    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
  );
};

const courseOptions = ref([]);

const fetchCoursesListForLeave = async () => {
  try {
    const {
      data: {
        data: { courses },
      },
    } = await applicationApi.getCoursesListForLeave();
    courseOptions.value = courses.map((course) => ({
      label: course.name,
      value: course.id,
    }));
  } catch (error) {
    console.error("Error fetching courses list:", error);
  }
};

onMounted(async () => {
  await fetchCoursesListForLeave();
});
</script>

<template>
  <div class="u-p-1rem u-w-full">
    <div class="u-bg-white u-rounded-0.5rem u-p-1.5rem u-shadow-md">
      <h1 class="u-text-1.5rem u-fw600 u-mb-1.5rem u-c-blue">請假申請</h1>

      <a-form
        ref="leaveFormRef"
        layout="vertical"
        :model="leaveApplicationForm"
        @finish="handleSubmit"
        @finishFailed="handleFinishFailed"
      >
        <ApplicantInfo />

        <a-divider orientation="left">請假資訊</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              v-bind="leaveApplicationSchema.course_id"
              name="course_id"
            >
              <a-select
                v-model:value="leaveApplicationForm.course_id"
                :options="courseOptions"
                :placeholder="leaveApplicationSchema.course_id.placeholder"
                allow-clear
                class="u-w-full"
                :filter-option="filterOption"
                show-search
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              v-bind="leaveApplicationSchema.leave_type"
              name="leave_type"
            >
              <a-select
                v-model:value="leaveApplicationForm.leave_type"
                :options="leaveApplicationSchema.leave_type.options"
                :placeholder="leaveApplicationSchema.leave_type.placeholder"
                allow-clear
                class="u-w-full"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              v-bind="leaveApplicationSchema.leave_date_range"
              name="leave_date_range"
            >
              <a-range-picker
                v-model:value="leaveApplicationForm.leave_date_range"
                :format="leaveApplicationSchema.leave_date_range.format"
                :value-format="
                  leaveApplicationSchema.leave_date_range.valueFormat
                "
                :placeholder="
                  leaveApplicationSchema.leave_date_range.placeholder
                "
                class="u-w-full"
              />
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item
              v-bind="leaveApplicationSchema.leave_reason"
              name="leave_reason"
            >
              <a-textarea
                v-model:value="leaveApplicationForm.leave_reason"
                :rows="4"
                :placeholder="leaveApplicationSchema.leave_reason.placeholder"
              />
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item
              v-bind="leaveApplicationSchema.attachments"
              name="attachments"
            >
              <a-upload
                list-type="picture"
                v-model:file-list="leaveApplicationForm.attachments"
                :customRequest="customRequest"
                :disabled="uploading"
              >
                <a-button>
                  <upload-outlined />
                  上傳檔案
                </a-button>
                <template #itemRender="{ file, actions }">
                  <span>
                    <a-button type="link" @click="() => handlePreview(file)">
                      {{ file.name }}
                    </a-button>
                  </span>
                  <span>
                    <a-button type="link" @click="() => actions.remove()">
                      删除
                    </a-button>
                  </span>
                </template>
              </a-upload>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" :loading="submitting"
              >提交申請</a-button
            >
            <a-button @click="handleReset">重置表單</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <!-- 成功提示 -->
      <a-modal
        v-model:open="successVisible"
        title="申請提交成功"
        @ok="handleSuccessOk"
      >
        <p>您的請假申請已成功提交</p>
        <p>目前狀態：待審核</p>
      </a-modal>
    </div>
  </div>
</template>

<style scoped>
.u-shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
