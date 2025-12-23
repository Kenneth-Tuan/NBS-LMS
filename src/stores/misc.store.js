import { defineStore } from "pinia";
import { ref } from "vue";
import { message } from "ant-design-vue";

import othersApi from "@/apis/others";

export const useMiscStore = defineStore(
  "misc",
  () => {
    const globalLoading = ref(false);
    const creditFee = ref(0);

    const getCreditFeeHandler = async () => {
      if (globalLoading.value) {
        message.error("正在處理中，請稍後再試");
        return;
      }
      try {
        globalLoading.value = true;
        const response = await othersApi.getCreditFee();
        console.log(response);
        creditFee.value = response.data.data.multiplier;
      } catch (error) {
        console.error(error);
        message.error("載入學分費用失敗: " + error.msg);
      } finally {
        globalLoading.value = false;
      }
    };

    const setCreditFeeHandler = async () => {
      if (
        creditFee.value === undefined ||
        creditFee.value === null ||
        creditFee.value === ""
      ) {
        message.error("學分費用不能為空");
        return;
      }
      if (creditFee.value <= 0) {
        message.error("學分費用不能小於或等於0");
        return;
      }
      // if (newCreditFee.toString().includes(".")) {
      //   message.error("學分費用不能有小數");
      //   return;
      // }
      if (globalLoading.value) {
        message.error("正在處理中，請稍後再試");
        return;
      }
      try {
        globalLoading.value = true;
        await othersApi.setCreditFee(creditFee.value);
        message.success("學分費用設定成功");
      } catch (error) {
        console.error(error);
        message.error("學分費用設定失敗: " + error.msg);
      } finally {
        globalLoading.value = false;
      }
    };

    return {
      globalLoading,
      creditFee,

      getCreditFeeHandler,
      setCreditFeeHandler,
    };
  },
  {
    persist: ["creditFee"],
  }
);
