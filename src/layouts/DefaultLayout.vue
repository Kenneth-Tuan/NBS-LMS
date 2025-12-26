<script setup>
import {
  reactive,
  unref,
  ref,
  onMounted,
  onUnmounted,
  computed,
  watch,
} from "vue";
import { storeToRefs } from "pinia";
import {
  LoginOutlined,
  UserOutlined,
  BellOutlined,
  CaretDownOutlined,
  MenuOutlined,
} from "@ant-design/icons-vue";
import { useRouter } from "vue-router";

import { useUserStore } from "@/stores/user";
import SideMenu from "@/components/SideMenu.vue";
import { UserRole } from "@/enums/appEnums";

const router = useRouter();
const open = ref(false);

const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { updateLoginDialogOpen, logout, userProfile, setUserRole } = userStore;

const visible = ref(false);
const handleMenuClick = (e) => {
  if (e.key === "3") {
    logout();
    router.push("/landing-page");
  }
};

async function onClickLoginBtn() {
  if (!unref(isLoggedIn)) {
    updateLoginDialogOpen(true);
  } else {
    logout();
  }
}

const onClose = () => {
  open.value = false;
};

const handleRoleChange = (newRole) => {
  setUserRole(newRole);
  // Optionally: refresh or trigger something to reflect role change immediately
  // e.g., router.go(0) or re-fetch data based on role
};

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

const userRoleOptions = computed(() => {
  return [
    {
      label: "Creator",
      value: UserRole.Creator,
    },
    {
      label: "Admin",
      value: UserRole.Admin,
    },
    {
      label: "Manager",
      value: UserRole.Manager,
    },
    {
      label: "Teacher",
      value: UserRole.Teacher,
    },
    {
      label: "Student",
      value: UserRole.Student,
    },
  ].filter(
    (item) => showCreatorOption.value || item.value !== UserRole.Creator
  );
});

const isDEV = import.meta.env.DEV;

// Close the drawer on route change (better UX on mobile)
watch(
  () => router.currentRoute.value.fullPath,
  () => {
    onClose();
  }
);

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
  <div class="u-relative u-min-h-screen u-flex u-flex-col u-h-full u-w-full">
    <header
      :class="[
        'u-bg-white',
        'u-py-0.5rem u-px-1rem u-w-full lg:u-py-1rem lg:u-px-2rem',
        'u-fixed u-top-0 u-left-0 u-z-10 lg:u-relative',
      ]"
    >
      <div class="u-flex u-items-center u-justify-between">
        <div
          class="u-flex u-items-center u-justify-start u-h-full lg:u-flex-gap-x-2rem u-flex-gap-x-0.5rem"
        >
          <div
            class="lg:u-flex u-hidden u-items-center u-justify-center u-h-full"
          >
            <img
              src="/src/assets/icon/logo2.jpeg"
              alt="Logo"
              class="lg:u-w-16 lg:u-h-16 u-w-12 u-h-12"
            />
          </div>
          <a-button
            type="text"
            class="lg:u-hidden u-inline-flex u-items-center u-justify-center u-px-0 u-border-none u-bg-transparent u-shadow-none"
            aria-label="開啟選單"
            @click="open = true"
          >
            <MenuOutlined class="u-text-1.25rem u-c-blue" />
          </a-button>
          <div
            class="u-c-blue u-font-bold u-flex u-flex-col u-items-start u-leading-tight lg:u-leading-normal"
          >
            <span
              class="xl:u-text-1.5rem lg:u-text-1.25rem u-font-bold u-text-0.875rem"
            >
              拿撒勒人會神學院選課系統
            </span>
            <span
              class="lg:u-text-1rem u-text-0.75rem u-font-bold lg:u-inline u-hidden"
            >
              Taiwan Nazarene Theological College LMS
            </span>
          </div>
        </div>

        <!-- DEV ONLY: Role Switcher -->
        <!-- <div v-if="isDEV" class="u-mx-2">
        <a-select
          :value="userProfile.userRole"
          style="width: 120px"
          @change="handleRoleChange"
          :options="userRoleOptions"
        >
        </a-select>
      </div> -->
        <!-- END DEV ONLY -->

        <!-- <Transition name="fade" :duration="550" mode="out-in" appear> -->
        <a-tooltip v-if="isLoggedIn && false" title="通知">
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

        <a-tooltip v-if="!isLoggedIn" title="登入">
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
              <span
                class="md:u-text-1rem u-text-0.875rem u-font-bold u-c-blue md:u-inline u-hidden"
              >
                {{ userProfile.userName }}
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
                <!-- <a-menu-item key="1"> 個人資料</a-menu-item>
              <a-menu-item key="2"> 修改密碼</a-menu-item>
              <a-menu-divider /> -->
                <a-menu-item key="3"> 登出</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <!-- </Transition> -->
      </div>
    </header>

    <main
      class="lg:u-pt-0 u-pt-3rem u-relative u-flex-grow u-flex u-flex-col u-justify-start u-h-max u-w100% u-bg-cover u-bg-center u-bg-opacity-10 u-bg-[url('/src/assets/image/loginPoster.jpg')]"
    >
      <div class="u-absolute u-inset-0 u-bg-white u-opacity-40 u-h100%"></div>
      <div class="u-w100% u-h-max u-z-9 u-flex-1 u-flex u-flex-nowrap">
        <!-- Desktop sidebar -->
        <SideMenu class="u-hidden lg:u-block u-w-[260px] u-flex-shrink-0" />
        <div class="u-w-full u-h-max lg:u-p-1rem u-p-0.5rem">
          <router-view />
        </div>
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

    <!-- Mobile drawer for the side menu -->
    <a-drawer
      title="選單"
      placement="left"
      :open="open"
      @close="onClose"
      :closable="false"
      :destroyOnClose="true"
      class="lg:u-hidden"
      :bodyStyle="{ padding: 0 }"
      width="min-content"
    >
      <SideMenu />
    </a-drawer>
  </div>
</template>

<style scoped>
/* Styles specific to the DefaultLayout component */
</style>
