<script setup>
import { ref } from "vue";

const content = ref("");
</script>

<template>
  <div class="u-w-full u-h-full">
    <QuillEditor v-model:content="content" theme="snow" toolbar="full" />
  </div>
</template>

<style lang="scss" scoped></style>
