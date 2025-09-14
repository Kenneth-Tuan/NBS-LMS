<script setup>
import { QuillEditor } from "@vueup/vue-quill";

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

const handleContentChange = (newContent) => {
  emit("update:content", newContent);
};
</script>

<template>
  <div class="u-w-full u-h-full">
    <QuillEditor
      :content="content"
      content-type="html"
      theme="snow"
      toolbar="full"
      :placeholder="placeholder"
      class="u-h280px u-rounded-4px"
      @update:content="handleContentChange"
    />
  </div>
</template>
