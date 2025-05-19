<script setup>
import { ref, reactive, computed } from "vue";
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
import {
  dummyNewsData,
  dummyNoticeData,
  dummyAnnouncementData,
} from "@/data/dummy";

import { useUserStore } from "@/stores/user"; // Import user store
import { UserRole } from "@/enums/appEnums"; // Import UserRole enum

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

// Make data source reactive and add unique keys if missing
const newsDataSource = ref(
  dummyNewsData.map((item, index) => ({
    ...item,
    key: item.key || `news-${index}`,
  }))
);
const editableNewsData = reactive({});
let newsKeyCounter = newsDataSource.value.length; // For generating unique keys

const computedColumns = computed(() => {
  return isAdmin.value ? [...baseColumns, operationColumn] : baseColumns;
});

const editNews = (key) => {
  editableNewsData[key] = cloneDeep(
    newsDataSource.value.find((item) => key === item.key)
  );
};

const saveNews = (key) => {
  const editedItem = editableNewsData[key];
  const targetItem = newsDataSource.value.find((item) => key === item.key);
  if (targetItem && editedItem) {
    Object.assign(targetItem, editedItem);
    delete editableNewsData[key];
    message.success("儲存成功");
  } else {
    message.error("儲存失敗");
    delete editableNewsData[key]; // Still remove from edit mode
  }
};

const cancelNews = (key) => {
  delete editableNewsData[key];
};

const deleteNewsRow = (key) => {
  newsDataSource.value = newsDataSource.value.filter(
    (item) => item.key !== key
  );
  message.success("刪除成功");
};

const addNewsRow = () => {
  const newKey = `news-${newsKeyCounter++}`;
  const newRow = {
    key: newKey,
    date: new Date().toISOString().split("T")[0], // Default to today's date
    content: "",
    publisher: userProfile.userName || "Admin", // Default publisher
  };
  newsDataSource.value.unshift(newRow); // Add to the top
  editNews(newKey); // Enter edit mode immediately
};

// --- Course Announcements List Data and Logic ---
let announcementKeyCounter = 0;
const announcementDataSource = ref(
  dummyAnnouncementData.map((item, index) => ({
    ...item,
    key: item.key || `announcement-${announcementKeyCounter++}`,
  }))
);
const isAnnouncementModalVisible = ref(false);
const modalMode = ref("add"); // 'add' or 'edit'
const currentEditingAnnouncement = reactive({
  key: null,
  title: "",
  // Store contents as a single string for textarea editing
  contentsString: "",
});

const modalTitle = computed(() =>
  modalMode.value === "add" ? "新增課程公告" : "編輯課程公告"
);

const showAddAnnouncementModal = () => {
  modalMode.value = "add";
  currentEditingAnnouncement.key = null;
  currentEditingAnnouncement.title = "";
  currentEditingAnnouncement.contentsString = "";
  isAnnouncementModalVisible.value = true;
};

const showEditAnnouncementModal = (item) => {
  modalMode.value = "edit";
  const clonedItem = cloneDeep(item);
  currentEditingAnnouncement.key = clonedItem.key;
  currentEditingAnnouncement.title = clonedItem.title;
  // Join array into a string for textarea
  currentEditingAnnouncement.contentsString = (clonedItem.contents || []).join(
    "\n"
  );
  isAnnouncementModalVisible.value = true;
};

const handleAnnouncementModalOk = () => {
  if (!currentEditingAnnouncement.title) {
    message.error("請輸入標題");
    return;
  }

  // Split string back into array, filtering empty lines
  const updatedContents = currentEditingAnnouncement.contentsString
    .split("\n")
    .filter((line) => line.trim() !== "");

  if (modalMode.value === "add") {
    const newKey = `announcement-${announcementKeyCounter++}`;
    announcementDataSource.value.unshift({
      key: newKey,
      title: currentEditingAnnouncement.title,
      contents: updatedContents,
    });
    message.success("新增成功");
  } else {
    const index = announcementDataSource.value.findIndex(
      (item) => item.key === currentEditingAnnouncement.key
    );
    if (index !== -1) {
      announcementDataSource.value[index].title =
        currentEditingAnnouncement.title;
      announcementDataSource.value[index].contents = updatedContents;
      message.success("更新成功");
    } else {
      message.error("找不到要更新的項目");
    }
  }
  isAnnouncementModalVisible.value = false;
};

const handleAnnouncementModalCancel = () => {
  isAnnouncementModalVisible.value = false;
};

const deleteAnnouncement = (key) => {
  announcementDataSource.value = announcementDataSource.value.filter(
    (item) => item.key !== key
  );
  message.success("刪除成功");
};

// --- Notices List Data and Logic ---
let noticeKeyCounter = 0;
const noticeDataSource = ref(
  dummyNoticeData.map((item, index) => ({
    ...item,
    key: item.key || `notice-${noticeKeyCounter++}`,
  }))
);
const isNoticeModalVisible = ref(false);
const noticeModalMode = ref("add"); // 'add' or 'edit'
const currentEditingNotice = reactive({
  key: null,
  title: "",
  contentsString: "",
});

const noticeModalTitle = computed(() =>
  noticeModalMode.value === "add" ? "新增注意事項" : "編輯注意事項"
);

const showAddNoticeModal = () => {
  noticeModalMode.value = "add";
  currentEditingNotice.key = null;
  currentEditingNotice.title = "";
  currentEditingNotice.contentsString = "";
  isNoticeModalVisible.value = true;
};

const showEditNoticeModal = (item) => {
  noticeModalMode.value = "edit";
  const clonedItem = cloneDeep(item);
  currentEditingNotice.key = clonedItem.key;
  currentEditingNotice.title = clonedItem.title;
  currentEditingNotice.contentsString = (clonedItem.contents || []).join("\n");
  isNoticeModalVisible.value = true;
};

const handleNoticeModalOk = () => {
  if (!currentEditingNotice.title) {
    message.error("請輸入標題");
    return;
  }
  const updatedContents = currentEditingNotice.contentsString
    .split("\n")
    .filter((line) => line.trim() !== "");

  if (noticeModalMode.value === "add") {
    const newKey = `notice-${noticeKeyCounter++}`;
    noticeDataSource.value.unshift({
      key: newKey,
      title: currentEditingNotice.title,
      contents: updatedContents,
    });
    message.success("新增成功");
  } else {
    const index = noticeDataSource.value.findIndex(
      (item) => item.key === currentEditingNotice.key
    );
    if (index !== -1) {
      noticeDataSource.value[index].title = currentEditingNotice.title;
      noticeDataSource.value[index].contents = updatedContents;
      message.success("更新成功");
    } else {
      message.error("找不到要更新的項目");
    }
  }
  isNoticeModalVisible.value = false;
};

const handleNoticeModalCancel = () => {
  isNoticeModalVisible.value = false;
};

const deleteNotice = (key) => {
  noticeDataSource.value = noticeDataSource.value.filter(
    (item) => item.key !== key
  );
  message.success("刪除成功");
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
</script>

<template>
  <div class="u-grid u-grid-cols-2 u-h100% u-gap-4 u-p4 u-items-start">
    <div
      class="u-p24px u-col-span-2 u-bg-white u-w100% u-h100% u-shadow u-rounded-16px"
    >
      <div class="u-flex u-justify-between u-items-center u-mb-2">
        <h1 class="u-text-24px u-font-bold u-c-blue u-m0">
          {{ "最新消息" }}
        </h1>
        <a-button
          v-if="isAdmin"
          type="primary"
          @click="addNewsRow"
          size="small"
        >
          新增消息</a-button
        >
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
          >新增注意</a-button
        >
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
