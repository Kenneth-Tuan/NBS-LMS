import { ref } from "vue";
import { message } from "ant-design-vue";
import { courseService } from "@/services/course.service";

/**
 * Reusable file download composable.
 * - Resolves a downloadable URL (handles gs:// or signed URLs via backend)
 * - Opens the file in a new tab
 */
export function useFileDownload() {
  const downloading = ref(false);

  const isHttpUrl = (url) => /^https?:\/\//i.test(url || "");

  const getDownloadUrl = async (input) => {
    const raw = typeof input === "string" ? input : input?.url;
    if (!raw) return null;

    // If it's already an http(s) link, use it directly
    if (isHttpUrl(raw)) return raw;

    // Otherwise, ask backend to generate a signed URL
    return await courseService.downloadFile(raw);
  };

  const downloadAndOpen = async (input) => {
    try {
      downloading.value = true;
      const url = await getDownloadUrl(input);
      if (!url) {
        message.error("無法取得下載連結");
        return;
      }
      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      message.error("附件下載失敗");
    } finally {
      downloading.value = false;
    }
  };

  return { downloading, getDownloadUrl, downloadAndOpen };
}


