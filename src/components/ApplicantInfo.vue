<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useApplicationStore } from "@/stores/application";
import { decryptString } from "@/utils/misc";

const userStore = useUserStore();
const applicationStore = useApplicationStore();
const { applicationForm } = applicationStore;

onMounted(async () => {
  // Default applicantName from user profile
  if (!applicationForm.applicantName.value) {
    applicationForm.applicantName.value = userStore.userProfile.userName || "";
  }

  // Default applicantEmail by decrypting from cookies
  try {
    const enc = $cookies.get("UserEmailEnc");
    const token = $cookies.get("ApiToken");
    if (userStore.userProfile.userEmail) {
      applicationForm.applicantEmail.value = userStore.userProfile.userEmail;
      return;
    }
    let payload = null;
    if (typeof enc === "string") payload = JSON.parse(enc);
    else if (enc && typeof enc === "object") payload = enc;
    if (payload?.c && payload?.i && payload?.s && token) {
      const email = await decryptString(
        { cipherTextBase64: payload.c, ivHex: payload.i, saltHex: payload.s },
        token
      );
      applicationForm.applicantEmail.value = email || "";
    }
  } catch {}
});
</script>

<template>
  <a-row :gutter="16">
    <a-col :span="12">
      <a-form-item
        :label="applicationForm.applicantName.label"
        :validateStatus="applicationForm.applicantName.err ? 'error' : ''"
        :help="applicationForm.applicantName.errMsg"
      >
        <a-input v-model:value="applicationForm.applicantName.value" placeholder="請輸入申請人名稱" disabled />
      </a-form-item>
    </a-col>

    <a-col :span="12">
      <a-form-item
        :label="applicationForm.applicantEmail.label"
        :validateStatus="applicationForm.applicantEmail.err ? 'error' : ''"
        :help="applicationForm.applicantEmail.errMsg"
      >
        <a-input v-model:value="applicationForm.applicantEmail.value" placeholder="請輸入申請人 Email" disabled />
      </a-form-item>
    </a-col>
  </a-row>
</template>



