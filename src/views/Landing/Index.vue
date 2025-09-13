<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue"; // Import message for feedback

import {
  Divider,
  Input as AInput,
  Textarea as ATextarea,
  Button as AButton,
  Popconfirm as APopconfirm,
  DatePicker as ADatePicker,
  List as AList,
  ListItem as AListItem,
  ListItemMeta as AListItemMeta,
  Modal as AModal,
  Space as ASpace,
} from "ant-design-vue"; // Import needed components

import { useUserStore } from "@/stores/user"; // Import user store
import { UserRole } from "@/enums/appEnums"; // Import UserRole enum
import { announcementService } from "@/services/announcement.service";
import dayjs from "dayjs";

// --- Store and User Role ---
const userStore = useUserStore();
const { userProfile } = userStore; // No need for storeToRefs if just reading profile directly

const isAdmin = computed(
  () =>
    userProfile.userRole === UserRole.Admin ||
    userProfile.userRole === UserRole.Manager ||
    userProfile.userRole === UserRole.Creator
);

// --- Loading States ---
const isLoading = ref(false); // 整體載入狀態
const newsLoadingStates = reactive({}); // 新聞行的 loading 狀態
const isAnnouncementModalLoading = ref(false); // 公告 modal 的 loading 狀態
const isNoticeModalLoading = ref(false); // 注意事項 modal 的 loading 狀態
const announcementActionLoading = reactive({}); // 公告操作的 loading 狀態
const noticeActionLoading = reactive({}); // 注意事項操作的 loading 狀態

// --- News Modal States ---
const isNewsModalVisible = ref(false);
const newsModalMode = ref("add"); // 'add' or 'edit'
const isNewsModalLoading = ref(false);
const currentEditingNews = reactive({
  $id: null,
  date: "",
  content: "",
  publisher: "",
  announcementDateTime: null,
});

const newsModalTitle = computed(() =>
  newsModalMode.value === "add" ? "新增最新消息" : "編輯最新消息"
);

// --- Latest News Table Data and Logic ---
const baseColumns = [
  {
    title: "日期",
    dataIndex: "date",
    key: "date",
    width: "15%",
  },
  {
    title: "内容",
    dataIndex: "content",
    key: "content",
    width: "60%",
  },
  {
    title: "發佈單位",
    dataIndex: "publisher",
    key: "publisher",
    width: "15%",
  },
];

const operationColumn = {
  title: "操作",
  dataIndex: "operation",
  key: "operation",
  width: "10%",
};

// Make data source reactive
const newsDataSource = ref([]);

const computedColumns = computed(() => {
  return isAdmin.value ? [...baseColumns, operationColumn] : baseColumns;
});

// Load all announcements from API and filter by type
const loadAllAnnouncements = async () => {
  try {
    isLoading.value = true;
    const allAnnouncements = await announcementService.getAnnouncements();

    // Filter and map news
    const newsItems = allAnnouncements.filter((item) => item.type === "news");
    newsDataSource.value = newsItems.map((item) => ({
      key: item.$id,
      $id: item.$id,
      date: item.announcementDateTime
        ? dayjs(item.announcementDateTime).format("YYYY-MM-DD")
        : "",
      content: item.description || "",
      publisher: item.department || "",
      announcementDateTime: item.announcementDateTime,
      type: "news",
    }));

    // Filter and map announcements
    const announcements = allAnnouncements.filter(
      (item) => item.type === "announcement"
    );
    announcementDataSource.value = announcements.map((item) => ({
      key: item.$id,
      $id: item.$id,
      title: item.department || "未分類", // Use department as title for now
      contents: item.description
        ? item.description.split("\n").filter((line) => line.trim())
        : [],
      announcementDateTime: item.announcementDateTime,
      department: item.department,
      description: item.description,
      type: "announcement",
    }));

    // Filter and map notices
    const notices = allAnnouncements.filter((item) => item.type === "notice");
    noticeDataSource.value = notices.map((item) => ({
      key: item.$id,
      $id: item.$id,
      title: item.department || "未分類",
      contents: item.description
        ? item.description.split("\n").filter((line) => line.trim())
        : [],
      announcementDateTime: item.announcementDateTime,
      department: item.department,
      description: item.description,
      type: "notice",
    }));
  } catch (error) {
    console.error("Failed to load announcements:", error);
    message.error("載入公告失敗");
  } finally {
    isLoading.value = false;
  }
};

