import { defineStore } from "pinia";
import { ref } from "vue";

export const useMiscStore = defineStore(
  "misc",
  () => {
    const globalLoading = ref(false);

    return {
      globalLoading,
    };
  },
  {
    persist: false,
  }
);
