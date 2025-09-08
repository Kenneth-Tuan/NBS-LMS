<script setup>
import { ref, computed } from "vue";
import { message } from "ant-design-vue";
import dayjs from "dayjs";

import { useUserStore } from "@/stores/user";
import { useApplicationStore } from "@/stores/application";
import { ApplicationStatus, UserRole } from "@/enums/appEnums";
import {
  SUBSIDY_TYPE,
  APPLICATION_TYPE_COLOR,
  APPLICATION_TYPE_TEXT,
  APPLICATION_STATUS_COLOR,
  APPLICATION_STATUS_TEXT,
} from "@/constant/application.constant";
import AttachmentColumn from "./AttachmentColumn.vue";

const { userProfile } = useUserStore();
const applicationStore = useApplicationStore();
const { getApplicationDetail, reviewApplication } = applicationStore;

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

const emits = defineEmits(["afterReview"]);

// 表格欄位定義
const columns = [
  {
    title: "申請編號",
    dataIndex: "applicant_id",
    key: "applicant_id",
    width: "150px",
    roles: [UserRole.Creator],
  },
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
    roles: [
      UserRole.Creator,
      UserRole.Admin,
      UserRole.Manager,
      UserRole.Teacher,
    ],
  },
];

const filterColumns = computed(() => {
  return columns.filter((column) => {
    if (!column.roles) return true;
    return column.roles.includes(userProfile.userRole);
  });
});

// 詳細資訊相關
const detailVisible = ref(false);
const currentRecord = ref(null);

// 顯示詳細資訊
const showDetail = async (record) => {
  try {
    const applicationDetail = await getApplicationDetail(
      record.application_id,
      record.type
    );
    currentRecord.value = applicationDetail;
    currentRecord.value.type = record.type;
    detailVisible.value = true;
  } catch (error) {
    console.error("獲取申請詳細資訊失敗:", error);
    message.error("獲取申請詳細資訊失敗，請重試: " + error.message);
  }
};

// 審核相關狀態
const reviewResult = ref(ApplicationStatus.Approved);
const reviewComment = ref("");

// 提交審核
const submitReview = async () => {
  if (!reviewComment.value.trim()) {
    message.error("請輸入審核意見");
    return;
  }

  try {
    // 準備審核數據
    const reviewData = {
      action: reviewResult.value,
      note: reviewComment.value,
    };

    // 使用 store 中的方法更新申請狀態
    await reviewApplication(
      currentRecord.value.base.application_id,
      currentRecord.value.type,
      reviewData
    );

    message.success(
      `申請 ${currentRecord.value.base.application_id} 已${
        reviewResult.value === ApplicationStatus.Approved ? "通過" : "退回"
      }`
    );
    emits("afterReview");

    // 關閉對話框
    detailVisible.value = false;

    // 重置審核表單
    reviewResult.value = ApplicationStatus.Approved;
    reviewComment.value = "";
  } catch (error) {
    console.error("更新申請狀態失敗:", error.message);
  }
};

