<template>
  <div class="notifications-container u-flex u-h100% u-bg-white u-w-full">
    <!-- 左側：通知列表 -->
    <div
      class="notifications-list u-w-1/3 u-border-r u-bg-[#f5f5f5] u-p-4 u-flex u-flex-col"
    >
      <div class="u-mb-4">
        <a-input-search
          v-model:value="searchQuery"
          placeholder="搜尋通知（名稱/類型/內容）"
          enter-button
          @search="handleSearch"
        />
        <div class="u-flex u-gap-2 u-mt-2">
          <a-select
            v-model:value="filterType"
            placeholder="通知類型"
            style="width: 120px"
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="review">審核通知</a-select-option>
            <a-select-option value="course">課程通知</a-select-option>
            <a-select-option value="system">系統通知</a-select-option>
          </a-select>
          <a-range-picker v-model:value="dateRange" style="width: 220px" />
        </div>
      </div>
      <a-list
        :data-source="filteredNotifications"
        class="u-flex-1 u-overflow-y-auto"
        bordered
      >
        <template #renderItem="{ item }">
          <a-list-item
            :class="[
              'u-cursor-pointer',
              !item.read ? 'u-bg-yellow-50' : '',
              selectedNotification && selectedNotification.id === item.id
                ? 'u-bg-blue-50'
                : '',
            ]"
            @click="selectNotification(item)"
          >
            <div class="u-flex u-flex-col u-gap-1">
              <div class="u-flex u-items-center u-gap-2">
                <span class="u-font-bold">{{ item.title }}</span>
                <a-badge v-if="!item.read" color="red" dot />
              </div>
              <span class="u-text-xs u-cool-gray">{{ item.date }}</span>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <!-- 右側：通知詳情 -->
    <div class="notifications-detail u-flex-1 u-p-8 u-bg-white">
      <template v-if="selectedNotification">
        <div class="u-mb-4 u-flex u-items-center u-gap-2">
          <span class="u-font-bold u-text-lg">{{
            selectedNotification.title
          }}</span>
          <a-tag :color="typeColor(selectedNotification.type)">
            {{ typeLabel(selectedNotification.type) }}
          </a-tag>
          <span class="u-text-xs u-cool-gray">{{
            selectedNotification.date
          }}</span>
        </div>
        <div class="u-mb-6 u-text-base u-whitespace-pre-line u-text-gray-600">
          {{ selectedNotification.content }}
        </div>
        <template v-if="selectedNotification.type === 'review'">
          <a-form layout="vertical" class="u-mb-4">
            <a-form-item label="審核結果">
              <a-radio-group v-model:value="reviewResult">
                <a-radio value="approved">同意</a-radio>
                <a-radio value="rejected">不同意</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="審核意見">
              <a-textarea
                v-model:value="reviewComment"
                rows="3"
                placeholder="請填寫審核意見"
              />
            </a-form-item>
          </a-form>
          <div class="u-flex u-gap-4">
            <a-button @click="handleBack">返回</a-button>
            <a-button
              type="primary"
              :disabled="!reviewResult"
              @click="handleReview"
              >審核</a-button
            >
          </div>
        </template>
        <template v-else>
          <div class="u-flex u-gap-4">
            <a-button type="primary" @click="handleConfirm">確認</a-button>
          </div>
        </template>
      </template>
      <template v-else>
        <div class="u-text-gray-400 u-text-center u-mt-20">
          請從左側選擇一則通知以查看詳情
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { message } from "ant-design-vue";

// 假資料，後續可接 API
const notifications = ref([
  {
    id: 1,
    title: "請假申請審核通知",
    content: "學生 王小明 提出請假申請，請您進行審核。",
    type: "review",
    date: "2025-02-24 10:00",
    read: false,
  },
  {
    id: 2,
    title: "實習申請審核通知",
    content: "學生 李小華 提出實習申請，請您進行審核。",
    type: "review",
    date: "2025-02-23 15:30",
    read: true,
  },
  {
    id: 3,
    title: "課程異動通知",
    content: "您的「AI導論」課程時間已更改，請留意最新課表。",
    type: "course",
    date: "2025-02-22 09:00",
    read: false,
  },
  {
    id: 4,
    title: "系統維護通知",
    content: "系統將於 2/25 晚間 10:00-12:00 進行維護，請提前儲存資料。",
    type: "system",
    date: "2025-02-21 18:00",
    read: true,
  },
]);

const searchQuery = ref("");
const filterType = ref("all");
const dateRange = ref([]);
const selectedNotification = ref(null);
const reviewResult = ref("");
const reviewComment = ref("");

const typeLabel = (type) => {
  switch (type) {
    case "review":
      return "審核通知";
    case "course":
      return "課程通知";
    case "system":
      return "系統通知";
    default:
      return "通知";
  }
};
const typeColor = (type) => {
  switch (type) {
    case "review":
      return "orange";
    case "course":
      return "blue";
    case "system":
      return "purple";
    default:
      return "default";
  }
};

const filteredNotifications = computed(() => {
  let list = notifications.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }
  if (filterType.value !== "all") {
    list = list.filter((n) => n.type === filterType.value);
  }
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value;
    list = list.filter((n) => {
      const d = new Date(n.date);
      return d >= new Date(start) && d <= new Date(end);
    });
  }
  // 按時間倒序
  return list.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
});

function selectNotification(item) {
  selectedNotification.value = item;
  // 點擊後設為已讀
  item.read = true;
}

function handleSearch() {
  // 目前僅觸發重新計算
}
function handleBack() {
  selectedNotification.value = null;
  reviewResult.value = "";
  reviewComment.value = "";
}
function handleReview() {
  message.success("審核結果已提交！");
  handleBack();
}
function handleConfirm() {
  message.success("已確認通知！");
  handleBack();
}
</script>

<style scoped>
.notifications-container {
  min-height: 600px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.notifications-list {
  min-width: 320px;
  max-width: 65%;
  border-right: 1px solid #e5e7eb;
}
.notifications-detail {
  min-width: 0;
}
</style>
