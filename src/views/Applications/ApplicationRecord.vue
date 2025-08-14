

<script setup>
import { ref, computed, onMounted, unref } from "vue";

import { storeToRefs } from "pinia";
import { useApplicationStore } from "@/stores/application";
import { message } from "ant-design-vue";
import ApplicationList from "./components/ApplicationList.vue";
import { ApplicationType } from "@/enums/appEnums";

const applicationStore = useApplicationStore();
const { applicationList, loading } = storeToRefs(applicationStore)
const {  getApplicationList } = applicationStore;

// 當前激活的標籤頁
const activeTabKey = ref("all");

// 根據類型過濾申請列表
const internshipApplications = computed(() => {
  return unref(applicationList).filter((item) => item.type === ApplicationType.Internship);
});

const leaveApplications = computed(() => {
  return unref(applicationList).filter((item) => item.type === ApplicationType.Leave);
});

const subsidyApplications = computed(() => {
  return unref(applicationList).filter((item) => item.type === ApplicationType.Subsidy);
});

const othersApplications = computed(() => {
  return unref(applicationList).filter((item) => item.type === ApplicationType.Others);
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
onMounted (async () => {
  try {
    await getApplicationList();
  } catch (err) {
    message.error("獲取申請列表失敗：" + (err.message || "未知錯誤"));
  }
});
</script>

<template>
  <div class="u-p-1rem u-w-100%">
    <div class="u-bg-white u-rounded-0.5rem u-p-1.5rem u-shadow-md">
      <h1 class="u-text-1.5rem u-fw600 u-mb-1.5rem u-c-blue">申請紀錄</h1>

      <a-spin :spinning="loading">
        <a-tabs v-model:activeKey="activeTabKey">
          <a-tab-pane key="all" tab="全部申請">
            <application-list :data="filteredApplications" @afterReview="getApplicationList" />
          </a-tab-pane>
          <a-tab-pane key="internship" tab="實習申請">
            <application-list :data="internshipApplications" @afterReview="getApplicationList" />
          </a-tab-pane>
          <a-tab-pane key="leave" tab="請假申請">
            <application-list :data="leaveApplications" @afterReview="getApplicationList" />
          </a-tab-pane>
          <a-tab-pane key="subsidy" tab="補助申請">
            <application-list :data="subsidyApplications" @afterReview="getApplicationList" />
          </a-tab-pane>
          <a-tab-pane key="others" tab="其他申請">
            <application-list :data="othersApplications" @afterReview="getApplicationList" />
          </a-tab-pane>
        </a-tabs>
      </a-spin>
    </div>
  </div>
</template>


<style scoped>
.u-shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
