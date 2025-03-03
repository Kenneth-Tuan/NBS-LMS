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
      <LoginOutlined class="u-text-2rem u-font-bold u-c-blue" />
    </header>

    <main
      class="u-relative u-flex-grow u-flex u-flex-col u-justify-start u-h100% u-w100% u-bg-cover u-bg-center u-bg-opacity-10 u-bg-[url('/src/assets/image/loginPoster.jpg')]"
    >
      <div class="u-absolute u-inset-0 u-bg-white u-opacity-40 u-h100%"></div>
      <div class="u-w100% u-h100% u-z-9 u-flex-1 u-flex u-flex-nowrap">
        <!-- <a-button
          type="primary"
          style="margin-bottom: 16px"
          @click="toggleCollapsed"
        >
          <MenuUnfoldOutlined v-if="state.collapsed" />
          <MenuFoldOutlined v-else />
        </a-button> -->
        <a-menu
          class="u-w-256px"
          v-model:openKeys="state.openKeys"
          v-model:selectedKeys="state.selectedKeys"
          mode="inline"
          theme="light"
          :inline-collapsed="state.collapsed && false"
          :items="items"
        ></a-menu>
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

<script setup>
import { reactive, watch, h } from "vue";
import {
  PieChartOutlined,
  MailOutlined,
  DesktopOutlined,
  InboxOutlined,
  AppstoreOutlined,
  LoginOutlined,
} from "@ant-design/icons-vue";
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
    label: "公告",
    title: "Option 1",
  },
  {
    key: "2",
    icon: () => h(DesktopOutlined),
    label: "Option 2",
    title: "Option 2",
  },
  {
    key: "3",
    icon: () => h(InboxOutlined),
    label: "Option 3",
    title: "Option 3",
  },
  {
    key: "sub1",
    icon: () => h(MailOutlined),
    label: "Navigation One",
    title: "Navigation One",
    children: [
      {
        key: "5",
        label: "Option 5",
        title: "Option 5",
      },
      {
        key: "6",
        label: "Option 6",
        title: "Option 6",
      },
      {
        key: "7",
        label: "Option 7",
        title: "Option 7",
      },
      {
        key: "8",
        label: "Option 8",
        title: "Option 8",
      },
    ],
  },
  {
    key: "sub2",
    icon: () => h(AppstoreOutlined),
    label: "Navigation Two",
    title: "Navigation Two",
    children: [
      {
        key: "9",
        label: "Option 9",
        title: "Option 9",
      },
      {
        key: "10",
        label: "Option 10",
        title: "Option 10",
      },
      {
        key: "sub3",
        label: "Submenu",
        title: "Submenu",
        children: [
          {
            key: "11",
            label: "Option 11",
            title: "Option 11",
          },
          {
            key: "12",
            label: "Option 12",
            title: "Option 12",
          },
        ],
      },
    ],
  },
]);
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
</script>

<style scoped>
/* 這裡可以添加額外的樣式 */
</style>
