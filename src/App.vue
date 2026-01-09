<script setup>
import LoginDialog from "@/components/LoginDialog.vue";
</script>

<template>
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#dec690',
      },
    }"
  >
    <component :is="$route.meta.layout || 'div'" class="u-h-full u-w-full">
      <router-view />
    </component>
  </a-config-provider>
  <LoginDialog />
</template>

<style scoped></style>
