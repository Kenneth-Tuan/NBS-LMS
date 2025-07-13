<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { cloneDeep } from "lodash-es";
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
    userProfile.userRole === UserRole.Creator
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
const editableNewsData = reactive({});

const computedColumns = computed(() => {
  return isAdmin.value ? [...baseColumns, operationColumn] : baseColumns;
});

// Load all announcements from API and filter by type
const loadAllAnnouncements = async () => {
  try {
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
  }
};

const editNews = (key) => {
  editableNewsData[key] = cloneDeep(
    newsDataSource.value.find((item) => key === item.key)
  );
};

const saveNews = async (key) => {
  const editedItem = editableNewsData[key];
  if (!editedItem) return;

  try {
    // Convert date string back to ISO format if it's been edited
    const announcementDateTime = editedItem.date
      ? dayjs(editedItem.date).toISOString()
      : new Date().toISOString();

    await announcementService.updateAnnouncement({
      $id: editedItem.$id,
      announcementDateTime,
      description: editedItem.content,
      department: editedItem.publisher,
      type: "news",
    });

    // Reload news after successful update
    await loadAllAnnouncements();
    delete editableNewsData[key];
  } catch (error) {
    console.error("Failed to save news:", error);
    delete editableNewsData[key];
  }
};

const cancelNews = (key) => {
  delete editableNewsData[key];
};

const deleteNewsRow = async (key) => {
  try {
    const newsItem = newsDataSource.value.find((item) => item.key === key);
    if (newsItem) {
      await announcementService.deleteAnnouncement({ $id: newsItem.$id });
      await loadAllAnnouncements();
    }
  } catch (error) {
    console.error("Failed to delete news:", error);
  }
};

const addNewsRow = async () => {
  try {
    await announcementService.createAnnouncement({
      announcementDateTime: new Date().toISOString(),
      description: "新消息內容",
      department: userProfile.userName || "Admin",
      type: "news",
    });

    // Reload news after creation
    await loadAllAnnouncements();

    // Find the newly created item and enter edit mode
    const newItem = newsDataSource.value[0]; // Assuming newest items are first
    if (newItem) {
      editNews(newItem.key);
    }
  } catch (error) {
    console.error("Failed to add news:", error);
  }
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
    if (modalMode.value === "add") {
      await announcementService.createAnnouncement({
        announcementDateTime: currentEditingAnnouncement.announcementDateTime,
        description: currentEditingAnnouncement.contentsString,
        department: currentEditingAnnouncement.title, // Using title as department
        type: "announcement",
      });
    } else {
      await announcementService.updateAnnouncement({
        $id: currentEditingAnnouncement.$id,
        announcementDateTime: currentEditingAnnouncement.announcementDateTime,
        description: currentEditingAnnouncement.contentsString,
        department: currentEditingAnnouncement.title, // Using title as department
        type: "announcement",
      });
    }

    // Reload announcements after successful operation
    await loadAllAnnouncements();
    isAnnouncementModalVisible.value = false;
  } catch (error) {
    console.error("Failed to save announcement:", error);
    // Error messages are handled by the service
  }
};

const handleAnnouncementModalCancel = () => {
  isAnnouncementModalVisible.value = false;
};

const deleteAnnouncement = async (key) => {
  try {
    const announcement = announcementDataSource.value.find(
      (item) => item.key === key
    );
    if (announcement) {
      await announcementService.deleteAnnouncement({ $id: announcement.$id });
      await loadAllAnnouncements();
    }
  } catch (error) {
    console.error("Failed to delete announcement:", error);
    // Error messages are handled by the service
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
    if (noticeModalMode.value === "add") {
      await announcementService.createAnnouncement({
        announcementDateTime: currentEditingNotice.announcementDateTime,
        description: currentEditingNotice.contentsString,
        department: currentEditingNotice.title,
        type: "notice",
      });
    } else {
      await announcementService.updateAnnouncement({
        $id: currentEditingNotice.$id,
        announcementDateTime: currentEditingNotice.announcementDateTime,
        description: currentEditingNotice.contentsString,
        department: currentEditingNotice.title,
        type: "notice",
      });
    }

    await loadAllAnnouncements();
    isNoticeModalVisible.value = false;
  } catch (error) {
    console.error("Failed to save notice:", error);
  }
};

const handleNoticeModalCancel = () => {
  isNoticeModalVisible.value = false;
};