// 取消審核
const cancelReview = () => {
  reviewResult.value = ApplicationStatus.Approved;
  reviewComment.value = "";
  detailVisible.value = false;
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
      :columns="filterColumns"
      rowKey="application_id"
      :pagination="{ pageSize: 30 }"
    >
      <!-- 申請編號列 -->
      <template #bodyCell="{ column, record }">
        <!-- 申請狀態 -->
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="APPLICATION_STATUS_COLOR[record.status]">
            {{ APPLICATION_STATUS_TEXT[record.status] }}
          </a-tag>
        </template>

        <!-- 申請類型 -->
        <template v-if="column.dataIndex === 'type'">
          <a-tag :color="APPLICATION_TYPE_COLOR[record.type]">
            {{ APPLICATION_TYPE_TEXT[record.type] }}
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
      width="850px"
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
            <a-tag :color="APPLICATION_TYPE_COLOR[currentRecord.type]">
              {{ APPLICATION_TYPE_TEXT[currentRecord.type] }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="申請日期">{{
            dateFormatter(currentRecord?.base?.application_date)
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
            <a-descriptions-item label="請假課程" :span="2">{{
              currentRecord?.info?.course_name
            }}</a-descriptions-item>
            <a-descriptions-item label="請假開始日期">{{
              dateFormatter(currentRecord?.info?.leave_start_date)
            }}</a-descriptions-item>
            <a-descriptions-item label="請假結束日期">{{
              dateFormatter(currentRecord?.info?.leave_end_date)
            }}</a-descriptions-item>
            <a-descriptions-item label="請假原因" :span="2">{{
              currentRecord?.info?.leave_reason
            }}</a-descriptions-item>
            <a-descriptions-item label="相關附件" :span="2">
              <attachment-column
                :attachments="currentRecord?.info?.attachments"
              />
            </a-descriptions-item>
          </template>

          <!-- 補助申請特定欄位 -->
          <template v-if="currentRecord.type === 'subsidy'">
            <a-descriptions-item label="補助類型" :span="2">{{
              SUBSIDY_TYPE[currentRecord.info.subsidy_type]
            }}</a-descriptions-item>
            <a-descriptions-item label="相關附件" :span="2">
              <attachment-column
                :attachments="currentRecord?.info?.attachments"
              />
            </a-descriptions-item>
          </template>

          <!-- 其他申請特定欄位 -->
          <template v-if="currentRecord.type === 'other'">
            <a-descriptions-item label="相關附件" :span="2">
              <attachment-column
                :attachments="currentRecord?.info?.attachments"
              />
            </a-descriptions-item>
          </template>
        </a-descriptions>

        <!-- 審核狀況區塊 - 統一顯示所有審核相關資訊 -->
        <div v-if="currentRecord" class="review-section">
          <a-divider>審核狀況</a-divider>

          <a-descriptions
            bordered
            :column="2"
            class="u-border u-border-[#89c4d6] u-rounded-b-lg"
          >
            <a-descriptions-item label="申請狀態">
              <a-tag
                :color="APPLICATION_STATUS_COLOR[currentRecord?.base?.status]"
              >
                {{ APPLICATION_STATUS_TEXT[currentRecord?.base?.status] }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="審核日期">{{
              dateFormatter(currentRecord?.base?.review_date) || "尚未審核"
            }}</a-descriptions-item>
            <a-descriptions-item label="審核人員" :span="2">{{
              currentRecord?.base?.reviewer_name || "尚未審核"
            }}</a-descriptions-item>
            <a-descriptions-item label="審核結果" :span="2">{{
              currentRecord?.base?.reviewer_note || "尚未審核"
            }}</a-descriptions-item>

            <!-- 審核動作區域 - 僅對待審核申請且非學生用戶顯示 -->
            <template
              v-if="
                currentRecord?.base?.status === ApplicationStatus.Pending &&
                userProfile.userRole !== UserRole.Student
              "
            >
              <a-descriptions-item label="審核結果" :span="2">
                <a-radio-group v-model:value="reviewResult">
                  <a-radio :value="ApplicationStatus.Approved">同意</a-radio>
                  <a-radio :value="ApplicationStatus.Rejected">退回</a-radio>
                </a-radio-group>
              </a-descriptions-item>

              <a-descriptions-item label="審核意見" :span="2">
                <a-textarea
                  v-model:value="reviewComment"
                  placeholder="請輸入審核意見"
                  :rows="4"
                />
              </a-descriptions-item>
            </template>
          </a-descriptions>

          <!-- 審核動作按鈕 - 僅對待審核申請且非學生用戶顯示 -->
          <div
            v-if="
              currentRecord?.base?.status === ApplicationStatus.Pending &&
              userProfile.userRole !== UserRole.Student
            "
            class="u-flex u-justify-center u-gap-4 u-mt-4 u-mb-4"
          >
            <a-button @click="cancelReview">取消</a-button>
            <a-button type="primary" @click="submitReview">確認</a-button>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped></style>
