<script setup>
import { reactive, watch, h, unref, ref, computed } from "vue";
import { storeToRefs } from "pinia";
import {
  LoginOutlined,
  UserOutlined,
  BellOutlined,
  CaretDownOutlined,
} from "@ant-design/icons-vue";
import { useRouter, useRoute } from "vue-router";

import { useUserStore } from "@/stores/user";
import SideMenu from "@/components/SideMenu.vue";

const router = useRouter();
const route = useRoute();

const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { updateLoginDialogOpen, logout, userProfile, setUserRole } = userStore;

const state = reactive({
  collapsed: false,
});

const visible = ref(false);
const handleMenuClick = (e) => {
  if (e.key === "3") {
    logout();
    router.push("/landing-page");
  }
};

const toggleCollapsed = () => {
  state.collapsed = !state.collapsed;
};

async function onClickLoginBtn() {
  if (!unref(isLoggedIn)) {
    updateLoginDialogOpen(true);
  } else {
    logout();
  }
}

const isDev = import.meta.env.DEV;

const handleRoleChange = (newRole) => {
  setUserRole(newRole);
  // Optionally: refresh or trigger something to reflect role change immediately
  // e.g., router.go(0) or re-fetch data based on role
};

const userRoleOptions = [
  {
    label: "Admin",
    value: 1,
  },
  {
    label: "Manager",
    value: 2,
  },
  {
    label: "Teacher",
    value: 3,
  },
  {
    label: "Student",
    value: 4,
  },
];
</script>

<template>
  <div class="u-flex u-flex-col u-min-h-screen">
    <header
      class="u-bg-white u-text-white u-text-center u-flex u-items-center u-justify-start u-flex-gap-x-2rem u-py-1rem u-px-2rem"
    >
      <div class="u-flex u-items-center u-justify-center u-h-full">
        <img
          src="/src/assets/icon/logo2.jpeg"
          alt="Logo"
          class="u-w-16 u-h-16"
        />
      </div>
      <p class="u-c-blue u-font-bold u-flex u-flex-col u-items-start">
        <span class="u-text-1.5rem u-font-bold">Lorem ipsum</span>
        <span class="u-text-1rem u-font-bold">
          Taiwan Nazarene Thological College LMS
        </span>
      </p>
      <div class="u-flex-1"></div>

      <!-- DEV ONLY: Role Switcher -->
      <div v-if="false" class="u-mx-2">
        <a-select
          :value="userProfile.userType"
          style="width: 120px"
          @change="handleRoleChange"
          :options="userRoleOptions"
        >
        </a-select>
      </div>
      <!-- END DEV ONLY -->

      <!-- <Transition name="fade" :duration="550" mode="out-in" appear> -->
      <a-tooltip v-if="isLoggedIn" title="通知">
        <a-button
          @click="() => {}"
          shape="circle"
          :size="'large'"
          type="ghost"
          :ghost="true"
        >
          <BellOutlined class="u-text-1.5rem u-font-bold u-c-blue" />
        </a-button>
      </a-tooltip>

      <a-tooltip v-else title="登入">
        <a-button
          @click="onClickLoginBtn"
          shape="circle"
          :size="'large'"
          type="ghost"
          :ghost="true"
        >
          <LoginOutlined class="u-text-1.5rem u-font-bold u-c-blue" />
        </a-button>
      </a-tooltip>
      <!-- </Transition> -->

      <!-- <Transition name="fade" :duration="550" mode="out-in" appear> -->
      <div v-if="isLoggedIn">
        <a-dropdown v-model:open="visible">
          <div
            class="u-flex u-items-center u-justify-center u-flex-gap-x-0.5rem"
          >
            <UserOutlined class="u-text-1.5rem u-font-bold u-c-blue" />
            <span class="u-text-1rem u-font-bold u-c-blue">
              {{ userProfile.userID }} {{ userProfile.userName }}
            </span>

            <CaretDownOutlined
              class="u-text-1rem u-font-bold u-c-blue"
              :class="{
                'u-rotate-180': visible,
                'u-transition-all u-duration-250ms u-ease-in-out': true,
              }"
            />
          </div>
          <template #overlay>
            <a-menu @click="handleMenuClick">
              <a-menu-item key="1"> 個人資料</a-menu-item>
              <a-menu-item key="2"> 修改密碼</a-menu-item>
              <a-menu-divider />
              <a-menu-item key="3"> 登出</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <!-- </Transition> -->
    </header>

    <main
      class="u-relative u-flex-grow u-flex u-flex-col u-justify-start u-h100% u-w100% u-bg-cover u-bg-center u-bg-opacity-10 u-bg-[url('/src/assets/image/loginPoster.jpg')]"
    >
      <div class="u-absolute u-inset-0 u-bg-white u-opacity-40 u-h100%"></div>
      <div class="u-w100% u-h100% u-z-9 u-flex-1 u-flex u-flex-nowrap">
        <Transition name="fade" :duration="550" mode="out-in" appear>
          <SideMenu v-if="isLoggedIn" :collapsed="state.collapsed" />
        </Transition>
        <router-view />
      </div>
    </main>

    <footer
      class="u-p1rem u-bg-primary u-text-white u-text-center u-text-xs u-flex u-flex-col u-items-center u-justify-center"
    >
      <p>
        建議瀏覽器版本：最新版本-chrome．Firefox．Safari．Edge © Taiwan Nazarene
        Theological College LMS
      </p>
    </footer>
  </div>
</template>

<style scoped>
/* Styles specific to the DefaultLayout component */
</style>
