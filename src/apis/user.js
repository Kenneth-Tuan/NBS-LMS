import { apiHelper } from "@/utils/axios";

export default {
  getUserProfile() {
    return apiHelper.get("/userprofile");
  },
};
