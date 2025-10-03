<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { PlusOutlined } from "@ant-design/icons-vue";
import { announcementService } from "@/services/course.service";
import { announcementSchema } from "@/schemas/announcement.schema";
import WYSIWYG from "../../../components/WYSIWYG.vue";

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

// Form ref
const announcementFormRef = ref(null);

// Loading state
const loading = ref(false);

// Watch for prop changes
watch(
  () => props.announcements,
  (newVal) => {
    localAnnouncements.value = [...newVal];
  }
);

// Methods
const fetchAnnouncements = async () => {
  loading.value = true;
  try {
    const response = await announcementService.list(props.courseId);
    const announcements = response.announcements || [];
    localAnnouncements.value = announcements.map((a) => ({
      id: a.id,
      courseId: props.courseId,
      title: a.title,
      content: a.content,
      date: dayjs(a.date).format("YYYY-MM-DD HH:mm"),
    }));
    emit("update:announcements", localAnnouncements.value);
  } catch (e) {
    console.error(e);
    message.error("無法載入公告");
  } finally {
    loading.value = false;
  }
};

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

const confirmAnnouncement = async () => {
  if (!announcementModal.title || !announcementModal.content) {
    message.error("請填寫標題和內容");
    return;
  }

  loading.value = true;
  try {
    if (announcementModal.isEdit) {
      await announcementService.edit(announcementModal.id, {
        title: announcementModal.title,
        content: announcementModal.content,
      });
      message.success("公告更新成功");
    } else {
      await announcementService.create(props.courseId, {
        title: announcementModal.title,
        content: announcementModal.content,
      });
      message.success("公告新增成功");
    }

    await fetchAnnouncements();
    announcementModal.visible = false;
  } catch (e) {
    console.error(e);
    message.error(announcementModal.isEdit ? "公告更新失敗" : "公告新增失敗");
  } finally {
    loading.value = false;
    announcementFormRef.value.resetFields();
    announcementModal.content = "";
    announcementModal.title = "";
  }
};

const deleteAnnouncement = async (annId) => {
  loading.value = true;
  try {
    await announcementService.delete(annId);
    message.success("公告刪除成功");
    await fetchAnnouncements();
  } catch (e) {
    console.error(e);
    message.error("公告刪除失敗");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAnnouncements();
});
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
          <div class="u-mt-2 u-c-gray-700 u-whitespace-pre-line" v-html="item.content">
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
      okText="確認"
      cancelText="取消"
      @ok="confirmAnnouncement"
    >
      <a-form
        ref="announcementFormRef"
        layout="vertical"
        :model="announcementModal"
        @finish="confirmAnnouncement"
      >
        <a-form-item v-bind="announcementSchema.title" name="title">
          <a-input
            v-model:value="announcementModal.title"
            :placeholder="announcementSchema.title.placeholder"
          />
        </a-form-item>
        <a-form-item v-bind="announcementSchema.content" name="content">
          <WYSIWYG v-model:content="announcementModal.content" />
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
