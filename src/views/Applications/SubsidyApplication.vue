
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { UploadOutlined } from "@ant-design/icons-vue";

import { useApplicationStore } from "@/stores/application";
import ApplicantInfo from "@/components/ApplicantInfo.vue";
import { subsidyApplicationSchema } from "@/schemas/subsidyApplication.schema";
import { useFileUpload } from "@/composables/useFileUpload";
import { useFileDownload } from "@/composables/useFileDownload";
import { RouterName } from "@/enums/appEnums";

const router = useRouter();

const applicationStore = useApplicationStore();
const { subsidyApplicationForm, resetSubsidyForm, submitSubsidyForm } =
  applicationStore;

// 表單 Ref
const subsidyFormRef = ref(null);

// 上傳/下載 composables
const { uploading, beforeUpload, processFileList } = useFileUpload({ maxSizeMB: 50 });
const { downloadAndOpen } = useFileDownload();

const handlePreview = async (file) => {
  await downloadAndOpen(file);
};

const customRequest = async () => {
  await processFileList(subsidyApplicationForm.attachments);
};

// 狀態變量
const submitting = ref(false);
const successVisible = ref(false);

// 提交表單
const handleSubmit = async () => {
  try {
    submitting.value = true;
    await submitSubsidyForm();
    successVisible.value = true;
  } catch (error) {
    message.error(error.message || "表單提交失敗，請檢查填寫內容");
  } finally {
    submitting.value = false;
  }
};

// 重置表單
const handleReset = () => {
  resetSubsidyForm();
  subsidyFormRef.value?.clearValidate?.();
};

// 成功提示框確認
const handleSuccessOk = () => {
  successVisible.value = false;
  handleReset();
  router.push({ name: RouterName.ApplicationRecord });
};
</script>

<template>
  <div class="u-p-1rem u-w-full">
    <div class="u-bg-white u-rounded-0.5rem u-p-1.5rem u-shadow-md">
      <h1 class="u-text-1.5rem u-fw600 u-mb-1.5rem u-c-blue">補助申請</h1>

      <a-form
        ref="subsidyFormRef"
        layout="vertical"
        :model="subsidyApplicationForm"
        @finish="handleSubmit"
      >
        <ApplicantInfo />

        <a-divider orientation="left">補助資訊</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item v-bind="subsidyApplicationSchema.subsidy_type" name="subsidy_type">
              <a-select
                v-model:value="subsidyApplicationForm.subsidy_type"
                :placeholder="subsidyApplicationSchema.subsidy_type.placeholder || '請選擇補助類型'"
                :options="subsidyApplicationSchema.subsidy_type.options"
                class="u-w-full"
                allow-clear
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item v-bind="subsidyApplicationSchema.attachments" name="attachments">
              <a-upload
                list-type="picture"
                v-model:file-list="subsidyApplicationForm.attachments"
                :before-upload="beforeUpload"
                :custom-request="async () => { await processFileList(subsidyApplicationForm.attachments) }"
                :disabled="uploading"
              >
                <a-button>
                  <upload-outlined />
                  上傳相關附件
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
      <a-modal v-model:open="successVisible" title="申請提交成功" @ok="handleSuccessOk">
        <p>您的補助申請已成功提交</p>
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
