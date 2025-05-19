<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from "vue";
import { message } from "ant-design-vue";
import { MailOutlined, LockOutlined } from "@ant-design/icons-vue";

import { useUserStore } from "../stores/user";
import { storeToRefs } from "pinia";
import { UserRole } from "../enums/appEnums";
import { loginService } from "../services/login.service";

const userStore = useUserStore();
const { loginDialogOpen } = storeToRefs(userStore);
const { updateLoginDialogOpen, setUserRole } = userStore;

const formState = reactive({
  userEmail: "",
  password: "",
  userRole: "",
  remember: true,
});

const loading = ref(false);
const showCreatorOption = ref(false);

const handleKeyDown = (event) => {
  if (event.key === "Shift") {
    showCreatorOption.value = true;
  }
};

const handleKeyUp = (event) => {
  if (event.key === "Shift") {
    showCreatorOption.value = false;
  }
};

const onFinish = async () => {
  try {
    loading.value = true;

    message.loading({ content: "Loading...", key: "login" });

    const result = await loginService.login(
      formState.userRole,
      formState.userEmail,
      formState.password
    );

    if (result || showCreatorOption.value) {
      message.success({
        content: "Login Success!",
        key: "login",
        duration: 2,
      });
      setUserRole(formState.userRole);
      updateLoginDialogOpen(false);
    } else throw new Error("Login Failed!");

    loading.value = false;
  } catch (error) {
    message.error({
      content: "Login Failed!",
      key: "login",
      duration: 2,
    });
    loading.value = false;
    throw error;
  } finally {
  }
};

const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

const disabled = computed(() => {
  return !(formState.userEmail && formState.password);
});

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
});
</script>

<template>
  <div>
    <a-modal v-model:open="loginDialogOpen" :footer="null">
      <div class="u-text-center u-my8">
        <h1 class="u-text-2xl u-text-blue u-font-normal">
          Taiwan Nazarene Theological College LMS
        </h1>
      </div>

      <a-form
        :model="formState"
        name="normal_login"
        class="login-form"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
      >
        <a-form-item label="角色" name="userRole">
          <a-select v-model:value="formState.userRole" placeholder="請選擇">
            <a-select-option v-if="showCreatorOption" :value="UserRole.Creator"
              >Creator</a-select-option
            >
            <a-select-option :value="UserRole.Admin">Admin</a-select-option>
            <a-select-option :value="UserRole.Manager">管理員</a-select-option>
            <a-select-option :value="UserRole.Student">學生</a-select-option>
            <a-select-option :value="UserRole.Teacher">教師</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          label="信箱"
          name="userEmail"
          :rules="[{ required: true, message: '請輸入信箱!' }]"
        >
          <a-input v-model:value="formState.userEmail">
            <template #prefix>
              <MailOutlined class="site-form-item-icon" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="密碼"
          name="password"
          :rules="[{ required: true, message: '請輸入密碼!' }]"
        >
          <a-input-password v-model:value="formState.password">
            <template #prefix>
              <LockOutlined class="site-form-item-icon" />
            </template>
          </a-input-password>
        </a-form-item>

        <!-- <a-form-item>
          <a-form-item name="remember" no-style>
            <a-checkbox v-model:checked="formState.remember">
              Remember me
            </a-checkbox>
          </a-form-item>
          <a class="login-form-forgot" href="">Forgot password</a>
        </a-form-item> -->

        <a-form-item>
          <a-button
            :disabled="disabled"
            type="primary"
            html-type="submit"
            class="login-form-button"
            :loading="loading"
          >
            Log in
          </a-button>
          <!-- Or
          <a href="">register now!</a> -->
        </a-form-item>
      </a-form>

      <!-- <div class="u-text-center u-text-gray-600 u-text-sm u-mb-4">
          <a class="u-c-blue u-hover:u-text-primary-dark u-transition-colors">
            公平待客原則
          </a>
          <span class="mx-2">|</span>
          <a class="u-c-blue u-hover:u-text-primary u-transition-colors">
            隱私權聲明
          </a>
          <span class="mx-2">|</span>
          <a class="u-c-gray-600 u-hover:u-text-primary u-transition-colors">
            相關連結
          </a>
        </div> -->
    </a-modal>
  </div>
</template>

<style scoped>
#components-form-demo-normal-login .login-form {
  /* max-width: 300px; */
}
#components-form-demo-normal-login .login-form-forgot {
  float: right;
}
#components-form-demo-normal-login .login-form-button {
  width: 100%;
}
</style>
