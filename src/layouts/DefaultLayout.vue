<script setup>
import { reactive, watch, h, unref, ref } from "vue";
import { storeToRefs } from "pinia";
import {
  PieChartOutlined,
  MailOutlined,
  DesktopOutlined,
  InboxOutlined,
  AppstoreOutlined,
  LoginOutlined,
  UserOutlined,
  BellOutlined,
  CaretDownOutlined,
} from "@ant-design/icons-vue";
import { useRouter } from "vue-router";

import { useUserStore } from "@/stores/user";

const router = useRouter();

const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { updateLoginDialogOpen, logout } = userStore;

const state = reactive({
  collapsed: false,
  selectedKeys: ["1"],
  openKeys: ["sub1"],
  preOpenKeys: ["sub1"],
});

const items = reactive([
  {
    key: "1",
    icon: () => h(PieChartOutlined),
    label: "Home",
    title: "Option 1",
    path: "/landing-page",
  },
  {
    key: "2",
    icon: () => h(DesktopOutlined),
    label: "Dashboard",
    title: "Option 2",
    path: "/dashboard",
  },
  {
    key: "3",
    icon: () => h(InboxOutlined),
    label: "My Course",
    title: "Option 3",
    path: "/",
  },
  // {
  //   key: "sub1",
  //   icon: () => h(MailOutlined),
  //   label: "Site Administration",
  //   title: "Navigation One",
  //   children: [
  //     {
  //       key: "5",
  //       label: "General",
  //       title: "Option 5",
  //     },
  //     {
  //       key: "6",
  //       label: "Users",
  //       title: "Option 6",
  //     },
  //     {
  //       key: "7",
  //       label: "Courses",
  //       title: "Option 7",
  //     },
  //     {
  //       key: "8",
  //       label: "Grades",
  //       title: "Option 8",
  //     },
  //     {
  //       key: "9",
  //       label: "Appearance",
  //       title: "Option 9",
  //     },
  //   ],
  // },
  // {
  //   key: "sub2",
  //   icon: () => h(AppstoreOutlined),
  //   label: "",
  //   title: "Navigation Two",
  //   children: [
  //     {
  //       key: "9",
  //       label: "Option 9",
  //       title: "Option 9",
  //     },
  //     {
  //       key: "10",
  //       label: "Option 10",
  //       title: "Option 10",
  //     },
  //     {
  //       key: "sub3",
  //       label: "Submenu",
  //       title: "Submenu",
  //       children: [
  //         {
  //           key: "11",
  //           label: "Option 11",
  //           title: "Option 11",
  //         },
  //         {
  //           key: "12",
  //           label: "Option 12",
  //           title: "Option 12",
  //         },
  //       ],
  //     },
  //   ],
  // },
]);

const visible = ref(false);
const handleMenuClick = (e) => {
  if (e.key === "3") {
    logout();
    router.push("/login");
  }
};
const handleMenuSelect = ({ item, key, selectedKeys }) => {
  if (item.hasOwnProperty("path")) router.push(item.path);
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

function onClickLoginBtn() {
  if (!unref(isLoggedIn)) {
    updateLoginDialogOpen(true);
  } else {
    logout();
  }
}
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
                A1234 王小明
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
            class="u-w-256px"
            v-model:openKeys="state.openKeys"
            v-model:selectedKeys="state.selectedKeys"
            mode="inline"
            theme="light"
            :inline-collapsed="state.collapsed && false"
            :items="items"
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
/* 這裡可以添加額外的樣式 */
</style>
