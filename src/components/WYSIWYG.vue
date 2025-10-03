<script setup>
import { QuillEditor } from "@vueup/vue-quill";
import DOMPurify from "dompurify";

const props = defineProps({
  content: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "請輸入內容...",
  },
});

const emit = defineEmits(["update:content"]);

// 配置 DOMPurify 只允許 essential toolbar 中允許的標籤和屬性
const allowedTags = [
  // 基本格式化標籤
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "strike",
  // 列表標籤
  "ul",
  "ol",
  "li",
  // 連結標籤
  "a",
  // 其他允許標籤
  "br",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
];

const allowedAttributes = ["href", "target", "rel", "class"];

// 自訂 DOMPurify 配置
const purifyConfig = {
  ALLOWED_TAGS: allowedTags,
  ALLOWED_ATTR: allowedAttributes,
  // 允許資料屬性
  ALLOW_DATA_ATTR: false,
  // 禁止所有不允許的標籤
  FORBID_TAGS: [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
  ],
  // 禁止危險屬性
  FORBID_ATTR: [
    "onclick",
    "onload",
    "onerror",
    "onmouseover",
    "onmouseout",
    "onkeydown",
    "onkeyup",
    "onkeypress",
  ],
  // 清理內容時保留樣式屬性
  KEEP_CONTENT: true,
  // 允許協議相對 URL
  ALLOW_UNKNOWN_PROTOCOLS: false,
  // 清理內容時轉換相對協議為絕對協議
  SANITIZE_DOM: true,
};

// 應用配置到 DOMPurify
DOMPurify.setConfig(purifyConfig);

const sanitizeInput = (content) => {
  if (!content || typeof content !== "string") return "";
  return DOMPurify.sanitize(content);
};

const sanitizeOutput = (content) => {
  if (!content || typeof content !== "string") return "";
  return DOMPurify.sanitize(content);
};

const handleContentChange = (newContent) => {
  // 清理內容後發出事件
  const sanitizedContent = sanitizeOutput(newContent);
  emit("update:content", sanitizedContent);
};

const toolbar = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  // ["blockquote"],
  ["link"],
  // [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  // [{ direction: "rtl" }],
  // [{ size: ["small", false, "large", "huge"] }],
  // [{ font: [] }],
  [{ color: [] }, { background: [] }],
  // [{ align: [] }],
  ["clean"],
];
</script>

<template>
  <div class="u-w-full u-h-full">
    <QuillEditor
      :content="sanitizeInput(content)"
      content-type="html"
      theme="snow"
      :toolbar="toolbar"
      :placeholder="placeholder"
      :disabled="disabled"
      class="u-h280px u-rounded-4px"
      @update:content="handleContentChange"
    />
  </div>
</template>
