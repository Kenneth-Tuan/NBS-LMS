<script setup>
import { ref, reactive } from "vue";
import { v4 as uuidv4 } from "uuid";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import {
  FilePdfOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileTextOutlined,
  LinkOutlined,
  PlusOutlined,
  InboxOutlined,
  UploadOutlined,
} from "@ant-design/icons-vue";
import { courseService } from "@/services/course.service";

// Props
const props = defineProps({
  courseId: {
    type: String,
    required: true,
  },
  materials: {
    type: Array,
    default: () => [],
  },
  currentCourse: {
    type: Object,
    default: () => ({}),
  },
  isTeacherOrCreator: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["update"]);

// Local state
const localMaterials = ref([...props.materials]);
const localCurrentCourse = ref({ ...props.currentCourse });

// Modal state
const materialModal = reactive({
  visible: false,
  file: null,
});

// Watch for prop changes
import { watch } from "vue";
watch(
  () => props.materials,
  (newVal) => {
    localMaterials.value = [...newVal];
  }
);
watch(
  () => props.currentCourse,
  (newVal) => {
    localCurrentCourse.value = { ...newVal };
  },
  { deep: true }
);

// Helper functions
const getFileIcon = (fileType) => {
  const type = fileType?.toLowerCase();
  if (type === "pdf") return FilePdfOutlined;
  if (type === "doc" || type === "docx") return FileWordOutlined;
  if (type === "ppt" || type === "pptx") return FilePptOutlined;
  return FileTextOutlined;
};

// Methods
const openAddMaterialModal = () => {
  materialModal.file = null;
  materialModal.visible = true;
};

const beforeOutlineUpload = (file) => {
  console.log("beforeOutlineUpload called with file:", file);
  // Check file type
  const isPDF = file.type === "application/pdf";
  const isExcel =
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel";

  if (!isPDF && !isExcel) {
    message.error("僅支援 PDF 或 Excel 檔案!");
    return false;
  }

  // Check file size
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    message.error("檔案大小不能超過 10MB!");
    return false;
  }

  console.log("File validation passed, returning true");
  return true;
};

const handleFileChange = () => {
  materialModal.file = materialModal.file.map((file) => ({
    ...file,
    status: "done",
  }));
};

const confirmMaterial = async () => {
  if (!materialModal.file) {
    return message.error("請選擇要上傳的檔案");
  }

  try {
    const result = await courseService.updateCourse(params);

    if (result) {
      // Add new materials to the list
      const newMaterials = materialModal.fileUrls.map((url) => {
        const filename = url.split("/").pop() || "檔案";
        const fileTypeMatch = filename.split(".").pop();
        return {
          id: uuidv4(),
          name: filename,
          type: "file",
          fileType: fileTypeMatch,
          url,
          uploadDate: dayjs().format("YYYY-MM-DD"),
        };
      });

      localMaterials.value = [...localMaterials.value, ...newMaterials];

      emit("update", {
        materials: localMaterials.value,
        currentCourse: localCurrentCourse.value,
      });

      message.success("教材新增成功");
    }
  } catch (error) {
    console.error("Failed to update course materials:", error);
    message.error("教材更新失敗");
  }

  materialModal.visible = false;
};

const deleteMaterial = (materialId) => {
  localMaterials.value = localMaterials.value.filter(
    (m) => m.id !== materialId
  );
  emit("update", {
    materials: localMaterials.value,
    currentCourse: localCurrentCourse.value,
  });
  message.success("教材刪除成功");
};

const downloadMaterial = async (material) => {
  try {
    const url = await courseService.downloadFile(material.url);
    window.open(url, "_blank");
  } catch (error) {
    console.error(error);
    message.error("教材下載失敗");
  }
};
</script>

<template>
  <div>
    <div class="u-mb-4 u-flex u-justify-end">
      <a-button
        v-if="isTeacherOrCreator"
        type="primary"
        @click="openAddMaterialModal"
      >
        <template #icon><PlusOutlined /></template> 新增教材
      </a-button>
    </div>

    <a-list :data-source="materials" item-layout="horizontal" :bordered="false">
      <template #renderItem="{ item }">
        <a-list-item
          class="u-bg-gray-50 u-p-3 u-rounded-md u-mb-2 hover:u-shadow-md u-transition-shadow"
        >
          <a-list-item-meta>
            <template #avatar>
              <a-avatar
                shape="square"
                :size="40"
                class="u-bg-blue-100 u-flex u-items-center u-justify-center"
              >
                <component
                  :is="getFileIcon(item.fileType)"
                  class="u-text-blue-600 u-text-xl"
                />
              </a-avatar>
            </template>
            <template #title>
              <a
                @click="downloadMaterial(item)"
                class="u-text-md u-font-semibold u-c-blue-600 hover:u-underline"
                >{{ item.name }}</a
              >
            </template>
          </a-list-item-meta>
          <template #actions>
            <a-button type="link" size="small" @click="downloadMaterial(item)"
              >下載</a-button
            >
            <a-popconfirm
              v-if="isTeacherOrCreator"
              title="確定刪除此教材嗎?"
              @confirm="deleteMaterial(item.id)"
            >
              <a-button type="link" size="small" danger>刪除</a-button>
            </a-popconfirm>
          </template>
        </a-list-item>
      </template>
    </a-list>

    <!-- Material Modal -->
    <a-modal
      v-model:visible="materialModal.visible"
      title="新增教材"
      @ok="confirmMaterial"
      okText="確認"
      cancelText="取消"
    >
      <a-form layout="vertical">
        <a-form-item label="選擇檔案" name="file">
          <!-- <a-upload
            v-model:file-list="materialModal.file"
            @change="handleMaterialFileChange"
            :custom-request="() => {}"
            :before-upload="() => false"
            :max-count="1"
          >
            <a-button> <UploadOutlined /> 點擊選擇檔案 </a-button>
          </a-upload> -->

          <a-upload-dragger
            v-model:file-list="materialModal.file"
            @change="handleFileChange"
            :custom-request="() => {}"
            :before-upload="beforeOutlineUpload"
          >
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">點擊或拖曳檔案至此上傳課程大綱</p>
            <p class="ant-upload-hint">
              僅支援 PDF 或 Excel 檔案，單個檔案大小不超過 10MB
            </p>
          </a-upload-dragger>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
