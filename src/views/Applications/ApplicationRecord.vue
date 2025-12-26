<script setup>
import { ref, computed, onMounted, unref } from "vue";

import { storeToRefs } from "pinia";
import { useApplicationStore } from "@/stores/application";
import { message } from "ant-design-vue";
import ApplicationList from "./components/ApplicationList.vue";
import { ApplicationType, RouterName } from "@/enums/appEnums";
import { useNotificationStore } from "@/stores/notificationStore";

const applicationStore = useApplicationStore();
const { applicationList, loading } = storeToRefs(applicationStore);
const { getApplicationList } = applicationStore;
const notificationStore = useNotificationStore();
const { notifiedRouterNames } = storeToRefs(notificationStore);

// 當前激活的標籤頁
const activeTabKey = ref("all");

// 根據類型過濾申請列表
const internshipApplications = computed(() => {
  return unref(applicationList).filter(
    (item) => item.type === ApplicationType.Internship
  );
});

const leaveApplications = computed(() => {
  return unref(applicationList).filter(
    (item) => item.type === ApplicationType.Leave
  );
});

const subsidyApplications = computed(() => {
  return unref(applicationList).filter(
    (item) => item.type === ApplicationType.Subsidy
  );
});

const othersApplications = computed(() => {
  return unref(applicationList).filter(
    (item) => item.type === ApplicationType.Others
  );
});

const filteredApplications = computed(() => {
  if (activeTabKey.value === "all") {
    return unref(applicationList);
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

const isNotified = (routerName) => {
  return unref(notifiedRouterNames).includes(routerName);
};
</script>

<template>
  <div class="u-w-full u-bg-white u-rounded-0.5rem u-p-1.5rem u-shadow-md">
    <h1 class="u-text-1.5rem u-fw600 u-mb-1.5rem u-c-blue">申請紀錄</h1>

    <a-spin :spinning="loading">
      <a-tabs v-model:activeKey="activeTabKey">
        <a-tab-pane key="all">
          <template #tab>
            <span>
              全部申請
              <a-badge :dot="unref(notifiedRouterNames).length > 0" />
            </span>
          </template>

          <application-list
            :data="filteredApplications"
            @afterReview="getApplicationList"
          />
        </a-tab-pane>
        <a-tab-pane key="internship">
          <template #tab>
            <span>
              實習申請
              <a-badge :dot="isNotified(RouterName.InternshipApplication)" />
            </span>
          </template>
          <application-list
            :data="internshipApplications"
            @afterReview="getApplicationList"
          />
        </a-tab-pane>
        <a-tab-pane key="leave">
          <template #tab>
            <span>
              請假申請
              <a-badge :dot="isNotified(RouterName.LeaveApplication)" />
            </span>
          </template>
          <application-list
            :data="leaveApplications"
            @afterReview="getApplicationList"
          />
        </a-tab-pane>
        <a-tab-pane key="subsidy">
          <template #tab>
            <span>
              補助申請
              <a-badge :dot="isNotified(RouterName.SubsidyApplication)" />
            </span>
          </template>
          <application-list
            :data="subsidyApplications"
            @afterReview="getApplicationList"
          />
        </a-tab-pane>
        <a-tab-pane key="others">
          <template #tab>
            <span>
              其他申請
              <a-badge :dot="isNotified(RouterName.OthersApplication)" />
            </span>
          </template>
          <application-list
            :data="othersApplications"
            @afterReview="getApplicationList"
          />
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </div>
</template>

<style scoped>
.u-shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
