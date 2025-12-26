<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";

import { useMiscStore } from "@/stores/misc.store";

const miscStore = useMiscStore();
const { creditFee } = storeToRefs(miscStore);
const { setCreditFeeHandler, getCreditFeeHandler } = miscStore;

onMounted(() => {
  getCreditFeeHandler();
});
</script>

<template>
  <div
    class="u-w-full u-bg-white u-rounded-16px u-p24px u-shadow"
  >
    <div class="u-flex u-justify-between u-items-center u-mb12px md:u-mb16px">
      <h1 class="u-text-18px md:u-text-24px u-font-bold u-c-blue u-m0">
        {{ "系統設定" }}
      </h1>
    </div>

    <ADivider class="u-my8px" />

    <a-form>
      <a-form-item label="學分費用">
        <a-input-number v-model:value="creditFee" />
      </a-form-item>
    </a-form>
    <AButton type="primary" @click="setCreditFeeHandler">保存</AButton>
  </div>
</template>
