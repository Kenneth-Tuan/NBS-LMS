import { ref, computed } from "vue";
import { defineStore } from "pinia";

import applicationApi from "@/apis/application";
import { RouterName } from "../enums/appEnums";

export const useNotificationStore = defineStore("notifications", () => {
  const notifiedRouterNames = ref([]);
  const isReadApplication = ref(false);

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

  const fetchMyNotification = async () => {
    try {
      const res = await applicationApi.getMyNotification();
      if (res.status === 200) {
        const {
          data: {
            data: { is_read },
          },
        } = res;
        isReadApplication.value = is_read;
      } else {
        throw new Error("Failed to fetch my notification");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async () => {
    try {
      const res = await applicationApi.markAsRead();
      if (res.status === 200) {
        console.log("mark as read");
      } else {
        throw new Error("Failed to mark as read");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    notifiedRouterNames,
    isReadApplication,

    fetchPendingNotification,
    fetchMyNotification,
    markAsRead,
  };
});
