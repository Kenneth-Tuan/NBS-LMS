<script setup>
import { reactive, ref, computed } from "vue";
import { message } from "ant-design-vue";
import { MailOutlined, LockOutlined } from "@ant-design/icons-vue";

import { sha256 } from "@/utils/misc";
import { useUserStore, user } from "../stores/user";
import { storeToRefs } from "pinia";
import { dummyUserData } from "@/data/dummy";

const userStore = useUserStore();
const { loginDialogOpen } = storeToRefs(userStore);
const { updateLoginDialogOpen, signIn, setUserProfile } = userStore;

const formState = reactive({
  username: "",
  userEmail: "",
  password: "",
  remember: true,
});

const loading = ref(false);

const onFinish = async (values) => {
  try {
    loading.value = true;
    delete values.remember;
    // const hashedAccountInfo = await sha256(JSON.stringify(values));

    message.loading({ content: "Loading...", key: "login" });

    const userInfo = dummyUserData.find(
      (user) =>
        user.userEmail === values.userEmail && user.password === values.password
    );

    // const isLoginSuccess = await signIn(hashedAccountInfo);

    const isLoginSuccess = userInfo !== undefined;

    if (isLoginSuccess) {
      // user.init();
      setUserProfile(userInfo);
      message.success({
        content: "Login Success!",
        key: "login",
        duration: 2,
      });
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
        <!-- <a-form-item
          label="Username"
          name="username"
          :rules="[{ required: true, message: 'Please input your username!' }]"
        >
          <a-input v-model:value="formState.username">
            <template #prefix>
              <UserOutlined class="site-form-item-icon" />
            </template>
          </a-input>
        </a-form-item> -->

        <a-form-item
          label="Email"
          name="userEmail"
          :rules="[{ required: true, message: 'Please input your email!' }]"
        >
          <a-input v-model:value="formState.userEmail">
            <template #prefix>
              <MailOutlined class="site-form-item-icon" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="Password"
          name="password"
          :rules="[{ required: true, message: 'Please input your password!' }]"
        >
          <a-input-password v-model:value="formState.password">
            <template #prefix>
              <LockOutlined class="site-form-item-icon" />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-form-item name="remember" no-style>
            <a-checkbox v-model:checked="formState.remember">
              Remember me
            </a-checkbox>
          </a-form-item>
          <a class="login-form-forgot" href="">Forgot password</a>
        </a-form-item>

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
          Or
          <a href="">register now!</a>
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
