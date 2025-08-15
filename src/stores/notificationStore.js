import { ref, computed } from "vue";
import { defineStore } from "pinia";

import applicationApi from "@/apis/application";
import { RouterName } from "../enums/appEnums";

export const useNotificationStore = defineStore("notifications", () => {
  const notifiedRouterNames = ref([]);

  const fetchPendingNotification = async () => {
    const TYPE_MAP = {
      intership: RouterName.InternshipApplication,
      leave: RouterName.LeaveApplication,
      subsidy: RouterName.SubsidyApplication,
      other: RouterName.OthersApplication,
    };

    try {
      const res = await applicationApi.getPendingNotification();

      const types = res.data.data.types;
      const result = types
        .map((type) => (TYPE_MAP.hasOwnProperty(type) ? TYPE_MAP[type] : null))
        .filter((type) => type !== null);

      notifiedRouterNames.value = result;

      return result;
    } catch (error) {
      console.error(error);
    }
  };

  return {
    notifiedRouterNames,

    fetchPendingNotification,
  };
});
