<template>
  <div class="u-flex-grow u-flex u-items-center u-justify-center">
    <Transition name="nested" :duration="550" mode="out-in" appear>
      <a-card
        class="u-w-[400px] u-bg-white u-rounded-lg u-p-8"
        :bordered="false"
      >
        <div class="u-text-center u-mb-8">
          <h1 class="u-text-2xl u-text-blue u-font-normal">
            Taiwan Nazarene Theological College LMS
          </h1>
        </div>

        <a-form :model="formState" @finish="handleFinish" class="u-mb-8">
          <a-form-item
            name="username"
            :rules="[{ required: true, message: '請輸入帳號' }]"
          >
            <a-input
              v-model:value="formState.username"
              placeholder="帳號"
              size="large"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item
            name="password"
            :rules="[{ required: true, message: '請輸入密碼' }]"
          >
            <a-input-password
              v-model:value="formState.password"
              placeholder="密碼"
              size="large"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              class="u-bg-primary u-hover:u-bg-primary-dark"
            >
              登入
            </a-button>
          </a-form-item>
        </a-form>

        <div class="u-text-center u-text-gray-600 u-text-sm u-mb-4">
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
        </div>

        <div class="u-text-center u-text-gray-400 u-text-xs">
          建議瀏覽器版本：最新版本-chrome．Firefox．Safari．Edge © Fubon Life
          Insurance Co.Ltd. All Rights Reserved
        </div>
      </a-card>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";

interface FormState {
  username: string;
  password: string;
}

const formState = reactive<FormState>({
  username: "",
  password: "",
});

const handleFinish = (values: FormState) => {
  console.log("Success:", values);
};
</script>

<style lang="css" scoped>
.nested-enter-active,
.nested-leave-active {
  transition: all 0.5s ease-in-out;
}
/* delay leave of parent element */
.nested-leave-active {
  transition-delay: 0.25s;
}

.nested-enter-from,
.nested-leave-to {
  transform: translateY(30px);
  opacity: 0;
}
</style>