const deleteNewsRow = async (key) => {
  try {
    newsLoadingStates[key] = { deleting: true };
    const newsItem = newsDataSource.value.find((item) => item.key === key);
    if (newsItem) {
      await announcementService.deleteAnnouncement({ $id: newsItem.$id });
      await loadAllAnnouncements();
      message.success("刪除成功");
    }
  } catch (error) {
    console.error("Failed to delete news:", error);
    message.error("刪除失敗");
  } finally {
    delete newsLoadingStates[key];
  }
};

const showAddNewsModal = () => {
  newsModalMode.value = "add";
  currentEditingNews.$id = null;
  currentEditingNews.date = dayjs().format("YYYY-MM-DD");
  currentEditingNews.content = "";
  currentEditingNews.publisher = "";
  currentEditingNews.announcementDateTime = new Date().toISOString();
  isNewsModalVisible.value = true;
};

const showEditNewsModal = (item) => {
  newsModalMode.value = "edit";
  currentEditingNews.$id = item.$id;
  currentEditingNews.date = item.date;
  currentEditingNews.content = item.content;
  currentEditingNews.publisher = item.publisher;
  currentEditingNews.announcementDateTime = item.announcementDateTime;
  isNewsModalVisible.value = true;
};

const handleNewsModalOk = async () => {
  if (
    !currentEditingNews.date ||
    !currentEditingNews.content ||
    !currentEditingNews.publisher
  ) {
    message.error("請填寫所有必填欄位");
    return;
  }

  try {
    isNewsModalLoading.value = true;

    const announcementDateTime = currentEditingNews.date
      ? dayjs(currentEditingNews.date).toISOString()
      : new Date().toISOString();

    if (newsModalMode.value === "add") {
      await announcementService.createAnnouncement({
        announcementDateTime,
        description: currentEditingNews.content,
        department: currentEditingNews.publisher,
        type: "news",
      });
      message.success("新增消息成功");
    } else {
      await announcementService.updateAnnouncement({
        $id: currentEditingNews.$id,
        announcementDateTime,
        description: currentEditingNews.content,
        department: currentEditingNews.publisher,
        type: "news",
      });
      message.success("更新消息成功");
    }

    // Reload news after successful operation
    await loadAllAnnouncements();
    isNewsModalVisible.value = false;
  } catch (error) {
    console.error("Failed to save news:", error);
    message.error("儲存消息失敗");
  } finally {
    isNewsModalLoading.value = false;
  }
};

const handleNewsModalCancel = () => {
  isNewsModalVisible.value = false;
};

// --- Course Announcements List Data and Logic ---
const announcementDataSource = ref([]);
const isAnnouncementModalVisible = ref(false);
const modalMode = ref("add"); // 'add' or 'edit'
const currentEditingAnnouncement = reactive({
  $id: null,
  title: "",
  // Store contents as a single string for textarea editing
  contentsString: "",
  department: "",
  announcementDateTime: null,
});

const modalTitle = computed(() =>
  modalMode.value === "add" ? "新增課程公告" : "編輯課程公告"
);

const showAddAnnouncementModal = () => {
  modalMode.value = "add";
  currentEditingAnnouncement.$id = null;
  currentEditingAnnouncement.title = "";
  currentEditingAnnouncement.contentsString = "";
  currentEditingAnnouncement.department = userProfile.userName || "教務處";
  currentEditingAnnouncement.announcementDateTime = new Date().toISOString();
  isAnnouncementModalVisible.value = true;
};

const showEditAnnouncementModal = (item) => {
  modalMode.value = "edit";
  currentEditingAnnouncement.$id = item.$id;
  currentEditingAnnouncement.title = item.title;
  // Join array into a string for textarea
  currentEditingAnnouncement.contentsString = (item.contents || []).join("\n");
  currentEditingAnnouncement.department =
    item.department || userProfile.userName || "教務處";
  currentEditingAnnouncement.announcementDateTime =
    item.announcementDateTime || new Date().toISOString();
  isAnnouncementModalVisible.value = true;
};

