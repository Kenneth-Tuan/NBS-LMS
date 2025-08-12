<script setup>
import { ref } from "vue";
import { message } from "ant-design-vue";
import dayjs from "dayjs";

import { useUserStore } from "@/stores/user";
import { useApplicationStore } from "@/stores/application";
import { ApplicationStatus, ApplicationType } from "@/enums/appEnums";

const { userProfile } = useUserStore();
const applicationStore = useApplicationStore();
const { getApplicationDetail } = applicationStore;

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

// 審核相關狀態
const reviewResult = ref("approve");
const reviewComment = ref("");

// 提交審核
const submitReview = async () => {
  if (!reviewComment.value.trim()) {
    message.error("請輸入審核意見");
    return;
  }

  try {
    // 更新狀態
    const newStatus =
      reviewResult.value === "approve"
        ? ApplicationStatus.Approved
        : ApplicationStatus.Rejected;

    // 準備審核數據
    const reviewData = {
      reviewDate: new Date().toISOString().split("T")[0].replace(/-/g, "/"),
      reviewer: userProfile.userName,
      reviewComment: reviewComment.value,
    };

    // 使用 store 中的方法更新申請狀態
    await applicationStore.updateApplicationStatus(
      currentRecord.value.id,
      newStatus,
      reviewData
    );

    message.success(
      `申請 ${currentRecord.value.id} 已${
        reviewResult.value === "approve" ? "通過" : "退回"
      }`
    );

    // 關閉對話框
    detailVisible.value = false;

    // 重置審核表單
    reviewResult.value = "approve";
    reviewComment.value = "";
  } catch (error) {
    console.error("更新申請狀態失敗:", error);
    message.error("更新申請狀態失敗，請重試: " + error.message);
  }
};

// 取消審核
const cancelReview = () => {
  reviewResult.value = "approve";
  reviewComment.value = "";
  detailVisible.value = false;
};


// 表格欄位定義
const columns = [
  // {
  //   title: "申請編號",
  //   dataIndex: "applicant_id",
  //   key: "applicant_id",
  //   width: "150px",
  // },
  {
    title: "申請人",
    dataIndex: "applicant_name",
    key: "applicant_name",
    width: "100px",
  },
  {
    title: "申請類型",
    dataIndex: "type",
    key: "type",
    width: "120px",
  },
  {
    title: "申請日期",
    dataIndex: "date",
    key: "date",
    width: "120px",
    customRender: (record) => {
      return dayjs(record.value).format("YYYY-MM-DD");
    },
  },
  {
    title: "狀態",
    dataIndex: "status",
    key: "status",
    width: "100px",
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    width: "80px",
  },
];

// 詳細資訊相關
const detailVisible = ref(false);
const currentRecord = ref(null);

// 顯示詳細資訊
const showDetail = async (record) => {

  try {
    const applicationDetail = await getApplicationDetail(record.application_id, record.type);
    console.log("applicationDetail", applicationDetail);
    currentRecord.value = applicationDetail;
    currentRecord.value.type = record.type;
    detailVisible.value = true;
  } catch (error) {
    console.error("獲取申請詳細資訊失敗:", error);
    message.error("獲取申請詳細資訊失敗，請重試: " + error.message);
  }
};

// 狀態相關輔助函數
const getStatusText = (status) => {
  switch (status) {
    case ApplicationStatus.Pending:
      return "待審核";
    case ApplicationStatus.Approved:
      return "已通過";
    case ApplicationStatus.Rejected:
      return "已駁回";
    default:
      return "未知狀態";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case ApplicationStatus.Pending:
      return "blue";
    case ApplicationStatus.Approved:
      return "green";
    case ApplicationStatus.Rejected:
      return "red";
    default:
      return "gray";
  }
};

// 類型相關輔助函數
const getTypeText = (type) => {
  switch (type) {
    case ApplicationType.Internship:
      return "實習申請";
    case ApplicationType.Leave:
      return "請假申請";
    case ApplicationType.Subsidy:
      return "補助申請";
    case ApplicationType.Other:
      return "其他申請";
    default:
      return "未知類型";
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case ApplicationType.Internship:
      return "cyan";
    case ApplicationType.Leave:
      return "purple";
    case ApplicationType.Subsidy:
      return "orange";
    case ApplicationType.Other:
      return "pink";
    default:
      return "gray";
  }
};

// 補助類型輔助函數
const getSubsidyTypeText = (type) => {
  switch (type) {
    case "type1":
      return "學費補助";
    case "type2":
      return "住宿補助";
    case "type3":
      return "交通補助";
    case "type4":
      return "其他補助";
    default:
      return "未知類型";
  }
};

const dateFormatter = (date) => {
  if (!date) return "尚未審核";
  return dayjs(date).format("YYYY-MM-DD");
};
</script>

