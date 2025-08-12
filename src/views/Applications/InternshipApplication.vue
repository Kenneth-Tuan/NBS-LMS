<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-lg u-p-6 u-shadow-md">
      <h1 class="u-text-2xl u-font-bold u-mb-6 u-c-blue">實習申請</h1>

      <a-form layout="vertical" :model="applicationForm">
        <ApplicantInfo />

        <a-divider orientation="left">實習機構資訊</a-divider>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item
              label="實習機構名稱"
              :validateStatus="
                formField('internshipProviderName').err ? 'error' : ''
              "
              :help="formField('internshipProviderName').errMsg"
            >
              <a-input
                v-model:value="formField('internshipProviderName').value"
                placeholder="請輸入實習機構名稱"
              />
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item
              label="實習機構地址"
              :validateStatus="
                formField('internshipProviderAddress').err ? 'error' : ''
              "
              :help="formField('internshipProviderAddress').errMsg"
            >
              <a-input
                v-model:value="formField('internshipProviderAddress').value"
                placeholder="請輸入實習機構地址"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="實習機構聯絡人"
              :validateStatus="
                formField('internshipProviderContactPerson').err ? 'error' : ''
              "
              :help="formField('internshipProviderContactPerson').errMsg"
            >
              <a-input
                v-model:value="
                  formField('internshipProviderContactPerson').value
                "
                placeholder="請輸入實習機構聯絡人"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="實習機構聯絡人電話"
              :validateStatus="
                formField('internshipProviderContactPersonTel').err
                  ? 'error'
                  : ''
              "
              :help="formField('internshipProviderContactPersonTel').errMsg"
            >
              <a-input
                v-model:value="
                  formField('internshipProviderContactPersonTel').value
                "
                placeholder="請輸入實習機構聯絡人電話"
                v-mask="
                  formField('internshipProviderContactPersonTel').mask ||
                  '####-###-###'
                "
              />
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item
              label="實習機構聯絡人Email"
              :validateStatus="
                formField('internshipProviderContactPersonEmail').err
                  ? 'error'
                  : ''
              "
              :help="formField('internshipProviderContactPersonEmail').errMsg"
            >
              <a-input
                v-model:value="
                  formField('internshipProviderContactPersonEmail').value
                "
                placeholder="請輸入實習機構聯絡人Email"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">實習期間</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              label="實習開始日期"
              :validateStatus="
                formField('internshipStartDate').err ? 'error' : ''
              "
              :help="formField('internshipStartDate').errMsg"
            >
              <a-input
                v-model:value="formField('internshipStartDate').value"
                placeholder="YYYY/MM/DD"
                v-mask="formField('internshipStartDate').mask"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="實習結束日期"
              :validateStatus="
                formField('internshipEndDate').err ? 'error' : ''
              "
              :help="formField('internshipEndDate').errMsg"
            >
              <a-input
                v-model:value="formField('internshipEndDate').value"
                placeholder="YYYY/MM/DD"
                v-mask="formField('internshipEndDate').mask"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="實習時數"
              :validateStatus="formField('internshipHours').err ? 'error' : ''"
              :help="formField('internshipHours').errMsg"
            >
              <a-input
                v-model:value="formField('internshipHours').value"
                placeholder="請輸入實習時數"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item
          label="實習概述"
          :validateStatus="formField('internshipOverview').err ? 'error' : ''"
          :help="formField('internshipOverview').errMsg"
        >
          <a-textarea
            v-model:value="formField('internshipOverview').value"
            placeholder="請簡述實習內容"
            :rows="4"
          />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSubmit" :loading="submitting"
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
        <p>您的實習申請已成功提交，申請編號：{{ submittedId }}</p>
        <p>目前狀態：待審核</p>
      </a-modal>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useApplicationStore } from "@/stores/application";
import { message } from "ant-design-vue";
import ApplicantInfo from "@/components/ApplicantInfo.vue";

const applicationStore = useApplicationStore();
const { applicationForm, intershipApplicationForm, resetForm, submitForm } =
  applicationStore;

// 輔助函數來獲取表單欄位
const formField = (fieldName) => {
  return applicationForm[fieldName];
};

// 狀態變量
const submitting = ref(false);
const successVisible = ref(false);
const submittedId = ref("");

// 提交表單
const handleSubmit = async () => {
  try {
    submitting.value = true;

    // 調用 store 中的提交函數
    const result = await submitForm("internship");

    // 提交成功處理
    submittedId.value = result.id;
    successVisible.value = true;
  } catch (error) {
    // 提交失敗處理
    message.error(error.message || "表單提交失敗，請檢查填寫內容");
  } finally {
    submitting.value = false;
  }
};

// 重置表單
const handleReset = () => {
  resetForm();
};

// 成功提示框確認
const handleSuccessOk = () => {
  successVisible.value = false;
};
</script>

<style scoped>
.u-p-4 {
  padding: 1rem;
}
.u-w-full {
  width: 100%;
}
.u-bg-white {
  background-color: white;
}
.u-rounded-lg {
  border-radius: 0.5rem;
}
.u-p-6 {
  padding: 1.5rem;
}
.u-shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.u-text-2xl {
  font-size: 1.5rem;
}
.u-font-bold {
  font-weight: bold;
}
.u-mb-6 {
  margin-bottom: 1.5rem;
}
</style>
