<script setup>
import { reactive, watch, h, unref, ref, computed } from "vue";
import { storeToRefs } from "pinia";
import {
  PieChartOutlined,
  LoginOutlined,
  UserOutlined,
  BellOutlined,
  CaretDownOutlined,
} from "@ant-design/icons-vue";
import { useRouter, useRoute } from "vue-router";

import { useUserStore, user } from "@/stores/user";
import { RouterName, MenuItems, UserRole } from "@/enums/appEnums";

const router = useRouter();
const route = useRoute();

const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { updateLoginDialogOpen, logout, userProfile, setUserRole } = userStore;

const state = reactive({
  collapsed: false,
  selectedKeys: [route.name],
  openKeys: ["sub1"],
  preOpenKeys: ["sub1"],
});

// 從appEnums.js的MenuItems轉換成ant design menu需要的格式
const menuItems = computed(() => {
  const transformMenu = (menuItem) => {
    // 處理子菜單項
    if (menuItem.children) {
      return {
        key: menuItem.key,
        icon: () => h(menuItem.icon),
        label: menuItem.label,
        children: menuItem.children.map((child) => ({
          key: child.route ? child.route.name : child.key,
          label: child.label,
          adminOnly: child.adminOnly,
          disabled: child.disabled,
          class:
            child.highlight && !state.selectedKeys.includes(child.route.name)
              ? "menu-highlight"
              : "",
        })),
      };
    }

    // 處理一級菜單項
    return {
      key: menuItem.route ? menuItem.route.name : menuItem.key,
      icon: () => h(menuItem.icon),
      label: menuItem.label,
      adminOnly: menuItem.adminOnly,
      disabled: menuItem.disabled,
      class:
        menuItem.highlight && !state.selectedKeys.includes(menuItem.route.name)
          ? "menu-highlight"
          : "",
    };
  };

  // 添加首頁
  const homeMenuItem = {
    key: RouterName.LandingPage,
    icon: () => h(PieChartOutlined),
    label: "首頁",
  };

  const transformedItems = [homeMenuItem, ...MenuItems.map(transformMenu)];

  // 過濾掉管理員專用項目（如果非管理員）
  return transformedItems.filter((item) => {
    // 如果項目需要管理員權限但用戶不是管理員
    if (item.adminOnly && userProfile.userType !== 1) {
      return false;
    }

    // 處理子項目
    if (item.children) {
      item.children = item.children.filter((child) => {
        return !(child.adminOnly && userProfile.userType !== 1);
      });
    }

    return true;
  });
});

const visible = ref(false);
const handleMenuClick = (e) => {
  if (e.key === "3") {
    logout();
    router.push("/landing-page");
  }
};
const handleMenuSelect = ({ item, key, selectedKeys }) => {
  router.push({ name: key });
};
watch(
  () => state.openKeys,
  (_val, oldVal) => {
    state.preOpenKeys = oldVal;
  }
);
const toggleCollapsed = () => {
  state.collapsed = !state.collapsed;
  state.openKeys = state.collapsed ? [] : state.preOpenKeys;
};

async function onClickLoginBtn() {
  console.log("test: ", user.current);
  if (user.current) await user.logout();
  if (!unref(isLoggedIn)) {
    updateLoginDialogOpen(true);
  } else {
    logout();
  }
}

// 根據路由更新選中的菜單項
watch(
  () => route.name,
  (newRouteName) => {
    state.selectedKeys = [newRouteName];
  }
);

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
      <div v-if="isDev" class="u-mx-2">
        <a-select
          :value="userProfile.userType"
          style="width: 120px"
          @change="handleRoleChange"
          :options="userRoleOptions"
        >
        </a-select>
      </div>
      <!-- END DEV ONLY -->

      <Transition name="fade" :duration="550" mode="out-in" appear>
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
      </Transition>

      <Transition name="fade" :duration="550" mode="out-in" appear>
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
      </Transition>

      <Transition name="fade" :duration="550" mode="out-in" appear>
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
      </Transition>
    </header>

    <main
      class="u-relative u-flex-grow u-flex u-flex-col u-justify-start u-h100% u-w100% u-bg-cover u-bg-center u-bg-opacity-10 u-bg-[url('/src/assets/image/loginPoster.jpg')]"
    >
      <div class="u-absolute u-inset-0 u-bg-white u-opacity-40 u-h100%"></div>
      <div class="u-w100% u-h100% u-z-9 u-flex-1 u-flex u-flex-nowrap">
        <Transition name="fade" :duration="550" mode="out-in" appear>
          <a-menu
            v-if="isLoggedIn"
            @select="handleMenuSelect"
            class="u-wmin u-px0.5rem"
            v-model:openKeys="state.openKeys"
            v-model:selectedKeys="state.selectedKeys"
            mode="inline"
            theme="light"
            :inline-collapsed="state.collapsed && false"
            :items="menuItems"
          ></a-menu>
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
:deep(.menu-highlight) {
  position: relative;
  color: #ffbc11;
  font-weight: bold;
  animation: pulse 1.5s infinite;
}

/* :deep(.menu-highlight::after) {
  content: "";
  position: absolute;
  right: 0px;
  top: 0px;
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background-color: #ffbc11;
  animation: pulse 1.5s infinite;
} */

@keyframes pulse {
  0% {
    /* transform: scale(0.95); */
    box-shadow: 0 0 0 0 rgba(255, 188, 17, 0.7);
  }

  70% {
    /* transform: scale(1); */
    box-shadow: 0 0 0 6px rgba(255, 188, 17, 0);
  }

  100% {
    /* transform: scale(0.95); */
    box-shadow: 0 0 0 0 rgba(255, 188, 17, 0);
  }
}
</style>
