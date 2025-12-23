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
    class="u-grid u-grid-cols-1 md:u-grid-cols-2 u-h100% u-w100% u-gap-2 md:u-gap-4 u-p2 md:u-p4 u-items-start"
  >
    <div
      class="u-p16px md:u-p24px u-col-span-1 md:u-col-span-2 u-bg-white u-w100% u-h100% u-shadow u-rounded-16px"
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
  </div>
</template>
