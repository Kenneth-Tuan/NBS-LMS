<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { message, Modal } from "ant-design-vue";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons-vue";

import applicationApi from "@/apis/application";
import { useFileUpload } from "@/composables/useFileUpload";
import { useFileDownload } from "@/composables/useFileDownload";

// data state
const items = ref([]);
const loading = ref(false);

// form state
const formRef = ref(null);
const isEditing = ref(false);
const submitting = ref(false);
const form = reactive({
  id: "",
  name: "",
  attachments: [], // Ant Upload file list
});

const { processFileList } = useFileUpload();
const { downloadAndOpen } = useFileDownload();

const resetForm = () => {
  form.id = "";
  form.name = "";
  form.attachments = [];
  isEditing.value = false;
  formRef.value?.clearValidate?.();
};

const toFileList = (urls = []) => {
  if (!Array.isArray(urls)) return [];
  return urls.filter(Boolean).map((url, index) => {
    const fileName = String(url).split("_").pop();
    const fileType = String(fileName || "")
      .split(".")
      .pop();
    return {
      uid: `${Date.now()}-${index}`,
      name: fileName || `附件-${index + 1}`,
      status: "done",
      url,
      fileType,
      isUploaded: true,
    };
  });
};

const toUrlList = async (fileList) => {
  const processed = await processFileList(fileList || []);
  return processed.filter((f) => f?.isUploaded && f?.url).map((f) => f.url);
};

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await applicationApi.getOthersApplicationList();
    if (res.status === 200) {
      const {
        data: {
          data: { list },
        },
      } = res;
      items.value = Array.isArray(list) ? list : [];
    } else {
      throw new Error(res.message || "獲取清單失敗");
    }
  } catch (e) {
    message.error(e.message || "取得資料時發生錯誤");
  } finally {
    loading.value = false;
  }
};

const startCreate = () => {
  resetForm();
};

const startEdit = (item) => {
  form.id = item.id;
  form.name = item.name || "";
  form.attachments = toFileList(item.attachments || []);
  isEditing.value = true;
};

const handleSubmit = async () => {
  try {
    submitting.value = true;
    const attachments = await toUrlList(form.attachments);
    if (!form.name || String(form.name).trim().length === 0) {
      throw new Error("請輸入項目名稱");
    }

    if (isEditing.value && form.id) {
      const res = await applicationApi.updateOthersApplication(form.id, {
        name: form.name,
        attachments,
      });
      if (res.status !== 200) throw new Error(res.message || "更新失敗");
      message.success("已儲存變更");
    } else {
      const res = await applicationApi.createOthers({
        name: form.name,
        attachments,
      });
      if (res.status !== 200) throw new Error(res.message || "新增失敗");
      message.success("已新增項目");
    }
    await fetchList();
    resetForm();
  } catch (e) {
    message.error(e.message || "操作失敗");
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (record) => {
  Modal.confirm({
    title: "確認刪除",
    content: `確定要刪除「${record.name}」嗎？`,
    okText: "刪除",
    okType: "danger",
    cancelText: "取消",
    async onOk() {
      try {
        const res = await applicationApi.deleteOthersApplication(record.id);
        if (res.status !== 200) throw new Error(res.message || "刪除失敗");
        message.success("已刪除");
        await fetchList();
        // 若刪除的是當前編輯的項目，重置表單
        if (isEditing.value && form.id === record.id) resetForm();
      } catch (e) {
        message.error(e.message || "刪除失敗");
      }
    },
  });
};

const downloadAttachment = async (url) => {
  try {
    await downloadAndOpen(url);
  } catch (e) {
    message.error("下載失敗");
  }
};

onMounted(async () => {
  await fetchList();
});

const columns = [
  { title: "名稱", dataIndex: "name", key: "name" },
  {
    title: "附件",
    key: "attachments",
    customRender: ({ record }) =>
      (Array.isArray(record.attachments) ? record.attachments : [])?.length,
  },
  { title: "操作", key: "action" },
];
</script>

<template>
  <div class="u-w-full u-bg-white u-rounded-0.5rem u-p-1.5rem u-shadow-md">
    <h1 class="u-text-1.5rem u-fw600 u-mb-1.5rem u-c-blue">
      其他申請 - 控制面板
    </h1>

    <a-row :gutter="16">
      <a-col :span="12">
        <a-form
          ref="formRef"
          layout="vertical"
          :model="form"
          @finish="handleSubmit"
        >
          <a-form-item
            label="項目名稱"
            name="name"
            :rules="[{ required: true, message: '請輸入項目名稱' }]"
          >
            <a-input v-model:value="form.name" placeholder="請輸入項目名稱" />
          </a-form-item>

          <a-form-item label="附件" name="attachments">
            <a-upload
              list-type="picture"
              v-model:file-list="form.attachments"
              :custom-request="
                async () => {
                  await processFileList(form.attachments);
                }
              "
            >
              <a-button> <upload-outlined /> 上傳附件 </a-button>
            </a-upload>
          </a-form-item>

          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit" :loading="submitting">
                {{ isEditing ? "儲存變更" : "新增項目" }}
              </a-button>
              <a-button @click="resetForm">清除</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-col>

      <a-col :span="12">
        <a-table
          :data-source="items"
          :loading="loading"
          :columns="columns"
          row-key="id"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'attachments'">
              <a-space direction="vertical" style="width: 100%">
                <a-empty
                  v-if="!(record.attachments && record.attachments.length)"
                  description="無附件"
                />
                <a-button
                  v-for="(att, idx) in record.attachments || []"
                  :key="idx"
                  type="default"
                  @click="downloadAttachment(att)"
                  size="small"
                >
                  <download-outlined /> 下載附件 {{ idx + 1 }}
                </a-button>
              </a-space>
            </template>

            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" @click="startEdit(record)">編輯</a-button>
                <a-button type="link" danger @click="handleDelete(record)"
                  >刪除</a-button
                >
              </a-space>
            </template>
          </template>
        </a-table>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.u-shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
