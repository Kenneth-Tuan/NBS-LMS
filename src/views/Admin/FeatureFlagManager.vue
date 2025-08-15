<script setup>
import { computed } from "vue";
import { FeatureFlagManager, featureFlags } from "@/config/featureFlags";

// 將功能開關扁平化為可顯示的列表
const flagList = computed(() => {
  const list = [];

  const traverse = (obj, prefix = "") => {
    Object.keys(obj).forEach((key) => {
      const path = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === "boolean") {
        list.push({
          path,
          enabled: obj[key],
          category: prefix || "general",
          name: key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase()),
        });
      } else if (typeof obj[key] === "object") {
        traverse(obj[key], path);
      }
    });
  };

  traverse(featureFlags);
  return list.sort((a, b) => a.path.localeCompare(b.path));
});

// 按類別分組
const groupedFlags = computed(() => {
  const groups = {};

  flagList.value.forEach((flag) => {
    if (!groups[flag.category]) {
      groups[flag.category] = [];
    }
    groups[flag.category].push(flag);
  });

  return groups;
});

// 類別顯示名稱映射
const categoryNames = {
  gradebook: "成績簿功能",
  courseManagement: "課程管理",
  userManagement: "用戶管理",
  notifications: "通知系統",
  experimental: "實驗性功能",
};

// 獲取類別顏色
const getCategoryColor = (category) => {
  const colors = {
    gradebook: "blue",
    courseManagement: "green",
    userManagement: "orange",
    notifications: "purple",
    experimental: "red",
  };
  return colors[category] || "default";
};

// 統計信息
const stats = computed(() => {
  const total = flagList.value.length;
  const enabled = flagList.value.filter((flag) => flag.enabled).length;
  const disabled = total - enabled;

  return { total, enabled, disabled };
});
</script>

<template>
  <div class="feature-flag-manager">
    <div class="u-mb-6">
      <h1 class="u-text-2xl u-font-bold u-mb-2">功能開關管理</h1>
      <p class="u-text-gray-600">
        查看和了解系統中所有功能開關的狀態。在開發環境中，您可以透過環境變數覆蓋這些設定。
      </p>
    </div>

    <!-- 統計卡片 -->
    <div class="u-grid u-grid-cols-1 md:u-grid-cols-3 u-gap-4 u-mb-6">
      <div class="u-bg-white u-p-4 u-rounded-lg u-border u-shadow-sm">
        <div class="u-flex u-items-center u-justify-between">
          <div>
            <p class="u-text-sm u-text-gray-600">總功能數</p>
            <p class="u-text-2xl u-font-bold u-text-gray-900">
              {{ stats.total }}
            </p>
          </div>
          <div
            class="u-w-12 u-h-12 u-bg-gray-100 u-rounded-full u-flex u-items-center u-justify-center"
          >
            <span class="u-text-xl">🚩</span>
          </div>
        </div>
      </div>

      <div class="u-bg-white u-p-4 u-rounded-lg u-border u-shadow-sm">
        <div class="u-flex u-items-center u-justify-between">
          <div>
            <p class="u-text-sm u-text-gray-600">已啟用</p>
            <p class="u-text-2xl u-font-bold u-text-green-600">
              {{ stats.enabled }}
            </p>
          </div>
          <div
            class="u-w-12 u-h-12 u-bg-green-100 u-rounded-full u-flex u-items-center u-justify-center"
          >
            <span class="u-text-xl">✅</span>
          </div>
        </div>
      </div>

      <div class="u-bg-white u-p-4 u-rounded-lg u-border u-shadow-sm">
        <div class="u-flex u-items-center u-justify-between">
          <div>
            <p class="u-text-sm u-text-gray-600">已禁用</p>
            <p class="u-text-2xl u-font-bold u-text-red-600">
              {{ stats.disabled }}
            </p>
          </div>
          <div
            class="u-w-12 u-h-12 u-bg-red-100 u-rounded-full u-flex u-items-center u-justify-center"
          >
            <span class="u-text-xl">❌</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能開關列表 -->
    <div class="u-space-y-6">
      <div
        v-for="(flags, category) in groupedFlags"
        :key="category"
        class="u-bg-white u-rounded-lg u-border u-shadow-sm"
      >
        <div class="u-p-4 u-border-b u-border-gray-200">
          <h2 class="u-text-lg u-font-semibold u-flex u-items-center u-gap-2">
            <a-tag :color="getCategoryColor(category)" size="small">
              {{ categoryNames[category] || category }}
            </a-tag>
            <span class="u-text-sm u-text-gray-500">
              ({{ flags.filter((f) => f.enabled).length }}/{{
                flags.length
              }}
              已啟用)
            </span>
          </h2>
        </div>

        <div class="u-p-4">
          <div class="u-grid u-gap-3">
            <div
              v-for="flag in flags"
              :key="flag.path"
              class="u-flex u-items-center u-justify-between u-p-3 u-bg-gray-50 u-rounded-lg"
            >
              <div class="u-flex-1">
                <div class="u-flex u-items-center u-gap-2 u-mb-1">
                  <code
                    class="u-text-sm u-bg-gray-200 u-px-2 u-py-1 u-rounded u-font-mono"
                  >
                    {{ flag.path }}
                  </code>
                </div>
                <p class="u-text-sm u-text-gray-600">{{ flag.name }}</p>
              </div>

              <div class="u-flex u-items-center u-gap-2">
                <a-tag :color="flag.enabled ? 'green' : 'red'" size="small">
                  {{ flag.enabled ? "已啟用" : "已禁用" }}
                </a-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用說明 -->
    <div
      class="u-mt-8 u-p-4 u-bg-blue-50 u-rounded-lg u-border u-border-blue-200"
    >
      <h3 class="u-text-lg u-font-semibold u-text-blue-800 u-mb-2">
        🔧 開發者說明
      </h3>
      <div class="u-text-sm u-text-blue-700 u-space-y-2">
        <p>
          <strong>環境變數覆蓋：</strong>
          您可以透過環境變數來覆蓋預設的功能開關設定。
        </p>
        <p>
          <strong>格式：</strong>
          <code class="u-bg-blue-100 u-px-2 u-py-1 u-rounded"
            >VITE_FEATURE_[CATEGORY]_[FEATURE]=true/false</code
          >
        </p>
        <p>
          <strong>範例：</strong>
          <code class="u-bg-blue-100 u-px-2 u-py-1 u-rounded"
            >VITE_FEATURE_GRADEBOOK_ENABLEWEIGHTCONFIGURATION=true</code
          >
        </p>
        <p>
          <strong>註意：</strong>
          環境變數的修改需要重新啟動開發服務器才會生效。
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feature-flag-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

code {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
}
</style>
