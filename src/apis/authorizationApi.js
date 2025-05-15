import qs from "qs";
import { authApiHelper } from "@/utils/axios";

export default {
  signIn(hashedValue) {
    return authApiHelper.post(
      "/token",
      {
        hashedValue,
      },
      {
        headers: { "content-type": "application/json" },
      }
    );
  },
  login(userRole, email, password) {
    return authApiHelper.post(`/login/${userRole}`, {
      email,
      password,
    });
  },
};
