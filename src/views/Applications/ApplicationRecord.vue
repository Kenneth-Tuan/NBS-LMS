<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-lg u-p-6 u-shadow-md">
      <h1 class="u-text-2xl u-font-bold u-mb-6 u-c-blue">申請紀錄</h1>

      <a-spin :spinning="loading">
        <a-tabs v-model:activeKey="activeTabKey">
          <a-tab-pane key="all" tab="全部申請">
            <application-list :data="filteredApplications" />
          </a-tab-pane>
          <a-tab-pane key="internship" tab="實習申請">
            <application-list :data="internshipApplications" />
          </a-tab-pane>
          <a-tab-pane key="leave" tab="請假申請">
            <application-list :data="leaveApplications" />
          </a-tab-pane>
          <a-tab-pane key="subsidy" tab="補助申請">
            <application-list :data="subsidyApplications" />
          </a-tab-pane>
        </a-tabs>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useApplicationStore } from "@/stores/application";
import { message } from "ant-design-vue";
import ApplicationList from "./components/ApplicationList.vue";

const applicationStore = useApplicationStore();
const { applicationList, loading, error, getApplicationList } =
  applicationStore;

// 當前激活的標籤頁
const activeTabKey = ref("all");

// 根據類型過濾申請列表
const internshipApplications = computed(() => {
  return applicationList.filter((item) => item.type === "internship");
});

const leaveApplications = computed(() => {
  return applicationList.filter((item) => item.type === "leave");
});

const subsidyApplications = computed(() => {
  return applicationList.filter((item) => item.type === "subsidy");
});

const filteredApplications = computed(() => {
  if (activeTabKey.value === "all") {
    return applicationList;
  } else if (activeTabKey.value === "internship") {
    return internshipApplications.value;
  } else if (activeTabKey.value === "leave") {
    return leaveApplications.value;
  } else if (activeTabKey.value === "subsidy") {
    return subsidyApplications.value;
  }
  return [];
});

// 初始化時獲取申請列表
onMounted(async () => {
  try {
    await getApplicationList();
  } catch (err) {
    message.error("獲取申請列表失敗：" + (err.message || "未知錯誤"));
  }
});
</script>

<style scoped>
.u-p-4 {
  padding: 1rem;
}
.u-w-full {
  width: 100%;
}
.u-bg-white {
  background-color: white;
}
.u-rounded-lg {
  border-radius: 0.5rem;
}
.u-p-6 {
  padding: 1.5rem;
}
.u-shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.u-text-2xl {
  font-size: 1.5rem;
}
.u-font-bold {
  font-weight: bold;
}
.u-mb-6 {
  margin-bottom: 1.5rem;
}
</style>
