<script setup>
import { reactive } from "vue";
import { message, Upload } from "ant-design-vue";

import {
  FilePdfOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileTextOutlined,
  PlusOutlined,
  InboxOutlined,
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

// Modal state
const materialModal = reactive({
  visible: false,
  file: null,
  uploading: false,
});

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

const beforeMaterialUpload = (file) => {
  // 支援的檔案類型
  const allowedTypes = [
    "application/pdf", // PDF
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel (.xlsx)
    "application/vnd.ms-excel", // Excel (.xls)
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Word (.docx)
    "application/msword", // Word (.doc)
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PowerPoint (.pptx)
    "application/vnd.ms-powerpoint", // PowerPoint (.ppt)
    "text/plain", // 純文字檔案
    "image/jpeg", // JPEG 圖片
    "image/png", // PNG 圖片
    "image/gif", // GIF 圖片
    "video/mp4", // MP4 影片
    "audio/mpeg", // MP3 音檔
  ];

  if (!allowedTypes.includes(file.type)) {
    message.error(
      "不支援的檔案格式！請上傳 PDF、Office 文件、圖片、影片或音檔。"
    );
    return Upload.LIST_IGNORE;
  }

  // 檔案大小限制（50MB）
  const isLt50M = file.size / 1024 / 1024 < 50;
  if (!isLt50M) {
    message.error("檔案大小不能超過 50MB！");
    return Upload.LIST_IGNORE;
  }

  console.log("File validation passed, returning true");
  return true;
};

const uploadAction = async (file) => {
  materialModal.file = await Promise.all(
    materialModal.file.map(async (file) => {
      try {
        if (!file?.isUploaded) {
          const fileUrl = await courseService.uploadFile([file]);
          file.url = fileUrl[0];
          file.fileType = file.name.split(".").pop();
          file.isUploaded = true;
        }
        file.status = "done";
        return file;
      } catch (error) {
        console.error(error);
        return file;
      }
    })
  );
};

const confirmMaterial = async () => {
  if (!materialModal.file || materialModal.file.length === 0) {
    return message.error("請選擇要上傳的檔案");
  }

  materialModal.uploading = true;

  try {
    // 構建課程更新參數
    const courseUpdateParams = {
      course_id: props.courseId,
      name: props.currentCourse.title,
      class_mode: props.currentCourse.classMode,
      duration: props.currentCourse.duration,
      credit: props.currentCourse.credit,
      teacher_id: props.currentCourse.instructor,
      start_date: props.currentCourse.startDate,
      end_date: props.currentCourse.endDate,
      enrollment_limit: props.currentCourse.enrollmentLimit,
      weekly_schedule: props.currentCourse.weeklySchedule || [],
      prerequisite_course_ids: props.currentCourse.prerequisites || [],
      description: props.currentCourse.description || "",
      outline_files:
        props.currentCourse.outlineFile
          .concat(materialModal.file)
          .map((f) => f.url) || [],
    };

    const result = await courseService.updateCourse(courseUpdateParams);

    if (result) {
      emit("update");

      message.success("教材新增成功");
      materialModal.visible = false;
      materialModal.file = null;
    } else {
      throw new Error("課程更新失敗");
    }
  } catch (error) {
    console.error("Failed to update course materials:", error);
    message.error("教材更新失敗：" + (error.message || "未知錯誤"));
  } finally {
    materialModal.uploading = false;
  }
};

const deleteMaterial = async (materialUrl) => {
  try {
    // 構建課程更新參數
    const courseUpdateParams = {
      course_id: props.courseId,
      name: props.currentCourse.title,
      class_mode: props.currentCourse.classMode,
      duration: props.currentCourse.duration,
      credit: props.currentCourse.credit,
      teacher_id: props.currentCourse.instructor,
      start_date: props.currentCourse.startDate,
      end_date: props.currentCourse.endDate,
      enrollment_limit: props.currentCourse.enrollmentLimit,
      weekly_schedule: props.currentCourse.weeklySchedule || [],
      prerequisite_course_ids: props.currentCourse.prerequisites || [],
      description: props.currentCourse.description || "",
      outline_files:
        props.currentCourse.outlineFile
          ?.map((f) => f.url)
          .filter((url) => url !== materialUrl) || [],
    };

    const result = await courseService.updateCourse(courseUpdateParams);

    if (result) {
      emit("update");

      message.success("教材刪除成功");
    } else {
      throw new Error("課程更新失敗");
    }
  } catch (error) {
    console.error("Failed to delete material:", error);
    message.error("教材刪除失敗：" + (error.message || "未知錯誤"));
  }
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
          v-if="item.url"
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
              >
                {{ item.name }}
              </a>
            </template>
          </a-list-item-meta>
          <template #actions>
            <a-button type="link" size="small" @click="downloadMaterial(item)">
              下載
            </a-button>
            <a-popconfirm
              v-if="isTeacherOrCreator"
              title="確定刪除此教材嗎?"
              @confirm="deleteMaterial(item.url)"
            >
              <a-button type="link" size="small" danger>
                刪除
              </a-button>
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
      :confirmLoading="materialModal.uploading"
      :okButtonProps="{ disabled: materialModal.uploading }"
    >
      <a-form layout="vertical">
        <a-form-item label="選擇檔案" name="file">
          <a-upload-dragger
            v-model:file-list="materialModal.file"
            :customRequest="uploadAction"
            :before-upload="beforeMaterialUpload"
            :disabled="materialModal.uploading"
          >
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">點擊或拖曳檔案至此上傳教材</p>
            <p class="ant-upload-hint">
              支援 PDF、Office 文件、圖片、影片或音檔，單個檔案大小不超過
              50MB，可選擇多個檔案
            </p>
          </a-upload-dragger>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
