import { apiHelper } from "@/utils/axios";

export default {
  signIn(hashedValue) {
    return apiHelper.post(
      "/token",
      {
        hashedValue,
      },
      {
        headers: { "content-type": "application/json" },
      }
    );
  },
};