const deleteNotice = async (key) => {
  try {
    const notice = noticeDataSource.value.find((item) => item.key === key);
    if (notice) {
      await announcementService.deleteAnnouncement({ $id: notice.$id });
      await loadAllAnnouncements();
    }
  } catch (error) {
    console.error("Failed to delete notice:", error);
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
  <div class="u-grid u-grid-cols-2 u-h100% u-w100% u-gap-4 u-p4 u-items-start">
    <div
      class="u-p24px u-col-span-2 u-bg-white u-w100% u-h100% u-shadow u-rounded-16px"
    >
      <div class="u-flex u-justify-between u-items-center u-mb16px">
        <h1 class="u-text-24px u-font-bold u-c-blue u-m0">
          {{ "最新消息" }}
        </h1>
        <a-button
          v-if="isAdmin"
          type="primary"
          @click="addNewsRow"
          size="small"
        >
          新增消息
        </a-button>
      </div>

      <Divider class="u-my8px" />

      <a-table
        :columns="computedColumns"
        :data-source="newsDataSource"
        :pagination="false"
        rowKey="key"
        bordered
      >
        <template #bodyCell="{ column, text, record }">
          <!-- Editable cells for date, content, publisher -->
          <template
            v-if="['date', 'publisher', 'content'].includes(column.dataIndex)"
          >
            <div v-if="editableNewsData[record.key]" style="margin: -5px 0">
              <!-- Use DatePicker for Date -->
              <a-date-picker
                v-if="column.dataIndex === 'date'"
                v-model:value="editableNewsData[record.key][column.dataIndex]"
                valueFormat="YYYY-MM-DD"
                style="width: 100%"
              />
              <!-- Use Input for Publisher -->
              <a-input
                v-else-if="column.dataIndex === 'publisher'"
                v-model:value="editableNewsData[record.key][column.dataIndex]"
              />
              <!-- Use Textarea for Content -->
              <a-textarea
                v-else-if="column.dataIndex === 'content'"
                v-model:value="editableNewsData[record.key][column.dataIndex]"
                :rows="2"
                :maxlength="300"
              />
            </div>
            <template v-else>
              <div v-if="column.dataIndex === 'content'" v-html="text"></div>
              <template v-else>{{ text }}</template>
            </template>
          </template>

          <!-- Operation column -->
          <template v-else-if="column.dataIndex === 'operation'">
            <div class="editable-row-operations">
              <span v-if="editableNewsData[record.key]">
                <a @click="saveNews(record.key)">儲存</a>
                <a-popconfirm
                  title="確定取消?"
                  @confirm="cancelNews(record.key)"
                >
                  <a class="u-ml-2">取消</a>
                </a-popconfirm>
              </span>
              <span v-else>
                <a @click="editNews(record.key)">編輯</a>
                <a-popconfirm
                  title="確定刪除?"
                  @confirm="deleteNewsRow(record.key)"
                >
                  <a class="u-ml-2">刪除</a>
                </a-popconfirm>
              </span>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <div
      class="u-p24px u-col-span-1 u-bg-white u-w100% u-shadow u-rounded-16px"
    >
      <div class="u-flex u-justify-between u-items-center u-mb-2">
        <h1 class="u-text-24px u-font-bold u-c-blue u-m0">
          {{ "課程公告" }}
        </h1>
        <a-button
          v-if="isAdmin"
          type="primary"
          @click="showAddAnnouncementModal"
          size="small"
          >新增公告</a-button
        >
      </div>
      <Divider class="u-my8px" />
      <a-list
        item-layout="vertical"
        :data-source="announcementDataSource"
        rowKey="key"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                {{ item.title }}
              </template>
            </a-list-item-meta>
            <ul class="u-flex u-flex-col u-gap-16px">
              <li
                v-for="(content, index) in item.contents"
                :key="`${item.key}-content-${index}`"
                v-html="content"
              ></li>
            </ul>
            <!-- Admin Actions -->
            <template v-if="isAdmin" #actions>
              <a-space>
                <a @click="showEditAnnouncementModal(item)">編輯</a>
                <a-popconfirm
                  title="確定刪除?"
                  @confirm="deleteAnnouncement(item.key)"
                >
                  <a>刪除</a>
                </a-popconfirm>
              </a-space>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <div
      class="u-p24px u-col-span-1 u-bg-white u-w100% u-shadow u-rounded-16px"
    >
      <div class="u-flex u-justify-between u-items-center u-mb-2">
        <h1 class="u-text-24px u-font-bold u-c-blue u-m0">
          {{ "注意事項" }}
        </h1>
        <a-button
          v-if="isAdmin"
          type="primary"
          @click="showAddNoticeModal"
          size="small"
        >
          新增注意
        </a-button>
      </div>
      <Divider class="u-my8px" />
      <a-list
        item-layout="vertical"
        :data-source="noticeDataSource"
        rowKey="key"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                {{ item.title }}
              </template>
            </a-list-item-meta>
            <ul class="u-flex u-flex-col u-gap-16px">
              <li
                v-for="(content, index) in item.contents"
                :key="`${item.key}-content-${index}`"
                v-html="content"
              ></li>
            </ul>
            <!-- Admin Actions -->
            <template v-if="isAdmin" #actions>
              <a-space>
                <a @click="showEditNoticeModal(item)">編輯</a>
                <a-popconfirm
                  title="確定刪除?"
                  @confirm="deleteNotice(item.key)"
                >
                  <a>刪除</a>
                </a-popconfirm>
              </a-space>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <!-- Announcement Add/Edit Modal -->
    <a-modal
      v-model:open="isAnnouncementModalVisible"
      :title="modalTitle"
      @ok="handleAnnouncementModalOk"
      @cancel="handleAnnouncementModalCancel"
      okText="儲存"
      cancelText="取消"
    >
      <a-space direction="vertical" style="width: 100%">
        <a-input
          v-model:value="currentEditingAnnouncement.title"
          placeholder="請輸入標題"
        />
        <a-textarea
          v-model:value="currentEditingAnnouncement.contentsString"
          placeholder="請輸入內容 (每行一個項目)"
          :rows="5"
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
    >
      <a-space direction="vertical" style="width: 100%">
        <a-input
          v-model:value="currentEditingNotice.title"
          placeholder="請輸入標題"
        />
        <a-textarea
          v-model:value="currentEditingNotice.contentsString"
          placeholder="請輸入內容 (每行一個項目)"
          :rows="5"
        />
      </a-space>
    </a-modal>
  </div>
</template>

<!-- <style lang="scss" scoped>
.editable-row-operations a {
  margin-right: 8px;
}
/* Add specific styles for list actions if needed */
:deep(.ant-list-item-action) {
  margin-left: auto; /* Push actions to the right */
}
</style> -->
