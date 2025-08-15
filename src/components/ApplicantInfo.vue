<script setup>
import { onMounted, reactive } from "vue";
import { useUserStore } from "@/stores/user";
import { decryptString } from "@/utils/misc";

const userStore = useUserStore();

const applicantInfo = reactive({
  userName: "",
  userEmail: "",
})

onMounted(async () => {
  // Default applicantName from user profile
  if (!applicantInfo.userName) {
    applicantInfo.userName = userStore.userProfile.userName || "";
  }

  // Default applicantEmail by decrypting from cookies
  try {
    const enc = $cookies.get("UserEmailEnc");
    const token = $cookies.get("ApiToken");
    if (userStore.userProfile.userEmail) {
      applicantInfo.userEmail = userStore.userProfile.userEmail;
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
      applicantInfo.userEmail = email || "";
    }
  } catch {}
});
</script>

<template>
  <a-row :gutter="16">
    <a-col :span="12">
      <a-form-item
        label="申請人名稱"
      >
        <a-input v-model:value="applicantInfo.userName" placeholder="請輸入申請人名稱" disabled />
      </a-form-item>
    </a-col>

    <a-col :span="12">
      <a-form-item
        label="申請人 Email"
      >
        <a-input v-model:value="applicantInfo.userEmail" placeholder="請輸入申請人 Email" disabled />
      </a-form-item>
    </a-col>
  </a-row>
</template>