<template>
  <div class="u-mt-1rem">
    <a-empty v-if="!data || data.length === 0" description="暫無申請記錄" />

    <a-table
      v-else
      :dataSource="data"
      :columns="columns"
      rowKey="id"
      :pagination="{ pageSize: 10 }"
    >
      <!-- 申請編號列 -->
      <template #bodyCell="{ column, record }">
        <!-- 申請狀態 -->
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>

        <!-- 申請類型 -->
        <template v-if="column.dataIndex === 'type'">
          <a-tag :color="getTypeColor(record.type)">
            {{ getTypeText(record.type) }}
          </a-tag>
        </template>

        <!-- 詳細資訊 -->
        <template v-if="column.dataIndex === 'action'">
          <a-button type="link" @click="showDetail(record)">詳細</a-button>
        </template>
      </template>
    </a-table>

    <!-- 詳細資訊對話框 -->
    <a-modal
      v-model:open="detailVisible"
      title="申請詳情"
      width="700px"
      :footer="null"
    >
      <div v-if="currentRecord">
        <a-descriptions bordered :column="2">
          <a-descriptions-item label="申請編號" :span="2">{{
            currentRecord?.base?.application_id
          }}</a-descriptions-item>
          <a-descriptions-item label="申請者">{{
            currentRecord?.base?.applicant_name
          }}</a-descriptions-item>
          <a-descriptions-item label="申請類型">
            <a-tag :color="getTypeColor(currentRecord.type)">
              {{ getTypeText(currentRecord.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="申請狀態">
            <a-tag :color="getStatusColor(currentRecord?.base?.status)">
              {{ getStatusText(currentRecord?.base?.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="申請日期">{{
            dateFormatter(currentRecord?.base?.application_date)
          }}</a-descriptions-item>
          <a-descriptions-item label="審核日期">{{
            dateFormatter(currentRecord?.base?.review_date) || "尚未審核"
          }}</a-descriptions-item>
          <a-descriptions-item label="審核人員">{{
            currentRecord?.base?.reviewer_name || "尚未審核"
          }}</a-descriptions-item>

          <!-- 實習申請特定欄位 -->
          <template v-if="currentRecord.type === 'internship'">
            <a-descriptions-item label="實習機構" :span="2">{{
              currentRecord?.info?.organization_name
            }}</a-descriptions-item>
            <a-descriptions-item label="實習開始日期">{{
              dateFormatter(currentRecord?.info?.internship_start_date)
            }}</a-descriptions-item>
            <a-descriptions-item label="實習結束日期">{{
              dateFormatter(currentRecord?.info?.internship_end_date)
            }}</a-descriptions-item>
            <a-descriptions-item label="實習時數">{{
              currentRecord?.info?.internship_hours
            }}</a-descriptions-item>
            <a-descriptions-item label="實習概述" :span="2">{{
              currentRecord?.info?.internship_description
            }}</a-descriptions-item>
          </template>

          <!-- 請假申請特定欄位 -->
          <template v-if="currentRecord.type === 'leave'">
            <a-descriptions-item label="請假開始日期">{{
              dateFormatter(currentRecord?.info?.leave_start_date)
            }}</a-descriptions-item>
            <a-descriptions-item label="請假結束日期">{{
              dateFormatter(currentRecord?.info?.leave_end_date)
            }}</a-descriptions-item>
            <a-descriptions-item label="請假原因" :span="2">{{
              currentRecord?.info?.leave_reason
            }}</a-descriptions-item>
            <a-descriptions-item label="相關附件" :span="2">{{
              currentRecord?.info?.attachments || "無"
            }}</a-descriptions-item>
          </template>

          <!-- 補助申請特定欄位 -->
          <template v-if="currentRecord.type === 'subsidy'">
            <a-descriptions-item label="補助類型">{{
              getSubsidyTypeText(currentRecord.info.subsidy_type)
            }}</a-descriptions-item>
            <a-descriptions-item label="相關附件" :span="2">{{
              currentRecord.info.attachments || "無"
            }}</a-descriptions-item>
          </template>
        </a-descriptions>

        <!-- 審核狀況區塊 - 僅對待審核的申請顯示 -->
        <div
          v-if="
            currentRecord && currentRecord?.base?.status === ApplicationStatus.Pending
          "
          class="review-section"
        >
          <a-divider>審核狀況</a-divider>

          <a-descriptions
            bordered
            :column="2"
            class="u-border u-border-[#89c4d6] u-rounded-b-lg"
          >
            <a-descriptions-item label="狀態">
              <a-tag :color="getStatusColor(currentRecord?.base?.status)">
                {{ getStatusText(currentRecord?.base?.status) }}
              </a-tag>
            </a-descriptions-item>

            <a-descriptions-item label="審核結果" :span="2">
              <a-radio-group v-model:value="reviewResult">
                <a-radio value="approve">同意</a-radio>
                <a-radio value="reject">退回</a-radio>
              </a-radio-group>
            </a-descriptions-item>

            <a-descriptions-item label="意見" :span="2">
              <a-textarea
                v-model:value="reviewComment"
                placeholder="請輸入"
                :rows="4"
              />
            </a-descriptions-item>
          </a-descriptions>

          <div class="u-flex u-justify-center u-gap-4 u-mt-4 u-mb-4">
            <a-button @click="cancelReview">取消</a-button>
            <a-button type="primary" @click="submitReview">確認</a-button>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
</style>
