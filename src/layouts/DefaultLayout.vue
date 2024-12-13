<template>
  <div class="u-flex u-flex-col u-min-h-screen">
    <header
      class="u-bg-white u-text-white u-text-center u-flex u-items-center u-justify-start u-flex-gap-x-2rem u-py-1rem u-px-2rem"
    >
      <div class="u-flex u-items-center u-justify-center u-h-full">
        <img
          src="/src/assets/icon/logo2.jpeg"
          alt="Logo"
          class="u-w-16 u-h-16"
        />
      </div>
      <p class="u-c-blue u-font-bold u-flex u-flex-col u-items-start">
        <span class="u-text-1.5rem u-font-bold">Lorem ipsum</span>
        <span class="u-text-1rem u-font-bold">
          Taiwan Nazarene Thological College LMS
        </span>
      </p>
    </header>

    <main
      class="u-relative u-flex-grow u-flex u-items-center u-h100% u-bg-cover u-bg-center u-bg-opacity-10 u-bg-[url('/src/assets/image/loginPoster.jpg')]"
    >
      <div class="u-absolute u-inset-0 u-bg-white u-opacity-40"></div>
      <router-view />
    </main>

    <footer
      class="u-p1rem u-bg-primary u-text-white u-text-center u-text-xs u-flex u-flex-col u-items-center u-justify-center"
    >
      <p>
        建議瀏覽器版本：最新版本-chrome．Firefox．Safari．Edge © Taiwan Nazarene
        Theological College LMS
      </p>
    </footer>
  </div>
</template>

<script setup>
// 這裡可以添加任何需要的腳本
</script>

<style scoped>
/* 這裡可以添加額外的樣式 */
</style>
