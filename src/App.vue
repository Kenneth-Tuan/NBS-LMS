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
    <component :is="$route.meta.layout || 'div'" class="h-100%">
      <router-view />
    </component>
  </a-config-provider>
  <LoginDialog />
</template>

<style scoped></style>