const handleAnnouncementModalOk = async () => {
  if (
    !currentEditingAnnouncement.title ||
    !currentEditingAnnouncement.contentsString
  ) {
    message.error("請輸入標題和內容");
    return;
  }

  try {
    isAnnouncementModalLoading.value = true;
    if (modalMode.value === "add") {
      await announcementService.createAnnouncement({
        announcementDateTime: currentEditingAnnouncement.announcementDateTime,
        description: currentEditingAnnouncement.contentsString,
        department: currentEditingAnnouncement.title, // Using title as department
        type: "announcement",
      });
      message.success("新增公告成功");
    } else {
      await announcementService.updateAnnouncement({
        $id: currentEditingAnnouncement.$id,
        announcementDateTime: currentEditingAnnouncement.announcementDateTime,
        description: currentEditingAnnouncement.contentsString,
        department: currentEditingAnnouncement.title, // Using title as department
        type: "announcement",
      });
      message.success("更新公告成功");
    }

    // Reload announcements after successful operation
    await loadAllAnnouncements();
    isAnnouncementModalVisible.value = false;
  } catch (error) {
    console.error("Failed to save announcement:", error);
    message.error("儲存公告失敗");
  } finally {
    isAnnouncementModalLoading.value = false;
  }
};

const handleAnnouncementModalCancel = () => {
  isAnnouncementModalVisible.value = false;
};

const deleteAnnouncement = async (key) => {
  try {
    announcementActionLoading[key] = { deleting: true };
    const announcement = announcementDataSource.value.find(
      (item) => item.key === key
    );
    if (announcement) {
      await announcementService.deleteAnnouncement({ $id: announcement.$id });
      await loadAllAnnouncements();
      message.success("刪除公告成功");
    }
  } catch (error) {
    console.error("Failed to delete announcement:", error);
    message.error("刪除公告失敗");
  } finally {
    delete announcementActionLoading[key];
  }
};

// --- Notices List Data and Logic ---
const noticeDataSource = ref([]);
const isNoticeModalVisible = ref(false);
const noticeModalMode = ref("add"); // 'add' or 'edit'
const currentEditingNotice = reactive({
  $id: null,
  title: "",
  contentsString: "",
  department: "",
  announcementDateTime: null,
});

const noticeModalTitle = computed(() =>
  noticeModalMode.value === "add" ? "新增注意事項" : "編輯注意事項"
);

const showAddNoticeModal = () => {
  noticeModalMode.value = "add";
  currentEditingNotice.$id = null;
  currentEditingNotice.title = "";
  currentEditingNotice.contentsString = "";
  currentEditingNotice.department = userProfile.userName || "教務處";
  currentEditingNotice.announcementDateTime = new Date().toISOString();
  isNoticeModalVisible.value = true;
};

const showEditNoticeModal = (item) => {
  noticeModalMode.value = "edit";
  currentEditingNotice.$id = item.$id;
  currentEditingNotice.title = item.title;
  currentEditingNotice.contentsString = (item.contents || []).join("\n");
  currentEditingNotice.department =
    item.department || userProfile.userName || "教務處";
  currentEditingNotice.announcementDateTime =
    item.announcementDateTime || new Date().toISOString();
  isNoticeModalVisible.value = true;
};

const handleNoticeModalOk = async () => {
  if (!currentEditingNotice.title || !currentEditingNotice.contentsString) {
    message.error("請輸入標題和內容");
    return;
  }

  try {
    isNoticeModalLoading.value = true;
    if (noticeModalMode.value === "add") {
      await announcementService.createAnnouncement({
        announcementDateTime: currentEditingNotice.announcementDateTime,
        description: currentEditingNotice.contentsString,
        department: currentEditingNotice.title,
        type: "notice",
      });
      message.success("新增注意事項成功");
    } else {
      await announcementService.updateAnnouncement({
        $id: currentEditingNotice.$id,
        announcementDateTime: currentEditingNotice.announcementDateTime,
        description: currentEditingNotice.contentsString,
        department: currentEditingNotice.title,
        type: "notice",
      });
      message.success("更新注意事項成功");
    }

    await loadAllAnnouncements();
    isNoticeModalVisible.value = false;
  } catch (error) {
    console.error("Failed to save notice:", error);
    message.error("儲存注意事項失敗");
  } finally {
    isNoticeModalLoading.value = false;
  }
};

const handleNoticeModalCancel = () => {
  isNoticeModalVisible.value = false;
};

const deleteNotice = async (key) => {
  try {
    noticeActionLoading[key] = { deleting: true };
    const notice = noticeDataSource.value.find((item) => item.key === key);
    if (notice) {
      await announcementService.deleteAnnouncement({ $id: notice.$id });
      await loadAllAnnouncements();
      message.success("刪除注意事項成功");
    }
  } catch (error) {
    console.error("Failed to delete notice:", error);
    message.error("刪除注意事項失敗");
  } finally {
    delete noticeActionLoading[key];
  }
};

