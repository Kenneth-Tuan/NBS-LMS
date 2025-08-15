<script setup>
const props = defineProps({
  attachments: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <div v-if="attachments && attachments.length > 0">
    <span v-for="attachment in attachments" :key="attachment.url">
      <a-button
        class="u-p-0"
        type="link"
        @click="handleAttachmentClick(attachment.url)"
      >
        {{ attachment.name }}
      </a-button>
      <a-divider type="vertical" />
    </span>
  </div>
  <template v-else> 無 </template>
</template>
