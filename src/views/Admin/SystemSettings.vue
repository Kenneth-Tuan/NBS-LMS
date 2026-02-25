<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";

import { useMiscStore } from "@/stores/misc.store";
import { useStudentRegistrationExcel } from "@/composables/useStudentRegistrationExcel";

const miscStore = useMiscStore();
const { creditFee } = storeToRefs(miscStore);
const { setCreditFeeHandler, getCreditFeeHandler } = miscStore;

const { dateRange, loading, generateExcel } =
  useStudentRegistrationExcel(creditFee);

onMounted(() => {
  getCreditFeeHandler();
});
</script>

<template>
  <div class="u-w-full u-bg-white u-rounded-16px u-p24px u-shadow">
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
    <a-button type="primary" @click="setCreditFeeHandler">保存</a-button>

    <a-divider class="u-my24px" />

    <h2 class="u-text-18px u-font-bold u-c-blue u-mb12px md:u-mb16px">
      學員註冊表
    </h2>

    <a-form layout="inline" class="u-mb16px">
      <a-form-item label="日期範圍">
        <a-range-picker v-model:value="dateRange" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :loading="loading" @click="generateExcel">
          搜尋並生成 Excel
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
