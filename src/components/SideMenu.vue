<script setup>
import { reactive, watch, h, computed } from "vue";
import { storeToRefs } from "pinia";

import { useRouter, useRoute } from "vue-router";
import {
  PieChartOutlined,
  ClockCircleFilled,
  MailOutlined,
  FormOutlined,
  TeamOutlined,
} from "@ant-design/icons-vue";
import { RouterName, MenuItems } from "@/enums/appEnums";
import { useUserStore } from "@/stores/user";

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { userProfile } = userStore;

const state = reactive({
  collapsed: props.collapsed,
  selectedKeys: [route.name],
  openKeys: ["sub1"],
  preOpenKeys: ["sub1"],
});

// Function to map key to icon component
const getIconComponent = (key) => {
  switch (key) {
    case "timed-course-selection":
      return ClockCircleFilled;
    case "courses":
      return MailOutlined;
    case "applications":
      return FormOutlined;
    case "user-management":
      return TeamOutlined;
    default:
      return null;
  }
};

// 從appEnums.ts的MenuItems轉換成ant design menu需要的格式
const menuItems = computed(() => {
  const currentUserRole = Number(userProfile.userType);
  const hasRequiredRole = (itemRoles) => {
    if (!itemRoles || !Array.isArray(itemRoles) || itemRoles.length === 0)
      return true;
    return itemRoles.includes(currentUserRole);
  };

  const transformAndFilter = (menuItem) => {
    if (!hasRequiredRole(menuItem.roles)) return null;

    // Get icon component based on key, replacing the one from enum
    const IconComponent = getIconComponent(menuItem.key);

    const transformed = {
      key: menuItem.route ? menuItem.route.name : menuItem.key,
      // Use h() with the determined icon component
      icon: IconComponent ? () => h(IconComponent) : null,
      label: menuItem.label,
      disabled: menuItem.disabled,
      class:
        menuItem.highlight && !state.selectedKeys.includes(menuItem.route?.name)
          ? "menu-highlight"
          : "",
    };

    if (menuItem.children) {
      transformed.children = menuItem.children
        .map((child) => {
          if (!hasRequiredRole(child.roles)) return null;
          return {
            key: child.route ? child.route.name : child.key,
            label: child.label,
            disabled: child.disabled,
            class:
              child.highlight && !state.selectedKeys.includes(child.route?.name)
                ? "menu-highlight"
                : "",
          };
        })
        .filter((child) => child !== null);

      if (transformed.children.length === 0) return null;
    }
    return transformed;
  };

  const homeMenuItem = {
    key: RouterName.LandingPage,
    icon: () => h(PieChartOutlined), // Keep using PieChartOutlined for Home
    label: "首頁",
  };

  const filteredAppMenuItems = MenuItems.map(transformAndFilter).filter(
    (item) => item !== null
  );

  return [homeMenuItem, ...filteredAppMenuItems];
});

const handleMenuSelect = ({ item, key, selectedKeys }) => {
  router.push({ name: key });
};

watch(
  () => state.openKeys,
  (_val, oldVal) => {
    state.preOpenKeys = oldVal;
  }
);

// 根據路由更新選中的菜單項
watch(
  () => route.name,
  (newRouteName) => {
    state.selectedKeys = [newRouteName];
  }
);

// Watch for changes in the collapsed prop
watch(
  () => props.collapsed,
  (newVal) => {
    state.collapsed = newVal;
    state.openKeys = state.collapsed ? [] : state.preOpenKeys;
  }
);
</script>

<template>
  <a-menu
    @select="handleMenuSelect"
    class="u-wmin u-px0.5rem"
    v-model:openKeys="state.openKeys"
    v-model:selectedKeys="state.selectedKeys"
    mode="inline"
    theme="light"
    :inline-collapsed="state.collapsed && false"
    :items="menuItems"
  ></a-menu>
</template>

<style scoped>
:deep(.menu-highlight) {
  position: relative;
  color: #ffbc11;
  font-weight: bold;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 188, 17, 0.7);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(255, 188, 17, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(255, 188, 17, 0);
  }
}
</style>
