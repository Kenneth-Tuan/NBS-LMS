<script setup>
import { ref, reactive } from "vue";
import { v4 as uuidv4 } from "uuid";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { PlusOutlined } from "@ant-design/icons-vue";

// Props
const props = defineProps({
  courseId: {
    type: String,
    required: true,
  },
  announcements: {
    type: Array,
    default: () => [],
  },
  isTeacherOrCreator: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["update:announcements"]);

// Local state
const localAnnouncements = ref([...props.announcements]);

// Modal state
const announcementModal = reactive({
  visible: false,
  isEdit: false,
  id: null,
  title: "",
  content: "",
});

// Watch for prop changes
import { watch } from "vue";
watch(
  () => props.announcements,
  (newVal) => {
    localAnnouncements.value = [...newVal];
  }
);

// Methods
const openAddAnnouncementModal = () => {
  announcementModal.isEdit = false;
  announcementModal.id = null;
  announcementModal.title = "";
  announcementModal.content = "";
  announcementModal.visible = true;
};

const openEditAnnouncementModal = (ann) => {
  announcementModal.isEdit = true;
  announcementModal.id = ann.id;
  announcementModal.title = ann.title;
  announcementModal.content = ann.content;
  announcementModal.visible = true;
};

const confirmAnnouncement = () => {
  if (!announcementModal.title || !announcementModal.content) {
    message.error("請填寫標題和內容");
    return;
  }

  if (announcementModal.isEdit) {
    const index = localAnnouncements.value.findIndex(
      (a) => a.id === announcementModal.id
    );
    if (index !== -1) {
      localAnnouncements.value[index] = {
        ...localAnnouncements.value[index],
        title: announcementModal.title,
        content: announcementModal.content,
      };
      message.success("公告更新成功");
    }
  } else {
    localAnnouncements.value.unshift({
      id: uuidv4(),
      courseId: props.courseId,
      title: announcementModal.title,
      content: announcementModal.content,
      date: dayjs().format("YYYY-MM-DD HH:mm"),
    });
    message.success("公告新增成功");
  }

  emit("update:announcements", localAnnouncements.value);
  announcementModal.visible = false;
};

const deleteAnnouncement = (annId) => {
  localAnnouncements.value = localAnnouncements.value.filter(
    (a) => a.id !== annId
  );
  emit("update:announcements", localAnnouncements.value);
  message.success("公告刪除成功");
};
</script>

<template>
  <div>
    <div class="u-mb-4 u-flex u-justify-end">
      <a-button
        v-if="isTeacherOrCreator"
        type="primary"
        @click="openAddAnnouncementModal"
      >
        <template #icon><PlusOutlined /></template> 新增公告
      </a-button>
    </div>

    <a-list
      item-layout="vertical"
      :data-source="localAnnouncements"
      :bordered="false"
    >
      <template #renderItem="{ item }">
        <a-list-item
          class="u-bg-gray-50 u-p-4 u-rounded-md u-mb-3 hover:u-shadow-md u-transition-shadow"
        >
          <a-list-item-meta>
            <template #title>
              <span class="u-text-lg u-font-semibold u-c-gray-800">{{
                item.title
              }}</span>
            </template>
            <template #description>
              <span class="u-text-xs u-c-gray-500"
                >發布於: {{ item.date }}</span
              >
            </template>
          </a-list-item-meta>
          <div class="u-mt-2 u-c-gray-700 u-whitespace-pre-line">
            {{ item.content }}
          </div>
          <template v-if="isTeacherOrCreator" #actions>
            <a-button
              type="link"
              size="small"
              @click="openEditAnnouncementModal(item)"
              >編輯</a-button
            >
            <a-popconfirm
              title="確定刪除此公告嗎?"
              @confirm="deleteAnnouncement(item.id)"
            >
              <a-button type="link" size="small" danger>刪除</a-button>
            </a-popconfirm>
          </template>
        </a-list-item>
      </template>
      <template #empty>
        <a-empty description="暫無公告" />
      </template>
    </a-list>

    <!-- Announcement Modal -->
    <a-modal
      v-model:visible="announcementModal.visible"
      :title="announcementModal.isEdit ? '編輯公告' : '新增公告'"
      @ok="confirmAnnouncement"
      okText="確認"
      cancelText="取消"
    >
      <a-form layout="vertical">
        <a-form-item
          label="標題"
          name="title"
          :rules="[{ required: true, message: '請輸入標題!' }]"
        >
          <a-input v-model:value="announcementModal.title" />
        </a-form-item>
        <a-form-item
          label="內容"
          name="content"
          :rules="[{ required: true, message: '請輸入內容!' }]"
        >
          <a-textarea v-model:value="announcementModal.content" :rows="5" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.u-whitespace-pre-line {
  white-space: pre-line;
}
</style>
