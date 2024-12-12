<script setup></script>

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
</template>

<style scoped></style>
