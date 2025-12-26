<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons-vue";

import ApplicantInfo from "@/components/ApplicantInfo.vue";
import { useApplicationStore } from "@/stores/application";
import { useFileUpload } from "@/composables/useFileUpload";
import { useFileDownload } from "@/composables/useFileDownload";
import { otherApplicationSchema } from "@/schemas/otherApplication.schema";
import { RouterName } from "@/enums/appEnums";

const router = useRouter();

const applicationStore = useApplicationStore();
const {
  otherApplicationItems,
  fetchOtherApplicationItems,
  resetOtherForm,
  submitOtherForm,
  otherApplicationForm,
} = applicationStore;

// 申請項目選項與選擇
const itemOptions = computed(() =>
  (otherApplicationItems || []).map((item) => ({
    label: item.name,
    value: item.id,
  }))
);
const selectedItem = computed(() =>
  (otherApplicationItems || []).find(
    (i) => i.id === otherApplicationForm.other_application_id
  )
);

// 上傳/下載相關
const { uploading, beforeUpload, processFileList } = useFileUpload();
const { downloadAndOpen } = useFileDownload();

const handlePreview = async (file) => {
  await downloadAndOpen(file);
};

const normalizeAttachments = (att) => {
  if (!att) return [];
  if (Array.isArray(att)) return att.filter(Boolean);
  return [att].filter(Boolean);
};

// 狀態變量
const submitting = ref(false);
const successVisible = ref(false);

// 提交表單
const handleSubmit = async () => {
  try {
    submitting.value = true;
    await submitOtherForm();
    successVisible.value = true;
  } catch (error) {
    message.error(error.message || "表單提交失敗，請檢查填寫內容");
  } finally {
    submitting.value = false;
  }
};

// 重置表單
const otherFormRef = ref(null);
const handleReset = () => {
  resetOtherForm();
  otherFormRef.value?.clearValidate?.();
};

// 成功提示框確認
const handleSuccessOk = () => {
  successVisible.value = false;
  handleReset();
  router.push({ name: RouterName.ApplicationRecord });
};

const downloadAttachment = async (attachment) => {
  await downloadAndOpen(attachment);
};

onMounted(async () => {
  await fetchOtherApplicationItems();
});
</script>

<template>
  <div class="u-w-full u-bg-white u-rounded-0.5rem u-p-1.5rem u-shadow-md">
    <h1 class="u-text-1.5rem u-fw600 u-mb-1.5rem u-c-blue">其他申請</h1>

    <a-form
      ref="otherFormRef"
      layout="vertical"
      :model="otherApplicationForm"
      @finish="handleSubmit"
    >
      <ApplicantInfo />

      <a-divider orientation="left">申請項目</a-divider>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item
            v-bind="otherApplicationSchema.other_application_id"
            name="other_application_id"
          >
            <a-select
              v-model:value="otherApplicationForm.other_application_id"
              placeholder="請選擇申請項目"
              :options="itemOptions"
              style="width: 100%"
              allow-clear
            />
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item label="附件下載">
            <div v-if="selectedItem">
              <a-space direction="vertical" style="width: 100%">
                <a-empty
                  v-if="
                    normalizeAttachments(selectedItem.attachments).length === 0
                  "
                  description="無附件"
                />
                <a-button
                  v-for="(att, idx) in normalizeAttachments(
                    selectedItem.attachments
                  )"
                  :key="idx"
                  type="default"
                  @click="downloadAttachment(att)"
                >
                  <download-outlined /> 下載附件 {{ idx + 1 }}
                </a-button>
              </a-space>
            </div>
            <div v-else>
              <a-typography-text type="secondary"
                >請先選擇申請項目</a-typography-text
              >
            </div>
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item
            v-bind="otherApplicationSchema.attachments"
            name="attachments"
          >
            <a-upload
              list-type="picture"
              v-model:file-list="otherApplicationForm.attachments"
              :before-upload="beforeUpload"
              :custom-request="
                async () => {
                  await processFileList(otherApplicationForm.attachments);
                }
              "
              :disabled="uploading"
            >
              <a-button> <upload-outlined /> 上傳附件 </a-button>
              <template #itemRender="{ file, actions }">
                <span>
                  <a-button type="link" @click="() => handlePreview(file)">
                    {{ file.name }}
                  </a-button>
                </span>
                <span>
                  <a-button type="link" @click="() => actions.remove()"
                    >删除</a-button
                  >
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
  </div>

  <!-- 成功提示 -->
  <a-modal
    v-model:open="successVisible"
    title="申請提交成功"
    @ok="handleSuccessOk"
  >
    <p>您的其他申請已成功提交</p>
    <p>目前狀態：待審核</p>
  </a-modal>
</template>

<style scoped>
.u-shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
