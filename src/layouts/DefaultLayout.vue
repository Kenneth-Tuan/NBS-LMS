<template>
  <div class="u-flex u-flex-col u-min-h-screen">
    <header
      class="u-h64px u-bg-primary u-text-white u-text-center u-flex u-items-center u-justify-start"
    >
      <div class="u-flex u-items-center u-justify-center u-h-full">
        <img
          src="/src/assets/icon/logo2.jpeg"
          alt="Logo"
          class="u-w-16 u-h-16"
        />
      </div>
    </header>

    <main
      class="u-relative u-flex-grow u-flex u-items-center u-h100% u-bg-cover u-bg-center u-bg-opacity-10 u-bg-[url('/src/assets/image/loginPoster.jpg')]"
    >
      <div class="u-absolute u-inset-0 u-bg-white u-opacity-40"></div>
      <router-view />
    </main>

    <footer class="u-h70px u-bg-primary u-text-white u-text-center">
      <p>© lorem ipsum dolor sit amet.</p>
    </footer>
  </div>
</template>

<script setup>
// 這裡可以添加任何需要的腳本
</script>

<style scoped>
/* 這裡可以添加額外的樣式 */
</style>
