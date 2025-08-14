import { ref } from "vue";
import { message, Upload } from "ant-design-vue";
import { courseService } from "@/services/course.service";

/**
 * Generic file upload composable
 * - Validates file type and size before upload
 * - Provides Ant Design Vue compatible customRequest handler
 * - Can also process an entire file list in one call
 */
export function useFileUpload(options = {}) {
  const defaultAllowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
    "image/jpeg",
    "image/png",
  ];

  const allowedTypes = options.allowedTypes || defaultAllowedTypes;
  const maxSizeMB = options.maxSizeMB ?? 50;
  const uploadFn = options.uploadFn || courseService.uploadFile;

  const uploading = ref(false);

  const beforeUpload = (file) => {
    if (!allowedTypes.includes(file.type)) {
      message.error("不支援的檔案格式！請上傳 PDF、Word 文件、圖片。");
      return Upload.LIST_IGNORE;
    }

    const isLtMax = file.size / 1024 / 1024 < maxSizeMB;
    if (!isLtMax) {
      message.error(`檔案大小不能超過 ${maxSizeMB}MB！`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const uploadSingle = async (file) => {
    uploading.value = true;
    try {
      if (!file?.isUploaded) {
        const fileUrl = await uploadFn([file]);
        file.url = Array.isArray(fileUrl) ? fileUrl[0] : fileUrl;
        file.fileType = file.name?.split(".")?.pop?.();
        file.isUploaded = true;
      }
      file.status = "done";
      return file;
    } finally {
      uploading.value = false;
    }
  };

  // Ant Design Vue Upload customRequest handler
  const customRequest = async ({ file, onSuccess, onError }) => {
    console.log("customRequest", file, onSuccess, onError);
    try {
      const updated = await uploadSingle(file);
      onSuccess?.(updated);
    } catch (e) {
      onError?.(e);
    }
  };

  const processFileList = async (fileList) => {
    const files = Array.isArray(fileList) ? fileList : [];
    return Promise.all(files.map((f) => (f?.isUploaded ? f : uploadSingle(f))));
  };

  return {
    uploading,
    beforeUpload,
    customRequest,
    processFileList,
  };
}