// --- Existing Logic ---
const otherColumns = [
  // Assuming these are for the other tables, rename if needed
  {
    title: "日期",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "内容",
    dataIndex: "content",
    key: "content",
  },
  {
    title: "發佈單位",
    dataIndex: "publisher",
    key: "publisher",
  },
];

onMounted(async () => {
  // Load all three types of announcements
  await loadAllAnnouncements();
});
</script>

<template>
  <div
    class="u-grid u-grid-cols-1 md:u-grid-cols-2 u-h100% u-w100% u-gap-2 md:u-gap-4 u-p2 md:u-p4 u-items-start"
  >
    <div
      class="u-p16px md:u-p24px u-col-span-1 md:u-col-span-2 u-bg-white u-w100% u-h100% u-shadow u-rounded-16px"
    >
      <div class="u-flex u-justify-between u-items-center u-mb12px md:u-mb16px">
        <h1 class="u-text-18px md:u-text-24px u-font-bold u-c-blue u-m0">
          {{ "最新消息" }}
        </h1>
        <a-button
          v-if="isAdmin"
          type="primary"
          @click="showAddNewsModal"
          size="small"
          :disabled="isLoading"
        >
          新增消息
        </a-button>
      </div>

      <Divider class="u-my8px" />

      <a-table
        :columns="computedColumns"
        :data-source="newsDataSource"
        :pagination="false"
        :loading="isLoading"
        rowKey="key"
        bordered
        :scroll="{ x: 600 }"
        size="small"
        class="u-text-14px md:u-text-16px"
      >
        <template #bodyCell="{ column, text, record }">
          <!-- Display cells for date, content, publisher -->
          <template
            v-if="['date', 'publisher', 'content'].includes(column.dataIndex)"
          >
            <div v-if="column.dataIndex === 'content'" v-html="text"></div>
            <template v-else>{{ text }}</template>
          </template>

          <!-- Operation column -->
          <template v-else-if="column.dataIndex === 'operation'">
            <div>
              <span class="u-flex u-gap-2">
                <a-button
                  type="link"
                  size="small"
                  @click="showEditNewsModal(record)"
                  :disabled="newsLoadingStates[record.key]?.deleting"
                >
                  編輯
                </a-button>
                <a-popconfirm
                  title="確定刪除?"
                  @confirm="deleteNewsRow(record.key)"
                  :disabled="newsLoadingStates[record.key]?.deleting"
                >
                  <a-button
                    type="link"
                    size="small"
                    class="u-ml-2"
                    :loading="newsLoadingStates[record.key]?.deleting"
                    :disabled="newsLoadingStates[record.key]?.deleting"
                  >
                    刪除
                  </a-button>
                </a-popconfirm>
              </span>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <div
      class="u-p16px md:u-p24px u-col-span-1 u-bg-white u-w100% u-shadow u-rounded-16px"
    >
      <div class="u-flex u-justify-between u-items-center u-mb-2">
        <h1 class="u-text-18px md:u-text-24px u-font-bold u-c-blue u-m0">
          {{ "課程公告" }}
        </h1>
        <a-button
          v-if="isAdmin"
          type="primary"
          @click="showAddAnnouncementModal"
          size="small"
          :disabled="isLoading"
        >
          新增公告
        </a-button>
      </div>
      <Divider class="u-my8px" />
      <a-list
        item-layout="vertical"
        :data-source="announcementDataSource"
        :loading="isLoading"
        rowKey="key"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                {{ item.title }}
              </template>
            </a-list-item-meta>
            <ul class="u-flex u-flex-col u-gap-8px md:u-gap-16px">
              <li
                v-for="(content, index) in item.contents"
                :key="`${item.key}-content-${index}`"
                v-html="content"
              ></li>
            </ul>
            <!-- Admin Actions -->
            <template v-if="isAdmin" #actions>
              <a-space>
                <a-button
                  type="link"
                  size="small"
                  @click="showEditAnnouncementModal(item)"
                  :disabled="announcementActionLoading[item.key]?.deleting"
                >
                  編輯
                </a-button>
                <a-popconfirm
                  title="確定刪除?"
                  @confirm="deleteAnnouncement(item.key)"
                  :disabled="announcementActionLoading[item.key]?.deleting"
                >
                  <a-button
                    type="link"
                    size="small"
                    :loading="announcementActionLoading[item.key]?.deleting"
                    :disabled="announcementActionLoading[item.key]?.deleting"
                  >
                    刪除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <div
      class="u-p16px md:u-p24px u-col-span-1 u-bg-white u-w100% u-shadow u-rounded-16px"
    >
      <div class="u-flex u-justify-between u-items-center u-mb-2">
        <h1 class="u-text-18px md:u-text-24px u-font-bold u-c-blue u-m0">
          {{ "注意事項" }}
        </h1>
        <a-button
          v-if="isAdmin"
          type="primary"
          @click="showAddNoticeModal"
          size="small"
          :disabled="isLoading"
        >
          新增注意
        </a-button>
      </div>
      <Divider class="u-my8px" />
      <a-list
        item-layout="vertical"
        :data-source="noticeDataSource"
        :loading="isLoading"
        rowKey="key"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                {{ item.title }}
              </template>
            </a-list-item-meta>
            <ul class="u-flex u-flex-col u-gap-8px md:u-gap-16px">
              <li
                v-for="(content, index) in item.contents"
                :key="`${item.key}-content-${index}`"
                v-html="content"
              ></li>
            </ul>
            <!-- Admin Actions -->
            <template v-if="isAdmin" #actions>
              <a-space>
                <a-button
                  type="link"
                  size="small"
                  @click="showEditNoticeModal(item)"
                  :disabled="noticeActionLoading[item.key]?.deleting"
                >
                  編輯
                </a-button>
                <a-popconfirm
                  title="確定刪除?"
                  @confirm="deleteNotice(item.key)"
                  :disabled="noticeActionLoading[item.key]?.deleting"
                >
                  <a-button
                    type="link"
                    size="small"
                    :loading="noticeActionLoading[item.key]?.deleting"
                    :disabled="noticeActionLoading[item.key]?.deleting"
                  >
                    刪除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <!-- News Add/Edit Modal -->
    <a-modal
      v-model:open="isNewsModalVisible"
      :title="newsModalTitle"
      @ok="handleNewsModalOk"
      @cancel="handleNewsModalCancel"
      okText="儲存"
      cancelText="取消"
      :confirmLoading="isNewsModalLoading"
    >
      <a-space direction="vertical" style="width: 100%">
        <a-date-picker
          v-model:value="currentEditingNews.date"
          placeholder="請選擇日期"
          valueFormat="YYYY-MM-DD"
          style="width: 100%"
          :disabled="isNewsModalLoading"
        />
        <a-input
          v-model:value="currentEditingNews.publisher"
          placeholder="請輸入發佈單位"
          :disabled="isNewsModalLoading"
        />
        <a-textarea
          v-model:value="currentEditingNews.content"
          placeholder="請輸入內容"
          :rows="5"
          :disabled="isNewsModalLoading"
        />
      </a-space>
    </a-modal>

    <!-- Announcement Add/Edit Modal -->
    <a-modal
      v-model:open="isAnnouncementModalVisible"
      :title="modalTitle"
      @ok="handleAnnouncementModalOk"
      @cancel="handleAnnouncementModalCancel"
      okText="儲存"
      cancelText="取消"
      :confirmLoading="isAnnouncementModalLoading"
    >
      <a-space direction="vertical" style="width: 100%">
        <a-input
          v-model:value="currentEditingAnnouncement.title"
          placeholder="請輸入標題"
          :disabled="isAnnouncementModalLoading"
        />
        <a-textarea
          v-model:value="currentEditingAnnouncement.contentsString"
          placeholder="請輸入內容 (每行一個項目)"
          :rows="5"
          :disabled="isAnnouncementModalLoading"
        />
      </a-space>
    </a-modal>

    <!-- Notice Add/Edit Modal -->
    <a-modal
      v-model:open="isNoticeModalVisible"
      :title="noticeModalTitle"
      @ok="handleNoticeModalOk"
      @cancel="handleNoticeModalCancel"
      okText="儲存"
      cancelText="取消"
      :confirmLoading="isNoticeModalLoading"
    >
      <a-space direction="vertical" style="width: 100%">
        <a-input
          v-model:value="currentEditingNotice.title"
          placeholder="請輸入標題"
          :disabled="isNoticeModalLoading"
        />
        <a-textarea
          v-model:value="currentEditingNotice.contentsString"
          placeholder="請輸入內容 (每行一個項目)"
          :rows="5"
          :disabled="isNoticeModalLoading"
        />
      </a-space>
    </a-modal>
  </div>
</template>
