<script setup>
import { reactive, watch, h, computed, ref, onMounted, unref } from "vue";
import { storeToRefs } from "pinia";

import { useRouter, useRoute } from "vue-router";
import { MenuItems } from "@/enums/appEnums";
import { useUserStore } from "@/stores/user";
import { courseService } from "@/services/course.service";
import { RouterName } from "@/enums/appEnums";
import { useNotificationStore } from "@/stores/notificationStore";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { userProfile } = userStore;
const notificationStore = useNotificationStore();
const { notifiedRouterNames } = storeToRefs(notificationStore);

const state = reactive({
  collapsed: false,
  selectedKeys: [route.name],
  openKeys: ["sub1"],
  preOpenKeys: ["sub1"],
});

const hasEnrollment = ref(false);

// 從appEnums.ts的MenuItems轉換成ant design menu需要的格式
const menuItems = computed(() => {
  const currentUserRole = userProfile.userRole;
  const hasRequiredRole = (itemRoles) => {
    if (!itemRoles || !Array.isArray(itemRoles) || itemRoles.length === 0)
      return true;
    return itemRoles.includes(currentUserRole);
  };

  const transformAndFilter = (menuItem) => {
    if (!hasRequiredRole(menuItem.roles)) return null;

    // Get icon component based on key, replacing the one from enum

    const transformed = {
      key: menuItem.route ? menuItem.route.name : menuItem.key,
      icon: () => h(menuItem.icon),
      label: menuItem.label,
      disabled: menuItem.disabled,
      class:
        menuItem.highlight && !state.selectedKeys.includes(menuItem.route?.name)
          ? "menu-highlight"
          : "",
      isNotified: false,
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

    if (menuItem.key === RouterName.TimedCourseSelection) {
      transformed.disabled = !hasEnrollment.value;
      transformed.class = hasEnrollment.value ? "menu-highlight" : "";
    }

    if (
      unref(notifiedRouterNames).length > 0 &&
      menuItem.key === "applications"
    ) {
      transformed.isNotified = true;
      transformed.children.forEach((child) => {
        child.isNotified = child.key === RouterName.ApplicationRecord;
      });
    }

    return transformed;
  };

  const filteredAppMenuItems = MenuItems.map(transformAndFilter).filter(
    (item) => item !== null && !item.disabled
  );

  return filteredAppMenuItems;
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
    state.openKeys = [newRouteName];
  },
  {
    immediate: true,
  }
);

onMounted(async () => {
  const courses = await courseService.fetchCoursesForEnrollment();
  hasEnrollment.value = courses.length > 0;
});
</script>

<template>
  <a-menu
    @select="handleMenuSelect"
    class="u-wmin u-px0.5rem"
    v-model:openKeys="state.openKeys"
    v-model:selectedKeys="state.selectedKeys"
    mode="inline"
    theme="light"
    :inline-collapsed="state.collapsed"
  >
    <template v-for="item in menuItems" :key="item.key">
      <a-sub-menu
        v-if="item.hasOwnProperty('children')"
        :key="item.key"
        :class="item.class"
      >
        <template #icon>
          <component :is="item.icon" />
        </template>
        <template #title>
          <p class="u-w-85px">
            {{ item.label }}
            <a-badge :dot="item.isNotified" />
          </p>
        </template>
        <a-menu-item v-for="child in item.children" :key="child.key">
          <span>
            {{ child.label }}
            <a-badge :dot="child.isNotified" />
          </span>
        </a-menu-item>
      </a-sub-menu>
      <a-menu-item v-else :key="item.key" :class="item.class">
        <template #icon>
          <component :is="item.icon" />
        </template>
        <span>
          {{ item.label }}
          <a-badge :dot="item.isNotified" />
        </span>
      </a-menu-item>
    </template>
  </a-menu>
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
