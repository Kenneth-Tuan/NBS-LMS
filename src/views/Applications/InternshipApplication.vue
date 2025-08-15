<script setup>
import { ref } from "vue";
import { useApplicationStore } from "@/stores/application";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";

import ApplicantInfo from "@/components/ApplicantInfo.vue";
import { internshipApplicationSchema } from "@/schemas/internshipApplication.schema";
import { RouterName } from "@/enums/appEnums";

const router = useRouter();

const applicationStore = useApplicationStore();
const {
  internshipApplicationForm,
  resetInternshipForm,
  submitInternshipForm,
} = applicationStore;


// 狀態變量
const submitting = ref(false);
const successVisible = ref(false);
const internshipFormRef = ref(null);

// 提交表單
const handleSubmit = async () => {
  try {
    submitting.value = true;
    await submitInternshipForm();
    successVisible.value = true;
  } catch (error) {
    message.error(error.message || "表單提交失敗，請檢查填寫內容");
  } finally {
    submitting.value = false;

  }
};

// 重置表單
const handleReset = () => {
  resetInternshipForm();
  internshipFormRef.value.clearValidate();
};

// 成功提示框確認
const handleSuccessOk = () => {
  successVisible.value = false;
  handleReset();
  router.push({ name: RouterName.ApplicationRecord })
};

const handleFinishFailed = (errorInfo) => {
  console.log("errorInfo", errorInfo);
};
</script>

<template>
  <div class="u-p-1rem u-w-full">
    <div class="u-bg-white u-rounded-0.5rem u-p-1.5rem u-shadow-md">
      <h1 class="u-text-1.5rem u-fw600 u-mb-1.5rem u-c-blue">實習申請</h1>

      <a-form
        ref="internshipFormRef"
       layout="vertical" 
       :model="internshipApplicationForm" 
        @finish="handleSubmit"
        @finishFailed="handleFinishFailed"
      >
        <ApplicantInfo />

        <a-divider orientation="left">實習機構資訊</a-divider>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item v-bind="internshipApplicationSchema.organization_name" name="organization_name">
              <a-input v-model:value="internshipApplicationForm.organization_name" 
              :placeholder="internshipApplicationSchema.organization_name.placeholder" />
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item v-bind="internshipApplicationSchema.organization_address" name="organization_address">
              <a-input v-model:value="internshipApplicationForm.organization_address" 
              :placeholder="internshipApplicationSchema.organization_address.placeholder" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item v-bind="internshipApplicationSchema.contact_person_name" name="contact_person_name">
              <a-input v-model:value="internshipApplicationForm.contact_person_name" 
              :placeholder="internshipApplicationSchema.contact_person_name.placeholder" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item v-bind="internshipApplicationSchema.contact_person_phone" name="contact_person_phone ">
              <a-input v-model:value="internshipApplicationForm.contact_person_phone" 
              :placeholder="internshipApplicationSchema.contact_person_phone.placeholder" />
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item v-bind="internshipApplicationSchema.contact_person_email" name="contact_person_email">
              <a-input v-model:value="internshipApplicationForm.contact_person_email" 
              :placeholder="internshipApplicationSchema.contact_person_email.placeholder" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">實習期間</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item v-bind="internshipApplicationSchema.internship_date_range" name="internship_date_range">
              <a-range-picker 
                v-model:value="internshipApplicationForm.internship_date_range" 
                :value-format="internshipApplicationSchema.internship_date_range.valueFormat" 
                :format="internshipApplicationSchema.internship_date_range.format" 
                :placeholder="internshipApplicationSchema.internship_date_range.placeholder" 
                class="u-w-full"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item v-bind="internshipApplicationSchema.internship_hours" name="internship_hours">
              <a-input-number class="u-w-full" :min="0" v-model:value="internshipApplicationForm.internship_hours" :placeholder="internshipApplicationSchema.internship_hours.placeholder" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item v-bind="internshipApplicationSchema.internship_description" name="internship_description">
          <a-textarea v-model:value="internshipApplicationForm.internship_description" :placeholder="internshipApplicationSchema.internship_description.placeholder" :rows="internshipApplicationSchema.internship_description.rows" :maxlength="internshipApplicationSchema.internship_description.maxlength" />
        </a-form-item>

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
        <p>您的實習申請已成功提交</p>
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
