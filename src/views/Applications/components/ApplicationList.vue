<template>
  <div class="application-list">
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
      :title="`申請詳細 - ${currentRecord?.id || ''}`"
      width="700px"
      :footer="null"
    >
      <div v-if="currentRecord">
        <a-descriptions bordered :column="2">
          <a-descriptions-item label="申請編號" :span="2">{{
            currentRecord.id
          }}</a-descriptions-item>
          <a-descriptions-item label="申請者">{{
            currentRecord.name
          }}</a-descriptions-item>
          <a-descriptions-item label="學號">{{
            currentRecord.studentId
          }}</a-descriptions-item>
          <a-descriptions-item label="申請類型">
            <a-tag :color="getTypeColor(currentRecord.type)">
              {{ getTypeText(currentRecord.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="申請狀態">
            <a-tag :color="getStatusColor(currentRecord.status)">
              {{ getStatusText(currentRecord.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="申請日期">{{
            currentRecord.applicationDate
          }}</a-descriptions-item>
          <a-descriptions-item label="審核日期">{{
            currentRecord.reviewDate || "尚未審核"
          }}</a-descriptions-item>
          <a-descriptions-item label="審核人員">{{
            currentRecord.reviewer || "尚未審核"
          }}</a-descriptions-item>

          <!-- 實習申請特定欄位 -->
          <template v-if="currentRecord.type === 'internship'">
            <a-descriptions-item label="實習機構" :span="2">{{
              currentRecord.internshipProviderName
            }}</a-descriptions-item>
            <a-descriptions-item label="實習開始日期">{{
              currentRecord.internshipStartDate
            }}</a-descriptions-item>
            <a-descriptions-item label="實習結束日期">{{
              currentRecord.internshipEndDate
            }}</a-descriptions-item>
            <a-descriptions-item label="實習時數">{{
              currentRecord.internshipHours
            }}</a-descriptions-item>
            <a-descriptions-item label="實習概述" :span="2">{{
              currentRecord.internshipOverview
            }}</a-descriptions-item>
          </template>

          <!-- 請假申請特定欄位 -->
          <template v-if="currentRecord.type === 'leave'">
            <a-descriptions-item label="請假開始日期">{{
              currentRecord.leaveStartDate
            }}</a-descriptions-item>
            <a-descriptions-item label="請假結束日期">{{
              currentRecord.leaveEndDate
            }}</a-descriptions-item>
            <a-descriptions-item label="請假原因" :span="2">{{
              currentRecord.reasonForLeave
            }}</a-descriptions-item>
            <a-descriptions-item label="相關附件" :span="2">{{
              currentRecord.supplementaryMaterials || "無"
            }}</a-descriptions-item>
          </template>

          <!-- 補助申請特定欄位 -->
          <template v-if="currentRecord.type === 'subsidy'">
            <a-descriptions-item label="補助類型">{{
              getSubsidyTypeText(currentRecord.subsidyType)
            }}</a-descriptions-item>
            <a-descriptions-item label="補助金額"
              >NT$ {{ currentRecord.subsidyAmount }}</a-descriptions-item
            >
            <a-descriptions-item label="收據" :span="2">{{
              currentRecord.receipts || "無"
            }}</a-descriptions-item>
            <a-descriptions-item label="證明文件" :span="2">{{
              currentRecord.supportingDocuments || "無"
            }}</a-descriptions-item>
            <a-descriptions-item label="相關附件" :span="2">{{
              currentRecord.supplementaryMaterials || "無"
            }}</a-descriptions-item>
          </template>
        </a-descriptions>

        <!-- 審核狀況區塊 - 僅對待審核的申請顯示 -->
        <div
          v-if="
            currentRecord && currentRecord.status === APPLICATION_STATUS.PENDING
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
              <a-tag :color="getStatusColor(currentRecord.status)">
                {{ getStatusText(currentRecord.status) }}
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

<script setup>
import { ref } from "vue";
import { APPLICATION_STATUS } from "@/mocks/domains/applications/data";
import { message } from "ant-design-vue";
import { storeToRefs } from "pinia";

import { useUserStore } from "@/stores/user";
import { useApplicationStore } from "@/stores/application";

const { userProfile } = useUserStore();
const applicationStore = useApplicationStore();
const { applicationList } = storeToRefs(applicationStore);

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
        ? APPLICATION_STATUS.APPROVED
        : APPLICATION_STATUS.REJECTED;

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

// 接收數據
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

// 表格欄位定義
const columns = [
  {
    title: "申請編號",
    dataIndex: "id",
    key: "id",
    width: "150px",
  },
  {
    title: "申請者",
    dataIndex: "name",
    key: "name",
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
    dataIndex: "applicationDate",
    key: "applicationDate",
    width: "120px",
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
const showDetail = (record) => {
  currentRecord.value = record;
  detailVisible.value = true;
};

// 狀態相關輔助函數
const getStatusText = (status) => {
  switch (status) {
    case APPLICATION_STATUS.PENDING:
      return "待審核";
    case APPLICATION_STATUS.APPROVED:
      return "已通過";
    case APPLICATION_STATUS.REJECTED:
      return "已駁回";
    default:
      return "未知狀態";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case APPLICATION_STATUS.PENDING:
      return "blue";
    case APPLICATION_STATUS.APPROVED:
      return "green";
    case APPLICATION_STATUS.REJECTED:
      return "red";
    default:
      return "gray";
  }
};

// 類型相關輔助函數
const getTypeText = (type) => {
  switch (type) {
    case "internship":
      return "實習申請";
    case "leave":
      return "請假申請";
    case "subsidy":
      return "補助申請";
    default:
      return "未知類型";
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case "internship":
      return "cyan";
    case "leave":
      return "purple";
    case "subsidy":
      return "orange";
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
</script>

<style scoped>
.application-list {
  margin-top: 1rem;
}
</style>
